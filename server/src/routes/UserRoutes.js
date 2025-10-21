// src/routes/UserRoutes.js
import express from "express";
import {
  getUser,
  login,
  registerPublic,   // đăng ký công khai -> luôn patient
  createUser,       // admin tạo user (có thể chọn role)
  updateUser,
  deleteUser
} from "../controllers/UserController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

// middleware phụ: kiểm tra quyền nhanh
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });
  next();
};

// cho phép chính chủ hoặc admin
const selfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role === "admin" || String(req.user._id) === String(req.params.id)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

const router = express.Router();

/* ---------- AUTH ---------- */
router.post("/auth/login", login);          // POST /api/users/auth/login
router.post("/auth/register", registerPublic); // POST /api/users/auth/register
router.get("/auth/me", verifyToken, (req, res) => {
  // trả thông tin cơ bản từ JWT cho FE
  const { _id, email, role, status, profile_completed } = req.user;
  res.json({ user: { _id, email, role, status, profile_completed } });
});

/* ---------- ADMIN ONLY ---------- */
// Admin được tạo user (vd: doctor), và xoá user
router.post("/", verifyToken, requireRole("admin"), createUser);     // POST /api/users
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);// DELETE /api/users/:id

/* ---------- READ/UPDATE ---------- */
// Xem 1 user: admin xem bất kỳ; user chỉ xem chính mình
router.get("/:id", verifyToken, selfOrAdmin, getUser);               // GET /api/users/:id
// Cập nhật: cho chính chủ hoặc admin
router.put("/:id", verifyToken, selfOrAdmin, updateUser);            // PUT /api/users/:id

export default router;
