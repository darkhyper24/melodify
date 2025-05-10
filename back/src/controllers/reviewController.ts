import { Context } from 'hono';
import { supabase } from '../supabase/supabase';
import { songReview } from '../models/review';
import { songs } from '../models/song';

export const createReview = async (c: Context) => {
  try {
    const songId = c.req.param('song_id'); 
    const { rating } = await c.req.json();
    const user = c.get('user');
    
    const { data: existingReview } = await supabase
      .from('song_review')
      .select('*')
      .eq('song_id', songId)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return c.json({ error: 'You have already reviewed this song. Use PATCH to update.' }, 400);
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    // Check if song exists and get artist info
    const { data: song } = await supabase
      .from('song')
      .select('user_id')
      .eq('id', songId)
      .single();

    if (!song) {
      return c.json({ error: 'Song not found' }, 404);
    }

    // Prevent artist from reviewing their own song
    if (song.user_id === user.id) {
      return c.json({ error: 'Artists cannot review their own songs' }, 403);
    }

    const { data: review, error } = await supabase
      .from('song_review')
      .upsert({
        song_id: songId,
        user_id: user.id,
        rating,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await updateSongStatistics(songId);

    return c.json({ review }, 201);
  } catch (error) {
    console.error('Review error:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
};

const updateSongStatistics = async (songId: string) => {
  interface ReviewStat {
    rating: number;
  }
  
  const { data: stats } = await supabase
    .from('song_review')
    .select('rating')
    .eq('song_id', songId);

  if (!stats) return;

  const reviewCount = stats.length;
  const averageRating = stats.reduce((acc: number, curr: ReviewStat) => acc + curr.rating, 0) / reviewCount;

  await supabase
    .from('song')
    .update({
      average_rating: averageRating.toFixed(2),
      review_count: reviewCount,
    })
    .eq('id', songId);
};

export const getReviews = async (c: Context) => {
  try {
    const songId = c.req.param('song_id');

    const { data: reviews, error } = await supabase
      .from('song_review')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('song_id', songId);

    if (error) throw error;

    // Calculate statistics
    const reviewCount = reviews?.length || 0;
    const averageRating = reviews?.length 
      ? reviews.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / reviewCount 
      : 0;

    return c.json({ 
      reviews,
      statistics: {
        average_rating: Number(averageRating.toFixed(1)),
        review_count: reviewCount
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
};

export const updateReview = async (c: Context) => {
    try {
      const songId = c.req.param('song_id');
      const { rating } = await c.req.json();
      const user = c.get('user');
  
      const { data: existingReview } = await supabase
        .from('song_review')
        .select('*')
        .eq('song_id', songId)
        .eq('user_id', user.id)
        .single();
  
      if (!existingReview) {
        return c.json({ error: 'Review not found' }, 404);
      }
  
      const { data: review, error } = await supabase
        .from('song_review')
        .update({ 
          rating,
          updated_at: new Date().toISOString()
        })
        .eq('song_id', songId)
        .eq('user_id', user.id)
        .select()
        .single();
  
      if (error) throw error;
  
      await updateSongStatistics(songId);
      return c.json({ review }, 200);
    } catch (error) {
      console.error('Update review error:', error);
      return c.json({ error: 'Failed to update review' }, 500);
    }
  };

  export const deleteReview = async (c: Context) => {
    try {
      const songId = c.req.param('song_id');
      const user = c.get('user');

      // Check if the review exists
        const { data: existingReview } = await supabase
            .from('song_review')
            .select('*')
            .eq('song_id', songId)
            .eq('user_id', user.id)
            .single();

        if (!existingReview) {
            return c.json({ error: 'Review not found' }, 404);
        }

      // Delete the review
      const { error } = await supabase
        .from('song_review')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', user.id);
  
      if (error) throw error;
  
      await updateSongStatistics(songId);
      return c.json({ message: 'Review deleted successfully' }, 200);
    } catch (error) {
      console.error('Delete review error:', error);
      return c.json({ error: 'Failed to delete review' }, 500);
    }
  };