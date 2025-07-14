import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { validateUserData, validateLoginData } from '../validators/userValidator';
import { generateToken } from '../utils/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user
   * @route POST /api/v1/users/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate user data
      const { valid, errors } = validateUserData(req.body);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid user data',
          details: errors
        });
        return;
      }

      // Check if email already exists
      const existingUser = await this.userService.getUserByEmail(req.body.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
        return;
      }

      // Create user
      const user = await this.userService.createUser(req.body);
      
      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive data
      const { password_hash, reset_token, reset_token_expires, ...safeUser } = user;

      res.status(201).json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Login user
   * @route POST /api/v1/users/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate login data
      const { valid, errors } = validateLoginData(req.body);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid login data',
          details: errors
        });
        return;
      }

      // Authenticate user
      const { email, password } = req.body;
      const user = await this.userService.authenticateUser(email, password);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive data
      const { password_hash, reset_token, reset_token_expires, ...safeUser } = user;

      // Update last login
      await this.userService.updateLastLogin(user.id);

      res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to login',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user profile
   * @route GET /api/v1/users/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Remove sensitive data
      const { password_hash, reset_token, reset_token_expires, ...safeUser } = user;

      res.status(200).json({
        success: true,
        data: safeUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/users/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Validate user data
      const { valid, errors } = validateUserData(req.body, true);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid user data',
          details: errors
        });
        return;
      }

      // Update user
      const updatedUser = await this.userService.updateUser(userId, req.body);
      
      // Remove sensitive data
      const { password_hash, reset_token, reset_token_expires, ...safeUser } = updatedUser;

      res.status(200).json({
        success: true,
        data: safeUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user orders
   * @route GET /api/v1/users/orders
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const orders = await this.userService.getUserOrders(userId, page, limit);
      const total = await this.userService.countUserOrders(userId);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user supplement stack
   * @route GET /api/v1/users/supplement-stack
   */
  async getSupplementStack(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const stack = await this.userService.getUserSupplementStack(userId);

      res.status(200).json({
        success: true,
        data: stack
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supplement stack',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}