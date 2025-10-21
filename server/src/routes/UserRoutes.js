import express from "express";
import { getUser, createUser } from "../controllers/UserController.js";
const router = express.Router();

router.get("/:id", getUser);  // GET /api/users/:id
router.post("/", createUser); // POST /api/users

export default router;
