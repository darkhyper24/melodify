import axios from "axios";

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

        const response = await axios.get("http://localhost:8787/albums/my-albums", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching artist albums:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error("Authentication failed:", error.response?.data);
            localStorage.removeItem("token");
            return { error: "Session expired. Please log in again." };
        }
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

        const response = await axios.post(
            "http://localhost:8787/albums/create",
            { name },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            success: true,
            album: response.data.album,
        };
    } catch (error: any) {
        console.error("Error creating album:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            // We're always in the browser context when this is called
            localStorage.removeItem("token");
            return { success: false, error: "Session expired. Please log in again." };
        }
        return {
            success: false,
            error: error.response?.data?.error || "Failed to create album",
        };
    }
};
