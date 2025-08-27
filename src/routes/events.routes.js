import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload as imageUpload } from "../middleware/upload.js";
import {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventPublish,
  rsvpEvent,
} from "../controllers/events.controller.js";

const router = Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEvent);

// Authenticated routes
router.post("/:id/rsvp", protect, rsvpEvent);

// Admin routes
router.post("/", protect, authorize("exec", "admin"), imageUpload.single("image"), createEvent);
router.put("/:id", protect, authorize("exec", "admin"), imageUpload.single("image"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);
router.patch("/:id/publish", protect, authorize("exec", "admin"), toggleEventPublish);

export default router;
