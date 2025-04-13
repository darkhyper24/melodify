import { Context } from 'hono'
import { supabase } from '../supabase/supabase'

// Get user profile data
export const getProfile = async (c: Context) => {
  try {
    // Get user from context (set by authMiddleware)
    const user = c.get('user')
    
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, email, avatar_url, bio')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return c.json({ error: 'Failed to fetch profile data' }, 500)
    }
    
    if (!data) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    return c.json({
      profile: {
        fullName: data.full_name,
        phone: data.phone || null,
        email: data.email,
        avatarUrl: data.avatar_url || null,
        bio: data.bio || null
      }
    }, 200)
  } catch (error: unknown) {
    console.error('Unexpected error in getProfile:', error)
    return c.json({ error: 'Server error fetching profile' }, 500)
  }
}

// Updating profile information (fullname, bio, phone)
export const updateProfile = async (c: Context) => {
  try {
    const user = c.get('user')
    const { fullName, bio, phone } = await c.req.json()
    
    if (fullName !== undefined && typeof fullName !== 'string') {
      return c.json({ error: 'Full name must be a string' }, 400)
    }
    
    if (bio !== undefined && typeof bio !== 'string') {
      return c.json({ error: 'Bio must be a string' }, 400)
    }
    
    if (phone !== undefined && typeof phone !== 'string') {
      return c.json({ error: 'Phone must be a string' }, 400)
    }
    
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (fullName !== undefined) updateData.full_name = fullName
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
    
    if (error) {
      console.error('Error updating profile:', error)
      return c.json({ error: 'Failed to update profile' }, 500)
    }
    
    return c.json({
      message: 'Profile updated successfully',
      updated: {
        fullName: fullName !== undefined ? fullName : undefined,
        bio: bio !== undefined ? bio : undefined,
        phone: phone !== undefined ? phone : undefined
      }
    }, 200)
  } catch (error: unknown) {
    console.error('Unexpected error in updateProfile:', error)
    return c.json({ error: 'Server error updating profile' }, 500)
  }
}

// Update avatar URL
// export const updateAvatar = async (c: Context) => {
//   try {
//     const user = c.get('user')
//     const { avatarUrl } = await c.req.json()
    
//     if (!avatarUrl || typeof avatarUrl !== 'string') {
//       return c.json({ error: 'Avatar URL is required and must be a string' }, 400)
//     }
    
//     // Update just the avatar_url field
//     const { error } = await supabase
//       .from('profiles')
//       .update({
//         avatar_url: avatarUrl,
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', user.id)
    
//     if (error) {
//       console.error('Error updating avatar:', error)
//       return c.json({ error: 'Failed to update avatar' }, 500)
//     }
    
//     return c.json({
//       message: 'Avatar updated successfully',
//       avatarUrl: avatarUrl
//     }, 200)
//   } catch (error: unknown) {
//     console.error('Unexpected error in updateAvatar:', error)
//     return c.json({ error: 'Server error updating avatar' }, 500)
//   }
// }



export const uploadAvatar = async (c: Context) => {
  try {
    const user = c.get('user');
    

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching current profile:', profileError);

    }
    const oldAvatarUrl = currentProfile?.avatar_url;
    
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File;
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Avatar image file is required' }, 400);
    }

    if (file.size > 2 * 1024 * 1024) {
      return c.json({ error: 'Avatar image must be smaller than 2MB' }, 400);
    }
    
    const fileType = file.type;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(fileType)) {
      return c.json({ error: 'Only JPEG, PNG and WebP images are allowed' }, 400);
    }
    
    // Creating a unique file path using user ID to ensure they can only modify their own avatar
    const fileName = `${Date.now()}.${fileType.split('/')[1]}`;
    const filePath = `${user.id}/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Uploading to the bucket
    const { data, error } = await supabase
      .storage
      .from('avatars')  
      .upload(filePath, arrayBuffer, {
        contentType: fileType,
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading avatar:', error);
      return c.json({ error: 'Failed to upload avatar' }, 500);
    }
    
    // Getting the url
    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    const avatarUrl = urlData.publicUrl;
    
    // updating url in the database table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError);
      return c.json({ error: 'Failed to update profile with avatar URL' }, 500);
    }
    
    // Deleting the old avatar if there is any
    if (oldAvatarUrl) {
      try {

        const pathMatch = oldAvatarUrl.match(/\/avatars\/(.+)$/);
        
        if (pathMatch && pathMatch[1]) {
          const oldPath = pathMatch[1];
          // Delete the old file
          const { error: deleteError } = await supabase
            .storage
            .from('avatars')
            .remove([oldPath]);
          
          if (deleteError) {
            console.error('Error deleting old avatar, continuing anyway:', deleteError);
            // We don't return an error to the client as the upload succeeded
          } else {
            console.log('Successfully deleted old avatar:', oldPath);
          }
        }
      } catch (deleteError) {
        console.error('Exception while trying to delete old avatar:', deleteError);
        
      }
    }
    
    return c.json({
      message: 'Avatar uploaded and profile updated successfully',
      avatarUrl: avatarUrl
    }, 200);
  } catch (error: unknown) {
    console.error('Unexpected error in uploadAvatar:', error);
    return c.json({ error: 'Server error uploading avatar' }, 500);
  }
}