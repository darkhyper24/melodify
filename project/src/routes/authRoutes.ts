import { Hono } from 'hono'
import * as AuthController from '../controllers/authenticationController'
import { authMiddleware } from '../middleware/authMiddleware'
const router = new Hono()
router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.post('/logout', authMiddleware, AuthController.logout)
router.post('/login/google', AuthController.loginWithGoogle)
router.post('/login/facebook', AuthController.loginWithFacebook)
router.post('/set-role', authMiddleware, AuthController.setRole)
router.post('/refresh', AuthController.refreshToken)
export default router