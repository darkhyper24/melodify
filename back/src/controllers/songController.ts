import { Context } from "hono";
import { supabase } from "../supabase/supabase";

type SongData = {
    id: string;
    title: string;
    song_url: string;
    cover: string | null;
    category: string | null;
    created_at: string;
    album: {
        name: string;
        album_pic: string | null;
    } | null;
    profiles: {
        full_name: string;
    } | null;
    lyrics?: string | null;
};
//getting song info for the songs page
export const getSongBasicInfo = async (c: Context) => {
    try {
        const songId = c.req.param("id");
        if (!songId) {
            return c.json({ error: "Song ID is required" }, 400);
        }
        const { data: song, error } = await supabase
            .from("song")
            .select(
                `
        id,
        title,
        song_url,
        album_id,
        user_id,
        album (
          name
        ),
        cover,
        artist:user_id (
          full_name
        ),
        lyrics
      `
            )
            .eq("id", songId)
            .single();

        if (error) {
            console.error("Error fetching song:", error);
            return c.json({ error: "Failed to fetch song" }, 500);
        }
        if (!song) {
            return c.json({ error: "Song not found" }, 404);
        }

        return c.json(
            {
                song: {
                    id: song.id,
                    title: song.title,
                    songUrl: song.song_url,
                    album: song.album?.name || null,
                    cover: song.cover || null,
                    artist: song.artist?.full_name || "Unknown Artist",
                    lyrics: song.lyrics || null,
                },
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getSongBasicInfo:", error);
        return c.json({ error: "Server error fetching song" }, 500);
    }
};

export const createSong = async (c: Context) => {
    try {
        const albumId = c.req.param('album_id')
        const formData = await c.req.formData();
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const songFile = formData.get("song") as File;
        const coverFile = formData.get("cover") as File;
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user has artist role
        const { data: profile, error: profileError } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();

        if (profileError || !profile) {
            return c.json({ error: "Profile not found" }, 404);
        }

        if (profile.role !== "artist") {
            return c.json({ error: "Only artists can upload songs" }, 403);
        }

        if (!title || !songFile) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        if (!(songFile instanceof File)) {
            return c.json({ error: "Invalid song file" }, 400);
        }

        const fileType = songFile.type;
        if (!["audio/mpeg", "audio/mp3"].includes(fileType)) {
            return c.json({ error: "Only MP3 files are allowed" }, 400);
        }

        if (songFile.size > 10 * 1024 * 1024) {
            return c.json({ error: "Song file must be smaller than 10MB" }, 400);
        }

        const { data: album, error: albumError } = await supabase
            .from("album")
            .select("*")
            .eq("user_id", profile.id)
            .eq('id', albumId)
            .order("created_at", { ascending: false })
            .single();

        if (albumError || !album) {
            return c.json({ error: "No album found. Please create an album first" }, 404);
        }

        const songFileName = `${Date.now()}_${songFile.name}`;
        const songFilePath = `${album.id}/${songFileName}`;
        const songArrayBuffer = await songFile.arrayBuffer();

        const { error: songUploadError } = await supabase.storage.from("songs").upload(songFilePath, songArrayBuffer, {
            contentType: fileType,
            upsert: false,
        });

        if (songUploadError) {
            console.error("Error uploading song:", songUploadError);
            return c.json({ error: "Failed to upload song" }, 500);
        }

        const { data: songUrlData } = supabase.storage.from("songs").getPublicUrl(songFilePath);
        const songUrl = songUrlData.publicUrl;
        let coverUrl = null;

        // Handle cover file upload if provided
        if (coverFile && coverFile instanceof File) {
            const coverFileType = coverFile.type;
            if (!["image/jpeg", "image/png", "image/webp"].includes(coverFileType)) {
                // Clean up song file if cover validation fails
                await supabase.storage.from("songs").remove([songFilePath]);
                return c.json({ error: "Only JPEG, PNG and WebP images are allowed for cover" }, 400);
            }

            if (coverFile.size > 2 * 1024 * 1024) {
                // Clean up song file if cover validation fails
                await supabase.storage.from("songs").remove([songFilePath]);
                return c.json({ error: "Cover image must be smaller than 2MB" }, 400);
            }

            const coverFileName = `${Date.now()}_${coverFile.name}`;
            const coverFilePath = `${album.id}/${coverFileName}`;
            const coverArrayBuffer = await coverFile.arrayBuffer();

            const { error: coverUploadError } = await supabase.storage.from("song-pic").upload(coverFilePath, coverArrayBuffer, {
                contentType: coverFileType,
                upsert: false,
            });

            if (coverUploadError) {
                // Clean up song file if cover upload fails
                await supabase.storage.from("songs").remove([songFilePath]);
                console.error("Error uploading cover:", coverUploadError);
                return c.json({ error: "Failed to upload cover" }, 500);
            }

            const { data: coverUrlData } = supabase.storage.from("song-pic").getPublicUrl(coverFilePath);
            coverUrl = coverUrlData.publicUrl;
        }

        const { data: song, error } = await supabase
            .from("song")
            .insert({
                id: crypto.randomUUID(),
                title,
                song_url: songUrl,
                category,
                user_id: profile.id,
                album_id: album.id,
                cover: coverUrl,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select(
                `
          *,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `
            )
            .single();

        if (error) {
            console.error("Error creating song:", error);
            // If database insert fails, try to clean up the uploaded file
            await supabase.storage.from("song").remove([songFilePath]);
            return c.json({ error: "Failed to create song" }, 500);
        }

        return c.json(
            {
                song: {
                    id: song.id,
                    title: song.title,
                    songUrl: song.song_url,
                    category: song.category,
                    cover: song.cover,
                    albumName: song.album?.name,
                    albumPic: song.album?.album_pic,
                    artist: song.profiles?.full_name,
                    createdAt: song.created_at,
                },
            },
            201
        );
    } catch (error: unknown) {
        console.error("Unexpected error in createSong:", error);
        return c.json({ error: "Server error creating song" }, 500);
    }
};

// Get all songs
export const getSongs = async (c: Context) => {
    try {
        const { data: songs, error } = await supabase
            .from("song")
            .select(
                `
          id,
          title,
          song_url,
          category,
          created_at,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching songs:", error);
            return c.json({ error: "Failed to fetch songs" }, 500);
        }

        return c.json(
            {
                songs: songs.map((song: SongData) => ({
                    id: song.id,
                    title: song.title,
                    songUrl: song.song_url,
                    cover: song.cover,
                    category: song.category,
                    albumName: song.album?.name,
                    albumPic: song.album?.album_pic,
                    artist: song.profiles?.full_name,
                    createdAt: song.created_at,
                })),
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getSongs:", error);
        return c.json({ error: "Server error fetching songs" }, 500);
    }
};

// Get all songs in an album
export const getAlbumSongs = async (c: Context) => {
    try {
        const albumId = c.req.param("id");

        // First verify the album exists
        const { data: album, error: albumError } = await supabase.from("album").select("id, name").eq("id", albumId).single();

        if (albumError || !album) {
            return c.json({ error: "Album not found" }, 404);
        }

        const { data: songs, error } = await supabase
            .from("song")
            .select(
                `
          id,
          title,
          song_url,
          category,
          created_at,
          cover,
          lyrics,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `
            )
            .eq("album_id", albumId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching album songs:", error);
            return c.json({ error: "Failed to fetch album songs" }, 500);
        }

        return c.json(
            {
                album: album.name,
                songs: songs.map((song: SongData) => ({
                    id: song.id,
                    title: song.title,
                    cover: song.cover,
                    lyrics: song.lyrics,
                    songUrl: song.song_url,
                    category: song.category,
                    artist: song.profiles?.full_name,
                    createdAt: song.created_at,
                })),
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getAlbumSongs:", error);
        return c.json({ error: "Server error fetching album songs" }, 500);
    }
};

export const updateSong = async (c: Context) => {
    try {
        const songId = c.req.param("id");
        const user = c.get("user");
        const formData = await c.req.formData();
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const coverFile = formData.get("cover") as File;

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        if (!title && !category && !coverFile) {
            return c.json({ error: "No valid update fields provided" }, 400);
        }

        const { data: song, error: fetchError } = await supabase.from("song").select("*").eq("id", songId).single();

        if (fetchError || !song) {
            return c.json({ error: "Song not found" }, 404);
        }

        if (song.user_id !== user.id) {
            return c.json({ error: "Unauthorized to update this song" }, 403);
        }

        let coverUrl = song.cover;

        // Handle cover file update if provided
        if (coverFile && coverFile instanceof File) {
            // Validate cover file
            const coverFileType = coverFile.type;
            if (!["image/jpeg", "image/png", "image/webp"].includes(coverFileType)) {
                return c.json({ error: "Only JPEG, PNG and WebP images are allowed for cover" }, 400);
            }

            if (coverFile.size > 2 * 1024 * 1024) {
                return c.json({ error: "Cover image must be smaller than 2MB" }, 400);
            }

            // Delete old cover if exists
            if (song.cover) {
                try {
                    const pathMatch = song.cover.match(/\/song-pic\/(.+)$/);
                    if (pathMatch && pathMatch[1]) {
                        const oldPath = pathMatch[1];
                        const { error: deleteError } = await supabase.storage.from("song-pic").remove([oldPath]);

                        if (deleteError) {
                            console.error("Error deleting old cover:", deleteError);
                            // Continue with upload anyway
                        } else {
                            console.log("Successfully deleted old cover:", oldPath);
                        }
                    }
                } catch (deleteError) {
                    console.error("Exception while trying to delete old cover:", deleteError);
                }
            }

            const coverFileName = `${Date.now()}_${coverFile.name}`;
            const coverFilePath = `${song.albumId}/${coverFileName}`;
            const coverArrayBuffer = await coverFile.arrayBuffer();

            const { error: coverUploadError } = await supabase.storage.from("song-pic").upload(coverFilePath, coverArrayBuffer, {
                contentType: coverFileType,
                upsert: false,
            });

            if (coverUploadError) {
                console.error("Error uploading new cover:", coverUploadError);
                return c.json({ error: "Failed to upload new cover" }, 500);
            }

            const { data: coverUrlData } = supabase.storage.from("song-pic").getPublicUrl(coverFilePath);

            coverUrl = coverUrlData.publicUrl;
        }

        const updateData = {
            ...(title && { title: title }),
            ...(category && { category: category }),
            ...(coverUrl && { cover: coverUrl }),
            updated_at: new Date().toISOString(),
        };

        const { data: updatedSong, error: updateError } = await supabase
            .from("song")
            .update(updateData)
            .eq("id", songId)
            .select(
                `
          *,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `
            )
            .single();

        if (updateError) {
            console.error("Error updating song:", updateError);
            return c.json({ error: "Failed to update song" }, 500);
        }

        return c.json(
            {
                song: {
                    id: updatedSong.id,
                    title: updatedSong.title,
                    songUrl: updatedSong.song_url,
                    category: updatedSong.category,
                    cover: updatedSong.cover,
                    albumName: updatedSong.album?.name,
                    albumPic: updatedSong.album?.album_pic,
                    artist: updatedSong.profiles?.full_name,
                    createdAt: updatedSong.created_at,
                },
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in updateSong:", error);
        return c.json({ error: "Server error updating song" }, 500);
    }
};
//deletes song from artist album
export const deleteSong = async (c: Context) => {
    try {
        const songId = c.req.param("id");
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // First verify the song exists and belongs to the user
        const { data: song, error: fetchError } = await supabase.from("song").select("song_url, user_id").eq("id", songId).single();

        if (fetchError || !song) {
            return c.json({ error: "Song not found" }, 404);
        }

        // Check if user owns the song
        if (song.user_id !== user.id) {
            return c.json({ error: "Unauthorized to delete this song" }, 403);
        }

        // Delete the song file from storage if it exists
        if (song.song_url) {
            try {
                const songPathMatch = song.song_url.match(/\/songs\/(.+)$/);
                if (songPathMatch && songPathMatch[1]) {
                    const filePath = songPathMatch[1];
                    const { error: deleteStorageError } = await supabase.storage.from("songs").remove([filePath]);

                    if (deleteStorageError) {
                        console.error("Error deleting song file:", deleteStorageError);
                    }
                }
            } catch (deleteError) {
                console.error("Error deleting song file:", deleteError);
            }
        }

        if (song.cover) {
            try {
                const coverPathMatch = song.cover.match(/\/song-pic\/(.+)$/);
                if (coverPathMatch && coverPathMatch[1]) {
                    await supabase.storage.from("song-pic").remove([coverPathMatch[1]]);
                }
            } catch (deleteError) {
                console.error("Error deleting cover file:", deleteError);
            }
        }

        // Delete the song record from the database
        const { error: deleteError } = await supabase.from("song").delete().eq("id", songId);

        if (deleteError) {
            console.error("Error deleting song:", deleteError);
            return c.json({ error: "Failed to delete song" }, 500);
        }

        return c.json(
            {
                message: "Song deleted successfully",
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in deleteSong:", error);
        return c.json({ error: "Server error deleting song" }, 500);
    }
};


//get all songs in a users playlist
export const getPlaylistSongs = async (c: Context) => {
    try {
        const playlistId = c.req.param("id");
        const user = c.get("user");
        const { data: playlist, error: playlistError } = await supabase.from("Playlist").select("id, name").eq("id", playlistId).single();

        if (playlistError || !playlist) {
            return c.json({ error: "playlist not found" }, 404);
        }
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        const { data: songs, error } = await supabase
            .from("playlist_song")
            .select(
                `
          song_id,
          song:song_id (
            title,
            song_url,
            category,
            created_at,
            cover,
            album (
              name,
              album_pic
            ),
            profiles (
              full_name
            )
              )`
          ).eq("playlist_id", playlistId);
        if (error) {
            console.error("Error fetching playlist songs:", error);
            return c.json({ error: "Failed to fetch playlist songs" }, 500);
    }
    const formattedSongs = songs.map((item: { song_id: string; song: SongData }) => ({
        id: item.song_id,
        title: item.song.title,
        artist: item.song.profiles?.full_name,
        albumName: item.song.album?.name,
        albumCover: item.song.album?.album_pic,
        category: item.song.category,
        songUrl: item.song.song_url,
        coverImage: item.song.cover,
        createdAt: new Date(item.song.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }));

    return c.json(
        {
            playlistName: playlist.name,
            songsCount: formattedSongs.length,
            songs: formattedSongs
        }, 200);
    }
    catch (error){
        console.error("Unexpected error in getPlaylistSongs:", error);
        return c.json({ error: "Server error fetching playlist songs" }, 500);
    }
};


//add song to playlist
export const addSongToPlaylist = async (c: Context) => {
    try{
        const user = c.get("user");
        const playlistId = c.req.param("id");
        const { songId } = await c.req.json();
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!songId) {
            return c.json({ error: "Song ID is required" }, 400);
        }
        const { data: playlist, error: playlistError } = await supabase
        .from("Playlist")
        .select("id, user_id")
        .eq("id", playlistId)
        .single();
        if (playlistError || !playlist) {
            return c.json({ error: "Playlist not found" }, 404);
        }
        if (playlist.user_id !== user.id) {
            return c.json({ error: "Unauthorized to add song to this playlist" }, 403);
        }
        const { data: song, error: songError } = await supabase
        .from("song")
        .select("id")
        .eq("id", songId)
        .single();

        if (songError || !song) {
            return c.json({ error: "Song not found" }, 404);
        }
        const { data: existingSong, error: existingError } = await supabase
            .from("playlist_song")
            .select("*")
            .eq("playlist_id", playlistId)
            .eq("song_id", songId)
            .single();

        if (existingSong) {
            return c.json({ message: "Song already in playlist" }, 200);
        }
        const { error: insertError } = await supabase
            .from("playlist_song")
            .insert({
                playlist_id: playlistId,
                song_id: songId,
            });
        if (insertError) {
            console.error("Error adding song to playlist:", insertError);
            return c.json({ error: "Failed to add song to playlist" }, 500);
        }
        return c.json({ message: "Song added to playlist" }, 201);

    }
    catch (error) {
        console.error("Unexpected error in addSongToPlaylist:", error);
        return c.json({ error: "Server error adding song to playlist" }, 500);
    }

}

// Like a song (adds to Liked Songs playlist)
export const likeSong = async (c: Context) => {
    try {
        const user = c.get("user");
        const songId = c.req.param("id");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        if (!songId) {
            return c.json({ error: "Song ID is required" }, 400);
        }

        // Check if song exists
        const { data: song, error: songError } = await supabase
            .from("song")
            .select("id")
            .eq("id", songId)
            .single();

        if (songError || !song) {
            return c.json({ error: "Song not found" }, 404);
        }

        // Get or create Liked Songs playlist
        const { data: likedPlaylist, error: playlistError } = await supabase
            .from("Playlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", "Liked Songs")
            .single();

        let playlistId;

        if (!likedPlaylist) {
            // Create Liked Songs playlist if it doesn't exist
            const { data: newPlaylist, error: createError } = await supabase
                .from("Playlist")
                .insert({
                    id: crypto.randomUUID(),
                    name: "Liked Songs",
                    user_id: user.id
                })
                .select("id")
                .single();

            if (createError) {
                console.error("Error creating Liked Songs playlist:", createError);
                return c.json({ error: "Failed to create Liked Songs playlist" }, 500);
            }

            playlistId = newPlaylist.id;
        } else {
            playlistId = likedPlaylist.id;
        }

        // Check if song is already in playlist
        const { data: existingSong, error: existingError } = await supabase
            .from("playlist_song")
            .select("*")
            .eq("playlist_id", playlistId)
            .eq("song_id", songId)
            .single();

        if (existingSong) {
            return c.json({ message: "You already liked this song" }, 200);
        }

        // Add song to playlist
        const { error: insertError } = await supabase
            .from("playlist_song")
            .insert({
                playlist_id: playlistId,
                song_id: songId,
            });

        if (insertError) {
            console.error("Error adding song to Liked Songs:", insertError);
            return c.json({ error: "Failed to like song" }, 500);
        }

        return c.json({ message: "Song added to Liked Songs" }, 201);
    } catch (error) {
        console.error("Unexpected error in likeSong:", error);
        return c.json({ error: "Server error liking song" }, 500);
    }
};

export const unlikeSong = async (c: Context) => {
    try {
        const user = c.get("user");
        const songId = c.req.param("id");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        if (!songId) {
            return c.json({ error: "Song ID is required" }, 400);
        }

        // Get Liked Songs playlist
        const { data: likedPlaylist, error: playlistError } = await supabase
            .from("Playlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", "Liked Songs")
            .single();

        if (playlistError || !likedPlaylist) {
            return c.json({ error: "Liked Songs playlist not found" }, 404);
        }

        // Remove song from playlist
        const { error: deleteError } = await supabase
            .from("playlist_song")
            .delete()
            .eq("playlist_id", likedPlaylist.id)
            .eq("song_id", songId);

        if (deleteError) {
            console.error("Error removing song from Liked Songs:", deleteError);
            return c.json({ error: "Failed to unlike song" }, 500);
        }

        // Check if playlist is now empty
        const { data: remainingSongs, error: countError } = await supabase
            .from("playlist_song")
            .select("song_id")
            .eq("playlist_id", likedPlaylist.id);

        if (countError) {
            console.error("Error checking remaining songs:", countError);
            return c.json({ error: "Failed to check remaining songs" }, 500);
        }

        // If no songs left, delete the playlist
        if (remainingSongs.length === 0) {
            const { error: deletePlaylistError } = await supabase
                .from("Playlist")
                .delete()
                .eq("id", likedPlaylist.id);

            if (deletePlaylistError) {
                console.error("Error deleting empty Liked Songs playlist:", deletePlaylistError);
                return c.json({ error: "Failed to delete empty playlist" }, 500);
            }
        }

        return c.json({ message: "You don't like this song anymore :(" }, 200);
    } catch (error) {
        console.error("Unexpected error in unlikeSong:", error);
        return c.json({ error: "Server error unliking song" }, 500);
    }
};