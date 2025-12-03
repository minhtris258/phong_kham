import mongoose from "mongoose";
import Visit from "../models/VisitModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Timeslot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js"; 
import Patient from "../models/PatientModel.js"; 
import MedicalService from "../models/MedicalServiceModel.js"; // Import để tra giá dịch vụ
import { getDoctorIdFromUser } from "../utils/getDoctorIdFromUser.js";

// Helper: Tính tổng tiền (Dùng cho hàm update hoặc tính toán nội bộ)
function calcTotals(fee, items) {
  const safeFee = Math.max(Number(fee || 0), 0);
  const extra = items.reduce((sum, item) => {
    const q = Math.max(Number(item.quantity || 0), 0);
    const p = Math.max(Number(item.price || 0), 0);
    return sum + (q * p);
  }, 0);
  return safeFee + extra;
}

/** POST /api/visits 
 * Tạo hồ sơ khám bệnh
 */
export const createVisit = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const io = req.app.get('io'); 

    const {
      appointment_id,
      symptoms,
      diagnosis = "",
      notes = "",
      advice = "",
      next_visit_timeslot_id = null,
      
      // Mảng thuốc: [{ drug, dosage, frequency, quantity, unit, ... }]
      prescriptions = [],
      
      // Mảng ID dịch vụ: ["id_sieu_am", "id_xet_nghiem"]
      serviceIds = [] 
    } = req.body || {};

    // 1. Validate cơ bản
    if (!appointment_id || !symptoms) {
      return res.status(400).json({ error: "Thiếu thông tin lịch hẹn hoặc triệu chứng." });
    }

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    await session.withTransaction(async () => {
        // 2. Kiểm tra Appointment gốc
        const appt = await Appointment.findById(appointment_id).session(session);
        if (!appt) throw new Error("APPT_NOT_FOUND");
        if (String(appt.doctor_id) !== String(myDoctorId)) throw new Error("FORBIDDEN");
        
        // Kiểm tra trùng lặp
        const existed = await Visit.findOne({ appointment_id: appt._id }).session(session);
        if (existed) throw new Error("VISIT_EXISTS");

        // 3. Lấy giá khám snapshot
        const doc = await Doctor.findById(myDoctorId).session(session);
        const consultationFee = Math.max(Number(doc?.consultation_fee || 0), 0);

        // 4. Xử lý Dịch vụ (Bill Items) - Tra cứu từ DB để lấy giá chuẩn
        let billItems = [];
        if (serviceIds && serviceIds.length > 0) {
            const services = await MedicalService.find({ _id: { $in: serviceIds } }).session(session);
            
            billItems = services.map(svc => ({
                service_id: svc._id,
                name: svc.name,
                quantity: 1,      // Mặc định số lượng là 1
                price: svc.price  // Lấy giá từ DB
            }));
        }

        // 5. Xử lý Thuốc (Map đúng Quantity và Unit)
        const formattedPrescriptions = prescriptions.map(p => ({
            medicine_id: p.medicine_id || null, // ID thuốc (nếu có)
            drug: p.drug,                       // Tên thuốc
            
            dosage: p.dosage || "",             // Liều dùng (vd: 1 viên)
            frequency: p.frequency || "",       // Tần suất (vd: Sáng/Tối)
            duration: p.duration || "",
            note: p.note || "",
            
            // QUAN TRỌNG: Lưu số lượng mua và đơn vị
            quantity: Number(p.quantity) || 1, 
            unit: p.unit || "Viên"
        }));

        // 6. Xử lý Tái khám (Nếu có chọn Slot)
        let nextVisitDate = null;
        let followupInfo = { scheduled: false };

        if (next_visit_timeslot_id && mongoose.Types.ObjectId.isValid(next_visit_timeslot_id)) {
            const targetSlot = await Timeslot.findOne({
                _id: next_visit_timeslot_id,
                status: "free"
            }).session(session);

            if (targetSlot) {
                // Tạo lịch hẹn tái khám
                const newAppt = await Appointment.create([{
                    patient_id: appt.patient_id,
                    doctor_id: myDoctorId,
                    timeslot_id: targetSlot._id,
                    date: targetSlot.date,
                    start: targetSlot.start,
                    status: "confirmed",
                    reason: `Tái khám: ${diagnosis || symptoms}`.substring(0, 100)
                }], { session });

                // Update Slot
                targetSlot.status = "booked";
                targetSlot.appointment_id = newAppt[0]._id;
                await targetSlot.save({ session });

                nextVisitDate = targetSlot.date;
                followupInfo = { 
                    scheduled: true, 
                    date: targetSlot.date, 
                    start: targetSlot.start 
                };
            }
        }

        // 7. Tạo Visit & Tính tổng tiền
        const totalAmount = calcTotals(consultationFee, billItems);

        const [createdVisit] = await Visit.create([{
            appointment_id: appt._id,
            patient_id: appt.patient_id,
            doctor_id: myDoctorId,
            
            symptoms,
            diagnosis,
            notes,
            advice,
            
            next_visit_timeslot_id: nextVisitDate ? next_visit_timeslot_id : null, 
            next_visit_date: nextVisitDate, 
            
            prescriptions: formattedPrescriptions,
            
            consultation_fee_snapshot: consultationFee,
            bill_items: billItems,
            total_amount: totalAmount
        }], { session });

        // 8. Hoàn tất Appointment cũ
        appt.status = "completed";
        await appt.save({ session });

        // 9. Gửi Thông báo
        const patientProfile = await Patient.findById(appt.patient_id).session(session);
        if (patientProfile && patientProfile.user_id) {
            const targetUserId = patientProfile.user_id;
            
            let visitBody = `Chẩn đoán: ${diagnosis || symptoms}. Tổng chi phí dịch vụ: ${totalAmount.toLocaleString('vi-VN')} đ.`;
            if (followupInfo.scheduled) {
                 visitBody += " Có lịch tái khám mới.";
            }

            const notif = await Notification.create([{
                user_id: targetUserId,
                type: "visit",
                title: "✅ Kết Quả Khám Bệnh",
                body: visitBody,
                appointment_id: appt._id,
                data: { visit_id: createdVisit._id },
                channels: ["in-app"],
                status: "unread",
                sent_at: new Date()
            }], { session });

            if (io) {
                io.to(targetUserId.toString()).emit('new_notification', {
                    message: notif[0].title,
                    data: notif[0]
                });
            }
        }

        // Return response
        res.status(201).json({
            message: "Tạo hồ sơ khám thành công.",
            visit: createdVisit,
            followup: followupInfo
        });
    });

  } catch (e) {
    if (e.message === "APPT_NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy lịch hẹn gốc." });
    if (e.message === "FORBIDDEN") return res.status(403).json({ error: "Bạn không phụ trách lịch hẹn này." });
    if (e.message === "VISIT_EXISTS") return res.status(409).json({ error: "Hồ sơ khám đã tồn tại." });
    
    console.error("CREATE VISIT ERROR:", e);
    return res.status(500).json({ error: "Lỗi Server khi tạo hồ sơ khám." });
  } finally {
    session.endSession();
  }
};

