import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    dob : { type: Date, required: false },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    address: { type: String, required: false, default: "" },
    note: { type: String }
}, { timestamps: true }
);
const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
