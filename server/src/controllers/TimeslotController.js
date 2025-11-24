import TimeSlot from "../models/TimeslotModel.js";
import DoctorSchedule from "../models/DoctorScheduleModel.js";
import Holiday from "../models/HolidayModel.js";

// ==========================================
// HELPER FUNCTIONS (Tính toán giờ)
// ==========================================
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "").split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Hàm cắt giờ: 08:00 - 11:00 (30p) -> [08:00, 08:30, ...]
// Chỉ trả về mảng các giờ bắt đầu (start times)
const splitToSlots = (range, slotMinutes) => {
  const startM = toMinutes(range.start);
  const endM = toMinutes(range.end);
  if (startM == null || endM == null || endM <= startM) return [];
  
  const out = [];
  for (let t = startM; t + slotMinutes <= endM; t += slotMinutes) {
    out.push(toHHMM(t));
  }
  return out;
};

// Hàm gộp dải giờ
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

const applyException = (baseRanges, exception) => {
  if (!exception) return baseRanges;
  if (exception.isDayOff) return [];

  const afterRemove = baseRanges.filter(
    br => !exception.removeSlot.some(rr => rr.start === br.start && rr.end === br.end)
  );

  const combined = mergeRanges([...afterRemove, ...(exception.add || [])]);
  return combined;
};

// ==========================================
// MAIN CONTROLLER
// ==========================================

export const listOrGenerateSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId || req.params.id;
    const date = req.params.date; 

    if (!doctorId || !date) {
      return res.status(400).json({ error: "Thiếu doctorId hoặc date." });
    }

    // 1. KIỂM TRA DB
    const existingSlots = await TimeSlot.find({ 
        doctor_id: doctorId, 
        date: date 
    }).sort({ start: 1 }).lean();

    if (existingSlots.length > 0) {
      const availableSlots = existingSlots.filter(s => s.status === 'free');
      
      const now = new Date();
      const isToday = date === now.toISOString().slice(0, 10);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const finalSlots = isToday 
        ? availableSlots.filter(s => toMinutes(s.start) > currentMinutes)
        : availableSlots;

      return res.json(finalSlots);
    }

    // 2. TẠO MỚI (GENERATE)
    const globalHoliday = await Holiday.findOne({ date: date }).lean();
    if (globalHoliday && globalHoliday.isMandatoryDayOff) {
        return res.json([]); 
    }

    const schedule = await DoctorSchedule.findOne({ doctor_id: doctorId }).lean();
    if (!schedule) {
        return res.json([]); 
    }

    const dayDate = new Date(date);
    if (isNaN(dayDate.getTime())) return res.status(400).json({ error: "Ngày không hợp lệ" });
    
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayOfWeek = days[dayDate.getDay()];

    const dayConfig = schedule.weekly_schedule.find(d => d.dayOfWeek === dayOfWeek);
    const baseRanges = dayConfig ? dayConfig.timeRanges : [];
    const exception = schedule.exceptions.find(ex => ex.date === date);
    const finalRanges = applyException(baseRanges, exception);

    let generatedStartTimes = [];
    for (const range of finalRanges) {
        generatedStartTimes = [...generatedStartTimes, ...splitToSlots(range, schedule.slot_minutes)];
    }

    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (isToday) {
        generatedStartTimes = generatedStartTimes.filter(time => toMinutes(time) > currentMinutes);
    }

    if (generatedStartTimes.length === 0) {
        return res.json([]);
    }

    // E. LƯU VÀO DATABASE (SỬA LỖI TẠI ĐÂY)
    // Tính toán thêm trường 'end' dựa trên 'start' + 'slot_minutes'
    const slotDocuments = generatedStartTimes.map(startTime => {
        const startMin = toMinutes(startTime);
        const endMin = startMin + schedule.slot_minutes;
        
        return {
            doctor_id: doctorId,
            date: date,
            start: startTime,
            end: toHHMM(endMin), // <--- Bổ sung trường end (bắt buộc)
            status: "free", 
            appointment_id: null
        };
    });

    const savedSlots = await TimeSlot.insertMany(slotDocuments);

    return res.json(savedSlots);

  } catch (error) {
    console.error("Lỗi tạo slot:", error);
    next(error);
  }
};