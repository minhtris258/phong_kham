import mongoose from "mongoose";
import Visit from "../models/VisitModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Timeslot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js";
import Patient from "../models/PatientModel.js";
import MedicalService from "../models/MedicalServiceModel.js"; // Import để tra giá dịch vụ
import { getDoctorIdFromUser } from "../utils/getDoctorIdFromUser.js";
import sendEmail from "../utils/sendEmail.js";
import QRCode from "qrcode";

// Helper: Tính tổng tiền (Dùng cho hàm update hoặc tính toán nội bộ)
function calcTotals(fee, items) {
  const safeFee = Math.max(Number(fee || 0), 0);
  const extra = items.reduce((sum, item) => {
    const q = Math.max(Number(item.quantity || 0), 0);
    const p = Math.max(Number(item.price || 0), 0);
    return sum + q * p;
  }, 0);
  return safeFee + extra;
}

/** POST /api/visits
 * Tạo hồ sơ khám bệnh
 */
// ... (Các phần import giữ nguyên)

/** POST /api/visits
 * Tạo hồ sơ khám bệnh
 */

export const createVisit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const io = req.app.get("io");
    const {
      appointment_id,
      symptoms,
      diagnosis = "",
      notes = "",
      advice = "",
      next_visit_timeslot_id = null,
      prescriptions = [],
      serviceIds = [],
    } = req.body || {};

    // 1. Validate & Lấy thông tin cơ bản
    if (!appointment_id || !symptoms) throw new Error("MISSING_FIELDS");
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    const appt = await Appointment.findById(appointment_id).session(session);
    if (!appt || String(appt.doctor_id) !== String(myDoctorId))
      throw new Error("FORBIDDEN");

    const existed = await Visit.findOne({ appointment_id: appt._id }).session(
      session
    );
    if (existed) throw new Error("VISIT_EXISTS");

    // 2. Xử lý Tái khám
    let followupInfo = { scheduled: false };
    let targetSlot = null;
    let qrCodeBase64Followup = null;

    if (
      next_visit_timeslot_id &&
      mongoose.Types.ObjectId.isValid(next_visit_timeslot_id)
    ) {
      targetSlot = await Timeslot.findOne({
        _id: next_visit_timeslot_id,
        status: "free",
      }).session(session);
      if (targetSlot) {
        const [newAppt] = await Appointment.create(
          [
            {
              patient_id: appt.patient_id,
              doctor_id: myDoctorId,
              timeslot_id: targetSlot._id,
              date: targetSlot.date,
              start: targetSlot.start,
              status: "confirmed",
              reason: `Tái khám: ${diagnosis}`.substring(0, 100),
              checkinCode: Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase(),
            },
          ],
          { session }
        );

        targetSlot.status = "booked";
        targetSlot.appointment_id = newAppt._id;
        await targetSlot.save({ session });

        followupInfo = {
          scheduled: true,
          date: targetSlot.date,
          appointment_id: newAppt._id,
          start: targetSlot.start,
          checkinCode: newAppt.checkinCode,
        };

        const qrData = JSON.stringify({
          apptId: newAppt._id.toString(),
          patientId: appt.patient_id.toString(),
          code: followupInfo.checkinCode,
          action: "CHECK_IN",
        });
        qrCodeBase64Followup = await QRCode.toDataURL(qrData);
      }
    }

    // 3. Tính tiền & Tạo Visit
    const doc = await Doctor.findById(myDoctorId).session(session);
    const consultationFee = Number(doc?.consultation_fee || 0);

    let billItems = [];
    if (serviceIds?.length > 0) {
      const services = await MedicalService.find({
        _id: { $in: serviceIds },
      }).session(session);
      billItems = services.map((svc) => ({
        service_id: svc._id,
        name: svc.name,
        quantity: 1,
        price: svc.price,
      }));
    }
    const totalAmount = calcTotals(consultationFee, billItems);
    const formattedPrescriptions = prescriptions.map((p) => ({
      ...p,
      quantity: Number(p.quantity) || 1,
    }));

    const [createdVisit] = await Visit.create(
      [
        {
          appointment_id: appt._id,
          patient_id: appt.patient_id,
          doctor_id: myDoctorId,
          symptoms,
          diagnosis,
          notes,
          advice,
          next_visit_timeslot_id: followupInfo.scheduled
            ? next_visit_timeslot_id
            : null,
          next_visit_date: followupInfo.scheduled ? followupInfo.date : null,
          prescriptions: formattedPrescriptions,
          consultation_fee_snapshot: consultationFee,
          bill_items: billItems,
          total_amount: totalAmount,
        },
      ],
      { session }
    );

    // 4. Hoàn tất lịch cũ
    appt.status = "completed";
    await appt.save({ session });

    // 5. THÔNG BÁO REALTIME (FIXED)
    const patientProfile = await Patient.findById(appt.patient_id).session(
      session
    );
    if (patientProfile?.user_id) {
      const targetUserId = patientProfile.user_id.toString();

      // A. Thông báo Kết quả khám
      const [notifResult] = await Notification.create(
        [
          {
            user_id: targetUserId,
            type: "visit",
            title: "✅ Kết Quả Khám Bệnh",
            body: `Bác sĩ ${doc.fullName} đã trả kết quả. Chẩn đoán: ${
              diagnosis || symptoms
            }.`,
            appointment_id: appt._id,
            data: { visit_id: createdVisit._id },
            sent_at: new Date(),
          },
        ],
        { session }
      );
      if (io)
        io.to(targetUserId).emit("new_notification", {
          message: notifResult.title,
          data: notifResult,
        });

      // B. Thông báo yêu cầu đánh giá
      const [notifRating] = await Notification.create(
        [
          {
            user_id: targetUserId,
            type: "rating_request",
            title: "⭐ Đánh giá dịch vụ",
            body: `Hãy dành chút thời gian đánh giá bác sĩ ${doc.fullName} nhé!`,
            appointment_id: appt._id,
            sent_at: new Date(),
          },
        ],
        { session }
      );
      if (io)
        io.to(targetUserId).emit("new_notification", {
          message: notifRating.title,
          data: notifRating,
        });

      // C. Thông báo lịch tái khám
      if (followupInfo.scheduled) {
        const followupDateStr = new Date(followupInfo.date).toLocaleDateString(
          "vi-VN"
        );
        const [notifFollowup] = await Notification.create(
          [
            {
              user_id: targetUserId,
              type: "appointment",
              title: "📅 Lịch Tái Khám Mới",
              body: `Chào ${patientProfile.fullName}, bạn có lịch tái khám lúc ${followupInfo.start} ngày ${followupDateStr}.`,
              appointment_id: followupInfo.appointment_id,
              qr: qrCodeBase64Followup,
              sent_at: new Date(),
            },
          ],
          { session }
        );
        if (io)
          io.to(targetUserId).emit("new_notification", {
            message: notifFollowup.title,
            data: notifFollowup,
          });
      }
    }

    await session.commitTransaction();

    // 6. GỬI EMAIL TỔNG HỢP (GIỮ NGUYÊN LOGIC CỦA BẠN)
    if (patientProfile?.email) {
      try {
        const prescriptionListHtml =
          formattedPrescriptions.length > 0
            ? formattedPrescriptions
                .map(
                  (p, index) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                index + 1
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>${
                p.drug
              }</b></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                p.quantity
              } ${p.unit || "Viên"}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                p.dosage || ""
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                p.frequency || ""
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                p.duration || ""
              }</td>
            </tr>`
                )
                .join("")
            : `<tr><td colspan="6" style="padding: 15px; text-align: center; color: #777;"><i>Không có thuốc kê đơn</i></td></tr>`;

        const serviceListHtml = billItems
          .map(
            (s) => `<li>${s.name}: ${s.price.toLocaleString("vi-VN")} đ</li>`
          )
          .join("");

        let followUpSectionHtml = "";
        let emailAttachments = [];

        if (followupInfo.scheduled) {
          const followupDateStr = new Date(
            followupInfo.date
          ).toLocaleDateString("vi-VN");
          emailAttachments.push({
            filename: "qrcode_followup.png",
            path: qrCodeBase64Followup,
            cid: "qr_followup_cid",
          });

          followUpSectionHtml = `
            <div style="margin-top: 30px; border: 2px solid #007bff; border-radius: 12px; overflow: hidden; font-family: Arial, sans-serif;">
              <div style="background-color: #007bff; color: white; padding: 15px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">THÔNG TIN HẸN TÁI KHÁM</h2>
              </div>
              <div style="padding: 20px; background-color: #e9f2ff;">
                <p style="margin: 0 0 10px 0;">Bác sĩ đã chỉ định lịch tái khám cho bạn:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="width: 100px; color: #666;">Thời gian:</td><td style="font-weight: bold; color: #333;">${followupInfo.start} - ${followupDateStr}</td></tr>
                  <tr><td style="color: #666;">Bác sĩ:</td><td style="font-weight: bold; color: #333;">${doc.fullName}</td></tr>
                </table>
                <div style="text-align: center; margin-top: 20px; padding: 15px; border: 1px dashed #28a745; border-radius: 8px; background-color: #ffffff;">
                  <p style="font-weight: bold; color: #28a745; margin-bottom: 10px;">MÃ QR CHECK-IN TÁI KHÁM</p>
                  <img src="cid:qr_followup_cid" alt="QR Code" style="width: 160px; height: 160px; display: inline-block;"/>
                  <p style="font-size: 12px; color: #666; margin-top: 10px;">(Vui lòng đưa mã này cho lễ tân khi đến tái khám)</p>
                </div>
              </div>
            </div>`;
        }

        await sendEmail({
          email: patientProfile.email,
          subject: `Kết Quả Khám & Lịch Tái Khám - PK MedPro`,
          attachments: emailAttachments,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; padding: 20px;">
              <h2 style="color: #007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">PHIẾU KẾT QUẢ KHÁM BỆNH</h2>
              <p><b>Bệnh nhân:</b> ${
                patientProfile.fullName
              } | <b>Bác sĩ:</b> ${doc.fullName}</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
                <p><b>Triệu chứng:</b> ${symptoms}</p>
                <p><b>Chẩn đoán:</b> ${diagnosis}</p>
                <p><b>Lời dặn:</b> ${
                  advice || "Theo dõi và uống thuốc theo đơn"
                }</p>
              </div>
              <h3 style="color: #333;">ĐƠN THUỐC</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="background-color: #007bff; color: white;">
                  <th style="padding: 8px; border: 1px solid #ddd;">#</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Tên thuốc</th>
                  <th style="padding: 8px;">SL</th>
                  <th style="padding: 8px;">Liều</th>
                  <th style="padding: 8px;">Cách dùng</th>
                  <th style="padding: 8px;">TG</th>
                </tr>
                ${prescriptionListHtml}
              </table>
              <h3 style="color: #333; margin-top: 25px;">CHI PHÍ</h3>
              <ul><li>Phí khám: ${consultationFee.toLocaleString(
                "vi-VN"
              )} đ</li>${serviceListHtml}</ul>
              <p style="text-align: right; font-size: 18px;"><b>Tổng thanh toán: <span style="color: #d9534f;">${totalAmount.toLocaleString(
                "vi-VN"
              )} đ</span></b></p>
              ${followUpSectionHtml}
            </div>`,
        });
      } catch (err) {
        console.error("❌ Email Error:", err.message);
      }
    }

    return res.status(201).json({ message: "Thành công", visit: createdVisit });
  } catch (e) {
    await session.abortTransaction();
    console.error("❌ CREATE VISIT ERROR:", e);
    next(e);
  } finally {
    session.endSession();
  }
};
// ... CÁC HÀM GET GIỮ NGUYÊN NHƯ CŨ ...

