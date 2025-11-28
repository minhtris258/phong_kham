import mongoose from "mongoose";
import Visit from "../models/VisitModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Timeslot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js"; 
import Patient from "../models/PatientModel.js"; 
import { getDoctorIdFromUser } from "../utils/getDoctorIdFromUser.js";

// Helper: Tính tổng chi phí
function calcTotals(visitLike) {
  const fee = Math.max(Number(visitLike.consultation_fee_snapshot || 0), 0);
  const items = Array.isArray(visitLike.bill_items) ? visitLike.bill_items : [];
  const extra = items.reduce((s, it) => {
    const q = Math.max(Number(it.quantity || 0), 0);
    const p = Math.max(Number(it.price || 0), 0);
    return s + q * p;
  }, 0);
  return { total_amount: fee + extra };
}

/** POST /api/visits */
export const createVisit = async (req, res, next) => {
  try {
    // Lấy Socket IO
    const io = req.app.get('io'); 

    const {
      appointment_id,
      symptoms,
      diagnosis = "",
      notes = "",
      advice = "",
      next_visit_timeslot_id = null,
      prescriptions = [],
      bill_items = []
    } = req.body || {};

    // 1. Validate cơ bản
    if (!appointment_id || !symptoms) {
      return res.status(400).json({ error: "Thiếu thông tin lịch hẹn hoặc triệu chứng." });
    }

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    // 2. Kiểm tra Appointment gốc
    const appt = await Appointment.findById(appointment_id);
    if (!appt) return res.status(404).json({ error: "Không tìm thấy lịch hẹn gốc." });
    if (String(appt.doctor_id) !== String(myDoctorId)) return res.status(403).json({ error: "Bạn không phụ trách lịch hẹn này." });
    if (appt.status === "cancelled") return res.status(400).json({ error: "Lịch hẹn này đã bị hủy trước đó." });

    // 3. Kiểm tra trùng lặp Visit
    const existed = await Visit.findOne({ appointment_id: appt._id });
    if (existed) return res.status(409).json({ error: "Hồ sơ khám cho lịch hẹn này đã tồn tại." });

    // 4. Lấy giá khám snapshot
    const doc = await Doctor.findById(myDoctorId).lean();
    const consultation_fee_snapshot = Math.max(Number(doc?.consultation_fee || 0), 0);

    // 5. Chuẩn bị dữ liệu Visit (Bản nháp)
    const draft = {
      appointment_id: appt._id,
      patient_id: appt.patient_id,
      doctor_id: myDoctorId,
      symptoms,
      diagnosis,
      notes,
      advice,
      next_visit_timeslot_id: next_visit_timeslot_id || null, 
      next_visit_date: undefined, 
      prescriptions,
      consultation_fee_snapshot,
      bill_items
    };

    let followupResult = { scheduled: false };

    // 6. XỬ LÝ TÁI KHÁM (Nếu có ID Timeslot)
    if (next_visit_timeslot_id) {
      if (!mongoose.Types.ObjectId.isValid(next_visit_timeslot_id)) {
         // ID không hợp lệ thì bỏ qua, không crash app
      } else {
        const targetSlot = await Timeslot.findOne({
          _id: next_visit_timeslot_id,
          status: "free"
        });

        if (!targetSlot) {
            followupResult = {
              scheduled: false,
              reason: "SLOT_BUSY",
              message: "Khung giờ tái khám không còn trống."
            };
        } else {
            // a. Tạo Appointment tái khám
            const newAppt = await Appointment.create({
              patient_id: appt.patient_id,
              doctor_id: myDoctorId,
              timeslot_id: targetSlot._id,
              date: targetSlot.date,
              start: targetSlot.start,
              status: "confirmed",
              reason: `Tái khám: ${diagnosis || symptoms}`.substring(0, 100)
            });

            // b. Cập nhật Slot thành booked
            targetSlot.status = "booked";
            targetSlot.appointment_id = newAppt._id;
            await targetSlot.save();

            // c. Cập nhật ngày vào Draft Visit
            draft.next_visit_date = targetSlot.date;

            // Lưu kết quả để dùng cho notification bên dưới
            followupResult = {
              scheduled: true,
              appointment_id: newAppt._id,
              date: targetSlot.date,
              start: targetSlot.start
            };
        }
      }
    }

    // 7. Tạo Visit & Tính tiền
    const { total_amount } = calcTotals(draft);
    const createdVisit = await Visit.create({ ...draft, total_amount });

    // 8. Hoàn tất Appointment cũ
    appt.status = "completed";
    await appt.save();

    // ============================================================
    // 9. GỬI THÔNG BÁO (NOTIFICATION)
    // ============================================================
    try {
        // Tìm Patient Profile để lấy đúng User ID
        const patientProfile = await Patient.findById(appt.patient_id);
        
        if (patientProfile && patientProfile.user_id) {
            const targetUserId = patientProfile.user_id;
            const notificationsToSend = [];

            // --- THÔNG BÁO 1: KẾT QUẢ KHÁM & TÁI KHÁM ---
            let visitTitle = "Kết quả khám bệnh";
            let visitBody = `Buổi khám cho bệnh lý "${diagnosis || symptoms}" đã hoàn tất.`;
            
            if (followupResult.scheduled) {
                 const dateStr = new Date(followupResult.date).toLocaleDateString('vi-VN');
                 visitBody += ` Bác sĩ đã lên lịch tái khám cho bạn vào ngày ${dateStr} lúc ${followupResult.start}. Vui lòng kiểm tra lịch hẹn.`;
            } else if (prescriptions.length > 0) {
                 visitBody += " Đơn thuốc điện tử đã được cập nhật vào hồ sơ.";
            }

            notificationsToSend.push({
                user_id: targetUserId,
                type: "appointment",
                title: visitTitle,
                body: visitBody,
                appointment_id: appt._id,
                channels: ["in-app"],
                status: "unread",
                sent_at: new Date()
            });

            // --- THÔNG BÁO 2: YÊU CẦU ĐÁNH GIÁ ---
            notificationsToSend.push({
                user_id: targetUserId,
                type: "rating_request",
                title: "Đánh giá bác sĩ",
                body: "Bạn cảm thấy buổi khám hôm nay thế nào? Hãy dành 1 phút để đánh giá bác sĩ nhé!",
                appointment_id: appt._id,
                channels: ["in-app"],
                status: "unread",
                sent_at: new Date()
            });

            // Lưu vào Database
            const savedNotifs = await Notification.insertMany(notificationsToSend);

            // Gửi Realtime Socket
            if (io) {
                savedNotifs.forEach(notif => {
                    io.to(targetUserId.toString()).emit('new_notification', {
                        message: notif.title,
                        data: notif
                    });
                });
            }
        }
    } catch (notifyError) {
        // Lỗi gửi thông báo không làm ảnh hưởng quy trình chính
        console.error("Lỗi gửi thông báo:", notifyError);
    }

    return res.status(201).json({
      message: "Tạo hồ sơ khám thành công.",
      visit: createdVisit,
      followup: followupResult
    });

  } catch (e) {
    console.error("CREATE VISIT ERROR:", e);
    return res.status(500).json({ 
      error: "Lỗi Server khi tạo hồ sơ khám.", 
      details: e.message 
    });
  }
};

