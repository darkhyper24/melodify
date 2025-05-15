import { Hono } from "hono";
import * as ProfileController from "../controllers/profileController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = new Hono();

// This route doesn't need authentication, it's public
router.get("/all-artists", ProfileController.getAllArtists);
router.get("/", authMiddleware, ProfileController.getProfile);
router.post("/upload", authMiddleware, ProfileController.uploadAvatar);
router.patch("/update", authMiddleware, ProfileController.updateProfile);

export default router;
