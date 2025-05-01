import axios from 'axios';

const API_URL = 'http://localhost:8787';

export const likeSong = async (songId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        await axios.post(
            `${API_URL}/songs/${songId}/like`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error: any) {
        console.error('Error liking song:', error);
        throw error;
    }
};

export const unlikeSong = async (songId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        await axios.delete(
            `${API_URL}/songs/${songId}/unlike`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error: any) {
        console.error('Error unliking song:', error);
        throw error;
    }
}; 