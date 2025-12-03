import express from "express";
import { 
  createMedicine, 
  deleteMedicine, 
  getMedicines, 
  updateMedicine 
} from "../controllers/MedicineController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public hoặc User đều xem được để bác sĩ search
router.get("/", verifyToken, getMedicines);

// Chỉ Admin hoặc Bác sĩ mới được thêm/sửa/xóa thuốc
router.post("/", verifyToken, requireRole(["admin", "doctor"]), createMedicine);
router.put("/:id", verifyToken, requireRole(["admin", "doctor"]), updateMedicine);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteMedicine);

export default router;