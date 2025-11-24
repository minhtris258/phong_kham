import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
  createHoliday,
  getAllHolidays,
  updateHoliday,
  deleteHoliday,
} from "../controllers/HolidayController.js";

const router = Router();

router.post("/", verifyToken, requireRole(["admin"]), createHoliday);
router.get("/", getAllHolidays);
router.put("/:id", verifyToken, requireRole(["admin"]), updateHoliday);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteHoliday);

export default router;