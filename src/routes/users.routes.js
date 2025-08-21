import { Router } from 'express'
import { protect, authorize } from '../middleware/auth.js'
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  exportUsersCSV,
} from '../controllers/users.controller.js'

const router = Router()

router.get('/', protect, authorize('exec', 'admin'), listUsers)
router.get('/export', protect, authorize('exec', 'admin'), exportUsersCSV)
router.patch('/:id/role', protect, authorize('admin'), updateUserRole)
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus)
router.delete('/:id', protect, authorize('admin'), deleteUser)

export default router
