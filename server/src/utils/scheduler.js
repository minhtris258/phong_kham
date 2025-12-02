import moment from "moment";
import mongoose from "mongoose";
import DoctorSchedule from "../models/DoctorScheduleModel.js";
import TimeSlot from "../models/TimeslotModel.js"; // 👈 BẮT BUỘC PHẢI IMPORT CÁI NÀY
import Appointment from "../models/AppointmentModel.js";

// Hàm lấy các slot trống trong 1 ngày cụ thể
export const getAvailableSlots = async (doctorId, dateString) => {
    console.log(`\n🔵 --- BẮT ĐẦU CHECK LỊCH: ${dateString} ---`);

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) return [];

    // 2. Xác định thứ (Day of week)
    const date = moment(dateString);
    if (!date.isValid()) {
        console.log("❌ Ngày không hợp lệ");
        return [];
    }
    date.locale('en'); 
    const dayOfWeek = date.format('dddd'); // Ví dụ: "Monday"

    // 3. Lấy cấu hình lịch làm việc của bác sĩ (Lịch khung)
    const schedule = await DoctorSchedule.findOne({ doctor_id: doctorId });
    if (!schedule) {
        console.log("❌ Bác sĩ chưa có lịch làm việc khung.");
        return [];
    }

    // 4. Tìm cấu hình của ngày hôm đó
    const dailySchedule = schedule.weekly_schedule.find(d => d.dayOfWeek === dayOfWeek);
    if (!dailySchedule) {
        console.log(`❌ Bác sĩ nghỉ thứ: ${dayOfWeek}`);
        return [];
    }

    // 5. Tạo danh sách "LÝ THUYẾT" (Tất cả các giờ có thể đặt)
    let possibleSlots = [];
    const slotMinutes = schedule.slot_minutes || 30;

    dailySchedule.timeRanges.forEach(range => {
        let current = moment(`${dateString} ${range.start}`, "YYYY-MM-DD HH:mm");
        const end = moment(`${dateString} ${range.end}`, "YYYY-MM-DD HH:mm");
        
        const now = moment();
        const isToday = now.format("YYYY-MM-DD") === dateString;

        while (current.isBefore(end)) {
            // Nếu là hôm nay, chỉ lấy các giờ trong tương lai
            if (!isToday || current.isAfter(now)) {
                possibleSlots.push(current.format("HH:mm"));
            }
            current.add(slotMinutes, 'minutes');
        }
    });

    if (possibleSlots.length === 0) return [];

    // 👇 6. PHẦN SỬA LỖI QUAN TRỌNG: Check trực tiếp bảng TimeSlot
    // Lý do: Controller đặt lịch của bạn update trạng thái vào TimeSlot, nên check ở đây là chuẩn nhất.
    try {
        // Tìm tất cả các slot đã được tạo trong DB cho ngày này của bác sĩ này
        const existingTimeSlots = await TimeSlot.find({
            doctor_id: doctorId,
            date: dateString // Đảm bảo format YYYY-MM-DD khớp nhau
        });

        // Lọc ra danh sách những giờ ĐÃ BỊ CHIẾM (booked hoặc held)
        const busyTimes = existingTimeSlots
            .filter(slot => slot.status === "booked" || slot.status === "held")
            .map(slot => slot.start); // Lấy ra mảng giờ: ["09:00", "10:30"]

        console.log(`⚠️ Các giờ đã bận (Check TimeSlot DB):`, busyTimes);

        // 7. Loại bỏ giờ bận khỏi danh sách lý thuyết
        // Chỉ giữ lại giờ nào KHÔNG nằm trong busyTimes
        const finalSlots = possibleSlots.filter(time => !busyTimes.includes(time));

        console.log(`✅ Slot trống cuối cùng trả về:`, finalSlots);
        return finalSlots;

    } catch (err) {
        console.error("Lỗi khi check TimeSlot DB:", err);
        return [];
    }
};

// Hàm tìm ngày còn trống gần nhất (Quét 7 ngày tới)
export const findNextAvailableSlot = async (doctorId) => {
    console.log(`\n🔍 --- TÌM NGÀY TRỐNG GẦN NHẤT ---`);
    const nextDays = [];
    
    // Quét 7 ngày tính từ hôm nay
    for (let i = 0; i < 7; i++) {
        const checkDate = moment().add(i, 'days'); 
        const dateString = checkDate.format("YYYY-MM-DD");
        
        // Gọi lại hàm bên trên
        const slots = await getAvailableSlots(doctorId, dateString);

        if (slots && slots.length > 0) {
            nextDays.push({
                date: dateString,
                dayOfWeek: checkDate.locale('vi').format('dddd'), 
                slots: slots
            });
            // Nếu muốn tìm thấy ngày gần nhất là dừng luôn thì uncomment dòng dưới:
            // break; 
        }
    }
    
    return nextDays;
};