// ... (CÁC HÀM GET/PUT/DELETE KHÁC GIỮ NGUYÊN) ...

export const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id).lean();
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
    // 1. Tìm hồ sơ bệnh nhân từ User ID đăng nhập
    const patientProfile = await Patient.findOne({ user_id: req.user._id });
    
    if (!patientProfile) {
        // Nếu chưa có hồ sơ bệnh nhân -> Trả về danh sách rỗng
        return res.json({ data: [] });
    }

    // 2. Dùng ID hồ sơ bệnh nhân để tìm Visit
    const list = await Visit.find({ patient_id: patientProfile._id })
      .populate({ path: "doctor_id", select: "fullName specialty_id" }) // Populate thêm tên bác sĩ nếu cần
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
      "prescriptions","bill_items"
    ];
    for (const k of allowed) if (k in req.body) v[k] = req.body[k];

    const totals = calcTotals({
      consultation_fee_snapshot: v.consultation_fee_snapshot,
      bill_items: v.bill_items
    });
    v.total_amount = totals.total_amount;

    await v.save();
    res.json({ message: "Cập nhật hồ sơ khám thành công.", visit: v });
  } catch (e) { next(e); }
};

export const getVisitByPatient  = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const list = await Visit.find({ patient_id: patientId }).lean();
    res.json({ data: list });
  } catch (e) { next(e); }
};

// ... (Phần Admin & Report) ...
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

export const deleteVisitAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Chỉ Admin mới có quyền xóa hồ sơ." });
    const { id } = req.params;
    const deletedVisit = await Visit.findByIdAndDelete(id);
    if (!deletedVisit) return res.status(404).json({ error: "Không tìm thấy hồ sơ để xóa." });
    res.json({ message: "Đã xóa hồ sơ khám bệnh thành công.", id });
  } catch (e) { next(e); }
};

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

// ... (Phần Dashboard) ...
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