import { Context, Next } from 'hono'
import { db } from '../supabase/supabase'
import { profiles } from '../models/profile'
import { eq } from 'drizzle-orm'

export const artistMiddleware = async (c: Context, next: Next) => {
    // The authMiddleware should run before this middleware
    // so we can expect the user to be set in the context
    const user = c.get('user')
    
    if (!user) {
        return c.json({ error: 'Authentication required' }, 401)
    }
    
    try {
        // Get user profile with role
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id)
        });
        
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