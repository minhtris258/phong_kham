import mongoose from "mongoose";
import Visit from "../models/VisitModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Timeslot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js"; // Model của bạn
import { getDoctorIdFromUser } from "../utils/getDoctorIdFromUser.js";

// Helper: Tính tiền tổng
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
      return res.status(400).json({ error: "Thiếu appointment_id hoặc symptoms." });
    }

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (!myDoctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    // 2. Kiểm tra Appointment gốc
    const appt = await Appointment.findById(appointment_id);
    if (!appt) return res.status(404).json({ error: "Không tìm thấy lịch hẹn gốc." });
    if (String(appt.doctor_id) !== String(myDoctorId)) return res.status(403).json({ error: "Bạn không phụ trách lịch hẹn này." });
    if (appt.status === "cancelled") return res.status(400).json({ error: "Lịch hẹn đã bị hủy trước đó." });

    // 3. Kiểm tra trùng lặp Visit
    const existed = await Visit.findOne({ appointment_id: appt._id });
    if (existed) return res.status(409).json({ error: "Hồ sơ khám cho lịch hẹn này đã tồn tại." });

    // 4. Lấy giá khám snapshot
    const doc = await Doctor.findById(myDoctorId).lean();
    const consultation_fee_snapshot = Math.max(Number(doc?.consultation_fee || 0), 0);

    // 5. Chuẩn bị dữ liệu Visit (Draft)
    const draft = {
      appointment_id: appt._id,
      patient_id: appt.patient_id,
      doctor_id: myDoctorId,
      symptoms,
      diagnosis,
      notes,
      advice,
      next_visit_timeslot_id: next_visit_timeslot_id || null, 
      next_visit_date: undefined, // Sẽ cập nhật nếu có tái khám
      prescriptions,
      consultation_fee_snapshot,
      bill_items
    };

    let followupResult = { scheduled: false };

    // 6. XỬ LÝ TÁI KHÁM (Nếu có ID Timeslot)
    if (next_visit_timeslot_id) {
      // Validate ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(next_visit_timeslot_id)) {
         console.warn("Invalid Timeslot ID:", next_visit_timeslot_id);
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

            // d. TẠO THÔNG BÁO (Đã sửa khớp với NotificationModel của bạn)
            try {
              const dateStr = new Date(targetSlot.date).toLocaleDateString('vi-VN');
              await Notification.create({
                user_id: appt.patient_id, // Khớp với model: user_id
                type: "appointment",      // Khớp enum: "appointment"
                title: "Lịch tái khám mới",
                body: `Bác sĩ đã hẹn lịch tái khám cho bạn vào ngày ${dateStr} lúc ${targetSlot.start}.`,
                appointment_id: newAppt._id, // Khớp với model: appointment_id
                channels: ["in-app"]
              });
            } catch (notifyError) {
              console.error("Lỗi tạo thông báo (không ảnh hưởng quy trình chính):", notifyError);
            }

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

    return res.status(201).json({
      message: "Tạo hồ sơ khám thành công.",
      visit: createdVisit,
      followup: followupResult
    });

  } catch (e) {
    // Log lỗi chi tiết ra console server để debug
    console.error("CREATE VISIT ERROR:", e);
    return res.status(500).json({ 
      error: "Lỗi Server khi tạo hồ sơ khám.", 
      details: e.message 
    });
  }
};

// ... (Giữ nguyên các hàm GET/PUT khác) ...
export const getVisitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = await Visit.findById(id).lean();
    if (!v) return res.status(404).json({ error: "Không tìm thấy visit." });
    return res.json({ visit: v });
  } catch (e) { next(e); }
};

export const getVisitByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const v = await Visit.findOne({ appointment_id: appointmentId }).lean();
    if (!v) return res.status(404).json({ error: "Visit chưa tồn tại." });
    res.json({ visit: v });
  } catch (e) { next(e); }
};

