import mongoose from "mongoose";
import Visit from "../models/VisitModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Timeslot from "../models/TimeslotModel.js";
import { getDoctorIdFromUser } from "../utils/getDoctorIdFromUser.js";

// tính tiền tổng
function calcTotals(visitLike) {
  const fee = Math.max(Number(visitLike.consultation_fee_snapshot || 0), 0);
  const items = Array.isArray(visitLike.bill_items) ? visitLike.bill_items : [];
  const extra = items.reduce((s, it) => {
    const q = Math.max(Number(it.quantity || 0), 0);
    const p = Math.max(Number(it.price || 0), 0);
    return s + q * p;
  }, 0);
  return { total_amount: fee + extra };
}

/** POST /api/visits  (doctor) – tạo visit từ appointment */
export const createVisit = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const {
      appointment_id,
      symptoms,
      diagnosis = "",
      notes = "",
      advice = "",
      next_visit_date = null,     // "YYYY-MM-DD" hoặc ISO
      prescriptions = [],
      bill_items = []
    } = req.body || {};
    if (!appointment_id || !symptoms) {
      return res.status(400).json({ error: "Thiếu appointment_id hoặc symptoms." });
    }

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    let createdVisit;
    let followupResult = { scheduled: false };

    await session.withTransaction(async () => {
      // 1) Appointment hiện tại
      const appt = await Appointment.findById(appointment_id).session(session);
      if (!appt) throw new Error("APPT_NOT_FOUND");
      if (String(appt.doctor_id) !== String(myDoctorId)) throw new Error("FORBIDDEN");
      if (appt.status === "cancelled") throw new Error("APPT_CANCELLED");

      // 2) Không cho trùng visit
      const existed = await Visit.findOne({ appointment_id: appt._id }).session(session);
      if (existed) throw new Error("VISIT_EXISTS");

      // 3) Snapshot giá khám
      const doc = await Doctor.findById(myDoctorId).lean().session(session);
      const consultation_fee_snapshot = Math.max(Number(doc?.consultation_fee || 0), 0);

      // 4) Tạo visit
      const draft = {
        appointment_id: appt._id,
        patient_id: appt.patient_id,
        doctor_id: myDoctorId,
        symptoms,
        diagnosis,
        notes,
        advice,
        next_visit_date: next_visit_date ? new Date(next_visit_date) : undefined,
        prescriptions,
        consultation_fee_snapshot,
        bill_items
      };
      const { total_amount } = calcTotals(draft);

      const [v] = await Visit.create([{ ...draft, total_amount }], { session });
      createdVisit = v;

      // 5) Close appointment hiện tại
      if (appt.status !== "cancelled") {
        appt.status = "completed";
        await appt.save({ session });
      }

      // 6) Nếu có ngày tái khám -> đặt lịch mới
      if (next_visit_date) {
        const dateStr = typeof next_visit_date === "string"
          ? next_visit_date.slice(0, 10)
          : new Date(next_visit_date).toISOString().slice(0, 10);

        // tìm slot trống sớm nhất cùng bác sĩ, cùng ngày
        const nextFreeSlot = await Timeslot.findOne({
          doctor_id: myDoctorId,
          date: dateStr,
          status: "free"
        })
          .sort({ start: 1 })
          .session(session)
          .lean();

        if (nextFreeSlot) {
          // book slot
          const newAppt = await Appointment.create([{
            patient_id: appt.patient_id,
            doctor_id: myDoctorId,
            timeslot_id: nextFreeSlot._id,
            date: nextFreeSlot.date,
            start: nextFreeSlot.start,
            status: "confirmed",
            reason: "Follow-up"
          }], { session });
          await Timeslot.updateOne(
            { _id: nextFreeSlot._id },
            { $set: { status: "booked", appointment_id: newAppt[0]._id } },
            { session }
          );

          followupResult = {
            scheduled: true,
            appointment_id: newAppt[0]._id,
            date: nextFreeSlot.date,
            start: nextFreeSlot.start
          };
        } else {
          // không có slot trống trong ngày này
          followupResult = {
            scheduled: false,
            reason: "NO_FREE_SLOT",
            message: "Ngày tái khám không còn khung giờ trống. Vui lòng chọn ngày/giờ khác."
          };
        }
      }
    });

    return res.status(201).json({
      message: "Tạo hồ sơ khám thành công.",
      visit: createdVisit,
      followup: followupResult
    });
  } catch (e) {
    if (e.message === "APPT_NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy appointment." });
    if (e.message === "FORBIDDEN") return res.status(403).json({ error: "Không đủ quyền." });
    if (e.message === "VISIT_EXISTS") return res.status(409).json({ error: "Visit cho lịch này đã tồn tại." });
    if (e.message === "APPT_CANCELLED") return res.status(409).json({ error: "Appointment đã huỷ." });
    next(e);
  } finally {
    session.endSession();
  }
};

/** GET /api/visits/:id – bác sĩ chính / bệnh nhân / admin xem */
export const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id).lean();
    if (!v) return res.status(404).json({ error: "Không tìm thấy visit." });

    // Quyền đã do middleware verifyToken + (tuỳ route) requireRole kiểm soát.
    // Nếu cần chặn chéo giữa các bác sĩ/bệnh nhân, bạn có thể thêm check chi tiết ở đây.
    return res.json({ visit: v });
  } catch (e) { next(e); }
};

/** GET /api/visits/by-appointment/:appointmentId – tiện check đã có visit chưa */
export const getVisitByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const v = await Visit.findOne({ appointment_id: appointmentId }).lean();
    if (!v) return res.status(404).json({ error: "Visit chưa tồn tại." });
    res.json({ visit: v });
  } catch (e) { next(e); }
};

/** GET /api/visits/me – lịch sử khám của bệnh nhân */
export const myVisits = async (_req, res, next) => {
  try {
    const list = await Visit.find({ patient_id: _req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: list });
  } catch (e) { next(e); }
};

/** GET /api/visits/doctor/me – danh sách ca khám của tôi (bác sĩ) */
export const myDoctorVisits = async (req, res, next) => {
  try {
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    const list = await Visit.find({ doctor_id: myDoctorId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: list });
  } catch (e) { next(e); }
};

/** PUT /api/visits/:id – cập nhật hồ sơ khám (doctor/admin) */
export const updateVisit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const v = await Visit.findById(id);
    if (!v) return res.status(404).json({ error: "Không tìm thấy visit." });

    // Nếu muốn giới hạn đúng bác sĩ tạo mới được sửa:
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (myDoctorId && String(v.doctor_id) !== String(myDoctorId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Không đủ quyền." });
    }

    const allowed = [
      "symptoms","diagnosis","notes","advice","next_visit_date",
      "prescriptions","bill_items"
    ];
    for (const k of allowed) if (k in req.body) v[k] = req.body[k];

    const totals = calcTotals({
      consultation_fee_snapshot: v.consultation_fee_snapshot,
      bill_items: v.bill_items
    });
    v.total_amount = totals.total_amount;

    await v.save();
    res.json({ message: "Cập nhật hồ sơ khám thành công.", visit: v });
  } catch (e) { next(e); }
};