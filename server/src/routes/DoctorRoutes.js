import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
  createDoctor,
  updateDoctorAdmin,
  completeDoctorProfile,
  getMyDoctorProfile,
  getDoctorById,
  updateMyDoctorProfile,
  getAllDoctors,
  deleteDoctor,
  updateMyPassword,
  adminUpdateDoctorPassword,
} from "../controllers/DoctorController.js";

const router = Router();


router.post("/onboarding/doctor-profile", verifyToken, requireRole(["doctor"]), completeDoctorProfile);
router.get("/me", verifyToken, requireRole(["doctor"]), getMyDoctorProfile);
router.put("/me", verifyToken, requireRole(["doctor"]), updateMyDoctorProfile);
router.put("/me/password", verifyToken, requireRole(["doctor"]), updateMyPassword);

router.get("/:id", getDoctorById);
router.get("/", getAllDoctors);
router.post("/", verifyToken, requireRole(["admin"]), createDoctor);
router.put("/:id", verifyToken, requireRole(["admin"]), updateDoctorAdmin);
router.put("/:id/password", verifyToken, requireRole(["admin"]), adminUpdateDoctorPassword);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteDoctor);
export default router;
