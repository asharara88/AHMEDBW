import { Order, OrderStatus } from '../models/Order';
import { db } from '../config/database';
import { ProductService } from './ProductService';

export class OrderService {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const now = new Date();
      
      // Validate items and calculate totals
      const items = orderData.items || [];
      let subtotal = 0;
      
      // Validate each item and update inventory
      for (const item of items) {
        const product = await this.productService.getProductById(item.product_id);
        
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        
        if (!product.is_available) {
          throw new Error(`Product ${product.name} is not available`);
        }
        
        // Check inventory
        const inventorySnapshot = await db.collection('inventory')
          .where('product_id', '==', item.product_id)
          .limit(1)
          .get();
        
        if (inventorySnapshot.empty) {
          throw new Error(`Inventory not found for product ${product.name}`);
        }
        
        const inventory = inventorySnapshot.docs[0].data();
        
        if (inventory.quantity < item.quantity) {
          throw new Error(`Insufficient inventory for product ${product.name}. Available: ${inventory.quantity}, Requested: ${item.quantity}`);
        }
        
        // Update item with product details
        item.product_name = product.name;
        item.price = product.price;
        item.subtotal = product.price * item.quantity;
        
        // Add to subtotal
        subtotal += item.subtotal;
        
        // Update inventory
        await inventorySnapshot.docs[0].ref.update({
          quantity: inventory.quantity - item.quantity,
          updated_at: now
        });
      }
      
      // Calculate tax and total
      const tax = subtotal * 0.05; // 5% tax rate
      const shipping_cost = orderData.shipping_cost || 10; // Default shipping cost
      const total = subtotal + tax + shipping_cost;
      
      // Create order
      const newOrder = {
        user_id: orderData.user_id,
        status: 'pending' as OrderStatus,
        items,
        subtotal,
        tax,
        shipping_cost,
        total,
        payment_details: orderData.payment_details,
        shipping_info: orderData.shipping_info,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await db.collection('orders').add(newOrder);
      return { id: docRef.id, ...newOrder } as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const doc = await db.collection('orders').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() } as Order;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const now = new Date();
      
      // Update order status
      await db.collection('orders').doc(id).update({
        status,
        updated_at: now,
        ...(status === 'delivered' ? { completed_at: now } : {})
      });
      
      // Get updated order
      const updatedOrder = await this.getOrderById(id);
      return updatedOrder as Order;
    } catch (error) {
      console.error(`Error updating status for order with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(id: string): Promise<any | null> {
    try {
      const order = await this.getOrderById(id);
      
      if (!order) {
        return null;
      }
      
      // If order is not shipped yet, return basic info
      if (order.status === 'pending' || order.status === 'processing') {
        return {
          order_id: id,
          status: order.status,
          estimated_shipping: new Date(order.created_at.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after order
          tracking_available: false
        };
      }
      
      // If order is shipped or delivered, return tracking info
      if (order.status === 'shipped' || order.status === 'delivered') {
        // In a real system, this would query a shipping API
        return {
          order_id: id,
          status: order.status,
          tracking_number: order.shipping_info.tracking_number,
          carrier: order.shipping_info.carrier,
          estimated_delivery: order.shipping_info.estimated_delivery,
          tracking_url: `https://example.com/track/${order.shipping_info.carrier}/${order.shipping_info.tracking_number}`,
          tracking_available: true,
          tracking_events: [
            {
              status: 'Order Placed',
              location: 'Online',
              timestamp: order.created_at
            },
            {
              status: 'Processing',
              location: 'Warehouse',
              timestamp: new Date(order.created_at.getTime() + 1 * 24 * 60 * 60 * 1000)
            },
            ...(order.status === 'shipped' || order.status === 'delivered' ? [
              {
                status: 'Shipped',
                location: 'Distribution Center',
                timestamp: new Date(order.created_at.getTime() + 2 * 24 * 60 * 60 * 1000)
              }
            ] : []),
            ...(order.status === 'delivered' ? [
              {
                status: 'Delivered',
                location: order.shipping_info.address.city,
                timestamp: order.completed_at
              }
            ] : [])
          ]
        };
      }
      
      // For cancelled or refunded orders
      return {
        order_id: id,
        status: order.status,
        tracking_available: false
      };
    } catch (error) {
      console.error(`Error fetching tracking for order with ID ${id}:`, error);
      throw error;
    }
  }
}