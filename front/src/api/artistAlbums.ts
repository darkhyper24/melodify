import api from './axiosConfig';

export interface ArtistAlbum {
    id: string;
    name: string;
    albumPic: string | null;
    createdAt: string;
}

export interface ArtistAlbumsResponse {
    albums?: ArtistAlbum[];
    error?: string;
}

/**
 * Fetch albums created by the currently authenticated artist
 */
export const fetchArtistAlbums = async (): Promise<ArtistAlbumsResponse> => {
    try {
        // Ensure we're only running this in the browser
        if (typeof window === "undefined") {
            return { error: "Cannot fetch albums in server context" };
        }

        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No authentication token found");
            return { error: "Not authenticated" };
        }

        console.log("Using token for authentication:", token.substring(0, 10) + "...");

        const response = await api.get("/albums/my-albums");

        return response.data;
    } catch (error: any) {
        console.error("Error fetching artist albums:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            error: error.response?.data?.error || "Failed to fetch artist albums",
        };
    }
};

export const createAlbum = async (name: string): Promise<{ success: boolean; error?: string; album?: ArtistAlbum }> => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No authentication token found");
            return { success: false, error: "Not authenticated" };
        }

        const response = await api.post("/albums/create", { name });

        return {
            success: true,
            album: response.data.album,
        };
    } catch (error: any) {
        console.error("Error creating album:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            success: false,
            error: error.response?.data?.error || "Failed to create album",
        };
    }
};
