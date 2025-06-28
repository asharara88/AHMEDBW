// Simple in-memory cache with TTL support
interface CacheItem<T> {
  value: T;
  expires: number;
}

class MemoryCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private readonly defaultTTL: number;

  constructor(defaultTTLMs: number = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTLMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    const expires = Date.now() + ttl;
    
    this.cache.set(key, { value, expires });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  size(): number {
    // Clean up expired items first
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instances
export const responseCache = new MemoryCache<string>(600000); // 10 minutes for API responses
export const userDataCache = new MemoryCache<unknown>(300000); // 5 minutes for user data
export const supplementCache = new MemoryCache<unknown>(1800000); // 30 minutes for supplement data

export default MemoryCache;