export const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id)
      .populate("patient_id", "fullName email phone gender dob address") // Lấy chi tiết bệnh nhân
      .populate("doctor_id", "fullName specialty")
      .populate("appointment_id", "date start reason") // Lấy thông tin buổi hẹn gốc
      .lean();
    if (!v)
      return res.status(404).json({ error: "Không tìm thấy hồ sơ khám." });
    return res.json({ visit: v });
  } catch (e) {
    next(e);
  }
};

export const getVisitByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const v = await Visit.findOne({ appointment_id: appointmentId })
      .populate("patient_id", "fullName email phone")
      .populate("doctor_id", "fullName specialty")
      .lean();

    // Nếu chưa có thì trả về null hoặc object rỗng để frontend biết đường xử lý
    if (!v) return res.json({ visit: null });

    res.json({ visit: v });
  } catch (e) {
    next(e);
  }
};

export const myVisits = async (req, res, next) => {
  try {
    const patientProfile = await Patient.findOne({ user_id: req.user._id });
    if (!patientProfile) return res.json({ data: [] });

    const list = await Visit.find({ patient_id: patientProfile._id })
      .populate("doctor_id", "fullName specialty")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: list });
  } catch (e) {
    next(e);
  }
};

export const myDoctorVisits = async (req, res, next) => {
  try {
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId)
      return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    // 1. Lấy tham số phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { doctor_id: myDoctorId };

    // 2. Thực hiện query song song
    const [total, list] = await Promise.all([
      Visit.countDocuments(filter),
      Visit.find(filter)
        .populate("patient_id", "fullName gender dob")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // 3. Trả về kết quả
    res.json({
      data: list,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (e) {
    next(e);
  }
};

// =================================================================
// UPDATE VISIT (CẬP NHẬT & GỬI LẠI EMAIL)
// =================================================================

export const updateVisit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const io = req.app.get("io");
    const { id } = req.params;

    // 1. Tìm hồ sơ
    const v = await Visit.findById(id).session(session);
    if (!v) throw new Error("NOT_FOUND");

    // 2. Check quyền (Bác sĩ sở hữu hoặc Admin)
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    const isOwner = myDoctorId && String(v.doctor_id) === String(myDoctorId);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("FORBIDDEN");
    }

    // 3. Xử lý dữ liệu update
    const {
      symptoms,
      diagnosis,
      notes,
      advice,
      prescriptions,
      bill_items,
      next_visit_date,
    } = req.body;

    if (symptoms) v.symptoms = symptoms;
    if (diagnosis) v.diagnosis = diagnosis;
    if (notes) v.notes = notes;
    if (advice) v.advice = advice;
    if (next_visit_date) v.next_visit_date = next_visit_date;

    // --- Xử lý Thuốc (Nếu có gửi lên thì format lại giống createVisit) ---
    if (Array.isArray(prescriptions)) {
      v.prescriptions = prescriptions.map((p) => ({
        medicine_id:
          p.medicine_id && mongoose.Types.ObjectId.isValid(p.medicine_id)
            ? p.medicine_id
            : null,
        drug: p.drug || "Thuốc kê ngoài",
        dosage: p.dosage || "",
        frequency: p.frequency || "",
        duration: p.duration || "",
        note: p.note || "",
        quantity: Number(p.quantity) || 1,
        unit: p.unit || "Viên",
      }));
    }

    // --- Xử lý Dịch vụ & Tính tiền ---
    if (Array.isArray(bill_items)) {
      v.bill_items = bill_items.map((b) => ({
        service_id: b.service_id || null,
        name: b.name,
        quantity: Number(b.quantity) || 1,
        price: Number(b.price) || 0,
      }));
    }

    // Tính lại tổng tiền
    v.total_amount = calcTotals(v.consultation_fee_snapshot, v.bill_items);

    await v.save({ session });

    // 4. Notification (Socket)
    const patientProfile = await Patient.findById(v.patient_id).session(
      session
    );
    if (patientProfile && patientProfile.user_id) {
      const notif = await Notification.create(
        [
          {
            user_id: patientProfile.user_id,
            type: "visit",
            title: "📝 Hồ Sơ Khám Được Cập Nhật",
            body: `Bác sĩ vừa cập nhật kết quả khám của bạn. Chẩn đoán: ${v.diagnosis}.`,
            appointment_id: v.appointment_id,
            data: { visit_id: v._id },
            channels: ["in-app"],
            status: "unread",
            sent_at: new Date(),
          },
        ],
        { session }
      );

      if (io) {
        io.to(patientProfile.user_id.toString()).emit("new_notification", {
          message: notif[0].title,
          data: notif[0],
        });
      }
    }

    await session.commitTransaction();

    // 5. Gửi lại Email (Sau khi commit)
    // Chỉ gửi nếu là update từ Bác sĩ (tránh Admin update lặt vặt spam mail)
    if (isOwner && patientProfile && patientProfile.email) {
      try {
        // Tái sử dụng logic tạo HTML (Rút gọn cho code đỡ dài)
        const prescriptionHtml =
          v.prescriptions.length > 0
            ? v.prescriptions
                .map(
                  (p, i) => `
                    <tr>
                        <td style="padding:5px;border:1px solid #ddd;text-align:center">${
                          i + 1
                        }</td>
                        <td style="padding:5px;border:1px solid #ddd"><b>${
                          p.drug
                        }</b></td>
                        <td style="padding:5px;border:1px solid #ddd">${
                          p.quantity
                        } ${p.unit}</td>
                        <td style="padding:5px;border:1px solid #ddd">${
                          p.dosage
                        }</td>
                        <td style="padding:5px;border:1px solid #ddd">${
                          p.frequency
                        } <br><i>${p.note}</i></td>
                        <td style="padding:5px;border:1px solid #ddd">${
                          p.duration
                        }</td>
                    </tr>`
                )
                .join("")
            : '<tr><td colspan="6">Không có thuốc</td></tr>';

        const serviceHtml = v.bill_items
          .map(
            (s) => `<li>${s.name}: ${s.price.toLocaleString("vi-VN")} đ</li>`
          )
          .join("");

        await sendEmail({
          email: patientProfile.email,
          subject: `[CẬP NHẬT] Kết Quả Khám Bệnh - ${new Date().toLocaleDateString(
            "vi-VN"
          )}`,
          message: `Bác sĩ đã cập nhật hồ sơ khám bệnh của bạn.`,
          html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 800px; margin: 0 auto;">
                        <h2 style="color: #ff9800; text-align: center;">HỒ SƠ ĐÃ ĐƯỢC CẬP NHẬT</h2>
                        <p>Xin chào <b>${
                          patientProfile.fullName
                        }</b>, bác sĩ vừa chỉnh sửa thông tin khám bệnh của bạn:</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                            <p><b>Chẩn đoán:</b> ${v.diagnosis}</p>
                            <p><b>Lời dặn:</b> ${v.advice}</p>
                        </div>
                        
                        <h3>Đơn thuốc (Mới nhất):</h3>
                        <table style="width:100%; border-collapse:collapse; font-size: 13px;">
                             <thead style="background: #007bff; color: white;">
                                <tr>
                                    <th>#</th><th>Tên</th><th>SL</th><th>Liều</th><th>Cách dùng</th><th>TG</th>
                                </tr>
                             </thead>
                             <tbody>${prescriptionHtml}</tbody>
                        </table>

                        <h3>Chi phí:</h3>
                        <ul>
                            <li>Phí khám: ${v.consultation_fee_snapshot.toLocaleString(
                              "vi-VN"
                            )} đ</li>
                            ${serviceHtml}
                        </ul>
                        <p style="text-align: right; font-weight: bold; font-size: 18px; color: #d9534f;">Tổng: ${v.total_amount.toLocaleString(
                          "vi-VN"
                        )} đ</p>
                    </div>
                `,
        });
        console.log("📧 Đã gửi email cập nhật hồ sơ.");
      } catch (err) {
        console.error("Lỗi gửi mail update:", err.message);
      }
    }

    res.json({ message: "Cập nhật hồ sơ khám thành công.", visit: v });
  } catch (e) {
    await session.abortTransaction();
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy hồ sơ khám." });
    if (e.message === "FORBIDDEN")
      return res.status(403).json({ error: "Không đủ quyền truy cập." });
    next(e);
  } finally {
    session.endSession();
  }
};

// =================================================================
// CÁC HÀM QUẢN LÝ KHÁC (ADMIN, BÁC SĨ)
// =================================================================

// 7. Lấy tất cả hồ sơ khám của bệnh nhân
export const getVisitByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const list = await Visit.find({ patient_id: patientId })
      .populate("doctor_id", "fullName specialty")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: list });
  } catch (e) {
    next(e);
  }
};

// 8. Lấy tất cả hồ sơ khám (Dành cho Admin - Có Search & Pagination)
export const getAllVisitsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });
    }
    const { page = 1, limit = 10, search = "" } = req.query;

    // Tìm kiếm theo Chẩn đoán, Ghi chú, hoặc Tên bệnh nhân (Cần lookup nếu tìm tên)
    // Ở đây search đơn giản trên bảng Visit
    const query = search
      ? {
          $or: [
            { diagnosis: { $regex: search, $options: "i" } },
            { notes: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const visits = await Visit.find(query)
      .populate("patient_id", "fullName email phone")
      .populate("doctor_id", "fullName specialty")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Visit.countDocuments(query);
    res.json({
      data: visits,
      meta: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
};

// 9. XÓA HỒ SƠ KHÁM (ADMIN) - KÈM ROLLBACK APPOINTMENT
export const deleteVisitAdmin = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (req.user.role !== "admin") throw new Error("FORBIDDEN");

    const { id } = req.params;

    // 1. Tìm Visit để lấy appointment_id trước khi xóa
    const visit = await Visit.findById(id).session(session);
    if (!visit) throw new Error("NOT_FOUND");

    // 2. Cập nhật lại trạng thái Appointment (Từ completed -> confirmed)
    // Để bác sĩ có thể khám lại nếu cần
    await Appointment.updateOne(
      { _id: visit.appointment_id },
      { $set: { status: "confirmed" } }
    ).session(session);

    // 3. Nếu có Timeslot tái khám đã tạo tự động, có thể cần giải phóng (Tùy logic)
    // Ở đây mình tạm thời không xóa lịch tái khám để tránh phức tạp, chỉ xóa hồ sơ.

    // 4. Xóa Visit
    await Visit.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    res.json({
      message: "Đã xóa hồ sơ khám bệnh và khôi phục trạng thái lịch hẹn.",
      id,
    });
  } catch (e) {
    await session.abortTransaction();
    if (e.message === "FORBIDDEN")
      return res.status(403).json({ error: "Chỉ Admin mới có quyền xóa." });
    if (e.message === "NOT_FOUND")
      return res.status(404).json({ error: "Không tìm thấy hồ sơ." });
    next(e);
  } finally {
    session.endSession();
  }
};

// 10. Báo cáo doanh thu
export const getRevenueReportAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Không đủ quyền." });
    const { fromDate, toDate } = req.query;

    // Xử lý múi giờ hoặc lấy đầu ngày/cuối ngày
    const start = fromDate ? new Date(fromDate) : new Date(0);
    const end = toDate
      ? new Date(new Date(toDate).setHours(23, 59, 59, 999))
      : new Date();

    const stats = await Visit.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          totalRevenue: { $sum: "$total_amount" },
          avgRevenuePerVisit: { $avg: "$total_amount" },
        },
      },
    ]);
    res.json({
      period: { start, end },
      report: stats[0] || {
        totalVisits: 0,
        totalRevenue: 0,
        avgRevenuePerVisit: 0,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 11. Dashboard Bác sĩ
export const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId)
      return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Dùng Promise.all để chạy song song cho nhanh
    const [visitsToday, revenueStats] = await Promise.all([
      Visit.countDocuments({ doctor_id: doctorId, createdAt: { $gte: today } }),
      Visit.aggregate([
        {
          $match: {
            doctor_id: new mongoose.Types.ObjectId(doctorId),
            createdAt: { $gte: firstDayOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalMonthRevenue: { $sum: "$total_amount" },
            countMonth: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statData = revenueStats[0] || { totalMonthRevenue: 0, countMonth: 0 };

    res.json({
      stats: {
        visits_today: visitsToday,
        visits_this_month: statData.countMonth,
        revenue_this_month: statData.totalMonthRevenue,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 12. Tìm kiếm nâng cao cho Bác sĩ
export const searchDoctorVisits = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId)
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });

    // 1. Lấy tham số phân trang
    const page = parseInt(req.query.page) || 1; // Mặc định trang 1
    const limit = parseInt(req.query.limit) || 10; // Mặc định 10 dòng/trang
    const skip = (page - 1) * limit;

    const { diagnosis, fromDate, toDate, patientName } = req.query;

    let filter = { doctor_id: doctorId };

    // Filter theo chẩn đoán
    if (diagnosis) filter.diagnosis = { $regex: diagnosis, $options: "i" };

    // Filter theo ngày
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate)
        filter.createdAt.$lte = new Date(new Date(toDate).setHours(23, 59, 59));
    }

    // Filter theo tên bệnh nhân (Xử lý để tương thích với Phân trang)
    if (patientName) {
      // Tìm các bệnh nhân có tên trùng khớp trước
      const matchingPatients = await Patient.find({
        fullName: { $regex: patientName, $options: "i" },
      }).select("_id");

      const patientIds = matchingPatients.map((p) => p._id);

      // Thêm điều kiện: visit phải thuộc một trong các patientId tìm được
      filter.patient_id = { $in: patientIds };
    }

    // 2. Thực hiện query song song: Đếm tổng số và Lấy dữ liệu trang hiện tại
    const [total, visits] = await Promise.all([
      Visit.countDocuments(filter), // Đếm tổng số bản ghi thỏa điều kiện
      Visit.find(filter)
        .populate("patient_id", "fullName email phone dob")
        .sort({ createdAt: -1 })
        .skip(skip) // Bỏ qua số lượng bản ghi của trang trước
        .limit(limit) // Lấy số lượng bản ghi giới hạn
        .lean(),
    ]);

    // 3. Trả về kết quả kèm metadata phân trang
    res.json({
      data: visits,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (e) {
    next(e);
  }
};
