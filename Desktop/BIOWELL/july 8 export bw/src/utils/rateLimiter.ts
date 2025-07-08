// Rate limiting utility for API calls
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    // Check if we're under the limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}

// Global rate limiters for different API types
export const openaiRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const elevenlabsRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
export const generalApiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

export const createUserRateLimiter = (userId: string, endpoint: string): string => {
  return `${userId}:${endpoint}`;
};

export default RateLimiter;
