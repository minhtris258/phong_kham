import Rating from "../models/RatingModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";

/** POST /api/ratings
 *  - bệnh nhân đánh giá sau khi hoàn tất khám
 */
export const createRating = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient")
      return res.status(403).json({ error: "Chỉ bệnh nhân mới được đánh giá." });

    const { appointment_id, star, comment = "" } = req.body || {};
    if (!appointment_id || !star)
      return res.status(400).json({ error: "Thiếu appointment_id hoặc star." });

    // Lấy thông tin appointment
    const appt = await Appointment.findById(appointment_id).lean();
    if (!appt) return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });

    if (String(appt.patient_id) !== String(req.user._id))
      return res.status(403).json({ error: "Không thể đánh giá lịch hẹn của người khác." });

    if (appt.status !== "completed")
      return res.status(400).json({ error: "Chỉ được đánh giá sau khi khám hoàn tất." });

    // Kiểm tra trùng
    const existed = await Rating.findOne({ appointment_id });
    if (existed)
      return res.status(409).json({ error: "Bạn đã đánh giá lịch hẹn này." });

    // Tạo rating
    const rating = await Rating.create({
      appointment_id,
      patient_id: appt.patient_id,
      doctor_id: appt.doctor_id,
      star,
      comment,
    });

    try {
      const stats = await Rating.aggregate([
        { $match: { doctor_id: appt.doctor_id } },
        { 
          $group: { 
            _id: null, 
            avg: { $avg: "$star" } // Chỉ cần tính trung bình
          } 
        }
      ]);

      if (stats.length > 0) {
        // Làm tròn 1 chữ số thập phân (ví dụ: 4.6666 -> 4.7)
        const avgRating = Math.round(stats[0].avg * 10) / 10;
        
        await Doctor.findByIdAndUpdate(appt.doctor_id, {
          averageRating: avgRating
        });
      }
    } catch (err) {
      console.error("Lỗi cập nhật averageRating:", err);
    }
    // ============================================

    return res.status(201).json({ message: "Đánh giá thành công.", rating });
  } catch (e) {
    next(e);
  }
};

/** GET /api/ratings/doctor/:doctorId – xem danh sách đánh giá bác sĩ */
export const getRatingsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const ratings = await Rating.find({ doctor_id: doctorId })
      .populate({ path: "patient_id", select: "fullName email" })
      .sort({ createdAt: -1 })
      .lean();

    // Tính trung bình sao
    const avg =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + r.star, 0) / ratings.length
          ).toFixed(1)
        : 0;

    res.json({ average: avg, count: ratings.length, ratings });
  } catch (e) {
    next(e);
  }
};

/** GET /api/ratings/me – bệnh nhân xem lịch sử đánh giá của mình */
export const myRatings = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") return res.status(403).json({ error: "Chỉ bệnh nhân." });

    const ratings = await Rating.find({ patient_id: req.user._id })
      .populate({ path: "doctor_id", select: "fullName specialty_id" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: ratings });
  } catch (e) {
    next(e);
  }
};