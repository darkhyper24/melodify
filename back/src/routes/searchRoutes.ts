import { Hono } from 'hono'
import * as SearchController from '../controllers/searchController'

const router = new Hono()

router.get('/songs', SearchController.searchSongs)
router.get('/albums', SearchController.searchAlbums)
router.get('/artists', SearchController.searchArtists)
router.get('/playlists', SearchController.searchPlaylists)

export default router
