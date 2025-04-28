import { playlist } from '../models/schema';
import { Context } from "hono";
import { supabase } from "../supabase/supabase";

// Create a new playlist for a user
export const createPlaylist = async (c: Context) => {
    try {
        const { name } = await c.req.json();
        const  user  = await c.get("user");
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { data: existingPlaylist, error: existingError } = await supabase
            .from("Playlist")
            .select("*")
            .eq("name", name)
            .single();

        if (existingPlaylist) {
            return c.json({ message: "there is a playlist already with that name" }, 200);
        }
        const { data, error } = await supabase
            .from("Playlist")
            .insert({
                    id: crypto.randomUUID(),
                    name,
                    user_id: user.id
                })
            .select(`*,profiles (id,full_name)`)
            .single();
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ data }, 201);
    }
    catch (error) {
        console.error("Error creating playlist: ", error);
        return c.json({ error: "error creating playlist: " }, 500);
    }
}
//get all playlists for a user
export const getPlaylists = async (c: Context) => {
    try {
        const user = await c.get("user");
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        const { data, error } = await supabase
            .from("Playlist")
            .select(`*,profiles (id,full_name)`)
            .eq("user_id", user.id);
        if (error) {
            return c.json({ error: error.message }, 500);
        }
        return c.json({ data }, 200);
    } catch (error) {
        console.error("Error getting playlists: ", error);
        return c.json({ error: "error getting playlists: " }, 500);
    }
}

//update a playlist name
export const updatePlaylist = async (c: Context) => {
    try{
        const { id,name } = await c.req.json();
        const user = await c.get("user");
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        const { data, error } = await supabase
            .from("Playlist")
            .update({ name })
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
        if (error) {
            console.error("Error updating playlist: ", error);
            return c.json({ error: error.message }, 500);
        }
        console.log("playlist updated: ");
        return c.json({ data }, 200);
    }
    catch (error) {
        console.error("Error updating playlist: ", error);
        return c.json({ error: "error updating playlist: " }, 500);
    }
}
