import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    thumbnail: { type: String, default: "" },
}, { timestamps: true }
);
const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;