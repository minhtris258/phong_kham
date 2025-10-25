import DoctorSchedule from "../models/DoctorScheduleModel.js";
import Doctor from "../models/DoctorModel.js";

/** helper: parse "HH:mm" -> minutes */
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "").split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};
/** helper: minutes -> "HH:mm" */
const toHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
/** cắt dải giờ thành các slot theo slot_minutes */
const splitToSlots = (range, slotMinutes) => {
  const startM = toMinutes(range.start);
  const endM = toMinutes(range.end);
  if (startM == null || endM == null || endM <= startM) return [];
  const out = [];
  for (let t = startM; t + slotMinutes <= endM; t += slotMinutes) {
    out.push({ start: toHHMM(t), end: toHHMM(t + slotMinutes) });
  }
  return out;
};
/** hợp nhất các dải giờ (đơn giản: sort rồi merge nếu chồng) */
const mergeRanges = (ranges = []) => {
  const list = [...ranges]
    .map(r => ({ s: toMinutes(r.start), e: toMinutes(r.end) }))
    .filter(r => r.s != null && r.e != null && r.e > r.s)
    .sort((a, b) => a.s - b.s);
  const merged = [];
  for (const cur of list) {
    if (!merged.length || cur.s > merged[merged.length - 1].e) {
      merged.push({ s: cur.s, e: cur.e });
    } else {
      merged[merged.length - 1].e = Math.max(merged[merged.length - 1].e, cur.e);
    }
  }
  return merged.map(x => ({ start: toHHMM(x.s), end: toHHMM(x.e) }));
};
/** áp dụng exceptions cho 1 ngày cụ thể */
const applyException = (baseRanges, exception) => {
  if (!exception) return baseRanges;
  if (exception.isDayOff) return []; // nghỉ cả ngày

  // remove: loại bỏ dải khớp start-end (so sánh theo string)
  const afterRemove = baseRanges.filter(
    br => !exception.removeSlot.some(rr => rr.start === br.start && rr.end === br.end)
  );

  // add: thêm dải
  const combined = mergeRanges([...afterRemove, ...(exception.add || [])]);
  return combined;
};

/** GET /api/doctors/:id/schedule (public/admin tuỳ bạn) */
export const getDoctorSchedule = async (req, res, next) => {
  try {
    const { id } = req.params; // doctor id
    const doctor = await Doctor.findById(id).lean();
    if (!doctor) return res.status(404).json({ error: "Không tìm thấy bác sĩ." });

    const schedule = await DoctorSchedule.findOne({ doctor_id: id }).lean();
    if (!schedule) return res.status(404).json({ error: "Bác sĩ chưa cấu hình lịch." });

    return res.json({ schedule });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/:id/slots?date=YYYY-MM-DD
 * Trả danh sách slot trống theo template + exceptions (chưa trừ các booking).
 * Bạn có thể lọc thêm “đã đặt” bằng cách trừ các Appointment trong khoảng ngày đó.
 */
export const getDoctorSlotsByDate = async (req, res, next) => {
  try {
    const { id } = req.params;   // doctor id
    const { date } = req.query;  // "YYYY-MM-DD"

    if (!date) return res.status(400).json({ error: "Thiếu date (YYYY-MM-DD)" });

    const schedule = await DoctorSchedule.findOne({ doctor_id: id }).lean();
    if (!schedule) return res.status(404).json({ error: "Bác sĩ chưa cấu hình lịch." });

    const day = new Date(`${date}T00:00:00Z`);
    if (isNaN(day.getTime())) return res.status(400).json({ error: "Định dạng date không hợp lệ" });

    const weekday = day.getUTCDay(); // 0..6
    const week = schedule.weekly_schedule || [];
    const weekdayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][weekday];
    const dayDef = week.find(d => d.dayOfWeek === weekdayName);
    const baseRanges = dayDef?.timeRanges || [];

    // tìm exception của ngày này (theo string YYYY-MM-DD)
    const exception = (schedule.exceptions || []).find(ex => ex.date === date);

    // áp dụng ngoại lệ
    const finalRanges = applyException(baseRanges, exception);

    // cắt slot
    let slots = [];
    for (const r of finalRanges) {
      slots = slots.concat(splitToSlots(r, schedule.slot_minutes));
    }

    // (Optional) loại slot đã qua giờ hiện tại nếu là hôm nay
    const now = new Date();
    const nowYMD = now.toISOString().slice(0, 10);
    if (date === nowYMD) {
      const curMins = now.getUTCHours() * 60 + now.getUTCMinutes();
      slots = slots.filter(s => toMinutes(s.start) > curMins);
    }

    // TODO: trừ các booking đã có (nếu có bảng Appointments)
    // const appointments = await Appointment.find({ doctor_id: id, date, status: { $ne: "cancelled" }})
    // → loại trùng thời gian

    return res.json({ date, slot_minutes: schedule.slot_minutes, slots });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/me/schedule (doctor xem lịch của mình) */
export const getMySchedule = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được truy cập." });

    const schedule = await DoctorSchedule.findOne({ doctor_id: req.doctor._id }).lean();
    if (!schedule) return res.status(404).json({ error: "Bạn chưa cấu hình lịch." });

    return res.json({ schedule });
  } catch (e) {
    next(e);
  }
};

/** POST /api/doctors/me/schedule  (doctor tạo/cập nhật toàn bộ cấu hình)
 * body: { slot_minutes, weekly_template, exceptions }
 */
export const upsertMySchedule = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được cập nhật." });

    const { slot_minutes, weekly_schedule, exceptions } = req.body || {};

    // validate cơ bản
    if (slot_minutes && (typeof slot_minutes !== "number" || slot_minutes < 5 || slot_minutes > 240)) {
      return res.status(400).json({ error: "slot_minutes không hợp lệ (5–240)." });
    }

    const updated = await DoctorSchedule.findOneAndUpdate(
      { doctor_id: req.doctor._id },
      {
        $set: {
          ...(slot_minutes ? { slot_minutes } : {}),
          ...(weekly_schedule ? { weekly_schedule } : {}),
          ...(exceptions ? { exceptions } : {}),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({ message: "Lưu lịch khám thành công.", schedule: updated });
  } catch (e) {
    next(e);
  }
};

/** POST /api/doctors/me/schedule/exceptions (thêm/cập nhật 1 exception của ngày)
 * body: { date:"YYYY-MM-DD", isDayOff?:boolean, add?:[], remove?:[] }
 */
export const upsertMyException = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được cập nhật." });

    const { date, isDayOff = false, add = [], removeSlot = [] } = req.body || {};
    if (!date) return res.status(400).json({ error: "Thiếu date" });

    const schedule = await DoctorSchedule.findOne({ doctor_id: req.doctor._id });
    if (!schedule) {
      // tạo mới nếu chưa có
      const created = await DoctorSchedule.create({
        doctor_id: req.doctor._id,
        slot_minutes: 30,
        weekly_schedule: [],
        exceptions: [{ date, isDayOff, add, removeSlot }],
      });
      return res.status(200).json({ message: "Lưu thành công.", schedule: created });
    }

    const idx = schedule.exceptions.findIndex(ex => ex.date === date);
    if (idx >= 0) {
      schedule.exceptions[idx] = { date, isDayOff, add, removeSlot };
    } else {
      schedule.exceptions.push({ date, isDayOff, add, removeSlot });
    }
    await schedule.save();

    return res.status(200).json({ message: "Lưu thành công.", schedule });
  } catch (e) {
    next(e);
  }
};
