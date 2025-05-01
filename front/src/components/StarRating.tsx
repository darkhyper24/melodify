import { useState, useEffect } from 'react';
import { createReview, updateReview, getReviews, deleteReview } from '@/api/reviews';

interface StarRatingProps {
    songId: string;
    initialRating?: number;
}

export default function StarRating({ songId, initialRating = 0 }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasUserReview, setHasUserReview] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const fetchReviewData = async () => {
        try {
            const response = await getReviews(songId);
            const userId = localStorage.getItem('userId');
            
            if (userId && response.reviews) {
                const userReview = response.reviews.find(
                    (review) => review.user_id === userId
                );
                
                if (userReview) {
                    setRating(userReview.rating);
                    setHasUserReview(true);
                } else {
                    setRating(0);
                    setHasUserReview(false);
                }
            }

            if (response.statistics) {
                setAverageRating(response.statistics.average_rating);
                setReviewCount(response.statistics.review_count);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchReviewData();
        } else {
            setIsLoading(false);
        }
    }, [songId, isAuthenticated]);

    const handleRating = async (newRating: number) => {
        if (isSubmitting || !isAuthenticated) return;
        
        setIsSubmitting(true);
        try {
            if (!hasUserReview) {
                const review = await createReview(songId, newRating);
                if (review) {
                    setHasUserReview(true);
                    setRating(newRating);
                }
            } else {
                const review = await updateReview(songId, newRating);
                if (review) {
                    setRating(newRating);
                }
            }
            // Only fetch the statistics, not the user's review
            const response = await getReviews(songId);
            if (response.statistics) {
                setAverageRating(response.statistics.average_rating);
                setReviewCount(response.statistics.review_count);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            await fetchReviewData();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (isSubmitting || !hasUserReview || !isAuthenticated) return;
        
        setIsSubmitting(true);
        try {
            await deleteReview(songId);
            setRating(0);
            setHasUserReview(false);
            await fetchReviewData();
        } catch (error) {
            console.error('Error deleting review:', error);
            await fetchReviewData();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-6 w-24 bg-gray-700 rounded"></div>;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none text-lg"
                        disabled={isSubmitting || !isAuthenticated}
                    >
                        <span
                            className={`${
                                star <= (hoveredRating || rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                            }`}
                        >
                            ★
                        </span>
                    </button>
                ))}
            </div>
            <span className="text-sm text-[#b3b3b3]">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} ({reviewCount})
            </span>
            {hasUserReview && isAuthenticated && (
                <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-sm text-red-500 hover:text-red-600 ml-2"
                >
                    Delete
                </button>
            )}
        </div>
    );
}
