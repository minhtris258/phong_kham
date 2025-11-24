// controllers/DoctorScheduleController.js
import DoctorSchedule from "../models/DoctorScheduleModel.js";
import Doctor from "../models/DoctorModel.js";
import Holiday from "../models/HolidayModel.js";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

/** hợp nhất các dải giờ */
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

  const afterRemove = baseRanges.filter(
    br => !exception.removeSlot.some(rr => rr.start === br.start && rr.end === br.end)
  );

  const combined = mergeRanges([...afterRemove, ...(exception.add || [])]);
  return combined;
};

/** * [MỚI] Helper: Gộp Ngày Lễ (Holiday) vào Schedule trả về 
 * Giúp hiển thị chấm đỏ trên lịch tháng ngay cả khi bác sĩ chưa cấu hình ngày đó
 */
const mergeHolidaysIntoSchedule = async (schedule) => {
    // 1. Lấy tất cả ngày lễ bắt buộc nghỉ
    const holidays = await Holiday.find({ isMandatoryDayOff: true }).lean();
    
    if (!holidays || holidays.length === 0) return schedule;

    // 2. Convert Holidays thành format Exception để Frontend dễ hiển thị
    const holidayExceptions = holidays.map(h => ({
        date: h.date,        // "YYYY-MM-DD"
        isDayOff: true,      // Đánh dấu là ngày nghỉ
        isHoliday: true,     // Flag nhận biết là ngày lễ
        name: h.name,  // Tên ngày lễ (Frontend có thể hiển thị tooltip)
        reason: h.name,      
        add: [],
        removeSlot: []
    }));

    // 3. Gộp vào danh sách exceptions hiện có của bác sĩ
    // Lưu ý: Nếu ngày đó bác sĩ đã có exception riêng, ta có thể chọn ưu tiên Holiday hoặc ưu tiên Bác sĩ
    // Ở đây ta push thêm vào, Frontend cần logic để render (thường Holiday sẽ ưu tiên hiển thị)
    const mergedExceptions = [...(schedule.exceptions || []), ...holidayExceptions];

    // Trả về object schedule mới (không sửa trực tiếp vào DB, chỉ sửa dữ liệu trả ra API)
    return { ...schedule, exceptions: mergedExceptions };
};

// ==========================================
// CONTROLLERS
// ==========================================

/** GET /api/doctors/:id/schedule (public/admin tuỳ bạn) */
export const getDoctorSchedule = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.params.doctorId;
    
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) return res.status(404).json({ error: "Không tìm thấy bác sĩ." });

    let schedule = await DoctorSchedule.findOne({ doctor_id: doctorId }).lean();
    if (!schedule) return res.status(404).json({ error: "Bác sĩ chưa cấu hình lịch." });

    // [MỚI] Gộp ngày lễ vào để hiển thị
    schedule = await mergeHolidaysIntoSchedule(schedule);

    return res.json({ schedule });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/me/schedule (doctor xem lịch của mình) */
export const getMySchedule = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được truy cập." });

    let schedule = await DoctorSchedule.findOne({ doctor_id: req.doctor._id }).lean();
    if (!schedule) return res.status(404).json({ error: "Bạn chưa cấu hình lịch." });

    // [MỚI] Gộp ngày lễ vào để hiển thị
    schedule = await mergeHolidaysIntoSchedule(schedule);

    return res.json({ schedule });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/:id/slots?date=YYYY-MM-DD */
export const getDoctorSlotsByDate = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.params.doctorId;
    const { date } = req.query; 

    if (!date) return res.status(400).json({ error: "Thiếu date (YYYY-MM-DD)" });

    const schedule = await DoctorSchedule.findOne({ doctor_id: doctorId }).lean();
    if (!schedule) return res.status(404).json({ error: "Bác sĩ chưa cấu hình lịch." });

    // --- CHECK HOLIDAY ---
    const globalHoliday = await Holiday.findOne({ date: date }).lean();
    
    if (globalHoliday && globalHoliday.isMandatoryDayOff) {
        return res.json({
            date,
            slot_minutes: schedule.slot_minutes,
            slots: [], 
            isHoliday: true,
            holidayName: globalHoliday.name, 
            message: `Bác sĩ nghỉ lễ: ${globalHoliday.name}`
        });
    }
    // ---------------------

    const day = new Date(`${date}T00:00:00Z`);
    if (isNaN(day.getTime())) return res.status(400).json({ error: "Định dạng date không hợp lệ" });

    const weekday = day.getUTCDay();
    const week = schedule.weekly_schedule || [];
    const weekdayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][weekday];
    const dayDef = week.find(d => d.dayOfWeek === weekdayName);
    const baseRanges = dayDef?.timeRanges || [];

    const exception = (schedule.exceptions || []).find(ex => ex.date === date);
    const finalRanges = applyException(baseRanges, exception);

    let slots = [];
    for (const r of finalRanges) {
      slots = slots.concat(splitToSlots(r, schedule.slot_minutes));
    }

    const now = new Date();
    const nowYMD = now.toISOString().slice(0, 10);
    if (date === nowYMD) {
      const curMins = now.getUTCHours() * 60 + now.getUTCMinutes();
      slots = slots.filter(s => toMinutes(s.start) > curMins);
    }

    return res.json({ date, slot_minutes: schedule.slot_minutes, slots });
  } catch (e) {
    next(e);
  }
};

