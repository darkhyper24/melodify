import { Hono } from 'hono'
import * as AlbumController from '../controllers/albumController'
import { authMiddleware } from '../middleware/authMiddleware'
import { artistMiddleware } from '../middleware/roleMiddleware'

const router = new Hono()

router.get('/', AlbumController.getAlbums)
router.get('/my-albums', authMiddleware, AlbumController.getUserAlbums) 
router.post('/create', authMiddleware, artistMiddleware, AlbumController.createAlbum)
router.delete('/:id', authMiddleware, AlbumController.deleteAlbum)
router.patch('/:id', authMiddleware, AlbumController.updateAlbum)
router.post('/:id/upload', authMiddleware, AlbumController.uploadAlbumPicture)

export default router
