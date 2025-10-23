import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
    getDoctorSchedule,
  getDoctorSlotsByDate,
  getMySchedule,
  upsertMySchedule,
  upsertMyException,
} from "../controllers/DoctorScheduleController.js";

const router = Router();

router.get("/me/schedule", verifyToken, requireRole(["doctor"]), getMySchedule);
router.post("/me/schedule", verifyToken, requireRole(["doctor"]), upsertMySchedule);
router.post("/me/schedule/exceptions", verifyToken, requireRole(["doctor"]), upsertMyException);

router.get("/:doctorId", getDoctorSchedule);
router.get("/:doctorId/slots", getDoctorSlotsByDate);
export default router;
