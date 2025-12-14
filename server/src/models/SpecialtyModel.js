import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    thumbnail: { type: String, default: "" },
    keywords: { type: [String], index: true, default: [] }
}, { timestamps: true }
);
specialtySchema.index({ name: "text", keywords: "text" });
const Specialty = mongoose.model("Specialty", specialtySchema);

export default Specialty;