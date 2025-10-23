import mongoose from "mongoose";

const timeslotSchema = new mongoose.Schema(
    {
        doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
        date: { type: Date, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
        status: { type: String, enum: ["available", "booked", "unavailable"], default: "available",index: true },
        appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    },
    { timestamps: true }
);  

timeslotSchema.index({ doctor_id: 1, date: 1, start: 1 }, { unique: true });
const Timeslot = mongoose.model("Timeslot", timeslotSchema);
export default Timeslot;
