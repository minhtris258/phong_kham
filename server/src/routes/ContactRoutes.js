import express from "express";
import { 
  createContact, 
  getAllContacts, 
  getContactById, 
  updateContactStatus, 
  replyToContact,
  deleteContact 
} from "../controllers/ContactController.js";
import {verifyToken, requireRole} from "../middlewares/authMiddleware.js";
// Import Middleware bảo vệ (Giả sử bạn đã có file này)
// import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============================
// ROUTES CHO BỆNH NHÂN (PUBLIC)
// ============================

// Gửi liên hệ mới
// POST: http://localhost:5000/api/contacts
router.post("/", createContact);


// ============================
// ROUTES CHO ADMIN (PRIVATE)
// ============================
// Lưu ý: Cần thêm middleware verifyAdmin vào các route này

// Lấy tất cả liên hệ (có thể lọc ?status=new)
// GET: http://localhost:5000/api/contacts
router.get("/", verifyToken, requireRole("admin"), getAllContacts); // Thêm verifyAdmin vào trước getAllContacts

// Xem chi tiết liên hệ
// GET: http://localhost:5000/api/contacts/:id
router.get("/:id", verifyToken, requireRole("admin"), getContactById);
// Cập nhật trạng thái xử lý
// PUT: http://localhost:5000/api/contacts/:id/status
router.put("/:id/status", verifyToken, requireRole("admin"), updateContactStatus);

// Trả lời liên hệ qua email
// POST: http://localhost:5000/api/contacts/:id/reply
router.post("/:id/reply", verifyToken, requireRole("admin"), replyToContact);
// Xóa liên hệ
// DELETE: http://localhost:5000/api/contacts/:id
router.delete("/:id", verifyToken, requireRole("admin"), deleteContact);

export default router;