// src/routes/PatientsRoutes.js
import express from "express";
import { completePatientProfile, getMyPatientProfile, getPatientById, updateMyPatientProfile } from "../controllers/PatientController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/patients/complete-profile
router.post("/complete-profile", verifyToken, requireRole("patient"), completePatientProfile);
// GET /api/patients/me
router.get("/me", verifyToken, requireRole("patient"), getMyPatientProfile);
// PUT /api/patients/me
router.put("/me", verifyToken, requireRole("patient"), updateMyPatientProfile);
// GET /api/patients/:id
router.get("/:id", getPatientById);

export default router;
