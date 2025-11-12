import express from "express";
import { createPost, updatePost, deletePost,
  listPosts, getPostBySlug, relatedPosts } from "../controllers/PostController.js";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/posts
router.get("/", listPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id/related", relatedPosts);

// POST /api/posts  (ADMIN ONLY)
router.post("/", verifyToken, requireRole("admin"), createPost);
// PUT /api/posts/:id  (ADMIN ONLY)
router.put("/:id", verifyToken, requireRole("admin"), updatePost);
// DELETE /api/posts/:id  (ADMIN ONLY)
router.delete("/:id", verifyToken, requireRole("admin"), deletePost);

export default router;
