import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { getStats } from '../controllers/stats.controller.js'

const router = Router()

// Any authenticated user can view high-level stats
router.get('/', protect, getStats)

export default router
