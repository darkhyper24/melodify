import { Context } from "hono";
import { supabase } from "../supabase/supabase";
import { profiles } from "../models/profile";

type AlbumData = {
    id: string;
    name: string;
    album_pic: string | null;
    created_at: string;
};

// Get all albums with names and pictures only
export const getAlbums = async (c: Context) => {
    try {
        // Get all albums with artist information
        const { data: albums, error } = await supabase
            .from("album")
            .select(
                `id,
        name, 
        album_pic, 
                created_at,
                user_id,
                profiles (
                    full_name
                )
      `
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching albums:", error);
            return c.json({ error: "Failed to fetch albums" }, 500);
        }

        // Return with artist information
        return c.json(
            {
                albums: albums.map((album: any) => ({
                    id: album.id,
                    name: album.name,
                    albumPic: album.album_pic,
                    artistName: album.profiles?.full_name || "Unknown Artist"
                })),
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getAlbums:", error);
        return c.json({ error: "Server error fetching albums" }, 500);
    }
};

export const createAlbum = async (c: Context) => {
    try {
        const { name, album_pic } = await c.req.json();

        // Get user from context (set by authMiddleware)
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user has artist role
        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();

        if (profileError || !profile) {
            return c.json({ error: "Profile not found" }, 404);
        }

        if (profile.role !== "artist") {
            return c.json({ error: "Only artists can create albums" }, 403);
        }

        const { data, error } = await supabase
            .from("album")
            .insert({
                id: crypto.randomUUID(),
                name,
                album_pic: album_pic || null,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select(
                `
        *,
        profiles (
          id,
          full_name
        )
      `
            )
            .single();

        if (error) {
            console.error("Error creating album:", error);
            return c.json({ error: "Failed to create album" }, 500);
        }

        return c.json(
            {
                album: {
                    ...data,
                    artist: data.profiles?.full_name,
                },
            },
            201
        );
    } catch (error: unknown) {
        console.error("Unexpected error in createAlbum:", error);
        return c.json({ error: "Server error creating album" }, 500);
    }
};

// Delete an album

export const deleteAlbum = async (c: Context) => {
    try {
        const albumId = c.req.param("id");
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // First verify the album exists and belongs to the user
        const { data: album, error: fetchError } = await supabase.from("album").select("*").eq("id", albumId).single();

        if (fetchError || !album) {
            return c.json({ error: "Album not found" }, 404);
        }

        // Check if user owns the album
        if (album.user_id !== user.id) {
            return c.json({ error: "Unauthorized to delete this album" }, 403);
        }

        // Delete the album
        const { error: deleteError } = await supabase.from("album").delete().eq("id", albumId);

        if (deleteError) {
            console.error("Error deleting album:", deleteError);
            return c.json({ error: "Failed to delete album" }, 500);
        }

        return c.json(
            {
                message: "Album deleted successfully",
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in deleteAlbum:", error);
        return c.json({ error: "Server error deleting album" }, 500);
    }
};

export const updateAlbum = async (c: Context) => {
    try {
        const albumId = c.req.param("id");
        const user = c.get("user");
        const updates = await c.req.json();

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Validate update payload
        if (!updates.name && !updates.album_pic) {
            return c.json({ error: "No valid update fields provided" }, 400);
        }

        // First verify the album exists and belongs to the user
        const { data: album, error: fetchError } = await supabase.from("album").select("*").eq("id", albumId).single();

        if (fetchError || !album) {
            return c.json({ error: "Album not found" }, 404);
        }

        // Check if user owns the album
        if (album.user_id !== user.id) {
            return c.json({ error: "Unauthorized to update this album" }, 403);
        }

        // Build update object with only provided fields
        const updateData = {
            ...(updates.name && { name: updates.name }),
            ...(updates.album_pic && { album_pic: updates.album_pic }),
            updated_at: new Date().toISOString(),
        };

        // Update the album
        const { data: updatedAlbum, error: updateError } = await supabase
            .from("album")
            .update(updateData)
            .eq("id", albumId)
            .select(
                `
        *,
        profiles (
          id,
          full_name
        )
      `
            )
            .single();

        if (updateError) {
            console.error("Error updating album:", updateError);
            return c.json({ error: "Failed to update album" }, 500);
        }

        return c.json(
            {
                album: {
                    ...updatedAlbum,
                    artist: updatedAlbum.profiles?.full_name,
                },
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in updateAlbum:", error);
        return c.json({ error: "Server error updating album" }, 500);
    }
};

export const uploadAlbumPicture = async (c: Context) => {
    try {
        const albumId = c.req.param("id");
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // First verify the album exists and belongs to the user
        const { data: album, error: fetchError } = await supabase.from("album").select("album_pic, user_id").eq("id", albumId).single();

        if (fetchError || !album) {
            return c.json({ error: "Album not found" }, 404);
        }

        if (album.user_id !== user.id) {
            return c.json({ error: "Unauthorized to update this album" }, 403);
        }

        const oldAlbumPicUrl = album?.album_pic;

        const formData = await c.req.formData();
        const file = formData.get("album_pic") as File;

        if (!file || !(file instanceof File)) {
            return c.json({ error: "Album picture file is required" }, 400);
        }

        if (file.size > 2 * 1024 * 1024) {
            return c.json({ error: "Album picture must be smaller than 2MB" }, 400);
        }

        const fileType = file.type;
        if (!["image/jpeg", "image/png", "image/webp"].includes(fileType)) {
            return c.json({ error: "Only JPEG, PNG and WebP images are allowed" }, 400);
        }

        // Create unique file path
        const fileName = `${Date.now()}.${fileType.split("/")[1]}`;
        const filePath = `${albumId}/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();

        // Upload to storage bucket
        const { data, error } = await supabase.storage.from("album-pictures").upload(filePath, arrayBuffer, {
            contentType: fileType,
            upsert: true,
        });

        if (error) {
            console.error("Error uploading album picture:", error);
            return c.json({ error: "Failed to upload album picture" }, 500);
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("album-pictures").getPublicUrl(filePath);

        const albumPicUrl = urlData.publicUrl;

        // Update album with new picture URL
        const { error: updateError } = await supabase
            .from("album")
            .update({
                album_pic: albumPicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", albumId);

        if (updateError) {
            console.error("Error updating album with picture URL:", updateError);
            return c.json({ error: "Failed to update album with picture URL" }, 500);
        }

        // Delete old picture if exists
        if (oldAlbumPicUrl) {
            try {
                const pathMatch = oldAlbumPicUrl.match(/\/album-pictures\/(.+)$/);

                if (pathMatch && pathMatch[1]) {
                    const oldPath = pathMatch[1];
                    const { error: deleteError } = await supabase.storage.from("album-pictures").remove([oldPath]);

                    if (deleteError) {
                        console.error("Error deleting old album picture, continuing anyway:", deleteError);
                    } else {
                        console.log("Successfully deleted old album picture:", oldPath);
                    }
                }
            } catch (deleteError) {
                console.error("Exception while trying to delete old album picture:", deleteError);
            }
        }

        return c.json(
            {
                message: "Album picture uploaded and updated successfully",
                albumPicUrl: albumPicUrl,
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in uploadAlbumPicture:", error);
        return c.json({ error: "Server error uploading album picture" }, 500);
    }
};

export const getUserAlbums = async (c: Context) => {
    try {
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Get all albums for the authenticated user
        const { data: albums, error } = await supabase
            .from("album")
            .select(
                `
        id,
        name,
        album_pic,
        created_at,
        profiles (
          id,
          full_name
        )
      `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user albums:", error);
            return c.json({ error: "Failed to fetch user albums" }, 500);
        }

        return c.json(
            {
                albums: albums.map((album: AlbumData) => ({
                    id: album.id,
                    name: album.name,
                    albumPic: album.album_pic,
                    createdAt: album.created_at,
                })),
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getUserAlbums:", error);
        return c.json({ error: "Server error fetching user albums" }, 500);
    }
};

// getAlbumById
export const getAlbumById = async (c: Context) => {
    try {
        const albumId = c.req.param("id");

        // Get album by ID
        const { data: album, error } = await supabase
            .from("album")
            .select(
                `
        id,
        name,
        album_pic,
        created_at,
        profiles (
          id,
          full_name
        )
      `
            )
            .eq("id", albumId)
            .single();

        if (error) {
            console.error("Error fetching album:", error);
            return c.json({ error: "Failed to fetch album" }, 500);
        }

        if (!album) {
            return c.json({ error: "Album not found" }, 404);
        }

        return c.json(
            {
                album: {
                    id: album.id,
                    name: album.name,
                    albumPic: album.album_pic,
                    createdAt: album.created_at,
                    artist: album.profiles?.full_name,
                },
            },
            200
        );
    } catch (error: unknown) {
        console.error("Unexpected error in getAlbumById:", error);
        return c.json({ error: "Server error fetching album" }, 500);
    }
};
