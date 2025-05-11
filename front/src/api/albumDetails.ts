import axios from "axios";
import api from "./axiosConfig";

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover: string;
    songUrl: string;
    lyrics: { text: string; time: number }[];
    category: string | null;
    createdAt: string;
}

export interface AlbumSongsResponse {
    album?: string | null;
    songs?: Song[];
    error?: string;
}

/**
 * Fetch songs for a specific album
 */
export const fetchAlbumSongs = async (albumId: string): Promise<AlbumSongsResponse> => {
    try {
        const response = await api.get(`/songs/album/${albumId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching album songs:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            error: error.response?.data?.error || "Failed to fetch album songs",
        };
    }
};

/**
 * Upload a song to an album
 */
export const uploadSong = async (
    title: string,
    category: string,
    songFile: File,
    coverFile?: File | null,
    albumId?: string
): Promise<{ success: boolean; error?: string; song?: any }> => {
    try {
        if (!albumId) {
            return { success: false, error: "Album ID is required" };
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("song", songFile);

        // Add cover file if provided
        if (coverFile) {
            formData.append("cover", coverFile);
        }

        const response = await api.post(`/songs/create/${albumId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            song: response.data.song,
        };
    } catch (error: any) {
        console.error("Error uploading song:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            success: false,
            error: error.response?.data?.error || "Failed to upload song",
        };
    }
};

/**
 * Upload album cover image
 */
export const uploadAlbumCover = async (albumId: string, imageFile: File): Promise<{ success: boolean; error?: string; albumPic?: string }> => {
    try {
        const formData = new FormData();
        formData.append("album_pic", imageFile);

        const response = await api.post(`/albums/${albumId}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            albumPic: response.data.albumPicUrl,
        };
    } catch (error: any) {
        console.error("Error uploading album cover:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            success: false,
            error: error.response?.data?.error || "Failed to upload album cover",
        };
    }
};

/**
 * Delete a song from an album
 */
export const deleteSong = async (songId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await api.delete(`/songs/${songId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting song:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        if (error.response?.status === 403) {
            return { success: false, error: "You don't have permission to delete this song" };
        }
        if (error.response?.status === 404) {
            return { success: false, error: "Song not found" };
        }
        return {
            success: false,
            error: error.response?.data?.error || "Failed to delete song",
        };
    }
};

/**
 * Fetch album details by ID
 */
export const fetchAlbumById = async (albumId: string): Promise<{ album: any; error?: string }> => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No authentication token found");
            return { album: null, error: "Not authenticated" };
        }

        const response = await api.get(`/albums/${albumId}`);

        return response.data;
    } catch (error: any) {
        console.error("Error fetching album details:", error.response?.data || error.message);
        // Token refresh is handled by axios interceptors
        return {
            album: null,
            error: error.response?.data?.error || "Failed to fetch album details",
        };
    }
};
