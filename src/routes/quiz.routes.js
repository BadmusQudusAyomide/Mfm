import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllQuizzes,
  getQuiz,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizPublish,
  getQuizQuestionsAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../controllers/quiz.controller.js";

const router = Router();

// Public routes
router.get("/", getAllQuizzes);
router.get("/:id", getQuiz);
router.get("/:id/questions", getQuizQuestions);

// Admin routes
router.post("/", protect, authorize("exec", "admin"), createQuiz);
router.put("/:id", protect, authorize("exec", "admin"), updateQuiz);
router.delete("/:id", protect, authorize("admin"), deleteQuiz);
router.patch("/:id/publish", protect, authorize("exec", "admin"), toggleQuizPublish);

// Question management
router.get("/:quizId/questions/admin", protect, authorize("exec", "admin"), getQuizQuestionsAdmin);
router.post("/:quizId/questions", protect, authorize("exec", "admin"), createQuestion);
router.put("/questions/:id", protect, authorize("exec", "admin"), updateQuestion);
router.delete("/questions/:id", protect, authorize("admin"), deleteQuestion);
router.post("/:quizId/questions/reorder", protect, authorize("exec", "admin"), reorderQuestions);

export default router;
