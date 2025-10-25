import TimeSlot from "../models/TimeslotModel.js";
import DoctorSchedule from "../models/DoctorScheduleModel.js";

/** Lấy danh sách slot của bác sĩ theo ngày (tạo mới nếu chưa có dựa trên weekly_schedule + exceptions) */
export const listOrGenerateSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
      const date = req.params.date; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: "Thiếu date" });

    let slots = await TimeSlot.find({ doctor_id: doctorId, date })
      .sort({ start: 1 })
      .lean();
    if (slots.length) return res.json({ date, slots });

    const schedule = await DoctorSchedule.findOne({
      doctor_id: doctorId,
    }).lean();
    if (!schedule)
      return res.status(404).json({ error: "Bác sĩ chưa cấu hình lịch." });

    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[weekday];
    const dayDef = (schedule.weekly_schedule || []).find(
      (d) => d.dayOfWeek === dayName
    );
    let base = dayDef?.timeRanges || [];

    const ex = (schedule.exceptions || []).find((e) => e.date === date);
    if (ex) {
      if (ex.isDayOff) base = [];
      else {
        const removing = new Set(
          (ex.removeSlot || []).map((r) => `${r.start}-${r.end}`)
        );
        base = base.filter((r) => !removing.has(`${r.start}-${r.end}`));
        base = [...base, ...(ex.add || [])];
        // gộp trùng đơn giản
        const key = (r) => `${r.start}-${r.end}`;
        const map = new Map();
        for (const r of base) map.set(key(r), r);
        base = [...map.values()];
      }
    }
    const toMin = (s) => parseInt(s.slice(0, 2)) * 60 + parseInt(s.slice(3, 5));
    const toHHMM = (m) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
        2,
        "0"
      )}`;
    const out = [];
    for (const r of base) {
      let t = toMin(r.start);
      const end = toMin(r.end);
      while (t + schedule.slot_minutes <= end) {
        out.push({
          doctor_id: doctorId,
          date,
          start: toHHMM(t),
          end: toHHMM(t + schedule.slot_minutes),
          status: "free",
        });
        t += schedule.slot_minutes;
      }
    }

    if (!out.length) return res.json({ date, slots: [] });

    // insertMany with upsert-like (nhưng ở đây chưa tồn tại nên insert thẳng)
    await TimeSlot.insertMany(out, { ordered: false });
    slots = await TimeSlot.find({ doctor_id: doctorId, date })
      .sort({ start: 1 })
      .lean();
    return res.json({ date, slots });
  } catch (e) {
    next(e);
  }
};
