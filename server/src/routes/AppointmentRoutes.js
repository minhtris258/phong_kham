import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  myAppointments,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  cancelAppointmentByDoctor,
  rescheduleAppointmentByDoctor
} from "../controllers/AppointmentController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Patient Routes
router.post("/book", verifyToken, bookAppointment);
router.post("/cancel/:id", verifyToken, cancelAppointment);
router.get("/my-appointments", verifyToken, myAppointments);

// Doctor Routes
router.get("/doctor-appointments", verifyToken, requireRole("doctor"), getDoctorAppointments);
router.put("/doctor-appointments/:id/cancel", verifyToken, requireRole("doctor"), cancelAppointmentByDoctor);
router.put("/doctor-appointments/:id/reschedule", verifyToken, requireRole("doctor"), rescheduleAppointmentByDoctor);

// Admin Routes
router.get("/", verifyToken, requireRole("admin"), getAppointments); // Lấy danh sách
router.get("/:id", verifyToken, requireRole("admin"), getAppointmentById); // Xem chi tiết
router.put("/:id", verifyToken, requireRole("admin"), updateAppointment); // Cập nhật
router.delete("/:id", verifyToken, requireRole("admin"), deleteAppointment); // Xóa

export default router;