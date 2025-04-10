import { Context } from 'hono'
import { supabase } from '../supabase/supabase'

type AlbumData = {
  id: string;
  name: string;
  album_pic: string | null;
  created_at: string;
}

type ArtistAlbumData = {
  name: string;
  album_pic: string | null;
}

// Get all albums with names and pictures only
export const getAlbums = async (c: Context) => {
  try {
    // Get all albums - we still query all these fields for sorting/filtering
    const { data: albums, error } = await supabase
      .from('album')
      .select(` 
        name, 
        album_pic, 
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching albums:', error);
      return c.json({ error: 'Failed to fetch albums' }, 500);
    }
    
    // Return only name and album_pic
    return c.json({
      albums: albums.map((album: ArtistAlbumData) => ({
        name: album.name,
        albumPic: album.album_pic
      }))
    }, 200);
  } catch (error: unknown) {
    console.error('Unexpected error in getAlbums:', error);
    return c.json({ error: 'Server error fetching albums' }, 500);
  }
}

