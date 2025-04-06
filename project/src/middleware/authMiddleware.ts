import { Context, Next } from 'hono'
import { supabase } from '../supabase/supabase'

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
        return c.json({ error: 'Authorization header is missing' }, 401)
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
        return c.json({ error: 'Token is missing' }, 401)
    }
    try {
        const { data, error } = await supabase.auth.getUser(token)
        
        if (error) {
            if (error.message.includes('expired')) {
                return c.json({ 
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                }, 401)
            }
            return c.json({ error: 'Invalid token' }, 401)
        }
        
        c.set('user', data.user)
        await next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return c.json({ error: 'Server error during authentication' }, 500)
    }
}