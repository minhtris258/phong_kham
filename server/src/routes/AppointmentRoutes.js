import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {bookAppointment, cancelAppointment, myAppointments} from "../controllers/AppointmentController.js";

const router = Router();

router.post("/", verifyToken, requireRole(["patient"]), bookAppointment);
router.delete("/:id", verifyToken, cancelAppointment);           // patient (chính chủ) hoặc admin
router.get("/me", verifyToken, requireRole(["patient"]), myAppointments);

export default router;