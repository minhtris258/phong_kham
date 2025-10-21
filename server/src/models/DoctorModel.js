import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    fullName: {type: String, required: true},
    thumbnail: {type: String, required: true},
    gender: {type: String, enum: ["male", "female", "other"], required: true},
    dob: {type: Date, required: true},
    note: {type: String},
    specialty_id: {type: mongoose.Schema.Types.ObjectId, ref: "Specialties", required: true}
}, {timestamps: true}
);
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;