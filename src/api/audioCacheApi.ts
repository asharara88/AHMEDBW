import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

/**
 * API for managing audio cache in the database
 */
export const audioCacheApi = {
  /**
   * Store audio data in the cache
   * @param userId User ID
   * @param cacheKey Unique key for the cached item
   * @param audioData Audio data as Blob
   * @param expiryMinutes Minutes until the cache entry expires (default: 60)
   */
  async storeAudio(
    userId: string,
    cacheKey: string,
    audioData: Blob,
    expiryMinutes: number = 60
  ): Promise<void> {
    try {
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await audioData.arrayBuffer();
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
      
      // Store in database
      const { error } = await supabase
        .from('audio_cache')
        .upsert({
          user_id: userId,
          cache_key: cacheKey,
          audio_data: arrayBuffer,
          content_type: audioData.type,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'user_id,cache_key'
        });
      
      if (error) throw error;
    } catch (error) {
      logError('Error storing audio in cache', error);
      throw error;
    }
  },
  
  /**
   * Retrieve audio data from the cache
   * @param userId User ID
   * @param cacheKey Unique key for the cached item
   * @returns Audio data as Blob or null if not found
   */
  async getAudio(userId: string, cacheKey: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase
        .from('audio_cache')
        .select('audio_data, content_type, expires_at')
        .eq('user_id', userId)
        .eq('cache_key', cacheKey)
        .single();
      
      if (error || !data) return null;
      
      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        // Delete expired entry
        await this.deleteAudio(userId, cacheKey);
        return null;
      }
      
      // Convert to Blob
      return new Blob([data.audio_data], { type: data.content_type });
    } catch (error) {
      logError('Error retrieving audio from cache', error);
      return null;
    }
  },
  
  /**
   * Delete audio data from the cache
   * @param userId User ID
   * @param cacheKey Unique key for the cached item
   */
  async deleteAudio(userId: string, cacheKey: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('audio_cache')
        .delete()
        .eq('user_id', userId)
        .eq('cache_key', cacheKey);
      
      if (error) throw error;
    } catch (error) {
      logError('Error deleting audio from cache', error);
      throw error;
    }
  },
  
  /**
   * Clear all audio cache for a user
   * @param userId User ID
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('audio_cache')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      logError('Error clearing user audio cache', error);
      throw error;
    }
  },
  
  /**
   * Get cache statistics for a user
   * @param userId User ID
   * @returns Cache statistics
   */
  async getCacheStats(userId: string): Promise<{
    count: number;
    totalSize: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  }> {
    try {
      // Get count and total size
      const { data: countData, error: countError } = await supabase
        .from('audio_cache')
        .select('audio_data')
        .eq('user_id', userId);
      
      if (countError) throw countError;
      
      const count = countData?.length || 0;
      const totalSize = countData?.reduce((sum, item) => {
        // For bytea columns, we need to calculate the size differently
        // This is an approximation
        return sum + (item.audio_data ? item.audio_data.length : 0);
      }, 0) || 0;
      
      // Get oldest and newest entries
      const { data: timeData, error: timeError } = await supabase
        .from('audio_cache')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (timeError) throw timeError;
      
      const oldestEntry = timeData && timeData.length > 0 ? timeData[0].created_at : null;
      const newestEntry = timeData && timeData.length > 0 ? timeData[timeData.length - 1].created_at : null;
      
      return {
        count,
        totalSize,
        oldestEntry,
        newestEntry
      };
    } catch (error) {
      logError('Error getting cache statistics', error);
      return {
        count: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }
  }
};