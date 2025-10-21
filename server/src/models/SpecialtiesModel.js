import mongoose from "mongoose";

const specialtiesSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true }
);
const Specialties = mongoose.model("Specialties", specialtiesSchema);

export default Specialties;