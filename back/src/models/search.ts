// Search models for the Melodify application

export type SongSearchResult = {
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
};

export type AlbumSearchResult = {
    id: string;
    name: string;
    albumPic: string | null;
    createdAt: string;
    userId: string;
    artist: {
        fullName: string;
    } | null;
    songCount?: number;
};

export type ArtistSearchResult = {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
    bio: string | null;
};

export type SearchResponse = {
    query: string;
    count: number;
    songs: SongSearchResult[];
};

export type AlbumSearchResponse = {
    query: string;
    count: number;
    albums: AlbumSearchResult[];
};

export type ArtistSearchResponse = {
    query: string;
    count: number;
    artists: ArtistSearchResult[];
};
