import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
  createDoctor,
  completeDoctorProfile,
  getMyDoctorProfile,
  getDoctorById,
  updateMyDoctorProfile,
  getAllDoctors,
  deleteDoctor,
} from "../controllers/DoctorController.js";

const router = Router();

router.post("/", verifyToken, requireRole(["admin"]), createDoctor);

router.post("/onboarding/doctor-profile", verifyToken, requireRole(["doctor"]), completeDoctorProfile);
router.get("/me", verifyToken, requireRole(["doctor"]), getMyDoctorProfile);
router.put("/me", verifyToken, requireRole(["doctor"]), updateMyDoctorProfile);
router.get("/:id", getDoctorById);
router.get("/", getAllDoctors);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteDoctor);
export default router;
