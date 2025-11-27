import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import { 
  createVisit,
  getVisitById,
  getVisitByAppointment,
  myVisits,
  myDoctorVisits,
  updateVisit,
  // --- Các hàm bổ sung cần import ---
  getAllVisitsAdmin,
  deleteVisitAdmin,
  getRevenueReportAdmin,
  getDoctorDashboardStats,
  searchDoctorVisits,
  getVisitByPatient
} from "../controllers/VisitController.js";

const router = Router();

// ==========================================
// 1. NHÓM ADMIN (Quản trị viên)
// ==========================================

// [ADMIN] Lấy danh sách tất cả Visit (có phân trang & lọc)
router.get("/admin/all", verifyToken, requireRole(["admin"]), getAllVisitsAdmin);

// [ADMIN] Báo cáo doanh thu tổng hợp
router.get("/admin/revenue", verifyToken, requireRole(["admin"]), getRevenueReportAdmin);

// [ADMIN] Xóa hồ sơ khám bệnh
router.delete("/admin/:id", verifyToken, requireRole(["admin"]), deleteVisitAdmin);


// ==========================================
// 2. NHÓM DOCTOR (Bác sĩ)
// ==========================================

// [DOCTOR] Thống kê Dashboard cá nhân (Doanh thu, số ca khám)
router.get("/doctor/stats", verifyToken, requireRole(["doctor"]), getDoctorDashboardStats);

// [DOCTOR] Tìm kiếm hồ sơ bệnh án nâng cao (Theo bệnh lý, ngày tháng)
router.get("/doctor/search", verifyToken, requireRole(["doctor"]), searchDoctorVisits);

// [DOCTOR] Xem danh sách visit của chính mình (Đã có sẵn)
router.get("/doctor/me", verifyToken, requireRole(["doctor"]), myDoctorVisits);


// ==========================================
// 3. NHÓM CHUNG / SHARED
// ==========================================

// [DOCTOR/ADMIN] Xem lịch sử khám của một bệnh nhân cụ thể
// (Hàm này có trong controller nhưng chưa được route)
router.get("/patient/:patientId", verifyToken, requireRole(["doctor", "admin"]), getVisitByPatient);

// [DOCTOR] Tạo hồ sơ khám
router.post("/", verifyToken, requireRole(["doctor"]), createVisit);

// [DOCTOR/ADMIN] Cập nhật hồ sơ khám
router.put("/:id", verifyToken, requireRole(["doctor", "admin"]), updateVisit);


// ==========================================
// 4. NHÓM PATIENT & CHI TIẾT
// ==========================================

// [PATIENT] Danh sách visit của bản thân
router.get("/me", verifyToken, requireRole(["patient"]), myVisits);

// Kiểm tra visit theo appointment
router.get("/by-appointment/:appointmentId", verifyToken, getVisitByAppointment);

// Xem chi tiết visit (Đặt cuối cùng để tránh trùng lặp route với các path cụ thể phía trên)
router.get("/:id", verifyToken, getVisitById);

export default router;