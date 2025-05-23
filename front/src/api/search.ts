import api from './axiosConfig';
import { Song } from '@/providers/PlayerProvider';

// Response types
export interface SongSearchResult {
  id: string;
  title: string;
  songUrl: string;
  cover: string | null;
  category: string | null;
  createdAt: string;
  albumId: string;
  album: {
    name: string;
    albumPic: string | null;
  } | null;
  profiles: {
    fullName: string;
  } | null;
}

export interface AlbumSearchResult {
  id: string;
  name: string;
  albumPic: string | null;
  createdAt: string;
  userId: string;
  artist: {
    fullName: string;
  } | null;
  songCount?: number;
}

export interface ArtistSearchResult {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
}

export interface SearchResponse {
  songs: SongSearchResult[];
}

export interface AlbumSearchResponse {
  albums: AlbumSearchResult[];
}

export interface ArtistSearchResponse {
  artists: ArtistSearchResult[];
}

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await api.get<SearchResponse>(`/search/songs?q=${encodeURIComponent(query)}`);

    return response.data.songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.profiles?.fullName ?? 'Unknown Artist',
      album: song.album?.name ?? 'Unknown Album',
      album_id: song.albumId,
      cover: song.cover || song.album?.albumPic || '/placeholder.svg',
      songUrl: song.songUrl,
      lyrics: [],
    }));
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

export const searchAlbums = async (query: string): Promise<AlbumSearchResult[]> => {
  try {
    const response = await api.get<AlbumSearchResponse>(`/search/albums?q=${encodeURIComponent(query)}`);

    return response.data.albums;
  } catch (error) {
    console.error('Error searching albums:', error);
    return [];
  }
};

export const searchArtists = async (query: string): Promise<ArtistSearchResult[]> => {
  try {
    const response = await api.get<ArtistSearchResponse>(`/search/artists?q=${encodeURIComponent(query)}`);

    return response.data.artists;
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
};
