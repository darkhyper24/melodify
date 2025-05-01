import axios from 'axios';

const API_URL = 'http://localhost:8787';

export interface Review {
    id: string;
    rating: number;
    song_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    user?: {
        full_name: string;
        avatar_url: string | null;
    };
}

export interface ReviewResponse {
    reviews: Review[];
    statistics?: {
        average_rating: number;
        review_count: number;
    };
}

export const getReviews = async (songId: string): Promise<ReviewResponse> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await axios.get(`${API_URL}/reviews/${songId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

export const createReview = async (songId: string, rating: number): Promise<Review> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await axios.post(
            `${API_URL}/reviews/${songId}`,
            { rating },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.review;
    } catch (error: any) {
        console.error('Error creating review:', error);
        throw error;
    }
};

export const updateReview = async (songId: string, rating: number): Promise<Review> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await axios.patch(
            `${API_URL}/reviews/${songId}`,
            { rating },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.review;
    } catch (error: any) {
        console.error('Error updating review:', error);
        throw error;
    }
};

export const deleteReview = async (songId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        await axios.delete(`${API_URL}/reviews/${songId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        throw error;
    }
}; 