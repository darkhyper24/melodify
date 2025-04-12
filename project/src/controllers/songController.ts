import { Context } from 'hono'
import { supabase } from '../supabase/supabase'

type SongData = {
    id: string;
    title: string;
    song_url: string;
    category: string | null;
    created_at: string;
    album: {
      name: string;
      album_pic: string | null;
    } | null;
    profiles: {
      full_name: string;
    } | null;
  }
//getting song info for the songs page
export const getSongBasicInfo = async (c: Context) => {
  try {
    const songId = c.req.param('id')
    if (!songId) {
      return c.json({ error: 'Song ID is required' }, 400)
    }
    const { data: song, error } = await supabase
      .from('song')
      .select(`
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
      `)
      .eq('id', songId)
      .single()

    if (error) {
      console.error('Error fetching song:', error)
      return c.json({ error: 'Failed to fetch song' }, 500)
    }
    if (!song) {
      return c.json({ error: 'Song not found' }, 404)
    }

    return c.json({
      song: {
        id: song.id,
        title: song.title,
        songUrl: song.song_url,
        album: song.album?.name || null,
        cover: song.cover || null,
        artist: song.artist?.full_name || 'Unknown Artist',
        lyrics: song.lyrics || null

      }
    }, 200)

  } catch (error: unknown) {
    console.error('Unexpected error in getSongBasicInfo:', error)
    return c.json({ error: 'Server error fetching song' }, 500)
  }
}

