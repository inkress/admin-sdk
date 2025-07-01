import { HttpClient } from '../client';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ApiResponse,
  PaginationParams,
} from '../types';

export interface ProductListParams extends PaginationParams {
  search?: string;
  status?: number;
  category?: string;
  limit?: number;
}

export interface ProductListResponse {
  entries: Product[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class ProductsResource {
  constructor(private client: HttpClient) {}

  /**
   * List products with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: ProductListParams): Promise<ApiResponse<ProductListResponse>> {
    return this.client.get<ProductListResponse>('/products', params);
  }

  /**
   * Get a specific product by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Product>> {
    return this.client.get<Product>(`/products/${id}`);
  }

  /**
   * Create a new product
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.client.post<Product>('/products', data);
  }

  /**
   * Update an existing product
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateProductData): Promise<ApiResponse<Product>> {
    return this.client.put<Product>(`/products/${id}`, data);
  }

  /**
   * Delete a product
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/products/${id}`);
  }
}
