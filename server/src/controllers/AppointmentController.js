import mongoose from "mongoose";
import TimeSlot from "../models/TimeslotModel.js";
import Appointment from "../models/AppointmentModel.js";
import Notification from "../models/NotificationModel.js"; 
import User from "../models/UserModel.js"; 
import QRCode from "qrcode"; 

export const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  let created; 

  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") {
      return res
        .status(403)
        .json({ error: "Chỉ bệnh nhân mới được đặt lịch." });
    }

    const io = req.app.get('io'); 

    const { timeslot_id, reason = "" } = req.body || {};
    if (!timeslot_id)
      return res.status(400).json({ error: "Thiếu timeslot_id" });

    await session.withTransaction(async () => {
      // 1) Giữ chỗ (hold) timeslot
      const slot = await TimeSlot.findOneAndUpdate(
        { _id: timeslot_id, status: "free" },
        { $set: { status: "held" } },
        { new: true, session }
      );
      if (!slot) throw new Error("SLOT_NOT_AVAILABLE");

      // 2) Tạo appointment (dùng create với mảng để đi kèm session an toàn)
      const [appt] = await Appointment.create(
        [
          {
            patient_id: req.user._id,
            doctor_id: slot.doctor_id,
            timeslot_id: slot._id,
            date: slot.date,
            start: slot.start,
            status: "confirmed",
            reason,
          },
        ],
        { session }
      );
      created = appt;

      // 3) Đánh dấu slot đã book
      await TimeSlot.updateOne(
        { _id: slot._id },
        { $set: { status: "booked", appointment_id: appt._id } },
        { session }
      );
    }); 

    // 4) Chuẩn bị dữ liệu và tạo QR Code
    const qrData = JSON.stringify({
        apptId: created._id.toString(),
        patientId: created.patient_id.toString(),
        checkinCode: Math.random().toString(36).substring(2, 10), // Mã check-in ngẫu nhiên
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrData);
    // 5) Lấy thông tin Bác sĩ để đưa vào Notification
    const doctor = await User.findById(created.doctor_id).select('fullName').lean();
    
    const doctorName = doctor?.fullName || "Bác sĩ [Đã xóa]";
    const formattedDate = new Date(created.date).toLocaleDateString('vi-VN');
    // 6) Tạo Notification mới (lưu vào DB)
    const notificationPayload = {
        user_id: created.patient_id,
        type: "appointment",
        title: "Xác nhận Lịch Hẹn Thành Công",
        body: `Lịch hẹn với Bác sĩ ${doctorName} vào lúc ${created.start} ngày ${formattedDate} đã được xác nhận. Vui lòng sử dụng QR code để Check-in.`,
        data: {
            doctorName: doctorName,
            timeslot: created.start,
            date: formattedDate
        },
        appointment_id: created._id,
        qr: qrCodeBase64, // Lưu QR code dưới dạng base64
        channels: ["in-app"], 
        sent_at: new Date(),
    };
    const savedNotification = await Notification.create(notificationPayload);
    
    // 7) Gửi thông báo Realtime qua Socket.IO
    if (io) {
        // Gửi thông báo đến room có ID là ID của người dùng (Patient)
        io.to(created.patient_id.toString()).emit('new_notification', {
            message: savedNotification.title,
            notification: savedNotification,
            // Có thể thêm unreadCount ở đây nếu có logic tính toán
        });
    }

    return res
      .status(201)
      .json({ message: "Đặt lịch thành công và đã gửi thông báo.", appointment: created });
  } catch (e) {
    if (e.message === "SLOT_NOT_AVAILABLE") {
      return res.status(409).json({ error: "Khung giờ không khả dụng." });
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