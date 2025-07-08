import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Generate JWT token for user
 */
export const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Authenticate middleware - Verify JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided'
      });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      // Verify user exists in database
      const userService = new UserService();
      const user = await userService.getUserById(decoded.id);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid user'
        });
        return;
      }
      
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Authorize admin middleware
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required'
    });
    return;
  }
  
  next();
};

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // In a real implementation, use bcrypt or argon2
  // For this example, we'll use a simple hash function
  return `hashed_${password}`;
};

/**
 * Compare passwords
 */
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  // In a real implementation, use bcrypt or argon2
  // For this example, we'll use a simple comparison
  return hashedPassword === `hashed_${password}`;
};