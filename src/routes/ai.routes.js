import { Router } from 'express';
import { generate, chat } from '../controllers/ai.controller.js';

const router = Router();

// POST /api/ai/generate
router.post('/generate', generate);

// POST /api/ai/chat
router.post('/chat', chat);

export default router;
