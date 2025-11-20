import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    dob: { type: Date, required: false },
    phone: { type: String, required: false, index: true},
    email: { type: String, required: true },
    address: { type: String, required: false, default: "" },
    introduction: { type: String, default: "" },
    note: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    consultation_fee: { type: Number, default: 0, min: 0 },
}, {timestamps: true}
);
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;