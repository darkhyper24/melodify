import { Context } from 'hono'
import { supabase } from '../supabase/supabase'
//fetching avatar icon for home page
export const getavatar = async (c: Context) => {
    try{
        const user = c.get('user')
        const { data, error } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
        if (error) {
            console.error('Error fetching avatar:', error)
            return c.json({ error: 'Failed to fetch avatar' }, 500)
        }
        if (!data) {
            return c.json({ error: 'Avatar not found' }, 404)
        }
        return c.json({ avatarUrl: data.avatar_url || null }, 200)

    }
    catch (error: unknown) {
        console.error('Unexpected error in getavatar:', error)
        return c.json({ error: 'Server error fetching avatar' }, 500)
    }
}