import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createRating,
  getRatingsByDoctor,
  myRatings
} from "../controllers/RatingController.js";

const router = Router();

// bệnh nhân đánh giá
router.post("/", verifyToken, createRating);

// bệnh nhân xem danh sách đánh giá của mình
router.get("/me", verifyToken, myRatings);

// xem tất cả đánh giá của bác sĩ (public hoặc có token)
router.get("/doctor/:doctorId", getRatingsByDoctor);

export default router;
