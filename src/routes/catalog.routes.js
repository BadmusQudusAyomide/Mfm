import { Router } from 'express';
import { 
  listColleges, createCollege, updateCollege, deleteCollege,
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listCourses, createCourse, updateCourse, deleteCourse,
  listSubjects, createSubject, updateSubject, deleteSubject,
} from '../controllers/catalog.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// protect writes; allow reads for now (adjust as needed)
router.get('/colleges', protect, listColleges);
router.post('/colleges', protect, createCollege);
router.put('/colleges/:id', protect, updateCollege);
router.delete('/colleges/:id', protect, deleteCollege);

router.get('/departments', protect, listDepartments);
router.post('/departments', protect, createDepartment);
router.put('/departments/:id', protect, updateDepartment);
router.delete('/departments/:id', protect, deleteDepartment);

router.get('/courses', protect, listCourses);
router.post('/courses', protect, createCourse);
router.put('/courses/:id', protect, updateCourse);
router.delete('/courses/:id', protect, deleteCourse);

router.get('/subjects', protect, listSubjects);
router.post('/subjects', protect, createSubject);
router.put('/subjects/:id', protect, updateSubject);
router.delete('/subjects/:id', protect, deleteSubject);

export default router;
