// src/routes/PatientsRoutes.js
import express from "express";
import { completePatientProfile } from "../controllers/PatientController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/patients/complete-profile
router.post("/complete-profile", verifyToken, completePatientProfile);

export default router;
