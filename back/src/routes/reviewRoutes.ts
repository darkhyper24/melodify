import { Hono } from "hono";
import { createReview, getReviews, updateReview, deleteReview } from '../controllers/reviewController';
import { authMiddleware } from "../middleware/authMiddleware";

const router = new Hono();

router.post('/:song_id', authMiddleware, createReview);
router.get('/:song_id', getReviews);
router.patch('/:song_id', authMiddleware, updateReview);
router.delete('/:song_id', authMiddleware, deleteReview);

export default router