import mongoose from "mongoose";

const TimeRangeSchema = new mongoose.Schema(
    {
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    { _id: false }
);
 const WeeklyScheduleSchema = new mongoose.Schema(
    {
        dayOfWeek: { type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
        timeRanges: { type: [TimeRangeSchema], default: [] }, 
    },
    { _id: false }
);

const ExceptionSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        isDayOff: { type: Boolean, default: false },
        reason: { type: String, default: "" },
        add: { type: [TimeRangeSchema], default: [] },
        removeSlot: { type: [TimeRangeSchema], default: [] },
    },
    { _id: false }
);
const doctorScheduleSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true, index: true },
    slot_minutes: { type: Number, required: true, default: 30 },
    weekly_schedule: { type: [WeeklyScheduleSchema], default: [] },
    exceptions: { type: [ExceptionSchema], default: [] },
}, { timestamps: true }
);
const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);
export default DoctorSchedule;