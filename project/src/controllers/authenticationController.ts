import { Context } from 'hono'
import { supabase, db } from '../supabase/supabase'
import { profiles } from '../models/profile'

export const signup = async (c: Context) => {
  try {
    //to do: add the fields that the user needs to fill in the signup form like username , phone number ,etc
    const { email, password, fullName } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Supabase auth error:', error)
      return c.json({ error: error.message }, 400)
    }
    //to do: insert the data in the user entity or profile entity for future uses
       
    return c.json({ 
      message: 'Registration successful! Please check your email to confirm your account.',
      user: data.user 
    }, 201)
  } catch (error: unknown) {
    console.error('Signup error:', error)
    return c.json({ error: 'Server error during signup' }, 500)
  }
}


export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error)
      
      if (error.message.includes('Email not confirmed')) {
        return c.json({ 
          error: 'Please check your email inbox and confirm your email address before logging in.',
          needsEmailConfirmation: true
        }, 401)
      }
      return c.json({ error: error.message }, 401)
    }
    
    return c.json({
      message: 'Login successful',
      session: data.session,
      user: data.user
    }, 200)
    
  } catch (error: unknown) {
    console.error('Unexpected login error:', error)
    return c.json({ error: 'Server error during login' }, 500)
  }
}


export const logout = async (c: Context) => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ 
      message: 'Logged out successfully'
    }, 200)
  } catch (error: unknown) {
    console.error('Unexpected logout error:', error)
    return c.json({ error: 'Server error during logout' }, 500)
  }
}

export const loginWithGoogle = async (c: Context) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://127.0.0.1:8787', 
      },
    })

    if (error) {
      console.error('Google login error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({
      message: 'Redirecting to Google for authentication',
      url: data.url,
    }, 200)
  } catch (error: unknown) {
    console.error('Unexpected Google login error:', error)
    return c.json({ error: 'Server error during Google login' }, 500)
  }
}

export const loginWithFacebook = async (c: Context) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'http://127.0.0.1:8787', 
      }
    })

    if (error) {
      console.error('Facebook login error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({
      message: 'Redirecting to Facebook for authentication',
      url: data.url, 
    }, 200)
  } catch (error: unknown) {
    console.error('Unexpected Facebook login error:', error)
    return c.json({ error: 'Server error during Facebook login' }, 500)
  }
}

