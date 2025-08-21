import { Router } from 'express';
import { login, me, register, promoteSelf } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/promote-self', protect, promoteSelf);

export default router;

