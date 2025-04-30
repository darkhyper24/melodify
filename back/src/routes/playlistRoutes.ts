import { Hono } from 'hono'
import * as PlaylistController from '../controllers/playlistController'
import { authMiddleware } from '../middleware/authMiddleware'
const router = new Hono();
router.get("/", authMiddleware,PlaylistController.getPlaylists);
router.post("/create", authMiddleware, PlaylistController.createPlaylist);
router.patch("/update", authMiddleware, PlaylistController.updatePlaylist);
export default router;