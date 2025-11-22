// src/routes/PatientsRoutes.js
import express from "express";
import {
  adminUpdatePatientPassword,
  completePatientProfile,
  createPatient,
  getAllPatients,
  getMyPatientProfile,
  getPatientById,
  updateMyPatientProfile,
  updatePatientAdmin,
} from "../controllers/PatientController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Tuyến đường Admin ---
router.post("/", verifyToken, requireRole("admin"), createPatient); // POST /api/patients
router.get("/", verifyToken, requireRole("admin"), getAllPatients); // GET /api/patients
router.put("/:id", verifyToken, requireRole(["admin"]), updatePatientAdmin); // PUT /api/patients/:id (Admin cập nhật hồ sơ)
router.put(
  "/:id/password",
  verifyToken,
  requireRole(["admin"]),
  adminUpdatePatientPassword
); // PUT /api/patients/:id/password (Chỉ Admin)

// --- Tuyến đường Cá nhân (Patient) ---
router.post(
  "/complete-profile",
  verifyToken,
  requireRole("patient"),
  completePatientProfile
); // POST /api/patients/complete-profile

router.put("/me", verifyToken, requireRole("patient"), updateMyPatientProfile); // PUT /api/patients/me (Cập nhật hồ sơ cá nhân)
router.get("/me", verifyToken, requireRole("patient"), getMyPatientProfile); // GET /api/patients/me

// Đổi mật khẩu cá nhân sẽ dùng route khác (ví dụ: /me/password) hoặc dùng route Admin ở trên nếu hàm Admin đủ thông minh.
// Nếu bạn muốn Patient tự đổi mật khẩu (của CHÍNH họ), hãy dùng route /me
router.put(
  "/me/password",
  verifyToken,
  requireRole("patient"),
  adminUpdatePatientPassword
); // PUT /api/patients/me/password

// --- Tuyến đường Public/Get ID ---
router.get("/:id", getPatientById); // GET /api/patients/:id (Có thể cần kiểm tra quyền)

export default router;