// ... (Các hàm upsertMySchedule, upsertMyException, adminUpsertDoctorException, updateDefaultSchedule giữ nguyên như phiên bản trước) ...
// Bạn copy lại các hàm POST/PUT đó vào dưới đây là xong.
// Chúng không cần sửa vì logic ghi (write) không nên tự động ghi đè ngày lễ vào DB riêng của bác sĩ.
// Chỉ logic đọc (read/get) mới cần trộn ngày lễ vào để hiển thị.

/** POST /api/doctors/me/schedule */
export const upsertMySchedule = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được cập nhật." });
    const { slot_minutes, weekly_schedule, exceptions } = req.body || {};
    if (slot_minutes && (typeof slot_minutes !== "number" || slot_minutes < 5 || slot_minutes > 240)) {
      return res.status(400).json({ error: "slot_minutes không hợp lệ (5–240)." });
    }
    const updated = await DoctorSchedule.findOneAndUpdate(
      { doctor_id: req.doctor._id },
      { $set: { ...(slot_minutes ? { slot_minutes } : {}), ...(weekly_schedule ? { weekly_schedule } : {}), ...(exceptions ? { exceptions } : {}), }, },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return res.status(200).json({ message: "Lưu lịch khám thành công.", schedule: updated });
  } catch (e) { next(e); }
};

/** POST /api/doctors/me/schedule/exceptions */
export const upsertMyException = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return res.status(403).json({ error: "Chỉ bác sĩ được cập nhật." });
    const { date, isDayOff = false, add = [], removeSlot = [] } = req.body || {};
    if (!date) return res.status(400).json({ error: "Thiếu date" });
    const schedule = await DoctorSchedule.findOne({ doctor_id: req.doctor._id });
    if (!schedule) {
      const created = await DoctorSchedule.create({ doctor_id: req.doctor._id, slot_minutes: 30, weekly_schedule: [], exceptions: [{ date, isDayOff, add, removeSlot }], });
      return res.status(200).json({ message: "Lưu thành công.", schedule: created });
    }
    const idx = schedule.exceptions.findIndex(ex => ex.date === date);
    if (idx >= 0) { schedule.exceptions[idx] = { date, isDayOff, add, removeSlot }; } 
    else { schedule.exceptions.push({ date, isDayOff, add, removeSlot }); }
    await schedule.save();
    return res.status(200).json({ message: "Lưu thành công.", schedule });
  } catch (e) { next(e); }
};

/** POST /api/doctor-schedules/:id/exceptions */
export const adminUpsertDoctorException = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "admin") return res.status(403).json({ error: "Không có quyền Admin." });
    const doctorId = req.params.id || req.params.doctorId; 
    const { date, isDayOff = false, add = [], removeSlot = [], reason = "" ,} = req.body || {};
    if (!date || !doctorId) return res.status(400).json({ error: "Thiếu date hoặc doctorId." });
    const schedule = await DoctorSchedule.findOne({ doctor_id: doctorId });
    if (!schedule) {
      const created = await DoctorSchedule.create({ doctor_id: doctorId, slot_minutes: 30, weekly_schedule: [], exceptions: [{ date, isDayOff, add, removeSlot }], });
      return res.status(200).json({ message: "Admin: Lưu lịch nghỉ thành công (tạo mới).", schedule: created });
    }
    const idx = schedule.exceptions.findIndex(ex => ex.date === date);
   if (idx > -1) {
  schedule.exceptions[idx] = { date, isDayOff, add, removeSlot, reason }; // <--- Thêm reason
} else {
  schedule.exceptions.push({ date, isDayOff, add, removeSlot, reason }); // <--- Thêm reason
}
    const updated = await schedule.save();
    return res.status(200).json({ message: "Admin: Cập nhật ngoại lệ lịch khám thành công.", schedule: updated });
  } catch (e) { next(e); }
};

/** PUT /api/doctor-schedules/:id/default */
export const updateDefaultSchedule = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.params.doctorId; 
    const { slot_minutes, weekly_schedule } = req.body;
    if (!doctorId) return res.status(400).json({ error: "Không tìm thấy ID bác sĩ trên URL" });
    if (!weekly_schedule || !Array.isArray(weekly_schedule)) return res.status(400).json({ error: "Dữ liệu weekly_schedule không hợp lệ." });
    const updatedSchedule = await DoctorSchedule.findOneAndUpdate(
      { doctor_id: doctorId },
      { $set: { slot_minutes: slot_minutes || 30, weekly_schedule: weekly_schedule } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ message: "Cập nhật lịch mặc định thành công", data: updatedSchedule });
  } catch (error) {
    console.error("Lỗi cập nhật lịch mặc định:", error);
    res.status(500).json({ error: error.message });
  }
};