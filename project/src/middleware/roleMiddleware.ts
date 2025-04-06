import { Context, Next } from 'hono'
import { supabase } from '../supabase/supabase'

export const artistMiddleware = async (c: Context, next: Next) => {
    // The authMiddleware should run before this middleware
    const user = c.get('user')
    
    if (!user) {
        return c.json({ error: 'Authentication required' }, 401)
    }
    
    try {
        // Get user profile with role using Supabase REST API
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error) {
            console.error('Profile fetch error:', error);
            return c.json({ error: 'Error fetching user profile' }, 500);
        }
        
        if (!profile) {
            return c.json({ error: 'User profile not found' }, 404)
        }
        
        if (profile.role !== 'artist') {
            return c.json({ error: 'Artist privileges required' }, 403)
        }
        
        // Add profile to context for later use
        c.set('profile', profile)
        await next()
    } catch (error) {
        console.error('Artist middleware error:', error)
        return c.json({ error: 'Server error checking artist status' }, 500)
    }
}