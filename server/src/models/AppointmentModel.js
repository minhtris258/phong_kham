import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    timeslot: { type: String, required: true },
    date: { type: Date, required: true },
    start: { type: String, required: true },
    status: { type: String, enum: ["pending","confirmed", "completed", "canceled"], default: "pending" },
    reason: { type: String, default: "" },
}, { timestamps: true }
);
const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;