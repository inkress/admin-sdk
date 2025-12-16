import { HttpClient } from '../client';
import {
  Order,
  CreateOrderData,
  UpdateOrderData,
  ApiResponse,
  InternalOrder,
  InternalMerchant,
  Merchant,
  OrderStatus,
  OrderKind,
  AccountStatus,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  FeeStructureTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { OrderQueryBuilder } from '../utils/query-builders';
import {
  OrderFilterParams,
  OrderQueryParams,
  OrderListResponse,
  ORDER_FIELD_TYPES,
} from '../types/resources';

export interface CreateOrderRequestData {
  currency_code: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  total: number;
  reference_id?: string;
  kind?: 'online' | 'offline' | 'subscription';
}

export interface CreateOrderResponseData {
  id: number;
  payment_urls?: {
    short_link: string;
  };
  transaction?: {
    id: number;
  };
}

export interface UpdateOrderStatusData {
  status: number;
}

export class OrdersResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal order data (integers) to user-facing data (strings)
   */
  private translateOrderToUserFacing(internal: InternalOrder): Order {
    const result: any = {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'order') as OrderStatus,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'order') as OrderKind,
    };
    
    // Translate nested merchant if present
    if (internal.merchant) {
      result.merchant = this.translateMerchantToUserFacing(internal.merchant);
    }
    
    return result;
  }

  /**
   * Convert internal merchant data to user-facing merchant
   */
  private translateMerchantToUserFacing(internal: InternalMerchant): Merchant {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'account') as AccountStatus,
      platform_fee_structure: FeeStructureTranslator.toString(internal.platform_fee_structure),
      provider_fee_structure: FeeStructureTranslator.toString(internal.provider_fee_structure),
    };
  }

  /**
   * Convert user-facing order data (strings) to internal data (integers)
   */
  private translateOrderToInternal(userFacing: CreateOrderData | UpdateOrderData): any {
    const internal: any = { ...userFacing };
    
    if ('status' in userFacing && userFacing.status) {
      internal.status = typeof userFacing.status === 'string' 
        ? StatusTranslator.toIntegerWithContext(userFacing.status, 'order')
        : userFacing.status;
    }
    
    if ('kind' in userFacing && userFacing.kind) {
      internal.kind = typeof userFacing.kind === 'string' 
        ? KindTranslator.toIntegerWithContext(userFacing.kind, 'order')
        : userFacing.kind;
    }
    
    return internal;
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: OrderFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'order');
    }
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'order');
    }
    
    return translated;
  }

  /**
   * Convert status update data (strings to integers where needed)
   */
  private translateStatusUpdate(data: UpdateOrderStatusData): any {
    const internal: any = { ...data };
    
    if (data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status, 'order');
    }
    
    return internal;
  }

  /**
   * Create a new order
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateOrderRequestData): Promise<ApiResponse<CreateOrderResponseData>> {
    return this.client.post<CreateOrderResponseData>('/orders', data);
  }

  /**
   * Get order details by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Order>> {
    const response = await this.client.get<InternalOrder>(`/orders/${id}`);
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Update order status
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateOrderStatusData): Promise<ApiResponse<Order>> {
    const internalData = this.translateStatusUpdate(data);
    const response = await this.client.put<InternalOrder>(`/orders/${id}`, internalData);
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Delete an order
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/orders/${id}`);
  }

  /**
   * Get order status (public endpoint - no auth required)
   */
  async getStatus(id: number): Promise<ApiResponse<Order>> {
    const response = await this.client.post<InternalOrder>(`/orders/status/${id}`);
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Get order list with pagination and filtering
   * Supports filtering by any database field
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: OrderFilterParams): Promise<ApiResponse<OrderListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalOrder[]; page_info: any }>('/orders', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
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
      result: response.result as any
    };
  }

  /**
   * List orders with enhanced query support
   * Supports filtering by any database field using the new query system
   * Requires Client-Id header to be set in the configuration
   * 
   * @example
   * // Simple queries
   * await orders.query({ status: 'confirmed', kind: 'online' })
   * 
   * // Array queries (IN operations)
   * await orders.query({ id: [1, 2, 3], status: ['confirmed', 'shipped'] })
   * 
   * // Range queries
   * await orders.query({ total: { min: 100, max: 1000 } })
   * 
   * // String searches
   * await orders.query({ reference_id: { contains: 'ORDER-2024' } })
   * 
   * // Date range queries
   * await orders.query({ inserted_at: { after: '2024-01-01', before: '2024-12-31' } })
   * 
   * // Combined queries
   * await orders.query({
   *   status: 'confirmed',
   *   total: { min: 50 },
   *   inserted_at: { after: '2024-01-01' },
   *   page: 1,
   *   page_size: 20
   * })
   */
  async query(params?: OrderQueryParams): Promise<ApiResponse<OrderListResponse>> {
    // Process the query through the transformation system with validation and translation
    const processedQuery = processQuery(params || {}, ORDER_FIELD_TYPES, { validate: true, context: 'order' });
    
    const response = await this.client.get<{ entries: InternalOrder[]; page_info: any }>('/orders', processedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
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
      result: response.result as any
    };
  }

  /**
   * Create a query builder for orders
   * Provides a fluent interface for building complex queries
   * 
   * @example
   * const orders = await sdk.orders.createQueryBuilder()
   *   .whereStatus('confirmed')
   *   .whereTotalRange(100, 1000)
   *   .whereReferenceContains('ORDER-2024')
   *   .paginate(1, 20)
   *   .orderBy('inserted_at', 'desc')
   *   .execute();
   */
  createQueryBuilder(initialQuery?: OrderQueryParams): OrderQueryBuilder {
    return new OrderQueryBuilder(this, initialQuery);
  }
}
