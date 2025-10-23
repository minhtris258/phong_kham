import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    dob : { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
     thumbnail: { type: String, default: "" },
    note: { type: String }
}, { timestamps: true }
);
const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
