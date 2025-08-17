import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './groups.routes.js';
import eventRoutes from './events.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/events', eventRoutes);

export default router;