export const myVisits = async (_req, res, next) => {
  try {
    const list = await Visit.find({ patient_id: _req.user._id })
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
    if (!v) return res.status(404).json({ error: "Không tìm thấy visit." });

    const myDoctorId = await getDoctorIdFromUser(req.user._id);
    if (myDoctorId && String(v.doctor_id) !== String(myDoctorId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Không đủ quyền." });
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
// ==========================================
// PHẦN CHỨC NĂNG DÀNH CHO ADMIN
// ==========================================

/**
 * [ADMIN] Lấy danh sách tất cả Visit (có phân trang & lọc)
 * Mục đích: Quản lý tổng quan, kiểm tra lịch sử khám toàn hệ thống.
 */
export const getAllVisitsAdmin = async (req, res, next) => {
  try {
    // Chỉ Admin mới được dùng
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Quyền truy cập bị từ chối." });
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    
    // Tạo bộ lọc tìm kiếm (nếu có chuỗi search)
    const query = search 
      ? { 
          $or: [
            { diagnosis: { $regex: search, $options: "i" } }, // Tìm theo chẩn đoán
            { notes: { $regex: search, $options: "i" } }      // Tìm theo ghi chú
          ] 
        } 
      : {};

    const visits = await Visit.find(query)
      .populate("patient_id", "fullName email phone") // Lấy thông tin bệnh nhân
      .populate({
         path: "doctor_id",
         populate: { path: "user_id", select: "name" } // Lấy tên bác sĩ từ bảng User liên kết
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Visit.countDocuments(query);

    res.json({
      data: visits,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) { next(e); }
};

/**
 * [ADMIN] Xóa hồ sơ khám bệnh
 * Mục đích: Xử lý các hồ sơ rác hoặc bị tạo sai lệch nghiêm trọng.
 */
export const deleteVisitAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Chỉ Admin mới có quyền xóa hồ sơ khám." });
    }

    const { id } = req.params;
    const deletedVisit = await Visit.findByIdAndDelete(id);

    if (!deletedVisit) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ để xóa." });
    }

    // Tùy chọn: Có thể cần cập nhật lại status của Appointment gốc thành 'confirmed' 
    // nếu muốn cho phép bác sĩ khám lại, nhưng ở đây ta chỉ xóa Visit.
    
    res.json({ message: "Đã xóa hồ sơ khám bệnh thành công.", id });
  } catch (e) { next(e); }
};

/**
 * [ADMIN] Báo cáo doanh thu tổng hợp (Theo khoảng thời gian)
 */
export const getRevenueReportAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    const { fromDate, toDate } = req.query;
    const start = fromDate ? new Date(fromDate) : new Date(0); // Mặc định từ đầu
    const end = toDate ? new Date(toDate) : new Date();       // Mặc định đến hiện tại

    const stats = await Visit.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          totalRevenue: { $sum: "$total_amount" },
          avgRevenuePerVisit: { $avg: "$total_amount" }
        }
      }
    ]);

    res.json({ 
      period: { start, end },
      report: stats[0] || { totalVisits: 0, totalRevenue: 0, avgRevenuePerVisit: 0 } 
    });
  } catch (e) { next(e); }
};

// ==========================================
// PHẦN CHỨC NĂNG DÀNH CHO DOCTOR (BÁC SĨ)
// ==========================================

/**
 * [DOCTOR] Thống kê Dashboard cá nhân
 * Mục đích: Bác sĩ xem nhanh số lượng bệnh nhân hôm nay và doanh thu tháng.
 */
export const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId) return res.status(403).json({ error: "Không tìm thấy hồ sơ bác sĩ." });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Đếm số ca khám hôm nay
    const visitsToday = await Visit.countDocuments({
      doctor_id: doctorId,
      createdAt: { $gte: today }
    });

    // 2. Tổng doanh thu trong tháng này
    const revenueStats = await Visit.aggregate([
      {
        $match: {
          doctor_id: new mongoose.Types.ObjectId(doctorId),
          createdAt: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalMonthRevenue: { $sum: "$total_amount" },
          countMonth: { $sum: 1 }
        }
      }
    ]);

    const statData = revenueStats[0] || { totalMonthRevenue: 0, countMonth: 0 };

    res.json({
      stats: {
        visits_today: visitsToday,
        visits_this_month: statData.countMonth,
        revenue_this_month: statData.totalMonthRevenue
      }
    });
  } catch (e) { next(e); }
};

/**
 * [DOCTOR] Tìm kiếm hồ sơ bệnh án nâng cao
 * Mục đích: Tìm lại hồ sơ cũ dựa trên Chẩn đoán (Diagnosis) hoặc Khoảng thời gian.
 */
export const searchDoctorVisits = async (req, res, next) => {
  try {
    const doctorId = await getDoctorIdFromUser(req.user._id);
    if (!doctorId) return res.status(403).json({ error: "Access denied." });

    const { diagnosis, fromDate, toDate } = req.query;

    let filter = { doctor_id: doctorId };

    // Tìm theo tên bệnh (diagnosis) - không phân biệt hoa thường
    if (diagnosis) {
      filter.diagnosis = { $regex: diagnosis, $options: "i" };
    }

    // Tìm theo khoảng ngày
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const results = await Visit.find(filter)
      .populate("patient_id", "fullName email") // Hiển thị tên bệnh nhân
      .sort({ createdAt: -1 })
      .limit(50) // Giới hạn kết quả để tránh quá tải
      .lean();

    res.json({ count: results.length, data: results });
  } catch (e) { next(e); }
};