import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { validateOrderData } from '../validators/orderValidator';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Create a new order
   * @route POST /api/v1/orders
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Validate order data
      const { valid, errors } = validateOrderData(req.body);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid order data',
          details: errors
        });
        return;
      }

      // Create order with user ID
      const orderData = {
        ...req.body,
        user_id: userId
      };

      const order = await this.orderService.createOrder(orderData);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get order by ID
   * @route GET /api/v1/orders/:id
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if the order belongs to the user or if the user is an admin
      if (order.user_id !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have access to this order'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update order status
   * @route PUT /api/v1/orders/:id/status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      // Only admins can update order status
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
        return;
      }

      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        });
        return;
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
          details: `Status must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      const updatedOrder = await this.orderService.updateOrderStatus(orderId, status);
      res.status(200).json({
        success: true,
        data: updatedOrder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get order tracking information
   * @route GET /api/v1/orders/:id/tracking
   */
  async getOrderTracking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if the order belongs to the user or if the user is an admin
      if (order.user_id !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have access to this order'
        });
        return;
      }

      // Get tracking information
      const tracking = await this.orderService.getOrderTracking(orderId);
      
      if (!tracking) {
        res.status(404).json({
          success: false,
          error: 'Tracking information not available for this order'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tracking
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tracking information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}