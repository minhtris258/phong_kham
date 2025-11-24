import mongoose from "mongoose";
import QRCode from "qrcode";
import TimeSlot from "../models/TimeslotModel.js";
import Appointment from "../models/AppointmentModel.js";
import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";
import Doctor from "../models/DoctorModel.js";
import Patient from "../models/PatientModel.js";

// =================================================================
// CLIENT (PATIENT) FUNCTIONS
// =================================================================

export const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  let createdAppt;

  try {
    const role = req.user?.role || req.user?.role?.name;
    const io = req.app.get('io');
    const { timeslot_id, reason = "", patient_id } = req.body || {}; // Admin sẽ gửi patient_id

    if (!timeslot_id) return res.status(400).json({ error: "Thiếu timeslot_id" });

    // ============================================================
    // 1. XÁC ĐỊNH ID HỒ SƠ BỆNH NHÂN VÀ ID TÀI KHOẢN NHẬN THÔNG BÁO
    // ============================================================
    let finalPatientId;      // ID bảng Patient (lưu vào Appointment)
    let notificationUserId;  // ID bảng User (để gửi thông báo)
    let patientNameForNotif; // Tên để hiển thị trong thông báo

    if (role === 'admin') {
        // --- LOGIC ADMIN ---
        if (!patient_id) {
            return res.status(400).json({ error: "Admin phải chọn bệnh nhân (thiếu patient_id)." });
        }
        const patientObj = await Patient.findById(patient_id);
        if (!patientObj) {
            return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân này." });
        }
        finalPatientId = patientObj._id;
        notificationUserId = patientObj.user_id; // Thông báo gửi về User của bệnh nhân
        patientNameForNotif = patientObj.fullName;
    } else {
        // --- LOGIC PATIENT (Tự đặt) ---
        const patientProfile = await Patient.findOne({ user_id: req.user._id });
        if (!patientProfile) {
            return res.status(404).json({ error: "Vui lòng cập nhật hồ sơ bệnh nhân trước khi đặt lịch." });
        }
        finalPatientId = patientProfile._id;
        notificationUserId = req.user._id; // Thông báo gửi về chính mình
        patientNameForNotif = patientProfile.fullName;
    }
    // ============================================================

    await session.withTransaction(async () => {
      // 2. Giữ slot
      const slot = await TimeSlot.findOneAndUpdate(
        { _id: timeslot_id, status: "free" },
        { $set: { status: "held" } },
        { new: true, session }
      );
      if (!slot) throw new Error("SLOT_NOT_AVAILABLE");

      // 3. Tạo Appointment
      const [appt] = await Appointment.create(
        [{
          patient_id: finalPatientId, // <--- Dùng ID đã xác định ở trên
          doctor_id: slot.doctor_id,
          timeslot_id: slot._id,
          date: slot.date,
          start: slot.start,
          status: "confirmed",
          reason,
          checkinCode: Math.random().toString(36).substring(2, 10).toUpperCase()
        }],
        { session }
      );
      createdAppt = appt;

      // 4. Update Slot
      await TimeSlot.updateOne(
        { _id: slot._id },
        { $set: { status: "booked", appointment_id: appt._id } },
        { session }
      );
    });

    // ============================================================
    // 5. XỬ LÝ SAU KHI ĐẶT THÀNH CÔNG
    // ============================================================
    
    // Lấy thông tin bác sĩ
    const doctor = await Doctor.findById(createdAppt.doctor_id).lean();
    const doctorName = doctor?.fullName || "Bác sĩ";
    const formattedDate = new Date(createdAppt.date).toLocaleDateString('vi-VN');

    // Tạo QR Data
    const qrData = JSON.stringify({
      apptId: createdAppt._id.toString(),
      patientId: createdAppt.patient_id.toString(),
      code: createdAppt.checkinCode,
      action: "CHECK_IN"
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // Nội dung thông báo
    const notificationBody = 
      `Chào ${patientNameForNotif}, ${role === 'admin' ? 'Admin' : 'bạn'} đã đặt lịch thành công!\n` +
      `- Bác sĩ: ${doctorName}\n` +
      `- Thời gian: ${createdAppt.start} ngày ${formattedDate}\n` +
      `- Lý do: ${reason || "Không có"}\n` +
      `Vui lòng đưa mã QR đính kèm cho lễ tân để check-in.`;

    // Tạo Notification (Lưu ý user_id ở đây là Account User ID để họ nhận được trên App)
    const newNotification = await Notification.create({
      user_id: notificationUserId, // <--- Gửi cho User tương ứng với bệnh nhân
      type: "appointment",
      title: "✅ Đặt Lịch Thành Công",
      body: notificationBody,
      data: {
        doctorName: doctorName,
        time: createdAppt.start,
        date: formattedDate
      },
      appointment_id: createdAppt._id,
      qr: qrCodeBase64,
      channels: ["in-app"],
      status: "unread",
      sent_at: new Date()
    });

    // Gửi Socket Realtime
    if (io) {
      // Gửi cho Bệnh nhân
      io.to(notificationUserId.toString()).emit('new_notification', {
        message: newNotification.title,
        data: newNotification
      });
      
      // (Tùy chọn) Nếu Admin đặt, có thể gửi socket phản hồi cho Admin biết (nếu cần)
    }

    return res.status(201).json({
      message: "Đặt lịch thành công!",
      appointment: createdAppt,
      qrCode: qrCodeBase64
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
    const io = req.app.get('io');

    let appt;

    await session.withTransaction(async () => {
      appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      if (!(role === "admin" || String(appt.patient_id) === String(req.user._id))) {
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

      // Thông báo hủy
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
        io.to(appt.patient_id.toString()).emit('new_notification', {
          message: savedNotification.title,
          notification: savedNotification,
        });
        io.to(appt.doctor_id.toString()).emit('appointment_cancelled', {
          message: "Một lịch hẹn đã bị hủy.",
          appointmentId: appt._id,
          timeslotId: appt.timeslot_id,
        });
      }

      return res.json({ message: "Huỷ lịch thành công." });
    });
  } catch (e) {
    if (e.message === "NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    if (e.message === "FORBIDDEN") return res.status(403).json({ error: "Không đủ quyền." });
    next(e);
  } finally {
    session.endSession();
  }
};

export const myAppointments = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") return res.status(403).json({ error: "Chỉ bệnh nhân." });

    const items = await Appointment.find({ patient_id: req.user._id })
      .populate("doctor_id", "name email") // Populate thông tin User của bác sĩ (nếu cần)
      .sort({ createdAt: -1 })
      .lean();

    // Nếu muốn lấy tên đầy đủ từ bảng Doctor, bạn cần populate phức tạp hơn hoặc xử lý thủ công
    // Tạm thời populate user cơ bản
    return res.json({ data: items });
  } catch (e) {
    next(e);
  }
};

// =================================================================
// ADMIN FUNCTIONS (CRUD)
// =================================================================

/** GET /api/appointments (Admin: Lấy danh sách lịch hẹn có lọc) */
export const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter.date = date; // YYYY-MM-DD

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patient_id", " fullName email phone") // Lấy thông tin bệnh nhân
        .populate("doctor_id", " fullName email")       // Lấy thông tin bác sĩ (User)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      data: appointments,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

/** GET /api/appointments/:id (Admin: Xem chi tiết) */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patient_id", "name email phone gender dob address")
      .populate("doctor_id", "name email")
      .lean();

    if (!appointment) return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });

    res.json({ data: appointment });
  } catch (e) {
    next(e);
  }
};

