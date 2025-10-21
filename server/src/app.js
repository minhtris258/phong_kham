// src/app.js
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/UserRoutes.js";
import roleRoutes from "./routes/RoleRoutes.js";



const app = express();

// Middlewares cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health/db", (_req, res) => {
  res.json({
    state: mongoose.connection.readyState, // 1 = connected
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  });
});

// Route mặc định
app.get("/", (_req, res) => res.send("API ready"));

// Import và sử dụng các routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/specialties", specialtyRoutes);

export default app;
