import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
  updateGroup,
} from '../controllers/groups.controller.js';

const router = Router();

router.get('/', listGroups);
router.post('/', protect, authorize('exec', 'admin'), createGroup);
router.get('/:id', getGroup);
router.put('/:id', protect, authorize('exec', 'admin'), updateGroup);
router.delete('/:id', protect, authorize('admin'), deleteGroup);

export default router;
