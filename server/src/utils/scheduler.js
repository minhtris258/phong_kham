import moment from "moment";
import mongoose from "mongoose";
import DoctorSchedule from "../models/DoctorScheduleModel.js";
import Appointment from "../models/AppointmentModel.js";

export const getAvailableSlots = async (doctorId, dateString) => {
    console.log(`\n🔵 --- BẮT ĐẦU CHECK LỊCH ---`);
    console.log(`1. Input: ID=${doctorId}, Date=${dateString}`);

    // 1. Kiểm tra ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        console.log(`❌ ID rác. Return rỗng.`);
        return [];
    }

    // 2. Tính thứ (Ép về tiếng Anh để khớp Model)
    const date = moment(dateString);
    date.locale('en'); // 👈 QUAN TRỌNG: Ép về tiếng Anh
    const dayOfWeek = date.format('dddd'); // Kết quả: "Wednesday"
    
    console.log(`2. Thứ cần tìm: "${dayOfWeek}" (Ngày: ${dateString})`);

    // 3. Lấy dữ liệu từ DB
    const schedule = await DoctorSchedule.findOne({ doctor_id: doctorId });
    
    if (!schedule) {
        console.log(`❌ Lỗi: Bác sĩ này chưa được tạo Lịch làm việc (DoctorSchedule) trong DB!`);
        return []; // Trả về rỗng
    }

    console.log(`3. Tìm thấy bản ghi lịch trong DB. Các ngày có lịch là:`);
    // In ra xem DB đang lưu cái gì: "Wednesday" hay "T4"?
    const dbDays = schedule.weekly_schedule.map(s => s.dayOfWeek);
    console.log(`   👉 DB đang lưu: ${JSON.stringify(dbDays)}`);

    // 4. So sánh
    const dailySchedule = schedule.weekly_schedule.find(d => d.dayOfWeek === dayOfWeek);

    if (!dailySchedule) {
        console.log(`❌ LỆCH PHA: Code tìm "${dayOfWeek}" nhưng DB không có ngày này!`);
        return [];
    }

    console.log(`✅ Khớp lịch! Giờ làm việc:`, dailySchedule.timeRanges);

    // 5. Bung giờ (Logic tạo slot)
    let allSlots = [];
    const slotMinutes = schedule.slot_minutes || 30;

    dailySchedule.timeRanges.forEach(range => {
        // Parse giờ cẩn thận
        let current = moment(`${dateString} ${range.start}`, "YYYY-MM-DD HH:mm");
        const end = moment(`${dateString} ${range.end}`, "YYYY-MM-DD HH:mm");
        
        // Log thử 1 vòng lặp để xem có chạy không
        if (current.isValid() && end.isValid()) {
             // Loop
            while (current.isBefore(end)) {
                allSlots.push(current.format("HH:mm"));
                current.add(slotMinutes, 'minutes');
            }
        } else {
            console.log(`⚠️ Lỗi format giờ trong DB: ${range.start} - ${range.end}`);
        }
    });

    console.log(`✅ Tổng slot tạo ra: ${allSlots.length}`);
    
    // Nếu không có slot nào, return luôn
    if (allSlots.length === 0) return [];

    // 6. Trừ giờ đã đặt (Appointment)
    // ... (Code logic check appointment giữ nguyên) ...
    
    console.log(`🟢 KẾT QUẢ TRẢ VỀ:`, allSlots);
    return allSlots;
};