import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './groups.routes.js';
import eventRoutes from './events.routes.js';
import profileRoutes from './profile.routes.js';
import tutorialRoutes from './tutorials.routes.js';
import quizRoutes from './quiz.routes.js';
import usersRoutes from './users.routes.js';
import statsRoutes from './stats.routes.js';
import catalogRoutes from './catalog.routes.js';
import aiRoutes from './ai.routes.js';



const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/events', eventRoutes);
router.use('/profile', profileRoutes);
router.use('/tutorials', tutorialRoutes);
router.use('/quiz', quizRoutes);
router.use('/users', usersRoutes);
router.use('/stats', statsRoutes);
router.use('/catalog', catalogRoutes);
router.use('/ai', aiRoutes);

export default router;
