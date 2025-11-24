import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
    // Ngày lễ, định dạng YYYY-MM-DD
    date: { type: String, required: true, unique: true, index: true }, 
    // Tên ngày lễ
    name: { type: String, required: true },
    // Là ngày nghỉ bắt buộc (ghi đè lịch làm việc cá nhân)
    isMandatoryDayOff: { type: Boolean, default: true }, 
}, { timestamps: true });

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;