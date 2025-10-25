import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    star: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
    },
    { timestamps: true }
);

// 1 appointment chỉ có 1 rating
RatingSchema.index({ appointment_id: 1 }, { unique: true });
const Rating = mongoose.model("Rating", RatingSchema);
export default Rating;