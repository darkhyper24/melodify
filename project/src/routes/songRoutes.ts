import { Hono } from 'hono'
import * as SongController from '../controllers/songController'
import { authMiddleware } from '../middleware/authMiddleware'
import { artistMiddleware } from '../middleware/roleMiddleware'

const router = new Hono()

router.post('/create', authMiddleware, artistMiddleware, SongController.createSong)
router.get('/', SongController.getSongs)
router.get('/album/:id', SongController.getAlbumSongs)
router.patch('/:id', authMiddleware, SongController.updateSong)
router.delete('/:id', authMiddleware, SongController.deleteSong)
export default router