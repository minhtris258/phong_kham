// src/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import patientsRoutes from "./routes/PatientRoutes.js";

import userRoutes from "./routes/UserRoutes.js";
import roleRoutes from "./routes/RoleRoutes.js";
import specialtyRoutes from "./routes/SpecialtiesRoutes.js";

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.get("/", (_req, res) => res.send("🚀 PHONG-KHAM API is ready"));

// Import và sử dụng các routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/patients", patientsRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: "Endpoint not found" }));

// Xử lý lỗi chung
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;
