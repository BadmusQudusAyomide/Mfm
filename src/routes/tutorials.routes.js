import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import pdfUpload from '../middleware/pdfUpload.js';
import {
  listCourses,
  createCourse,
  listTutorialsByCourse,
  uploadTutorialPDF,
  viewPDF,
  downloadPDF,
} from '../controllers/tutorials.controller.js';

const router = Router();

// Courses
router.get('/courses', listCourses);
router.post('/courses', protect, authorize('exec', 'admin'), createCourse);

// Tutorials per course
router.get('/:courseId', listTutorialsByCourse);
router.post('/:courseId', protect, authorize('exec', 'admin'), pdfUpload.single('pdf'), uploadTutorialPDF);

// View / Download single tutorial PDF
router.get('/file/:id/view', viewPDF);
router.get('/file/:id/download', downloadPDF);

export default router;
