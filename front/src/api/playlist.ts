import axios from 'axios';

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  profiles?: {
    id: string;
    full_name: string;
  };
}

export interface PlaylistsResponse {
  data: Playlist[];
}

export interface PlaylistResponse {
  data: Playlist;
}

export interface PlaylistSong {
  id: string;
  title: string;
  artist?: string;
  albumName?: string;
  albumCover?: string;
  category?: string;
  songUrl: string;
  coverImage?: string;
  createdAt: string;
  album?: string;
  album_id?: string;
  cover?: string;
  lyrics?: { text: string; time: number }[];
  duration?: number;
}

export interface PlaylistSongsResponse {
  playlistName: string;
  songsCount: number;
  songs: PlaylistSong[];
}

const API_URL = 'http://localhost:8787';

// Get all playlists for the current user
export const fetchUserPlaylists = async (): Promise<PlaylistsResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/playlists`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

// Create a new playlist
export const createPlaylist = async (name: string): Promise<PlaylistResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/playlists/create`, 
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Update a playlist's name
export const updatePlaylistName = async (id: string, name: string): Promise<PlaylistResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_URL}/playlists/update`,
      { id, name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
};

// Get songs in a playlist
export const fetchPlaylistSongs = async (playlistId: string): Promise<PlaylistSongsResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/songs/playlist/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    throw error;
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (playlistId: string, songId: string): Promise<{ message: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/songs/playlist/${playlistId}/add`,
      { songId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    throw error;
  }
}; 