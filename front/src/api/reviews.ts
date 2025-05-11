import api from './axiosConfig';

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

        const response = await api.get(`/reviews/${songId}`);
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

        const response = await api.post(`/reviews/${songId}`, { rating });
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

        const response = await api.patch(`/reviews/${songId}`, { rating });
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

        await api.delete(`/reviews/${songId}`);
    } catch (error: any) {
        console.error('Error deleting review:', error);
        throw error;
    }
}; 