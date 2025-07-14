import express from 'express';
import { ProductController } from '../controllers/ProductController';
import { UserController } from '../controllers/UserController';
import { OrderController } from '../controllers/OrderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validator';

const router = express.Router();
const productController = new ProductController();
const userController = new UserController();
const orderController = new OrderController();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Product routes
router.get('/products', rateLimiter(), productController.getProducts.bind(productController));
router.get('/products/:id', rateLimiter(), productController.getProductById.bind(productController));
router.post('/products', authenticate, authorizeAdmin, rateLimiter(), validateRequest, productController.createProduct.bind(productController));
router.put('/products/:id', authenticate, authorizeAdmin, rateLimiter(), validateRequest, productController.updateProduct.bind(productController));
router.delete('/products/:id', authenticate, authorizeAdmin, rateLimiter(), productController.deleteProduct.bind(productController));
router.get('/products/:id/nutrition', rateLimiter(), productController.getProductNutrition.bind(productController));
router.get('/products/:id/reviews', rateLimiter(), productController.getProductReviews.bind(productController));

// User routes
router.post('/users/register', rateLimiter(), validateRequest, userController.register.bind(userController));
router.post('/users/login', rateLimiter(), validateRequest, userController.login.bind(userController));
router.get('/users/profile', authenticate, rateLimiter(), userController.getProfile.bind(userController));
router.put('/users/profile', authenticate, rateLimiter(), validateRequest, userController.updateProfile.bind(userController));
router.get('/users/orders', authenticate, rateLimiter(), userController.getUserOrders.bind(userController));
router.get('/users/supplement-stack', authenticate, rateLimiter(), userController.getSupplementStack.bind(userController));

// Order routes
router.post('/orders', authenticate, rateLimiter(), validateRequest, orderController.createOrder.bind(orderController));
router.get('/orders/:id', authenticate, rateLimiter(), orderController.getOrderById.bind(orderController));
router.put('/orders/:id/status', authenticate, authorizeAdmin, rateLimiter(), validateRequest, orderController.updateOrderStatus.bind(orderController));
router.get('/orders/:id/tracking', authenticate, rateLimiter(), orderController.getOrderTracking.bind(orderController));

export default router;