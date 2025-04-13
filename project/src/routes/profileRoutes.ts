import { Hono } from 'hono'
import * as ProfileController from '../controllers/profileController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = new Hono()

router.use('*', authMiddleware)

router.get('/', ProfileController.getProfile)
router.post('/upload', ProfileController.uploadAvatar)
router.patch('/update', ProfileController.updateProfile)
//router.patch('/avatar', ProfileController.updateAvatar)

export default router