/** PUT /api/appointments/:id (Admin: Cập nhật trạng thái/ghi chú) */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, adminNotes } = req.body; // Admin có thể sửa trạng thái, lý do khám, ghi chú admin
    const io = req.app.get('io');

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });

    const oldStatus = appointment.status;

    // Cập nhật thông tin
    if (status) appointment.status = status;
    if (reason) appointment.reason = reason;
    if (adminNotes) appointment.admin_notes = adminNotes; // Giả sử model có trường admin_notes

    await appointment.save();

    // Nếu trạng thái thay đổi, gửi thông báo cho bệnh nhân
    if (status && status !== oldStatus) {
      const notifTitle = status === "confirmed" ? "Lịch hẹn được xác nhận" 
                       : status === "completed" ? "Lịch khám hoàn tất" 
                       : "Cập nhật trạng thái lịch hẹn";
      
      const notifBody = `Lịch hẹn khám ngày ${new Date(appointment.date).toLocaleDateString('vi-VN')} của bạn đã chuyển sang trạng thái: ${status.toUpperCase()}.`;

      const newNotif = await Notification.create({
        user_id: appointment.patient_id,
        type: "appointment",
        title: notifTitle,
        body: notifBody,
        appointment_id: appointment._id,
        channels: ["in-app"],
        sent_at: new Date(),
        status: "unread"
      });

      if (io) {
        io.to(appointment.patient_id.toString()).emit('new_notification', {
          message: newNotif.title,
          data: newNotif
        });
      }
    }

    res.json({ message: "Cập nhật thành công.", data: appointment });
  } catch (e) {
    next(e);
  }
};

/** DELETE /api/appointments/:id (Admin: Xóa cứng - Cẩn trọng dùng) */
export const deleteAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // Nếu lịch chưa hủy/hoàn thành mà xóa -> Phải giải phóng slot
      if (appt.status !== "cancelled" && appt.status !== "completed") {
         await TimeSlot.updateOne(
            { _id: appt.timeslot_id },
            { $set: { status: "free", appointment_id: null } },
            { session }
         );
      }

      await Appointment.deleteOne({ _id: id }).session(session);
    });

    res.json({ message: "Đã xóa lịch hẹn vĩnh viễn." });
  } catch (e) {
    if (e.message === "NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    next(e);
  } finally {
    session.endSession();
  }
};