// src/routes/UserRoutes.js
import express from "express";
import {
  changePassword,
  getMe,
  login,
  loginWithGoogle,
  registerPublic,  
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

/* ---------- AUTH ---------- */
router.post("/login", login);          // POST /api/users/auth/login
router.post('/google-login', loginWithGoogle); // POST /api/users/auth/google-login
router.post("/register", registerPublic); // POST /api/users/auth/register
router.get("/me", verifyToken, getMe);
router.put("/updatepassword", verifyToken, changePassword);

export default router;
