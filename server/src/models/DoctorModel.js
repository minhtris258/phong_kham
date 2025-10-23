import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: { type: Date, required: true },
    phone: { type: String, required: true, index: true, unique: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    introduction: { type: String, default: "" },
    note: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, {timestamps: true}
);
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;