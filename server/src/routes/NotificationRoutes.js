import express from "express";
import {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controllers/NotificationController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken); // tất cả routes phải xác thực token

router.get("/", getNotifications);
router.get("/:id", getNotificationById);
router.post("/", requireRole("admin"), createNotification);
router.put("/:id", requireRole("admin"), updateNotification);
router.post("/:id/read", markAsRead);
router.post("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
