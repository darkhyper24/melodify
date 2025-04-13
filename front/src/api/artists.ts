import axios from "axios";

export interface Album {
    id: string;
    name: string;
    albumPic: string | null;
}

export interface AlbumsResponse {
    albums: Album[];
}

const API_URL = "http://localhost:8787";

export const fetchAlbums = async (): Promise<AlbumsResponse> => {
    try {
        const response = await axios.get<AlbumsResponse>(`${API_URL}/albums`);
        return response.data;
    } catch (error) {
        console.error("Error fetching albums:", error);
        throw error;
    }
};
