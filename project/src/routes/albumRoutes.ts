import { Hono } from 'hono'
import * as AlbumController from '../controllers/albumController'

const router = new Hono()

router.get('/', AlbumController.getAlbums)  


export default router