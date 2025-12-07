import mongoose from "mongoose";
import QRCode from "qrcode";
import TimeSlot from "../models/TimeslotModel.js";
import Appointment from "../models/AppointmentModel.js";
import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";
import Doctor from "../models/DoctorModel.js";
import Patient from "../models/PatientModel.js";
import Medicine from "../models/MedicineModel.js";
import MedicalService from "../models/MedicalServiceModel.js";
import sendEmail from "../utils/sendEmail.js";

// =================================================================
// CLIENT (PATIENT) FUNCTIONS
// =================================================================

// file: controllers/AppointmentController.js

export const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  let createdAppt;

  try {
    const role = req.user?.role || req.user?.role?.name;
    const io = req.app.get("io");
    const { timeslot_id, reason = "", patient_id } = req.body || {};

    if (!timeslot_id)
      return res.status(400).json({ error: "Thiếu timeslot_id" });

    // 1. XÁC ĐỊNH THÔNG TIN BỆNH NHÂN
    let finalPatientId;
    let notificationUserId;
    let patientNameForNotif;
    let patientEmail;

    if (role === "admin") {
      if (!patient_id)
        return res.status(400).json({ error: "Admin phải chọn bệnh nhân." });
      const patientObj = await Patient.findById(patient_id);
      if (!patientObj)
        return res
          .status(404)
          .json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
      finalPatientId = patientObj._id;
      notificationUserId = patientObj.user_id;
      patientNameForNotif = patientObj.fullName;
      patientEmail = patientObj.email;
    } else {
      const patientProfile = await Patient.findOne({ user_id: req.user._id });
      if (!patientProfile)
        return res
          .status(404)
          .json({ error: "Vui lòng cập nhật hồ sơ bệnh nhân." });
      finalPatientId = patientProfile._id;
      notificationUserId = req.user._id;
      patientNameForNotif = patientProfile.fullName;
      patientEmail = req.user.email || patientProfile.email;
    }

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
        [
          {
            patient_id: finalPatientId,
            doctor_id: slot.doctor_id,
            timeslot_id: slot._id,
            date: slot.date,
            start: slot.start,
            status: "confirmed",
            reason,
            checkinCode: Math.random()
              .toString(36)
              .substring(2, 10)
              .toUpperCase(),
          },
        ],
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
    const doctorUserId = doctor?.user_id;
    const formattedDate = new Date(createdAppt.date).toLocaleDateString(
      "vi-VN"
    );

    // Tạo QR Data (Base64)
    const qrData = JSON.stringify({
      apptId: createdAppt._id.toString(),
      patientId: createdAppt.patient_id.toString(),
      code: createdAppt.checkinCode,
      action: "CHECK_IN",
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // --- A. GỬI NOTIFICATION (Lưu DB) ---
    const notificationBody =
      `Chào ${patientNameForNotif}, đặt lịch thành công!\n` +
      `- Bác sĩ: ${doctorName}\n` +
      `- Thời gian: ${createdAppt.start} ngày ${formattedDate}`;

    const newNotification = await Notification.create({
      user_id: notificationUserId,
      type: "appointment",
      title: "✅ Đặt Lịch Thành Công",
      body: notificationBody,
      data: { doctorName, time: createdAppt.start, date: formattedDate },
      appointment_id: createdAppt._id,
      qr: qrCodeBase64,
      channels: ["in-app"],
      status: "unread",
      sent_at: new Date(),
    });

    // --- B. THÔNG BÁO CHO BÁC SĨ ---
    if (doctorUserId) {
      await Notification.create({
        user_id: doctorUserId,
        type: "appointment",
        title: "📅 Có Lịch Hẹn Mới",
        body: `Bệnh nhân ${patientNameForNotif} đặt lịch lúc ${createdAppt.start} ngày ${formattedDate}.`,
        appointment_id: createdAppt._id,
        channels: ["in-app"],
        status: "unread",
        sent_at: new Date(),
      });
      // Gửi socket cho bác sĩ (nếu cần)
      if (io) {
        const apptWithPatient = await Appointment.findById(createdAppt._id)
          .populate("patient_id", "fullName name email phone")
          .lean();
        io.to(doctorUserId.toString()).emit("new_appointment", apptWithPatient);
      }
    }

    // --- C. GỬI SOCKET REALTIME CHO BỆNH NHÂN ---
    if (io) {
      io.to(notificationUserId.toString()).emit("new_notification", {
        message: newNotification.title,
        data: newNotification,
      });
      io.emit("slot_booked", {
        timeslotId: timeslot_id,
        doctorId: createdAppt.doctor_id,
        bookedByUserId: notificationUserId.toString(),
      });
    }

    // ============================================================
    // D. GỬI EMAIL ĐẸP KÈM MÃ QR (ĐÃ SỬA LẠI FORM)
    // ============================================================
    try {
      if (patientEmail) {
        await sendEmail({
          email: patientEmail,
          subject: `[MedPro] Xác nhận lịch khám - ${formattedDate}`,
          message: `Xin chào ${patientNameForNotif}, bạn đã đặt lịch thành công.`,
          // Sử dụng attachments để gửi ảnh QR an toàn (tránh bị chặn bởi Gmail)
          attachments: [
            {
              filename: "qrcode.png",
              path: qrCodeBase64, // Nodemailer tự hiểu data URI
              cid: "unique_qr_code_image", // Content-ID để nhúng vào HTML
            },
          ],
          html: `
                    <div style="background-color: #f3f4f6; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            
                            <div style="background-color: #007bff; padding: 30px 20px; text-align: center; color: #ffffff;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">ĐẶT LỊCH THÀNH CÔNG</h1>
                                <p style="margin: 10px 0 0; opacity: 0.9;">Phòng Khám MedPro</p>
                            </div>
                            
                            <div style="padding: 30px;">
                                <p style="font-size: 16px; color: #333;">Xin chào <strong>${patientNameForNotif}</strong>,</p>
                                <p style="color: #555; line-height: 1.5;">Cảm ơn bạn đã tin tưởng lựa chọn dịch vụ của chúng tôi. Lịch hẹn của bạn đã được xác nhận với thông tin chi tiết dưới đây:</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f8f9fa; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Bác sĩ phụ trách:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${doctorName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Thời gian:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${
                                          createdAppt.start
                                        } - ${formattedDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Lý do khám:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #333;">${
                                          reason || "Không ghi chú"
                                        }</td>
                                    </tr>
                                    
                                </table>

                                <div style="text-align: center; margin-top: 30px; padding: 20px; border: 2px dashed #007bff; border-radius: 10px; background-color: #f0f7ff;">
                                    <p style="margin-bottom: 15px; font-weight: bold; color: #0056b3; font-size: 14px;">QUÉT MÃ QR NÀY ĐỂ CHECK-IN NHANH</p>
                                    
                                    <img src="cid:unique_qr_code_image" alt="QR Code" style="width: 180px; height: 180px; display: inline-block; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" />
                                    
                                    <p style="margin-top: 10px; font-size: 13px; color: #666;">(Vui lòng đưa mã này cho lễ tân khi đến phòng khám)</p>
                                </div>
                            </div>

                            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 5px;">Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.</p>
                                <p style="margin: 0;">&copy; 2025 Phòng Khám MedPro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `,
        });
        console.log(`📧 Email xác nhận đã gửi tới: ${patientEmail}`);
      }
    } catch (err) {
      console.error("❌ Lỗi gửi email đặt lịch:", err.message);
    }

    return res.status(201).json({
      message: "Đặt lịch thành công!",
      appointment: createdAppt,
      qrCode: qrCodeBase64,
    });
  } catch (e) {
    if (e.message === "SLOT_NOT_AVAILABLE")
      return res
        .status(409)
        .json({ error: "Khung giờ này đã bị người khác đặt." });
    next(e);
  } finally {
    session.endSession();
  }
};

// file: controllers/AppointmentController.js

export const cancelAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const role = req.user?.role || req.user?.role?.name;
    const io = req.app.get("io");

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // Check quyền (Giữ nguyên)
      let isOwner = false;
      if (role === "admin") isOwner = true;
      else {
        const myPatientProfile = await Patient.findOne({
          user_id: req.user._id,
        }).session(session);
        if (
          myPatientProfile &&
          String(appt.patient_id) === String(myPatientProfile._id)
        )
          isOwner = true;
      }
      if (!isOwner) throw new Error("FORBIDDEN");

      if (appt.status === "cancelled")
        return res.json({ message: "Đã huỷ trước đó." });

      // Update trạng thái
      appt.status = "cancelled";
      await appt.save({ session });

      await TimeSlot.updateOne(
        { _id: appt.timeslot_id },
        { $set: { status: "free", appointment_id: null } },
        { session }
      );

      // ==========================================================
      // XỬ LÝ THÔNG BÁO HỦY (CHO CẢ 2 BÊN)
      // ==========================================================

      const patientProfile = await Patient.findById(appt.patient_id).session(
        session
      );
      const doctorProfile = await Doctor.findById(appt.doctor_id).session(
        session
      ); // Lấy profile bác sĩ

      // 1. Thông báo cho Bệnh nhân
      if (patientProfile) {
        const targetUserId = patientProfile.user_id;
        const notifPayload = {
          user_id: targetUserId,
          type: "appointment",
          title: "Lịch Hẹn Đã Bị Hủy",
          body: `Lịch hẹn khám lúc ${appt.start} ngày ${new Date(
            appt.date
          ).toLocaleDateString("vi-VN")} đã hủy thành công.`,
          appointment_id: appt._id,
          channels: ["in-app"],
          sent_at: new Date(),
          status: "unread",
        };

        const [savedNotif] = await Notification.create([notifPayload], {
          session,
        });

        if (io) {
          io.to(targetUserId.toString()).emit("new_notification", {
            message: savedNotif.title,
            data: savedNotif,
          });
        }
      }

      // 2. Thông báo cho Bác sĩ (MỚI THÊM)
      if (doctorProfile && doctorProfile.user_id) {
        const doctorUserId = doctorProfile.user_id;
        const doctorNotifPayload = {
          user_id: doctorUserId, // Gửi về User ID của bác sĩ
          type: "appointment",
          title: "❌ Lịch Hẹn Bị Hủy",
          body: `Bệnh nhân ${
            patientProfile?.fullName || "Vãng lai"
          } đã hủy lịch hẹn lúc ${appt.start} ngày ${new Date(
            appt.date
          ).toLocaleDateString("vi-VN")}.`,
          appointment_id: appt._id,
          channels: ["in-app"],
          sent_at: new Date(),
          status: "unread",
        };

        const [savedDocNotif] = await Notification.create(
          [doctorNotifPayload],
          { session }
        );

        if (io) {
          console.log(`📡 Gửi socket hủy lịch tới Bác sĩ: ${doctorUserId}`);
          io.to(doctorUserId.toString()).emit("new_notification", {
            message: savedDocNotif.title,
            data: savedDocNotif,
          });

          // Emit sự kiện để FE bác sĩ xóa lịch khỏi màn hình ngay lập tức
          io.to(doctorUserId.toString()).emit("appointment_cancelled", {
            appointmentId: appt._id,
            timeslotId: appt.timeslot_id,
          });
        }
      }
    });

    return res.json({ message: "Huỷ lịch thành công." });
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    if (e.message === "FORBIDDEN")
      return res
        .status(403)
        .json({ error: "Bạn không có quyền hủy lịch hẹn này." });
    next(e);
  } finally {
    session.endSession();
  }
};