// ... CÁC HÀM GET GIỮ NGUYÊN NHƯ CŨ ...

export const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id)
        .populate("patient_id", "fullName email phone gender dob") // Lấy thông tin bệnh nhân
        .populate("doctor_id", "fullName specialty")
        .lean();
    if (!v) return res.status(404).json({ error: "Không tìm thấy hồ sơ khám." });
    return res.json({ visit: v });
  } catch (e) { next(e); }
};

export const getVisitByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const v = await Visit.findOne({ appointment_id: appointmentId }).lean();
    if (!v) return res.status(404).json({ error: "Hồ sơ khám chưa tồn tại." });
    res.json({ visit: v });
  } catch (e) { next(e); }
};

export const myVisits = async (req, res, next) => {
  try {
    const patientProfile = await Patient.findOne({ user_id: req.user._id });
    if (!patientProfile) return res.json({ data: [] });

    const list = await Visit.find({ patient_id: patientProfile._id })
      .populate("doctor_id", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: list });
  } catch (e) { next(e); }
};

export const myDoctorVisits = async (req, res, next) => {
  try {
    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    const list = await Visit.find({ doctor_id: myDoctorId })
      .populate("patient_id", "fullName gender dob")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: list });
  } catch (e) { next(e); }
};

export const updateVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id);
    if (!v) return res.status(404).json({ error: "Không tìm thấy hồ sơ khám." });

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (myDoctorId && String(v.doctor_id) !== String(myDoctorId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Không đủ quyền truy cập." });
    }

    const allowed = [
      "symptoms","diagnosis","notes","advice","next_visit_date",
      "prescriptions", // Lưu ý: Nếu update thuốc, client phải gửi đầy đủ cấu trúc mới
      "bill_items"     // Lưu ý: Nếu update dịch vụ, cần tính toán lại giá
    ];
    
    for (const k of allowed) if (k in req.body) v[k] = req.body[k];

    // Tính lại tổng tiền nếu có thay đổi dịch vụ hoặc phí khám
    v.total_amount = calcTotals(v.consultation_fee_snapshot, v.bill_items);

    await v.save();
    res.json({ message: "Cập nhật hồ sơ khám thành công.", visit: v });
  } catch (e) { next(e); }
};
// 7. Lấy tất cả hồ sơ khám của bệnh nhân
export const getVisitByPatient  = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const list = await Visit.find({ patient_id: patientId }).lean();
    res.json({ data: list });
  } catch (e) { next(e); }
};

