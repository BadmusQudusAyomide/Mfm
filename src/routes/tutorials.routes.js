import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import pdfUpload from "../middleware/pdfUpload.js";
import {
  getColleges,
  getCoursesByCollege,
  getTopicsByCourse,
  getTopicDocument,
  uploadTopicDocument,
  updateTopicDocument,
  deleteTopicDocument,
  toggleTopicPublish,
  viewPDF,
  downloadPDF,
  getVideo,
} from "../controllers/tutorials.controller.js";

const router = Router();

// Get hardcoded colleges (SET, CHS, JUPEP)
router.get("/colleges", getColleges);

// Get courses for a specific college
router.get("/colleges/:collegeAbbr/courses", getCoursesByCollege);

// Get topics for a specific course
router.get("/courses/:courseId/topics", getTopicsByCourse);

// Get a specific topic document
router.get("/topics/:topicId", getTopicDocument);

// Upload a new topic document (admin only)
router.post(
  "/courses/:courseId/topics",
  protect,
  authorize("exec", "admin"),
  pdfUpload.single("file"),
  uploadTopicDocument
);

// Update a topic document (admin only)
router.put(
  "/topics/:topicId",
  protect,
  authorize("exec", "admin"),
  updateTopicDocument
);

// Delete a topic document (admin only)
router.delete(
  "/topics/:topicId",
  protect,
  authorize("admin"),
  deleteTopicDocument
);

// Toggle topic publish status (admin only)
router.patch(
  "/topics/:topicId/publish",
  protect,
  authorize("exec", "admin"),
  toggleTopicPublish
);

// View PDF document
router.get("/topics/:topicId/view", viewPDF);

// Download PDF document
router.get("/topics/:topicId/download", downloadPDF);

// Get video stream
router.get("/topics/:topicId/video", getVideo);

export default router;
