import api from './axiosConfig';

export interface Album {
  id: string;
  name: string;
  albumPic: string | null;
}

export interface AlbumsResponse {
  albums: Album[];
}

export const fetchAlbums = async (): Promise<AlbumsResponse> => {
  try {
    const response = await api.get<AlbumsResponse>(`/albums`);
    return response.data;
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
};

