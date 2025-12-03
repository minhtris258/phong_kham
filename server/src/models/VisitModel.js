import mongoose from "mongoose";

// Schema cho thuốc (Cho phép nhập tên thuốc tự do hoặc chọn từ kho)
const PrescriptionSchema = new mongoose.Schema(
  {
    // Nếu chọn thuốc từ kho thì lưu ID, nếu nhập tay thì để null
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", default: null },
    
    // Tên thuốc (Bắt buộc)
    drug: { type: String, required: true }, 
    
    // --- BỔ SUNG QUAN TRỌNG ---
    quantity: { type: Number, required: true, default: 1 }, // Số lượng cần mua (vd: 10)
    unit: { type: String, default: "" },                    // Đơn vị tính (vd: Viên, Vỉ, Chai)
    // --------------------------

    dosage: { type: String, default: "" },    // Liều lượng (vd: 500mg)
    frequency: { type: String, default: "" }, // Tần suất (vd: Sáng 1, Chiều 1)
    duration: { type: String, default: "" },  // Thời gian (vd: 5 ngày)
    note: { type: String, default: "" },      // Ghi chú (vd: Uống sau ăn)
  },
  { _id: false }
);

// Schema cho dịch vụ tính tiền (Snapshot giá tại thời điểm khám)
const BillItemSchema = new mongoose.Schema(
  {
    // Lưu ID dịch vụ gốc để tiện thống kê báo cáo (không bắt buộc)
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalService", default: null },
    
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 }, // Giá lưu cứng tại thời điểm khám
  },
  { _id: false }
);

const VisitSchema = new mongoose.Schema(
  {
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },

    // Kết quả khám lâm sàng
    symptoms: { type: String, required: true }, // Triệu chứng
    diagnosis: { type: String, default: "" },   // Chẩn đoán
    notes: { type: String, default: "" },       // Ghi chú nội bộ
    advice: { type: String, default: "" },      // Lời dặn dò bệnh nhân
    
    // Tái khám
    next_visit_date: { type: Date },
    next_visit_timeslot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Timeslot", default: null },

    // Đơn thuốc
    prescriptions: { type: [PrescriptionSchema], default: [] },

    // Tài chính (Hóa đơn)
    consultation_fee_snapshot: { type: Number, required: true, min: 0 }, // Phí khám của bác sĩ
    bill_items: { type: [BillItemSchema], default: [] },                 // Các dịch vụ đã dùng
    total_amount: { type: Number, default: 0, min: 0 },                  // Tổng tiền cần thanh toán
  },
  { timestamps: true }
);

// Đảm bảo 1 cuộc hẹn chỉ có tối đa 1 hồ sơ khám bệnh (Visit)
VisitSchema.index({ appointment_id: 1 }, { unique: true });

const Visit = mongoose.model("Visit", VisitSchema);
export default Visit;