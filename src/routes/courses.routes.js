import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublish,
} from "../controllers/courses.controller.js";

const router = Router();

// All routes require authentication and admin privileges
router.use(protect);

// Get all courses (admin only)
router.get("/", authorize("exec", "admin"), getAllCourses);

// Create a new course (admin only)
router.post("/", authorize("exec", "admin"), createCourse);

// Update a course (admin only)
router.put("/:id", authorize("exec", "admin"), updateCourse);

// Delete a course (admin only)
router.delete("/:id", authorize("admin"), deleteCourse);

// Toggle course publish status (admin only)
router.patch("/:id/publish", authorize("exec", "admin"), toggleCoursePublish);

export default router;
