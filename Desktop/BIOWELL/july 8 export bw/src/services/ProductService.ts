import { Product, ProductFilter } from '../models/Product';
import { Nutrition } from '../models/Nutrition';
import { Review } from '../models/Review';
import { Inventory } from '../models/Inventory';
import { db } from '../config/database';

export class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  async getProducts(filters: ProductFilter): Promise<Product[]> {
    try {
      // Build query based on filters
      let query = db.collection('products').where('is_available', '==', true);
      
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      if (filters.subcategory) {
        query = query.where('subcategory', '==', filters.subcategory);
      }
      
      if (filters.brand) {
        query = query.where('brand', '==', filters.brand);
      }
      
      if (filters.is_featured) {
        query = query.where('is_featured', '==', true);
      }
      
      if (filters.is_bestseller) {
        query = query.where('is_bestseller', '==', true);
      }
      
      // Handle price range filtering in memory since Firestore doesn't support range queries on multiple fields
      let snapshot = await query.get();
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Apply price filters
      if (filters.price_min !== undefined) {
        products = products.filter(product => product.price >= filters.price_min!);
      }
      
      if (filters.price_max !== undefined) {
        products = products.filter(product => product.price <= filters.price_max!);
      }
      
      // Apply tag filtering
      if (filters.tags && filters.tags.length > 0) {
        products = products.filter(product => 
          product.tags && filters.tags!.some(tag => product.tags!.includes(tag))
        );
      }
      
      // Apply search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchLower) || 
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      if (filters.sort_by) {
        switch (filters.sort_by) {
          case 'price_asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'name_asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name_desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'newest':
            products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
          case 'popularity':
            // This would require additional data like view counts or sales
            break;
        }
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      return products.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Count total products matching filters (for pagination)
   */
  async countProducts(filters: ProductFilter): Promise<number> {
    try {
      // Similar to getProducts but just returns count
      let query = db.collection('products').where('is_available', '==', true);
      
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      if (filters.subcategory) {
        query = query.where('subcategory', '==', filters.subcategory);
      }
      
      if (filters.brand) {
        query = query.where('brand', '==', filters.brand);
      }
      
      let snapshot = await query.get();
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Apply additional filters
      if (filters.price_min !== undefined) {
        products = products.filter(product => product.price >= filters.price_min!);
      }
      
      if (filters.price_max !== undefined) {
        products = products.filter(product => product.price <= filters.price_max!);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        products = products.filter(product => 
          product.tags && filters.tags!.some(tag => product.tags!.includes(tag))
        );
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchLower) || 
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower))
        );
      }
      
      return products.length;
    } catch (error) {
      console.error('Error counting products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const doc = await db.collection('products').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const product = { id: doc.id, ...doc.data() } as Product;
      
      // Get nutrition information
      const nutritionDoc = await db.collection('nutrition').where('product_id', '==', id).limit(1).get();
      if (!nutritionDoc.empty) {
        product.nutrition = { id: nutritionDoc.docs[0].id, ...nutritionDoc.docs[0].data() } as Nutrition;
      }
      
      return product;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const now = new Date();
      const newProduct = {
        ...productData,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await db.collection('products').add(newProduct);
      
      // Create inventory record
      await db.collection('inventory').add({
        product_id: docRef.id,
        quantity: productData.stock_quantity || 0,
        location: 'main-warehouse',
        reorder_point: 10, // Default reorder point
        last_restock_date: now,
        created_at: now,
        updated_at: now
      });
      
      // If nutrition data is provided, create nutrition record
      if (productData.nutrition) {
        await db.collection('nutrition').add({
          product_id: docRef.id,
          ...productData.nutrition,
          created_at: now,
          updated_at: now
        });
      }
      
      return { id: docRef.id, ...newProduct } as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const now = new Date();
      const updateData = {
        ...productData,
        updated_at: now
      };
      
      await db.collection('products').doc(id).update(updateData);
      
      // Update inventory if stock quantity is provided
      if (productData.stock_quantity !== undefined) {
        const inventorySnapshot = await db.collection('inventory')
          .where('product_id', '==', id)
          .limit(1)
          .get();
        
        if (!inventorySnapshot.empty) {
          await inventorySnapshot.docs[0].ref.update({
            quantity: productData.stock_quantity,
            updated_at: now
          });
        }
      }
      
      // Update nutrition if provided
      if (productData.nutrition) {
        const nutritionSnapshot = await db.collection('nutrition')
          .where('product_id', '==', id)
          .limit(1)
          .get();
        
        if (!nutritionSnapshot.empty) {
          await nutritionSnapshot.docs[0].ref.update({
            ...productData.nutrition,
            updated_at: now
          });
        } else {
          // Create nutrition record if it doesn't exist
          await db.collection('nutrition').add({
            product_id: id,
            ...productData.nutrition,
            created_at: now,
            updated_at: now
          });
        }
      }
      
      // Get updated product
      const updatedProduct = await this.getProductById(id);
      return updatedProduct as Product;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      // Delete product document
      await db.collection('products').doc(id).delete();
      
      // Delete related nutrition
      const nutritionSnapshot = await db.collection('nutrition')
        .where('product_id', '==', id)
        .get();
      
      const nutritionDeletePromises = nutritionSnapshot.docs.map(doc => doc.ref.delete());
      
      // Delete related inventory
      const inventorySnapshot = await db.collection('inventory')
        .where('product_id', '==', id)
        .get();
      
      const inventoryDeletePromises = inventorySnapshot.docs.map(doc => doc.ref.delete());
      
      // Delete related reviews
      const reviewsSnapshot = await db.collection('reviews')
        .where('product_id', '==', id)
        .get();
      
      const reviewsDeletePromises = reviewsSnapshot.docs.map(doc => doc.ref.delete());
      
      // Wait for all deletions to complete
      await Promise.all([
        ...nutritionDeletePromises,
        ...inventoryDeletePromises,
        ...reviewsDeletePromises
      ]);
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get product nutrition details
   */
  async getProductNutrition(productId: string): Promise<Nutrition | null> {
    try {
      const snapshot = await db.collection('nutrition')
        .where('product_id', '==', productId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Nutrition;
    } catch (error) {
      console.error(`Error fetching nutrition for product ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    try {
      const snapshot = await db.collection('reviews')
        .where('product_id', '==', productId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset((page - 1) * limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      console.error(`Error fetching reviews for product ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Count product reviews
   */
  async countProductReviews(productId: string): Promise<number> {
    try {
      const snapshot = await db.collection('reviews')
        .where('product_id', '==', productId)
        .count()
        .get();
      
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error counting reviews for product ID ${productId}:`, error);
      throw error;
    }
  }
}