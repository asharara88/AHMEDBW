import { User, Address, HealthData, UserPreferences } from '../models/User';
import { Order } from '../models/Order';
import { db } from '../config/database';
import { hashPassword, comparePasswords } from '../utils/auth';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const now = new Date();
      
      // Hash password
      const password_hash = await hashPassword(userData.password_hash!);
      
      const newUser = {
        email: userData.email,
        password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        address: userData.address,
        health_data: userData.health_data || {},
        preferences: userData.preferences || {
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: true
        },
        created_at: now,
        updated_at: now,
        role: 'customer', // Default role
        is_verified: false // Requires email verification
      };
      
      const docRef = await db.collection('users').add(newUser);
      return { id: docRef.id, ...newUser } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const doc = await db.collection('users').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await comparePasswords(password, user.password_hash);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const now = new Date();
      const updateData: any = {
        ...userData,
        updated_at: now
      };
      
      // Don't update password_hash directly
      delete updateData.password_hash;
      
      // If new password is provided, hash it
      if (userData.password) {
        updateData.password_hash = await hashPassword(userData.password);
        delete updateData.password;
      }
      
      await db.collection('users').doc(id).update(updateData);
      
      const updatedUser = await this.getUserById(id);
      return updatedUser as User;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await db.collection('users').doc(id).update({
        last_login: new Date()
      });
    } catch (error) {
      console.error(`Error updating last login for user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<Order[]> {
    try {
      const snapshot = await db.collection('orders')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset((page - 1) * limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      console.error(`Error fetching orders for user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Count user orders
   */
  async countUserOrders(userId: string): Promise<number> {
    try {
      const snapshot = await db.collection('orders')
        .where('user_id', '==', userId)
        .count()
        .get();
      
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error counting orders for user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user supplement stack
   */
  async getUserSupplementStack(userId: string): Promise<any> {
    try {
      // Get user health data
      const user = await this.getUserById(userId);
      
      if (!user || !user.health_data) {
        return {
          recommendations: [],
          current_supplements: []
        };
      }
      
      // Get current supplements
      const currentSupplements = user.health_data.current_supplements || [];
      
      // Get recommended supplements based on health goals
      const healthGoals = user.health_data.health_goals || [];
      
      let recommendedSupplements: any[] = [];
      
      if (healthGoals.length > 0) {
        // Query supplements that match health goals
        const snapshot = await db.collection('products')
          .where('is_available', '==', true)
          .limit(10)
          .get();
        
        const allSupplements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter supplements based on health goals
        recommendedSupplements = allSupplements.filter(supplement => {
          // Check if supplement tags or category matches any health goal
          return healthGoals.some(goal => {
            const goalLower = goal.toLowerCase();
            return (
              (supplement.tags && supplement.tags.some((tag: string) => tag.toLowerCase().includes(goalLower))) ||
              (supplement.category && supplement.category.toLowerCase().includes(goalLower)) ||
              (supplement.key_benefits && supplement.key_benefits.some((benefit: string) => benefit.toLowerCase().includes(goalLower)))
            );
          });
        });
      }
      
      return {
        recommendations: recommendedSupplements,
        current_supplements: currentSupplements
      };
    } catch (error) {
      console.error(`Error fetching supplement stack for user with ID ${userId}:`, error);
      throw error;
    }
  }
}