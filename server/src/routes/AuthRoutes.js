// src/routes/UserRoutes.js
import express from "express";
import {
  login,
  registerPublic,  
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

/* ---------- AUTH ---------- */
router.post("/login", login);          // POST /api/users/auth/login
router.post("/register", registerPublic); // POST /api/users/auth/register
router.get("/me", verifyToken, (req, res) => {
  // trả thông tin cơ bản từ JWT cho FE
  const { _id, email, role, status, profile_completed } = req.user;
  res.json({ user: { _id, email, role, status, profile_completed } });
});

export default router;
