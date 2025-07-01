import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create rate limiter instances
const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
});

const authLimiter = new RateLimiterMemory({
  points: 5, // Number of points
  duration: 60, // Per 60 seconds
});

/**
 * Rate limiter middleware factory
 * @param options Custom options for specific routes
 */
export const rateLimiter = (options?: { 
  points?: number; 
  duration?: number;
  isAuth?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Determine which limiter to use
      const limiter = options?.isAuth ? authLimiter : apiLimiter;
      
      // Get client identifier (IP or user ID if authenticated)
      const clientId = req.user?.id || req.ip || 'unknown';
      
      // Consume points
      await limiter.consume(clientId);
      next();
    } catch (error) {
      if (error.remainingPoints === 0) {
        // Rate limit exceeded
        res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later',
          retryAfter: error.msBeforeNext / 1000
        });
      } else {
        // Other error
        res.status(500).json({
          success: false,
          error: 'Rate limiter error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };
};