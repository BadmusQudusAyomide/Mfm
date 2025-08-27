import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { upload as imageUpload } from "../middleware/upload.js";
import {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  sharePost,
  getPostComments,
  createComment,
  toggleCommentLike,
  updateComment,
  deleteComment,
} from "../controllers/community.controller.js";

const router = Router();

// Public routes
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPost);
router.get("/posts/:postId/comments", getPostComments);

// Authenticated routes
router.post("/posts", protect, imageUpload.array("images", 5), createPost);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.post("/posts/:id/like", protect, togglePostLike);
router.post("/posts/:id/share", protect, sharePost);

router.post("/posts/:postId/comments", protect, createComment);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);
router.post("/comments/:commentId/like", protect, toggleCommentLike);

export default router;