export const createSong = async (c: Context) => {
    try {
      const formData = await c.req.formData()
      const title = formData.get('title') as string
      const category = formData.get('category') as string
      const songFile = formData.get('song') as File
      const user = c.get('user')
  
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
  
      // Check if user has artist role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()
  
      if (profileError || !profile) {
        return c.json({ error: 'Profile not found' }, 404)
      }
  
      if (profile.role !== 'artist') {
        return c.json({ error: 'Only artists can upload songs' }, 403)
      }
  
      if (!title || !songFile) {
        return c.json({ error: 'Missing required fields' }, 400)
      }
  
      if (!(songFile instanceof File)) {
        return c.json({ error: 'Invalid song file' }, 400)
      }
  
      const fileType = songFile.type
      if (!['audio/mpeg', 'audio/mp3'].includes(fileType)) {
        return c.json({ error: 'Only MP3 files are allowed' }, 400)
      }
  
      if (songFile.size > 10 * 1024 * 1024) {
        return c.json({ error: 'Song file must be smaller than 10MB' }, 400)
      }
  
      // Get user's most recent album
      const { data: album, error: albumError } = await supabase
        .from('album') 
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
  
      if (albumError || !album) {
        return c.json({ error: 'No album found. Please create an album first' }, 404)
      }
  
      const fileName = `${Date.now()}_${songFile.name}`
      const filePath = `${album.id}/${fileName}`
  
      const arrayBuffer = await songFile.arrayBuffer()
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('songs')
        .upload(filePath, arrayBuffer, {
          contentType: fileType,
          upsert: false
        })
  
      if (uploadError) {
        console.error('Error uploading song:', uploadError)
        return c.json({ error: 'Failed to upload song' }, 500)
      }
  
      const { data: urlData } = supabase
        .storage
        .from('songs')
        .getPublicUrl(filePath)
  
      const songUrl = urlData.publicUrl
  
      const { data: song, error } = await supabase
        .from('song')
        .insert({
          id: crypto.randomUUID(),
          title,
          song_url: songUrl,
          category,
          user_id: profile.id,
          album_id: album.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `)
        .single()
  
      if (error) {
        console.error('Error creating song:', error)
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('song').remove([filePath])
        return c.json({ error: 'Failed to create song' }, 500)
      }
  
      return c.json({
        song: {
          id: song.id,
          title: song.title,
          songUrl: song.songUrl,
          category: song.category,
          albumName: song.album?.name, 
          albumPic: song.album?.album_pic,
          artist: song.profiles?.full_name,
          createdAt: song.createdAt
        }
      }, 201)
  
    } catch (error: unknown) {
      console.error('Unexpected error in createSong:', error)
      return c.json({ error: 'Server error creating song' }, 500)
    }
  }

  // Get all songs
export const getSongs = async (c: Context) => {
    try {
      const { data: songs, error } = await supabase
        .from('song')
        .select(`
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
        `)
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Error fetching songs:', error)
        return c.json({ error: 'Failed to fetch songs' }, 500)
      }
  
      return c.json({
        songs: songs.map((song: SongData) => ({
          id: song.id,
          title: song.title,
          songUrl: song.song_url,
          category: song.category,
          albumName: song.album?.name, 
          albumPic: song.album?.album_pic,
          artist: song.profiles?.full_name,
          createdAt: song.created_at
        }))
      }, 200)
  
    } catch (error: unknown) {
      console.error('Unexpected error in getSongs:', error)
      return c.json({ error: 'Server error fetching songs' }, 500)
    }
  }
  
  // Get all songs in an album
  export const getAlbumSongs = async (c: Context) => {
    try {
      const albumId = c.req.param('id')
  
      // First verify the album exists
      const { data: album, error: albumError } = await supabase
        .from('album')
        .select('id, name')
        .eq('id', albumId)
        .single()
  
      if (albumError || !album) {
        return c.json({ error: 'Album not found' }, 404)
      }
  
      const { data: songs, error } = await supabase
        .from('song')
        .select(`
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
        `)
        .eq('album_id', albumId)
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Error fetching album songs:', error)
        return c.json({ error: 'Failed to fetch album songs' }, 500)
      }
  
      return c.json({
        album: album.name,
        songs: songs.map((song: SongData) => ({
          id: song.id,
          title: song.title,
          songUrl: song.song_url,
          category: song.category,
          artist: song.profiles?.full_name,
          createdAt: song.created_at
        }))
      }, 200)
  
    } catch (error: unknown) {
      console.error('Unexpected error in getAlbumSongs:', error)
      return c.json({ error: 'Server error fetching album songs' }, 500)
    }
  }

export const updateSong = async (c: Context) => {
    try {
      const songId = c.req.param('id')
      const user = c.get('user')
      const updates = await c.req.json()
  
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
  
      if (!updates.title && !updates.category) {
        return c.json({ error: 'No valid update fields provided' }, 400)
      }
  
      const { data: song, error: fetchError } = await supabase
        .from('song')
        .select('*')
        .eq('id', songId)
        .single()
  
      if (fetchError || !song) {
        return c.json({ error: 'Song not found' }, 404)
      }
  
      if (song.user_id !== user.id) {
        return c.json({ error: 'Unauthorized to update this song' }, 403)
      }
  
      const updateData = {
        ...(updates.title && { title: updates.title }),
        ...(updates.category && { category: updates.category }),
        updated_at: new Date().toISOString()
      }
  
      const { data: updatedSong, error: updateError } = await supabase
        .from('song')
        .update(updateData)
        .eq('id', songId)
        .select(`
          *,
          album (
            name,
            album_pic
          ),
          profiles (
            full_name
          )
        `)
        .single()
  
      if (updateError) {
        console.error('Error updating song:', updateError)
        return c.json({ error: 'Failed to update song' }, 500)
      }
  
      return c.json({
        song: {
          id: updatedSong.id,
          title: updatedSong.title,
          songUrl: updatedSong.song_url,
          category: updatedSong.category,
          albumName: updatedSong.album?.name,
          albumPic: updatedSong.album?.album_pic,
          artist: updatedSong.profiles?.full_name,
          createdAt: updatedSong.createdAt
        }
      }, 200)
  
    } catch (error: unknown) {
      console.error('Unexpected error in updateSong:', error)
      return c.json({ error: 'Server error updating song' }, 500)
    }
  }
  
  export const deleteSong = async (c: Context) => {
    try {
      const songId = c.req.param('id')
      const user = c.get('user')
  
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
  
      // First verify the song exists and belongs to the user
      const { data: song, error: fetchError } = await supabase
        .from('song')
        .select('song_url, user_id')
        .eq('id', songId)
        .single()
  
      if (fetchError || !song) {
        return c.json({ error: 'Song not found' }, 404)
      }
  
      // Check if user owns the song
      if (song.user_id !== user.id) {
        return c.json({ error: 'Unauthorized to delete this song' }, 403)
      }
  
      // Delete the song file from storage if it exists
      if (song.songUrl) {
        try {
          const pathMatch = song.songUrl.match(/\/songs\/(.+)$/)
          if (pathMatch && pathMatch[1]) {
            const filePath = pathMatch[1]
            const { error: deleteStorageError } = await supabase
              .storage
              .from('songs')
              .remove([filePath])
  
            if (deleteStorageError) {
              console.error('Error deleting song file:', deleteStorageError)
            }
          }
        } catch (deleteError) {
          console.error('Error deleting song file:', deleteError)
        }
      }
  
      // Delete the song record from the database
      const { error: deleteError } = await supabase
        .from('song')
        .delete()
        .eq('id', songId)
  
      if (deleteError) {
        console.error('Error deleting song:', deleteError)
        return c.json({ error: 'Failed to delete song' }, 500)
      }
  
      return c.json({
        message: 'Song deleted successfully'
      }, 200)
  
    } catch (error: unknown) {
      console.error('Unexpected error in deleteSong:', error)
      return c.json({ error: 'Server error deleting song' }, 500)
    }
  }