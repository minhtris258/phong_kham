import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true }
);
const Specialty = mongoose.model("Specialty", specialtySchema);

export default Specialty;