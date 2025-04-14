import { Context } from 'hono'
import { supabase} from '../supabase/supabase'


export const signup = async (c: Context) => {
  try {
    const { email, password, fullName, role, phone } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    if (role !== 'user' && role !== 'artist') {
      return c.json({ error: 'Invalid role. Must be either "user" or "artist"' }, 400)
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Supabase auth error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    if (data.user) {
      try {
        console.log('Attempting to create profile for user:', data.user.id);
        
        // Use Supabase REST API instead of Drizzle
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName || '',
            role: role,
            email: data.user.email,
            phone: phone || null,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          // Verify profile was created
          const { data: createdProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          console.log('Profile created:', createdProfile ? 'success' : 'failed');
        }
      } catch (dbError) {
        console.error('Profile creation error:', dbError);
      }
    }
       
    return c.json({ 
      message: 'Registration successful! Please check your email to confirm your account.',
      user: {
        ...data.user,
        role: role 
      }
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
    
    // Get user profile with Supabase REST API
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    return c.json({
      message: 'Login successful',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'user'
      }
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
        redirectTo: process.env.GOOGLE_REDIRECT_URI, 
      },
    })

    if (error) {
      console.error('Google login error:', error)
      console.log('Google login error:', error.message)
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
        redirectTo: process.env.FACEBOOK_REDIRECT_URI, 
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

//this function is experimentatl
export const setRole = async (c: Context) => {
  try {
    const user = c.get('user')
    const { role } = await c.req.json()
    
    if (!role || (role !== 'user' && role !== 'artist')) {
      return c.json({ error: 'Invalid role. Must be either "user" or "artist"' }, 400)
    }
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    let updateError = null;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      updateError = error;
    } else {
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: role,
          email: user.email,
          updated_at: new Date().toISOString()
        });
      
      updateError = error;
    }
    
    if (updateError) {
      console.error('Role update error:', updateError);
      return c.json({ error: 'Failed to update role' }, 500);
    }
    
    return c.json({
      message: 'Role set successfully',
      role: role
    }, 200)
  } catch (error: unknown) {
    console.error('Set role error:', error)
    return c.json({ error: 'Server error setting role' }, 500)
  }
}


export const refreshToken = async (c: Context) => {
  try {
    const { refresh_token } = await c.req.json()
    
    if (!refresh_token) {
      return c.json({ error: 'Refresh token is required' }, 400)
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })
    
    if (error) {
      console.error('Token refresh error:', error)
      return c.json({ error: error.message }, 401)
    }
    
    // Additional verification: Check user exists in our database
    const { data: userExists, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError || !userExists) {
      console.error('User not found in database during token refresh:', data.user.id);
      return c.json({ 
        error: 'User account not found or deactivated',
        code: 'INVALID_USER'
      }, 401)
    }
    
    // If we reach here, the user is authenticated in both Supabase and our database
    return c.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token, 
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userExists.role || 'user'
      }
    }, 200)
  } catch (error: unknown) {
    console.error('Refresh token error:', error)
    return c.json({ error: 'Server error during token refresh' }, 500)
  }
}
