import { Context, Next } from 'hono'
import { supabase } from '../supabase/supabase'

export const authMiddleware = async (c: Context, next: Next) => {
    // Get access token from Authorization header
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
        return c.json({ error: 'Authorization header is missing' }, 401)
    }
    
    const token = authHeader.split(' ')[1]
    if (!token) {
        return c.json({ error: 'Token is missing' }, 401)
    }
    
    // Get refresh token from custom header if present
    const refreshToken = c.req.header('X-Refresh-Token')
    
    try {
        // Try to validate the token
        const { data, error } = await supabase.auth.getUser(token)
        
        // If token is expired but refresh token is provided
        if (error && error.message.includes('expired') && refreshToken) {
            console.log('Access token expired, attempting refresh')
            
            // Try to refresh the token
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken
            })
            
            if (refreshError) {
                console.error('Refresh token error:', refreshError)
                return c.json({ 
                    error: 'Token expired and refresh failed', 
                    code: 'REFRESH_FAILED',
                    details: refreshError.message
                }, 401)
            }
            
            // Check if user exists in our database
            const { data: userExists, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', refreshData.user.id)
                .single()
            
            if (profileError || !userExists) {
                console.error('User not found during token refresh:', refreshData.user.id)
                return c.json({ 
                    error: 'User account not found or deactivated',
                    code: 'INVALID_USER'
                }, 401)
            }
            
            // Success! Set user and continue
            c.set('user', refreshData.user)
            
            // Provide the new tokens in response headers
            c.header('X-New-Access-Token', refreshData.session.access_token)
            c.header('X-New-Refresh-Token', refreshData.session.refresh_token)
            
            await next()
            return
        } else if (error) {
            // Token invalid for another reason, or expired but no refresh token
            if (error.message.includes('expired')) {
                return c.json({ 
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                }, 401)
            }
            return c.json({ error: 'Invalid token', details: error.message }, 401)
        }
        
        // Valid token, continue normally
        c.set('user', data.user)
        await next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return c.json({ error: 'Server error during authentication' }, 500)
    }
}