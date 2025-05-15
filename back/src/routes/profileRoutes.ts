import { Hono } from 'hono'
import * as ProfileController from '../controllers/profileController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = new Hono()

// This route doesn't need authentication, it's public
router.get('/all-artists', ProfileController.getAllArtists)
router.use('*', authMiddleware)
router.get('/', ProfileController.getProfile)
router.post('/upload', ProfileController.uploadAvatar)
router.patch('/update', ProfileController.updateProfile)

export default router