// 8. Lấy tất cả hồ sơ khám (Dành cho Admin)
export const getAllVisitsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });
    }
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search 
      ? { $or: [ { diagnosis: { $regex: search, $options: "i" } }, { notes: { $regex: search, $options: "i" } } ] } 
      : {};

    const visits = await Visit.find(query)
      .populate("patient_id", "fullName email phone")
      .populate({ path: "doctor_id", populate: { path: "user_id", select: "name" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Visit.countDocuments(query);
    res.json({ data: visits, meta: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
};
// XÓA HỒ SƠ KHÁM BỆNH (DÀNH CHO ADMIN)
export const deleteVisitAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Chỉ Admin mới có quyền xóa hồ sơ." });
    const { id } = req.params;
    const deletedVisit = await Visit.findByIdAndDelete(id);
    if (!deletedVisit) return res.status(404).json({ error: "Không tìm thấy hồ sơ để xóa." });
    res.json({ message: "Đã xóa hồ sơ khám bệnh thành công.", id });
  } catch (e) { next(e); }
};
// 9. Báo cáo doanh thu theo khoảng ngày
export const getRevenueReportAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Không đủ quyền." });
    const { fromDate, toDate } = req.query;
    const start = fromDate ? new Date(fromDate) : new Date(0);
    const end = toDate ? new Date(toDate) : new Date();

    const stats = await Visit.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalVisits: { $sum: 1 }, totalRevenue: { $sum: "$total_amount" }, avgRevenuePerVisit: { $avg: "$total_amount" } } }
    ]);
    res.json({ period: { start, end }, report: stats[0] || { totalVisits: 0, totalRevenue: 0, avgRevenuePerVisit: 0 } });
  } catch (e) { next(e); }
};
// 10. Tìm kiếm hồ sơ khám cho Bác sĩ
export const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const visitsToday = await Visit.countDocuments({ doctor_id: doctorId, createdAt: { $gte: today } });
    const revenueStats = await Visit.aggregate([
      { $match: { doctor_id: new mongoose.Types.ObjectId(doctorId), createdAt: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, totalMonthRevenue: { $sum: "$total_amount" }, countMonth: { $sum: 1 } } }
    ]);
    const statData = revenueStats[0] || { totalMonthRevenue: 0, countMonth: 0 };
    res.json({ stats: { visits_today: visitsToday, visits_this_month: statData.countMonth, revenue_this_month: statData.totalMonthRevenue } });
  } catch (e) { next(e); }
};
//  TÌM KIẾM HỒ SƠ KHÁM BỆNH THEO CHẨN ĐOÁN VÀ KHOẢNG NGÀY (DÀNH CHO BÁC SĨ)
export const searchDoctorVisits = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId) return res.status(403).json({ error: "Quyền truy cập bị từ chối." });
    const { diagnosis, fromDate, toDate } = req.query;
    let filter = { doctor_id: doctorId };
    if (diagnosis) filter.diagnosis = { $regex: diagnosis, $options: "i" };
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const results = await Visit.find(filter).populate("patient_id", "fullName email").sort({ createdAt: -1 }).limit(50).lean();
    res.json({ count: results.length, data: results });
  } catch (e) { next(e); }
};