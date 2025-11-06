import { HttpClient } from '../client';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ApiResponse,
  BaseFilterParams,
  InternalProduct,
  ProductStatus,
} from '../types';
import {
  StatusTranslator,
  StatusKey,
} from '../utils/translators';

export interface ProductFilterParams extends BaseFilterParams {
  // Common filters
  search?: string; // Legacy search field - consider using 'q' instead
  status?: ProductStatus | StatusKey | number; // Accept contextual, full, and integer values
  category?: string;
  limit?: number;
  
  // Database field filters - any field from the products table can be filtered
  id?: number;
  title?: string;
  teaser?: string;
  price?: number;
  permalink?: string;
  image?: string;
  public?: boolean;
  unlimited?: boolean;
  units_remaining?: number;
  units_sold?: number;
  rating_sum?: number;
  rating_count?: number;
  tag_ids?: number[];
  uid?: string;
  category_id?: number;
  currency_id?: number;
  user_id?: number;
  inserted_at?: string;
  updated_at?: string;
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
}
