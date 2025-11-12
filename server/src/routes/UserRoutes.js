// src/routes/UserRoutes.js
import express from "express";
import {
  getUser,
  createUser,       // admin tạo user (có thể chọn role)
  updateUser,
  updateUserPassword,
  deleteUser
} from "../controllers/UserController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

// cho phép chính chủ hoặc admin
const selfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role === "admin" || String(req.user._id) === String(req.params.id)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

const router = express.Router();

/* ---------- ADMIN ONLY ---------- */
// Admin được tạo user (vd: doctor), và xoá user
router.post("/", verifyToken, requireRole("admin"), createUser);     // POST /api/users
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);// DELETE /api/users/:id

/* ---------- READ/UPDATE ---------- */
// Xem 1 user: admin xem bất kỳ; user chỉ xem chính mình
router.get("/:id", verifyToken, selfOrAdmin, getUser);               // GET /api/users/:id
// Cập nhật: cho chính chủ hoặc admin
router.put("/:id", verifyToken, selfOrAdmin, updateUser);            // PUT /api/users/:id
// Cập nhật mật khẩu: cho chính chủ hoặc admin
router.put("/password/:id", verifyToken, selfOrAdmin, updateUserPassword); // PUT /api/users/password/:id

export default router;
