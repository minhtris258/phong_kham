import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Tên thuốc (vd: Panadol Extra)
  unit: { type: String },                       // Đơn vị (Viên, Vỉ) - để bác sĩ biết kê đơn
  description: { type: String },                // Ghi chú công dụng (nếu cần)
  status: { type: String, enum: ["active", "inactive"], default: 'active' }   // active: đang dùng, inactive: thuốc đã ngừng sx
}, { timestamps: true });

export default mongoose.model("Medicine", medicineSchema);