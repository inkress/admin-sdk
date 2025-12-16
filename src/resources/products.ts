import { HttpClient } from '../client';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ApiResponse,
  InternalProduct,
  ProductStatus,
} from '../types';
import {
  StatusTranslator,
  StatusKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { ProductQueryBuilder } from '../utils/query-builders';
import {
  ProductFilterParams,
  ProductQueryParams,
  ProductListResponse,
  PRODUCT_FIELD_TYPES,
} from '../types/resources';

/**
 * @deprecated Use ProductFilterParams from types/resources instead
 */
export interface LegacyProductFilterParams {
  // Legacy interface - kept for backward compatibility
}

export class ProductsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal product data (integers) to user-facing data (strings)
   */
  private translateProductToUserFacing(internal: InternalProduct): Product {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'product') as ProductStatus,
    };
  }

  /**
   * Convert user-facing product data (strings) to internal data (integers)
   */
  private translateProductToInternal(userFacing: CreateProductData | UpdateProductData): any {
    const internal: any = { ...userFacing };
    
    if ('status' in userFacing && userFacing.status) {
      internal.status = typeof userFacing.status === 'string' 
        ? StatusTranslator.toIntegerWithContext(userFacing.status, 'product')
        : userFacing.status;
    }
    
    return internal;
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: ProductFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'product');
    }
    
    return translated;
  }

  /**
   * List products with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: ProductFilterParams): Promise<ApiResponse<ProductListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalProduct[]; page_info: any }>('/products', translatedParams);
    
    if (response.data?.entries) {
      const translatedEntries = response.data.entries.map(product => this.translateProductToUserFacing(product));
      return {
        state: response.state,
        data: {
          entries: translatedEntries,
          page_info: response.data.page_info
        }
      };
    }
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(product => this.translateProductToUserFacing(product));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.page_info
        }
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Get a specific product by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Product>> {
    const response = await this.client.get<InternalProduct>(`/products/${id}`);
    
    if (response.data) {
      const translatedProduct = this.translateProductToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedProduct
      };
    }
    
    if (response.result) {
      const translatedProduct = this.translateProductToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedProduct
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Create a new product
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateProductData): Promise<ApiResponse<Product>> {
    const internalData = this.translateProductToInternal(data);
    const response = await this.client.post<InternalProduct>('/products', internalData);
    
    if (response.data) {
      const translatedProduct = this.translateProductToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedProduct
      };
    }
    
    if (response.result) {
      const translatedProduct = this.translateProductToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedProduct
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Update an existing product
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateProductData): Promise<ApiResponse<Product>> {
    const internalData = this.translateProductToInternal(data);
    const response = await this.client.put<InternalProduct>(`/products/${id}`, internalData);
    
    if (response.data) {
      const translatedProduct = this.translateProductToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedProduct
      };
    }
    
    if (response.result) {
      const translatedProduct = this.translateProductToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedProduct
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Delete a product
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/products/${id}`);
  }

  /**
   * List products with enhanced query support
   * Supports filtering by any database field using the new query system
   * Requires Client-Id header to be set in the configuration
   * 
   * @example
   * // Simple queries
   * await products.query({ status: 'published', public: true })
   * 
   * // Array queries (IN operations)
   * await products.query({ category_id: [1, 2, 3], status: ['published', 'draft'] })
   * 
   * // Range queries
   * await products.query({ price: { min: 10, max: 100 } })
   * 
   * // String searches
   * await products.query({ title: { contains: 'shirt' } })
   * 
   * // Combined queries
   * await products.query({
   *   status: 'published',
   *   price: { min: 20 },
   *   public: true,
   *   page: 1,
   *   page_size: 20
   * })
   */
  async query(params?: ProductQueryParams): Promise<ApiResponse<ProductListResponse>> {
    // Process the query through the transformation system with validation
    const processedQuery = processQuery(params || {}, PRODUCT_FIELD_TYPES, { validate: true });
    
    // Apply contextual translations for status
    const translatedQuery = this.translateFilters(processedQuery);
    
    const response = await this.client.get<{ entries: InternalProduct[]; page_info: any }>('/products', translatedQuery);
    
    if (response.data?.entries) {
      const translatedEntries = response.data.entries.map(product => this.translateProductToUserFacing(product));
      return {
        state: response.state,
        data: {
          entries: translatedEntries,
          page_info: response.data.page_info
        }
      };
    }
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(product => this.translateProductToUserFacing(product));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.page_info
        }
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Create a query builder for products
   * Provides a fluent interface for building complex queries
   * 
   * @example
   * const products = await sdk.products.createQueryBuilder()
   *   .whereStatus('published')
   *   .wherePriceRange(10, 100)
   *   .whereTitleContains('shirt')
   *   .wherePublic(true)
   *   .paginate(1, 20)
   *   .execute();
   */
  createQueryBuilder(initialQuery?: ProductQueryParams): ProductQueryBuilder {
    return new ProductQueryBuilder(this, initialQuery);
  }
}
