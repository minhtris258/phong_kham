import express from "express";
import { getRole, createRole } from "../controllers/RoleController.js";
const router = express.Router();

router.get("/", getRole);  // GET /api/roles
router.post("/", createRole); // POST /api/roles

export default router;