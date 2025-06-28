import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

interface CacheEntry {
  blob: Blob;
  timestamp: number;
}

interface UseSpeechCacheReturn {
  getFromCache: (key: string) => Promise<Blob | null>;
  saveToCache: (key: string, blob: Blob) => Promise<void>;
  clearCache: () => Promise<void>;
  isCaching: boolean;
}

/**
 * Hook for caching speech audio data
 */
export function useSpeechCache(expiryTime: number = 60 * 60 * 1000): UseSpeechCacheReturn {
  const [isCaching, setIsCaching] = useState(false);
  
  // In-memory cache
  const memoryCache = new Map<string, CacheEntry>();
  
  /**
   * Get audio from cache (memory or storage)
   */
  const getFromCache = useCallback(async (key: string): Promise<Blob | null> => {
    // Check memory cache first
    const now = Date.now();
    const cached = memoryCache.get(key);
    
    if (cached && now - cached.timestamp < expiryTime) {
      return cached.blob;
    }
    
    // Try to get from Supabase storage
    try {
      const { data, error } = await supabase
        .storage
        .from('audio-cache')
        .download(`${key}.mp3`);
        
      if (error || !data) {
        return null;
      }
      
      // Save to memory cache
      memoryCache.set(key, { blob: data, timestamp: now });
      
      return data;
    } catch (err) {
      logError('Error getting from speech cache', err);
      return null;
    }
  }, [expiryTime]);
  
  /**
   * Save audio to cache (memory and storage)
   */
  const saveToCache = useCallback(async (key: string, blob: Blob): Promise<void> => {
    setIsCaching(true);
    
    try {
      // Save to memory cache
      const now = Date.now();
      memoryCache.set(key, { blob, timestamp: now });
      
      // Save to Supabase storage
      await supabase
        .storage
        .from('audio-cache')
        .upload(`${key}.mp3`, blob, {
          contentType: 'audio/mpeg',
          upsert: true
        });
    } catch (err) {
      logError('Error saving to speech cache', err);
    } finally {
      setIsCaching(false);
    }
  }, []);
  
  /**
   * Clear the cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    // Clear memory cache
    memoryCache.clear();
    
    // Clear storage cache (list and delete all files)
    try {
      const { data, error } = await supabase
        .storage
        .from('audio-cache')
        .list();
        
      if (error || !data) {
        return;
      }
      
      const filesToDelete = data.map(file => file.name);
      
      if (filesToDelete.length > 0) {
        await supabase
          .storage
          .from('audio-cache')
          .remove(filesToDelete);
      }
    } catch (err) {
      logError('Error clearing speech cache', err);
    }
  }, []);
  
  return {
    getFromCache,
    saveToCache,
    clearCache,
    isCaching
  };
}