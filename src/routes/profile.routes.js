import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getMyProfile, updateMyProfile } from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, upload.single('profileImage'), updateMyProfile);

export default router;
