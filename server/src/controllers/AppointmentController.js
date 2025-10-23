import mongoose from "mongoose";
import Timeslot from "../models/TimeslotModel.js";
import Appointment from "../models/AppointmentModel.js";

export const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") {
      return res.status(403).json({ error: "Chỉ bệnh nhân mới được đặt lịch." });
    }

    const { timeslot_id, reason = "" } = req.body || {};
    if (!timeslot_id) return res.status(400).json({ error: "Thiếu timeslot_id" });

    let created; // giữ appointment tạo ra

    await session.withTransaction(async () => {
      // 1) Giữ chỗ slot nếu còn "free"
      const slot = await Timeslot.findOneAndUpdate(
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
      await Timeslot.updateOne(
        { _id: slot._id },
        { $set: { status: "booked", appointment_id: appt._id } },
        { session }
      );
    });

    return res.status(201).json({ message: "Đặt lịch thành công.", appointment: created });
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

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("NOT_FOUND");

      // chỉ admin hoặc chính chủ patient
      if (!(role === "admin" || String(appt.patient_id) === String(req.user._id))) {
        throw new Error("FORBIDDEN");
      }

      if (appt.status === "cancelled") {
        return res.json({ message: "Đã huỷ trước đó." });
      }

      appt.status = "cancelled";
      await appt.save({ session });

      await Timeslot.updateOne(
        { _id: appt.timeslot_id, appointment_id: appt._id },
        { $set: { status: "free", appointment_id: null } },
        { session }
      );

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
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ data: items });
  } catch (e) {
    next(e);
  }
};