import axios from "axios";

export interface Song {
  id: string;
  title: string;
  songUrl: string;
  category: string | null;
  artist: string | null;
  createdAt: string;
}

export interface AlbumSongsResponse {
  album?: string;
  songs?: Song[];
  error?: string;
}

/**
 * Fetch songs for a specific album
 */
export const fetchAlbumSongs = async (albumId: string): Promise<AlbumSongsResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.error("No authentication token found");
      return { error: "Not authenticated" };
    }
    
    const response = await axios.get(`http://localhost:8787/songs/album/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching album songs:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      return { error: "Session expired. Please log in again." };
    }
    return { 
      error: error.response?.data?.error || "Failed to fetch album songs" 
    };
  }
};

/**
 * Upload a song to an album
 */
export const uploadSong = async (
  title: string,
  category: string,
  songFile: File
): Promise<{ success: boolean; error?: string; song?: any }> => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No authentication token found");
      return { success: false, error: "Not authenticated" };
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('song', songFile);
    
    const response = await axios.post(
      `http://localhost:8787/songs/create`, 
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      }
    );
    
    return { 
      success: true,
      song: response.data.song
    };
  } catch (error: any) {
    console.error("Error uploading song:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      return { success: false, error: "Session expired. Please log in again." };
    }
    return { 
      success: false,
      error: error.response?.data?.error || "Failed to upload song" 
    };
  }
};

/**
 * Upload album cover image
 */
export const uploadAlbumCover = async (
  albumId: string, 
  imageFile: File
): Promise<{ success: boolean; error?: string; albumPic?: string }> => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No authentication token found");
      return { success: false, error: "Not authenticated" };
    }
    
    const formData = new FormData();
    formData.append('album_pic', imageFile);
    
    const response = await axios.post(
      `http://localhost:8787/albums/${albumId}/upload`, 
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      }
    );
    
    return { 
      success: true,
      albumPic: response.data.albumPicUrl
    };
  } catch (error: any) {
    console.error("Error uploading album cover:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      return { success: false, error: "Session expired. Please log in again." };
    }
    return { 
      success: false,
      error: error.response?.data?.error || "Failed to upload album cover" 
    };
  }
};
