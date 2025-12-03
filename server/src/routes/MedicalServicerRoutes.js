import express from "express";
import { 
  createService, 
  deleteService, 
  getServices, 
  updateService 
} from "../controllers/MedicalServiceController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Bác sĩ cần lấy danh sách dịch vụ để kê bill
router.get("/", verifyToken, getServices);

// Chỉ Admin mới quản lý giá tiền và danh mục dịch vụ
router.post("/", verifyToken, requireRole(["admin"]), createService);
router.put("/:id", verifyToken, requireRole(["admin"]), updateService);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteService);

export default router;