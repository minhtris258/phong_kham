import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    drug: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const BillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const VisitSchema = new mongoose.Schema(
  {
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },

    symptoms: { type: String, required: true },
    diagnosis: { type: String, default: "" },
    notes: { type: String, default: "" },
    next_visit_date: { type: Date },
    next_visit_timeslot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Timeslot", default: null },

    prescriptions: { type: [PrescriptionSchema], default: [] },
    consultation_fee_snapshot: { type: Number, required: true, min: 0 },
    bill_items: { type: [BillItemSchema], default: [] },
    total_amount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// 1 appointment chỉ có 1 visit
VisitSchema.index({ appointment_id: 1 }, { unique: true });

const Visit = mongoose.model("Visit", VisitSchema);
export default Visit;
