import api from './axiosConfig';

export const likeSong = async (songId: string): Promise<void> => {
    try {
        await api.post(`/songs/${songId}/like`);
    } catch (error: any) {
        console.error('Error liking song:', error);
        throw error;
    }
};

export const unlikeSong = async (songId: string): Promise<void> => {
    try {
        await api.delete(`/songs/${songId}/unlike`);
    } catch (error: any) {
        console.error('Error unliking song:', error);
        throw error;
    }
}; 