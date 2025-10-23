import express from "express";
import { getRole, createRole, updateRole, deleteRole } from "../controllers/RoleController.js";
import {verifyToken, requireRole} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), getRole);  // GET /api/roles
router.post("/", verifyToken, requireRole("admin"), createRole); // POST /api/roles
router.put("/:id", verifyToken, requireRole("admin"), updateRole); // PUT /api/roles/:id
router.delete("/:id", verifyToken, requireRole("admin"), deleteRole); // DELETE /api/roles/:id

export default router;