import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import tutorialRoutes from "./tutorials.routes.js";
import coursesRoutes from "./courses.routes.js";
import usersRoutes from "./users.routes.js";
import aiRoutes from "./ai.routes.js";
import bibleQuoteRoutes from "./bibleQuote.routes.js";
import eventsRoutes from "./events.routes.js";
import communityRoutes from "./community.routes.js";
import quizRoutes from "./quiz.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/tutorials", tutorialRoutes);
router.use("/courses", coursesRoutes);
router.use("/users", usersRoutes);
router.use("/ai", aiRoutes);
router.use("/bible-quotes", bibleQuoteRoutes);
router.use("/events", eventsRoutes);
router.use("/community", communityRoutes);
router.use("/quizzes", quizRoutes);

export default router;
