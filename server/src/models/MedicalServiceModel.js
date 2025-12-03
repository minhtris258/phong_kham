import mongoose from "mongoose";

const medicalServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Tên dịch vụ (vd: Nội soi tai mũi họng)
  code: { type: String, unique: true },         // Mã dịch vụ (vd: NS01)
  price: { type: Number, required: true },      // Giá tiền phải trả tại phòng khám
  description: { type: String },
  image: { type: String, default: "" },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.model("MedicalService", medicalServiceSchema);