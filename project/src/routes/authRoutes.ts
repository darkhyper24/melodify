import { Hono } from 'hono'
import * as AuthController from '../controllers/authenticationController'
import { authMiddleware } from '../middleware/authMiddleware'
const router = new Hono()
router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.post('/logout', authMiddleware, AuthController.logout)
export default router