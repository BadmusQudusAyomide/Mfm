import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import pdfUpload from '../middleware/pdfUpload.js';
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublish,
  listTutorialsByCourse,
  uploadTutorialPDF,
  viewPDF,
  downloadPDF,
  updateTutorial,
  deleteTutorial,
  toggleTutorialPublish,
} from '../controllers/tutorials.controller.js';

const router = Router();

// Courses
router.get('/courses', listCourses);
router.post('/courses', protect, authorize('exec', 'admin'), createCourse);
router.put('/courses/:id', protect, authorize('exec', 'admin'), updateCourse);
router.delete('/courses/:id', protect, authorize('admin'), deleteCourse);
router.patch('/courses/:id/publish', protect, authorize('exec', 'admin'), toggleCoursePublish);

// Tutorials per course
router.get('/:courseId', listTutorialsByCourse);
router.post('/:courseId', protect, authorize('exec', 'admin'), pdfUpload.single('pdf'), uploadTutorialPDF);
router.put('/file/:id', protect, authorize('exec', 'admin'), updateTutorial);
router.delete('/file/:id', protect, authorize('admin'), deleteTutorial);
router.patch('/file/:id/publish', protect, authorize('exec', 'admin'), toggleTutorialPublish);

// View / Download single tutorial PDF
router.get('/file/:id/view', viewPDF);
router.get('/file/:id/download', downloadPDF);

export default router;
