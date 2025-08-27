import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getCurrentQuote,
  getAllQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  rotateQuote,
} from "../controllers/bibleQuote.controller.js";

const router = Router();

// Public routes
router.get("/current", getCurrentQuote);

// Admin routes
router.get("/", protect, authorize("exec", "admin"), getAllQuotes);
router.post("/", protect, authorize("exec", "admin"), createQuote);
router.put("/:id", protect, authorize("exec", "admin"), updateQuote);
router.delete("/:id", protect, authorize("admin"), deleteQuote);
router.post("/rotate", protect, authorize("exec", "admin"), rotateQuote);

export default router;
