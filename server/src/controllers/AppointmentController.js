import mongoose from "mongoose";
import QRCode from "qrcode"; // Nhớ chạy: npm install qrcode
import TimeSlot from "../models/TimeslotModel.js";
import Appointment from "../models/AppointmentModel.js";
import Notification from "../models/NotificationModel.js"; 
import User from "../models/UserModel.js"; 
import Doctor from "../models/DoctorModel.js"; // Import để lấy tên Bác sĩ chuẩn

export const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  let createdAppt; 

  try {
    // 1. Kiểm tra quyền (chỉ Patient được đặt)
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") {
      return res.status(403).json({ error: "Chỉ bệnh nhân mới được đặt lịch." });
    }

    const io = req.app.get('io'); // Lấy socket.io instance
    const { timeslot_id, reason = "" } = req.body || {};

    if (!timeslot_id) return res.status(400).json({ error: "Thiếu timeslot_id" });

    // 2. Giao dịch đặt lịch (Transaction)
    await session.withTransaction(async () => {
      // a) Giữ slot (tránh trùng lặp)
      const slot = await TimeSlot.findOneAndUpdate(
        { _id: timeslot_id, status: "free" },
        { $set: { status: "held" } },
        { new: true, session }
      );
      if (!slot) throw new Error("SLOT_NOT_AVAILABLE");

      // b) Tạo Appointment
      const [appt] = await Appointment.create(
        [{
          patient_id: req.user._id,
          doctor_id: slot.doctor_id,
          timeslot_id: slot._id,
          date: slot.date,
          start: slot.start,
          status: "confirmed",
          reason,
          // Tạo mã check-in ngẫu nhiên (để xác thực khi quét QR)
          checkinCode: Math.random().toString(36).substring(2, 10).toUpperCase() 
        }],
        { session }
      );
      createdAppt = appt;

      // c) Cập nhật trạng thái slot thành 'booked'
      await TimeSlot.updateOne(
        { _id: slot._id },
        { $set: { status: "booked", appointment_id: appt._id } },
        { session }
      );
    }); 

    // ==================================================================
    // 3. XỬ LÝ SAU KHI ĐẶT THÀNH CÔNG (Tạo QR & Thông báo)
    // ==================================================================
    
    // A. Lấy thông tin chi tiết để hiển thị trong thông báo
    const patient = await User.findById(req.user._id).lean();
    const doctor = await Doctor.findOne({ _id: createdAppt.doctor_id }).lean(); 
    // Nếu không tìm thấy trong bảng Doctor, tìm tạm trong User
    const doctorName = doctor?.fullName || "Bác sĩ"; 
    
    const formattedDate = new Date(createdAppt.date).toLocaleDateString('vi-VN');
    
    // B. Tạo mã QR (Chứa thông tin để check-in)
    const qrData = JSON.stringify({
        apptId: createdAppt._id.toString(),
        patientId: createdAppt.patient_id.toString(),
        code: createdAppt.checkinCode, // Mã bảo mật
        action: "CHECK_IN"
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrData); // Tạo ảnh Base64

    // C. Soạn nội dung thông báo (Có thông tin người đặt như bạn yêu cầu)
    const notificationBody = 
        `Chào ${patient.name}, bạn đã đặt lịch thành công!\n` +
        `- Bác sĩ: ${doctorName}\n` +
        `- Thời gian: ${createdAppt.start} ngày ${formattedDate}\n` +
        `- Lý do khám: ${reason || "Không có"}\n` +
        `Vui lòng đưa mã QR này cho lễ tân để check-in.`;

    // D. Lưu Thông báo vào DB (Khớp với NotificationModel của bạn)
    const newNotification = await Notification.create({
        user_id: createdAppt.patient_id,
        type: "appointment",
        title: "✅ Đặt Lịch Thành Công",
        body: notificationBody, // Nội dung chi tiết
        data: {
            doctorName: doctorName,
            time: createdAppt.start,
            date: formattedDate
        },
        appointment_id: createdAppt._id,
        qr: qrCodeBase64, // <--- Lưu mã QR vào trường 'qr' trong model
        channels: ["in-app"],
        status: "unread",
        sent_at: new Date()
    });

    // E. Gửi Socket Realtime (Thông báo nhảy ngay lập tức)
    if (io) {
        io.to(createdAppt.patient_id.toString()).emit('new_notification', {
            message: newNotification.title,
            data: newNotification
        });
    }

    return res.status(201).json({
        message: "Đặt lịch thành công!",
        appointment: createdAppt,
        qrCode: qrCodeBase64 // Trả về QR để Client hiển thị ngay nếu cần
    });

  } catch (e) {
    if (e.message === "SLOT_NOT_AVAILABLE") {
      return res.status(409).json({ error: "Khung giờ này đã bị người khác đặt." });
    }
    next(e);
  } finally {
    session.endSession();
  }
};

export const cancelAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const role = req.user?.role || req.user?.role?.name;
    const io = req.app.get('io'); // Lấy io instance

    let appt;

    await session.withTransaction(async () => {
      appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // chỉ admin hoặc chính chủ patient
      if (
        !(role === "admin" || String(appt.patient_id) === String(req.user._id))
      ) {
        throw new Error("FORBIDDEN");
      }

      if (appt.status === "cancelled") {
        return res.json({ message: "Đã huỷ trước đó." });
      }

      appt.status = "cancelled";
      await appt.save({ session });

      await TimeSlot.updateOne(
        { _id: appt.timeslot_id, appointment_id: appt._id },
        { $set: { status: "free", appointment_id: null } },
        { session }
      );

      // -----------------------------------------------------------------
      // ✨ THÔNG BÁO HỦY LỊCH REALTIME ✨
      // -----------------------------------------------------------------
      const doctor = await User.findById(appt.doctor_id).select('fullName').lean();
      const notificationPayload = {
          user_id: appt.patient_id,
          type: "appointment",
          title: "Lịch Hẹn Đã Bị Hủy",
          body: `Lịch hẹn khám với Bác sĩ ${doctor?.fullName || "Doctor"} vào lúc ${appt.start} ngày ${new Date(appt.date).toLocaleDateString('vi-VN')} đã bị hủy.`,
          appointment_id: appt._id,
          channels: ["in-app"], 
          sent_at: new Date(),
          status: "unread",
      };
      const savedNotification = await Notification.create(notificationPayload);
      
      if (io) {
          // Gửi thông báo đến Patient
          io.to(appt.patient_id.toString()).emit('new_notification', {
              message: savedNotification.title,
              notification: savedNotification,
          });
          // [Tùy chọn]: Gửi thông báo cho Doctor biết slot đã trống
          io.to(appt.doctor_id.toString()).emit('appointment_cancelled', {
              message: "Một lịch hẹn đã bị hủy.",
              appointmentId: appt._id,
              timeslotId: appt.timeslot_id,
          });
      }
      // -----------------------------------------------------------------

      return res.json({ message: "Huỷ lịch thành công." });
    });
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    if (e.message === "FORBIDDEN")
      return res.status(403).json({ error: "Không đủ quyền." });
    next(e);
  } finally {
    session.endSession();
  }
};

export const myAppointments = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient")
      return res.status(403).json({ error: "Chỉ bệnh nhân." });

    const items = await Appointment.find({ patient_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ data: items });
  } catch (e) {
    next(e);
  }
};