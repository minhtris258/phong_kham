// src/routes/DashboardRoutes.js
import express from "express";
import {
  getDashboardStats,
  getAppointmentTrend,
  getAppointmentStatus,
  getTopDoctors,
  getRecentActivity,
} from "../controllers/DashboardController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả các route này đều yêu cầu quyền ADMIN
router.use(verifyToken, requireRole("admin"));

router.get("/stats", getDashboardStats);           // KPI Cards
router.get("/trend", getAppointmentTrend);         // Biểu đồ xu hướng
router.get("/status", getAppointmentStatus);       // Biểu đồ tròn
router.get("/top-doctors", getTopDoctors);         // Bảng xếp hạng bác sĩ
router.get("/activities", getRecentActivity);      // Hoạt động gần đây

export default router;