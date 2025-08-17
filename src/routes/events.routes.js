import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../controllers/events.controller.js';

const router = Router();

router.get('/', listEvents);
router.post('/', protect, authorize('exec', 'admin'), createEvent);
router.get('/:id', getEvent);
router.put('/:id', protect, authorize('exec', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router;
