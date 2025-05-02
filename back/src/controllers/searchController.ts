import { Context } from "hono";
import { supabase } from "../supabase/supabase";
import { SearchResponse, AlbumSearchResponse, ArtistSearchResponse } from "../models/search";

type DbSong = {
    id: string;
    title: string;
    song_url: string;
    cover: string | null;
    category: string | null;
    created_at: string;
    album_id: string;
    album?: {
        name: string;
        album_pic: string | null;
    } | null;
    profiles?: {
        full_name: string;
    } | null;
};

type DbAlbum = {
    id: string;
    name: string;
    album_pic: string | null;
    created_at: string;
    user_id: string;
    profiles?: {
        full_name: string;
    } | null;
};

type DbArtist = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    bio: string | null;
};

export const searchSongs = async (c: Context) => {
    try {
        const query = c.req.query("q");
        const limit = parseInt(c.req.query("limit") ?? "20");
        const offset = parseInt(c.req.query("offset") ?? "0");
        
        if (!query) {
            return c.json({ error: "Search query is required" }, 400);
        }

        const normalizedQuery = query.toLowerCase().trim();
        
        const { data: songs, error } = await supabase
            .from("song")
            .select(`
                id,
                title,
                song_url,
                cover,
                category,
                created_at,
                album_id,
                album (
                    id,
                    name,
                    album_pic
                ),
                profiles (
                    id,
                    full_name
                )
            `)
            .or(`title.ilike.%${normalizedQuery}%, category.ilike.%${normalizedQuery}%`)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: songsByAlbum, error: albumError } = await supabase
            .from("song")
            .select(`
                id,
                title,
                song_url,
                cover,
                category,
                created_at,
                album_id,
                album!inner (
                    id,
                    name,
                    album_pic
                ),
                profiles (
                    id,
                    full_name
                )
            `)
            .filter('album.name', 'ilike', `%${normalizedQuery}%`)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: songsByArtist, error: artistError } = await supabase
            .from("song")
            .select(`
                id,
                title,
                song_url,
                cover,
                category,
                created_at,
                album_id,
                album (
                    id,
                    name,
                    album_pic
                ),
                profiles!inner (
                    id,
                    full_name
                )
            `)
            .filter('profiles.full_name', 'ilike', `%${normalizedQuery}%`)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error || albumError || artistError) {
            console.error("Error searching songs:", error || albumError || artistError);
            return c.json({ error: "Failed to search songs" }, 500);
        }

        const allSongs = [...(songs ?? []), ...(songsByAlbum ?? []), ...(songsByArtist ?? [])];
        const uniqueSongs = Array.from(new Map(allSongs.map(song => [song.id, song])).values());

        const response: SearchResponse = {
            query: query,
            count: uniqueSongs.length,
            songs: uniqueSongs.map((song: DbSong) => ({
                id: song.id,
                title: song.title,
                songUrl: song.song_url,
                cover: song.cover,
                category: song.category,
                albumId: song.album_id,
                album: song.album ? {
                    name: song.album.name,
                    albumPic: song.album.album_pic
                } : null,
                profiles: song.profiles ? {
                    fullName: song.profiles.full_name
                } : null,
                createdAt: song.created_at
            }))
        };

        return c.json(response, 200);
    } catch (error: unknown) {
        console.error("Unexpected error in searchSongs:", error);
        return c.json({ error: "Server error searching songs" }, 500);
    }
};

export const searchAlbums = async (c: Context) => {
    try {
        const query = c.req.query("q");
        const limit = parseInt(c.req.query("limit") ?? "20");
        const offset = parseInt(c.req.query("offset") ?? "0");
        
        if (!query) {
            return c.json({ error: "Search query is required" }, 400);
        }

        const normalizedQuery = query.toLowerCase().trim();
        
        const { data: albums, error } = await supabase
            .from("album")
            .select(`
                id,
                name,
                album_pic,
                created_at,
                user_id,
                profiles (
                    id,
                    full_name
                )
            `)
            .ilike('name', `%${normalizedQuery}%`)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error searching albums:", error);
            return c.json({ error: "Failed to search albums" }, 500);
        }

        // Get song count for each album
        const albumIds = albums?.map((album: DbAlbum) => album.id) || [];
        let songCounts: Record<string, number> = {};
        
        if (albumIds.length > 0) {
            const { data: songsData, error: songsError } = await supabase
                .from("song")
                .select('album_id')
                .in('album_id', albumIds);
                
            if (!songsError && songsData) {
                // Count songs per album
                songCounts = songsData.reduce((acc: Record<string, number>, song: { album_id: string }) => {
                    const albumId = song.album_id;
                    acc[albumId] = (acc[albumId] || 0) + 1;
                    return acc;
                }, {});
            }
        }

        // Format the response
        const response: AlbumSearchResponse = {
            query: query,
            count: albums?.length || 0,
            albums: (albums || []).map((album: DbAlbum) => ({
                id: album.id,
                name: album.name,
                albumPic: album.album_pic,
                createdAt: album.created_at,
                userId: album.user_id,
                artist: album.profiles ? {
                    fullName: album.profiles.full_name
                } : null,
                songCount: songCounts[album.id] || 0
            }))
        };

        return c.json(response, 200);
    } catch (error: unknown) {
        console.error("Unexpected error in searchAlbums:", error);
        return c.json({ error: "Server error searching albums" }, 500);
    }
};

export const searchArtists = async (c: Context) => {
    try {
        // Get search query from URL parameters
        const query = c.req.query("q");
        const limit = parseInt(c.req.query("limit") ?? "20");
        const offset = parseInt(c.req.query("offset") ?? "0");
        
        if (!query) {
            return c.json({ error: "Search query is required" }, 400);
        }

        // Normalize the search query for better matching
        const normalizedQuery = query.toLowerCase().trim();
        
        // Search artists by name
        const { data: artists, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                avatar_url,
                role,
                bio
            `)
            .ilike('full_name', `%${normalizedQuery}%`)
            .eq('role', 'artist')  // Only include users with 'artist' role
            .order("full_name", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error searching artists:", error);
            return c.json({ error: "Failed to search artists" }, 500);
        }

        // Format the response
        const response: ArtistSearchResponse = {
            query: query,
            count: artists?.length || 0,
            artists: (artists || []).map((artist: DbArtist) => ({
                id: artist.id,
                fullName: artist.full_name,
                avatarUrl: artist.avatar_url,
                role: artist.role,
                bio: artist.bio
            }))
        };

        return c.json(response, 200);
    } catch (error: unknown) {
        console.error("Unexpected error in searchArtists:", error);
        return c.json({ error: "Server error searching artists" }, 500);
    }
};