export const myAppointments = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    // (Tùy chọn) Kiểm tra role nếu cần, hoặc bỏ qua nếu middleware đã lo
    // if (role !== "patient") return res.status(403).json({ error: "Chỉ bệnh nhân." });

    // BƯỚC 1: Tìm hồ sơ bệnh nhân dựa trên User ID đang đăng nhập
    const patientProfile = await Patient.findOne({ user_id: req.user._id });

    if (!patientProfile) {
      return res.status(404).json({ error: "Chưa tìm thấy hồ sơ bệnh nhân." });
    }

    // BƯỚC 2: Dùng ID của hồ sơ bệnh nhân để tìm lịch hẹn
    const items = await Appointment.find({ patient_id: patientProfile._id })
      .populate({
        path: "doctor_id",
        select: "fullName email phone avatar specialty", // Chọn các trường cần hiển thị từ bảng Doctor
        model: "Doctor", // Đảm bảo populate từ model Doctor nếu doctor_id ref sang Doctor
      })
      .sort({ createdAt: -1 })
      .lean();

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
        .populate("doctor_id", " fullName email") // Lấy thông tin bác sĩ (User)
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

    if (!appointment)
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });

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
    const io = req.app.get("io");

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });

    const oldStatus = appointment.status;

    // Cập nhật thông tin
    if (status) appointment.status = status;
    if (reason) appointment.reason = reason;
    if (adminNotes) appointment.admin_notes = adminNotes; // Giả sử model có trường admin_notes

    await appointment.save();

    // Nếu trạng thái thay đổi, gửi thông báo cho bệnh nhân
    if (status && status !== oldStatus) {
      const notifTitle =
        status === "confirmed"
          ? "Lịch hẹn được xác nhận"
          : status === "completed"
          ? "Lịch khám hoàn tất"
          : "Cập nhật trạng thái lịch hẹn";

      const notifBody = `Lịch hẹn khám ngày ${new Date(
        appointment.date
      ).toLocaleDateString(
        "vi-VN"
      )} của bạn đã chuyển sang trạng thái: ${status.toUpperCase()}.`;

      const newNotif = await Notification.create({
        user_id: appointment.patient_id,
        type: "appointment",
        title: notifTitle,
        body: notifBody,
        appointment_id: appointment._id,
        channels: ["in-app"],
        sent_at: new Date(),
        status: "unread",
      });

      if (io) {
        io.to(appointment.patient_id.toString()).emit("new_notification", {
          message: newNotif.title,
          data: newNotif,
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
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    next(e);
  } finally {
    session.endSession();
  }
};
//lấy danh sách lịch hẹn của bác sĩ

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const {
      status,
      page = 1,
      limit = 10, // Mặc định 10 items/trang
      startDate,
      endDate,
      search, // Thêm tham số tìm kiếm
    } = req.query;

    // 1. Kiểm tra quyền bác sĩ
    const userRole = req.user.role?.name || req.user.role;
    if (userRole !== "doctor") {
      return res
        .status(403)
        .json({ success: false, message: "Chỉ bác sĩ mới có quyền." });
    }

    // 2. Lấy doctor_id
    const doctorProfile = await Doctor.findOne({ user_id: _id });
    if (!doctorProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hồ sơ bác sĩ." });
    }
    const doctorId = doctorProfile._id;

    // 3. Xây dựng query
    const query = { doctor_id: doctorId };

    // Lọc theo trạng thái
    if (status && status !== "all") {
      const statusArray = status.includes(",") ? status.split(",") : [status];
      query.status = { $in: statusArray };
    }

    // Lọc theo ngày
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    // Tìm kiếm (theo tên bệnh nhân hoặc SĐT - Cần aggregate hoặc populate trước để search)
    // Cách đơn giản nhất là tìm trong bảng Appointment nếu có lưu thông tin,
    // hoặc dùng $lookup trong aggregate. Ở đây ta dùng cách đơn giản trước:
    // Lưu ý: Tìm kiếm trên field populate cần aggregate, code dưới đây chỉ tìm trên field có sẵn trong Appointment (nếu có).
    // Nếu muốn tìm tên bệnh nhân, tốt nhất nên dùng Aggregation Pipeline.

    const skip = (page - 1) * parseInt(limit);

    // Dùng Aggregation để vừa filter, vừa sort, vừa phân trang và populate
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" }, // Bung mảng patient ra object
      // Thêm điều kiện tìm kiếm nếu có
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "patient.fullName": { $regex: search, $options: "i" } },
                  { "patient.phone": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Facet để đếm tổng và lấy data
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { date: 1, start: 1 } }, // Sắp xếp
            { $skip: skip },
            { $limit: parseInt(limit) },
          ],
        },
      },
    ];

    const result = await Appointment.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    return res.status(200).json({
      success: true,
      data: data.map((app) => ({ ...app, patient_id: app.patient })), // Map lại structure cũ để frontend đỡ sửa nhiều
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
/** PUT /api/appointments/doctor/cancel/:id - Bác sĩ hủy lịch */
export const cancelAppointmentByDoctor = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const { reason } = req.body; // Lý do hủy
    const userId = req.user._id;

    // 1. Tìm Profile Bác sĩ
    const doctor = await Doctor.findOne({ user_id: userId });
    if (!doctor)
      return res.status(403).json({ error: "Bạn không phải là bác sĩ." });

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // 2. Check quyền sở hữu (Chỉ hủy lịch của chính mình)
      if (appt.doctor_id.toString() !== doctor._id.toString()) {
        throw new Error("FORBIDDEN");
      }

      // 3. Kiểm tra trạng thái hiện tại
      if (appt.status === "cancelled") {
        return res.json({ message: "Lịch hẹn này đã bị hủy trước đó." });
      }
      if (appt.status === "completed") {
        throw new Error("COMPLETED_ERROR"); // Đã khám xong thì không hủy được
      }

      // 4. Cập nhật trạng thái -> Cancelled
      appt.status = "cancelled";
      // Lưu lý do hủy (nếu DB có trường này, hoặc ghi vào note)
      if (reason) {
        appt.reason = (appt.reason || "") + ` [Đã hủy: ${reason}]`;
      }
      await appt.save({ session });

      // 5. Giải phóng Slot (để trống cho người khác đặt, hoặc bác sĩ tự khóa sau)
      await TimeSlot.updateOne(
        { _id: appt.timeslot_id },
        { $set: { status: "free", appointment_id: null } },
        { session }
      );

      // 6. Gửi thông báo cho Bệnh nhân
      const patient = await Patient.findById(appt.patient_id).session(session);
      if (patient) {
        const notifBody = `Bác sĩ ${doctor.fullName} đã hủy lịch hẹn lúc ${
          appt.start
        } ngày ${new Date(appt.date).toLocaleDateString("vi-VN")}.\nLý do: ${
          reason || "Bận đột xuất"
        }`;

        await Notification.create(
          [
            {
              user_id: patient.user_id, // Gửi về account user của bệnh nhân
              type: "appointment",
              title: "⚠️ Lịch Hẹn Bị Hủy",
              body: notifBody,
              appointment_id: appt._id,
              channels: ["in-app"],
              status: "unread",
              sent_at: new Date(),
            },
          ],
          { session }
        );

        // Socket (nếu có)
        const io = req.app.get("io");
        if (io) {
          io.to(patient.user_id.toString()).emit("new_notification", {
            message: "⚠️ Lịch Hẹn Bị Hủy",
            data: { body: notifBody, appointment_id: appt._id },
          });
        }
      }
    });

    res.json({
      message: "Hủy lịch thành công. Lịch hẹn đã được lưu vào danh sách hủy.",
    });
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    if (e.message === "FORBIDDEN")
      return res
        .status(403)
        .json({ error: "Lịch hẹn này không thuộc về bạn." });
    if (e.message === "COMPLETED_ERROR")
      return res
        .status(400)
        .json({ error: "Lịch hẹn đã hoàn thành, không thể hủy." });
    next(e);
  } finally {
    session.endSession();
  }
};

