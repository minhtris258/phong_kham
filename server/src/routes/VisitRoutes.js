import { Router } from "express";
import { verifyToken , requireRole } from "../middlewares/authMiddleware.js";
import {  
    createVisit,
  getVisitById,
  getVisitByAppointment,
  myVisits,
  myDoctorVisits,
  updateVisit} from "../controllers/VisitController.js";

  const router = Router();

// Bác sĩ tạo hồ sơ khám
router.post("/", verifyToken, requireRole(["doctor"]), createVisit);

// Xem chi tiết visit (đã có verifyToken; hạn chế sâu hơn xử lý trong controller nếu cần)
router.get("/:id", verifyToken, getVisitById);

// Kiểm tra visit theo appointment
router.get("/by-appointment/:appointmentId", verifyToken, getVisitByAppointment);

// Danh sách visit của bệnh nhân
router.get("/me", verifyToken, requireRole(["patient"]), myVisits);

// Danh sách visit của bác sĩ
router.get("/doctor/me", verifyToken, requireRole(["doctor"]), myDoctorVisits);

// Cập nhật hồ sơ khám (bác sĩ tạo hoặc admin)
router.put("/:id", verifyToken, requireRole(["doctor","admin"]), updateVisit);
export default router;