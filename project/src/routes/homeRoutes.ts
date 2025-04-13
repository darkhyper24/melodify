import { Hono } from 'hono'
import * as homeController from '../controllers/homeController'
import { authMiddleware } from '../middleware/authMiddleware'
const router = new Hono()

router.get('/', authMiddleware, homeController.getavatar)  


export default router