/** PUT /api/appointments/doctor/update/:id - Bác sĩ cập nhật (Khám xong / Ghi chú) */
export const rescheduleAppointmentByDoctor = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params; // ID lịch hẹn cũ
    const { new_timeslot_id, reason } = req.body; // ID slot mới và lý do dời
    const userId = req.user._id;

    // 1. Kiểm tra bác sĩ
    const doctor = await Doctor.findOne({ user_id: userId });
    if (!doctor)
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });

    if (!new_timeslot_id)
      return res.status(400).json({ error: "Thiếu thông tin slot mới." });

    await session.withTransaction(async () => {
      // 2. Lấy lịch hẹn cũ
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // Check quyền
      if (appt.doctor_id.toString() !== doctor._id.toString()) {
        throw new Error("FORBIDDEN");
      }

      // Chỉ cho phép dời khi lịch đang "confirmed" hoặc "pending"
      if (["cancelled", "completed"].includes(appt.status)) {
        throw new Error("INVALID_STATUS");
      }

      // 3. Kiểm tra Slot mới có trống không
      const newSlot = await TimeSlot.findOne({
        _id: new_timeslot_id,
        status: "free",
      }).session(session);

      if (!newSlot) throw new Error("SLOT_BUSY"); // Slot mới đã bị đặt hoặc không tồn tại

      // === THỰC HIỆN HOÁN ĐỔI ===

      // A. Giải phóng Slot cũ
      await TimeSlot.updateOne(
        { _id: appt.timeslot_id },
        { $set: { status: "free", appointment_id: null } },
        { session }
      );

      // B. Cập nhật Slot mới (Đặt chỗ)
      await TimeSlot.updateOne(
        { _id: new_timeslot_id },
        { $set: { status: "booked", appointment_id: appt._id } },
        { session }
      );

      // C. Cập nhật thông tin Lịch hẹn
      const oldDateStr = new Date(appt.date).toLocaleDateString("vi-VN");
      const oldTime = appt.start;

      appt.timeslot_id = new_timeslot_id;
      appt.date = newSlot.date;
      appt.start = newSlot.start;
      // Ghi chú lý do dời lịch
      if (reason) {
        appt.reason =
          (appt.reason || "") + ` [Dời từ ${oldTime} ${oldDateStr}: ${reason}]`;
      }
      await appt.save({ session });

      // D. Thông báo cho bệnh nhân
      const patient = await Patient.findById(appt.patient_id);
      if (patient) {
        const newDateStr = new Date(newSlot.date).toLocaleDateString("vi-VN");
        const notifBody = `Bác sĩ ${
          doctor.fullName
        } đã đổi lịch khám của bạn.\nLịch cũ: ${oldTime} ${oldDateStr}\nLịch mới: ${
          newSlot.start
        } ${newDateStr}\nLý do: ${reason || "Thay đổi kế hoạch làm việc"}`;

        await Notification.create(
          [
            {
              user_id: patient.user_id,
              type: "appointment",
              title: "📅 Thay Đổi Lịch Khám",
              body: notifBody,
              appointment_id: appt._id,
              channels: ["in-app"],
              status: "unread",
              sent_at: new Date(),
            },
          ],
          { session }
        );

        // Socket
        const io = req.app.get("io");
        if (io) {
          io.to(patient.user_id.toString()).emit("new_notification", {
            message: "📅 Thay Đổi Lịch Khám",
            data: { body: notifBody },
          });
          // Emit sự kiện để reload lịch phía client nếu cần
          io.to(patient.user_id.toString()).emit("appointment_updated", appt);
        }
      }
    });

    res.json({ message: "Dời lịch thành công." });
  } catch (e) {
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    if (e.message === "FORBIDDEN")
      return res
        .status(403)
        .json({ error: "Đây không phải lịch hẹn của bạn." });
    if (e.message === "INVALID_STATUS")
      return res
        .status(400)
        .json({ error: "Lịch hẹn đã hủy hoặc hoàn thành không thể dời." });
    if (e.message === "SLOT_BUSY")
      return res.status(409).json({
        error: "Khung giờ mới đã có người đặt, vui lòng chọn giờ khác.",
      });
    next(e);
  } finally {
    session.endSession();
  }
};
