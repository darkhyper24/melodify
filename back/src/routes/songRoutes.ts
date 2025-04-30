import { Hono } from 'hono'
import * as SongController from '../controllers/songController'
import { authMiddleware } from '../middleware/authMiddleware'
import { artistMiddleware } from '../middleware/roleMiddleware'

const router = new Hono()

router.post('/create/:album_id', authMiddleware, artistMiddleware, SongController.createSong)
router.get('/', SongController.getSongs)
router.get('/album/:id', SongController.getAlbumSongs)
router.patch('/:id', authMiddleware, SongController.updateSong)
router.delete('/:id', authMiddleware, SongController.deleteSong)
router.get('/:id', SongController.getSongBasicInfo)
router.get('/playlist/:id', authMiddleware,SongController.getPlaylistSongs)
router.post('/playlist/:id/add', authMiddleware, SongController.addSongToPlaylist)

export default router