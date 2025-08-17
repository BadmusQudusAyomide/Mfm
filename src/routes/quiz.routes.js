import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { csvUpload } from '../middleware/csvUpload.js';
import {
  listSubjects,
  createSubject,
  listQuizzes,
  createQuiz,
  updateQuiz,
  uploadQuestionsCSV,
  startQuiz,
  submitAttempt,
  getAttempt,
  quizLeaderboard,
  globalLeaderboard,
  userLeaderboardDetail,
  exportAttemptsCSV,
  removeNegativeMarkingField,
} from '../controllers/quiz.controller.js';

const router = Router();

// Subjects
router.get('/subjects', listSubjects);
router.post('/subjects', protect, authorize('exec', 'admin'), createSubject);

// Quizzes (list/create/update)
router.get('/', listQuizzes);
router.post('/', protect, authorize('exec', 'admin'), createQuiz);
router.put('/:id', protect, authorize('exec', 'admin'), updateQuiz);

// CSV upload (with dryRun mode via query ?dryRun=true) - field name: 'csv'
router.post('/:id/questions/csv', protect, authorize('exec', 'admin'), csvUpload.single('csv'), uploadQuestionsCSV);

// Quiz taking
router.post('/:id/start', protect, startQuiz);
router.post('/attempts/:attemptId/submit', protect, submitAttempt);
router.get('/attempts/:attemptId', protect, getAttempt);

// Leaderboards
router.get('/:id/leaderboard', quizLeaderboard);
router.get('/leaderboard/global', globalLeaderboard);
router.get('/leaderboard/user/:userId', userLeaderboardDetail);

// Export attempts
router.get('/:id/attempts/export', protect, authorize('exec', 'admin'), exportAttemptsCSV);

// Admin maintenance
router.post('/admin/cleanup/remove-negative-marking', protect, authorize('exec', 'admin'), removeNegativeMarkingField);

export default router;
