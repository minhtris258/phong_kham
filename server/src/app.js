// src/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import patientsRoutes from "./routes/PatientRoutes.js";

import authRoutes from "./routes/AuthRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import roleRoutes from "./routes/RoleRoutes.js";
import specialtyRoutes from "./routes/SpecialtiesRoutes.js";
import DoctorRoutes from "./routes/DoctorRoutes.js";
import DoctorScheduleRoutes from "./routes/DoctorScheduleRoutes.js";
import TimeSlotRoutes from "./routes/TimeSlotRoutes.js";
import appointmentRoutes from "./routes/AppointmentRoutes.js";
import visitRoutes from "./routes/VisitRoutes.js";
import RatingRoutes from "./routes/RatingRoutes.js";
import PostRoutes from "./routes/PostRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import HolidayRoutes from "./routes/HolidayRoutes.js";

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware cơ bản
const BODY_LIMIT = '50mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

// Cấu hình CORS (Giữ nguyên)
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
// Health check DB
app.get("/health/db", (_req, res) => {
  res.json({
    state: mongoose.connection.readyState, // 0=disconnected, 1=connected
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  });
});

// Route mặc định
app.get("/", (_req, res) => res.send("PHONG-KHAM API is ready"));

// Import và sử dụng các routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/doctors", TimeSlotRoutes);
app.use("/api/doctors", DoctorRoutes);
app.use("/api/doctor-schedules", DoctorScheduleRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/ratings", RatingRoutes);
app.use("/api/posts", PostRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/holidays", HolidayRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: "Endpoint not found" }));

// Xử lý lỗi chung
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;
