import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  myAppointments,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from "../controllers/AppointmentController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Patient Routes
router.post("/book", verifyToken, bookAppointment);
router.post("/cancel/:id", verifyToken, cancelAppointment);
router.get("/my-appointments", verifyToken, myAppointments);

// Admin Routes
router.get("/", verifyToken, requireRole("admin"), getAppointments); // Lấy danh sách
router.get("/:id", verifyToken, requireRole("admin"), getAppointmentById); // Xem chi tiết
router.put("/:id", verifyToken, requireRole("admin"), updateAppointment); // Cập nhật
router.delete("/:id", verifyToken, requireRole("admin"), deleteAppointment); // Xóa

export default router;