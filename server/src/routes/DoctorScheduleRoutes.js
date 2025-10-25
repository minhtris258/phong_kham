import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import { attachDoctor } from "../middlewares/attachDoctor.js";
import {
    getDoctorSchedule,
  getDoctorSlotsByDate,
  getMySchedule,
  upsertMySchedule,
  upsertMyException,
} from "../controllers/DoctorScheduleController.js";

const router = Router();

router.get("/me/schedule",  verifyToken, requireRole(["doctor"]),attachDoctor, getMySchedule);
router.post("/me/schedule",  verifyToken, requireRole(["doctor"]),attachDoctor, upsertMySchedule);
router.post("/me/schedule/exceptions",  verifyToken, requireRole(["doctor"]),attachDoctor, upsertMyException);

router.get("/:doctorId", getDoctorSchedule);
router.get("/:doctorId/slots", getDoctorSlotsByDate);
export default router;
