import Rating from "../models/RatingModel.js";
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Patient from "../models/PatientModel.js"; // Nhớ import Patient

export const createRating = async (req, res, next) => {
  try {
    console.log("--- BẮT ĐẦU CREATE RATING (DEBUG) ---");
    
    // 1. Kiểm tra User & Role
    const user = req.user;
    console.log("1. User đang login:", user._id, "| Role:", user.role?.name || user.role);

    const role = user.role?.name || user.role;
    if (role !== "patient") {
        console.error("❌ Lỗi: Role không phải patient");
        return res.status(403).json({ error: "Chỉ bệnh nhân mới được đánh giá." });
    }

    const { appointment_id, star, comment = "" } = req.body || {};
    console.log("2. Payload nhận được:", { appointment_id, star });

    if (!appointment_id || !star) {
        return res.status(400).json({ error: "Thiếu thông tin appointment_id hoặc số sao." });
    }

    // 2. Lấy thông tin Appointment
    const appt = await Appointment.findById(appointment_id).lean();
    if (!appt) {
        console.error("❌ Lỗi: Không tìm thấy Appointment");
        return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    }
    console.log("3. Tìm thấy Appointment. Patient ID trong Appt:", appt.patient_id);

    // 3. Tìm Profile Bệnh nhân của User đang login
    const currentPatientProfile = await Patient.findOne({ user_id: user._id });
    if (!currentPatientProfile) {
        console.error("❌ Lỗi: User này chưa có hồ sơ Patient trong bảng Patients");
        return res.status(403).json({ error: "Tài khoản của bạn chưa có hồ sơ bệnh nhân." });
    }
    console.log("4. Tìm thấy Profile Patient của User:", currentPatientProfile._id);

    // 4. SO SÁNH QUAN TRỌNG
    // So sánh ID trong lịch hẹn vs ID của người đang login
    const apptPatientId = String(appt.patient_id);
    const userPatientId = String(currentPatientProfile._id);

    console.log(`>> So sánh: Appt(${apptPatientId}) === User(${userPatientId}) ?`);

    if (apptPatientId !== userPatientId) {
        console.error("❌ Lỗi: ID không khớp! Bạn đang cố đánh giá lịch của người khác.");
        return res.status(403).json({ 
            error: "Bạn không phải là chủ sở hữu của lịch hẹn này.",
            debug: `Appt: ${apptPatientId} vs You: ${userPatientId}` 
        });
    }

    // 5. Kiểm tra trạng thái
    if (appt.status !== "completed") {
         console.error("❌ Lỗi: Lịch hẹn chưa completed. Status hiện tại:", appt.status);
         return res.status(400).json({ error: "Chỉ được đánh giá sau khi khám hoàn tất." });
    }

    // 6. Kiểm tra trùng lặp
    const existed = await Rating.findOne({ appointment_id });
    if (existed) {
        console.error("❌ Lỗi: Đã đánh giá rồi");
        return res.status(409).json({ error: "Bạn đã đánh giá lịch hẹn này rồi." });
    }

    // 7. Tạo Rating
    const rating = await Rating.create({
      appointment_id,
      patient_id: appt.patient_id, 
      doctor_id: appt.doctor_id,
      star,
      comment,
    });
    console.log("✅ Tạo Rating thành công!");

    // 8. Cập nhật điểm bác sĩ
    try {
      const stats = await Rating.aggregate([
        { $match: { doctor_id: appt.doctor_id } },
        { $group: { _id: null, avg: { $avg: "$star" } } }
      ]);

      if (stats.length > 0) {
        const avgRating = Math.round(stats[0].avg * 10) / 10;
        await Doctor.findByIdAndUpdate(appt.doctor_id, { averageRating: avgRating });
        console.log("✅ Đã cập nhật điểm bác sĩ:", avgRating);
      }
    } catch (err) {
      console.error("Lỗi cập nhật điểm:", err);
    }

    return res.status(201).json({ message: "Đánh giá thành công.", rating });

  } catch (e) {
    console.error("❌ CRITICAL ERROR:", e);
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