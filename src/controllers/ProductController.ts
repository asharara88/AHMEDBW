import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ProductFilter } from '../models/Product';
import { validateProductData } from '../validators/productValidator';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products with pagination and filtering
   * @route GET /api/v1/products
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters: ProductFilter = {
        category: req.query.category as string,
        subcategory: req.query.subcategory as string,
        brand: req.query.brand as string,
        price_min: req.query.price_min ? Number(req.query.price_min) : undefined,
        price_max: req.query.price_max ? Number(req.query.price_max) : undefined,
        is_available: req.query.is_available === 'true',
        is_featured: req.query.is_featured === 'true',
        is_bestseller: req.query.is_bestseller === 'true',
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        search: req.query.search as string,
        sort_by: req.query.sort_by as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const products = await this.productService.getProducts(filters);
      const total = await this.productService.countProducts(filters);

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: filters.page || 1,
          limit: filters.limit || 20,
          pages: Math.ceil(total / (filters.limit || 20))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a single product by ID
   * @route GET /api/v1/products/:id
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const product = await this.productService.getProductById(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new product
   * @route POST /api/v1/products
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
        return;
      }

      // Validate product data
      const { valid, errors } = validateProductData(req.body);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid product data',
          details: errors
        });
        return;
      }

      const product = await this.productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a product
   * @route PUT /api/v1/products/:id
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
        return;
      }

      const productId = req.params.id;
      const product = await this.productService.getProductById(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }

      // Validate product data
      const { valid, errors } = validateProductData(req.body, true);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid product data',
          details: errors
        });
        return;
      }

      const updatedProduct = await this.productService.updateProduct(productId, req.body);
      res.status(200).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a product
   * @route DELETE /api/v1/products/:id
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
        return;
      }

      const productId = req.params.id;
      const product = await this.productService.getProductById(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }

      await this.productService.deleteProduct(productId);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get product nutrition details
   * @route GET /api/v1/products/:id/nutrition
   */
  async getProductNutrition(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const nutrition = await this.productService.getProductNutrition(productId);

      if (!nutrition) {
        res.status(404).json({
          success: false,
          error: 'Nutrition information not found for this product'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: nutrition
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch nutrition information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get product reviews
   * @route GET /api/v1/products/:id/reviews
   */
  async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const reviews = await this.productService.getProductReviews(productId, page, limit);
      const total = await this.productService.countProductReviews(productId);

      res.status(200).json({
        success: true,
        data: reviews,
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
        error: 'Failed to fetch product reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}