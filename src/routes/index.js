import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './groups.routes.js';
import eventRoutes from './events.routes.js';
import profileRoutes from './profile.routes.js';
import tutorialRoutes from './tutorials.routes.js';
import quizRoutes from './quiz.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/events', eventRoutes);
router.use('/profile', profileRoutes);
router.use('/tutorials', tutorialRoutes);
router.use('/quiz', quizRoutes);

export default router;
