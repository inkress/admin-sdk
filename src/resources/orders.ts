import { HttpClient } from '../client';
import {
  Order,
  CreateOrderData,
  UpdateOrderData,
  ApiResponse,
  BaseFilterParams,
  InternalOrder,
  OrderStatus,
  OrderKind,
  OrderQueryParams,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery, QueryBuilder } from '../utils/query-transformer';

// Define field types for Orders to enable type validation
const ORDER_FIELD_TYPES: Partial<Record<keyof InternalOrder, 'string' | 'number' | 'boolean' | 'date' | 'array'>> = {
  id: 'number',
  reference_id: 'string',
  total: 'number',
  status_on: 'number',
  uid: 'string',
  cart_id: 'number',
  kind: 'number',
  status: 'number',
  inserted_at: 'date',
  updated_at: 'date',
  // Note: currency, customer, merchant etc. are objects, not primitive fields
} as const;

// Legacy filter interface for backward compatibility
export interface OrderFilterParams extends BaseFilterParams {
  // Common filters
  search?: string; // Legacy search field - consider using 'q' instead
  status?: OrderStatus | StatusKey | number; // Accept contextual, full, and integer values
  kind?: OrderKind | KindKey | number; // Accept contextual, full, and integer values
  limit?: number;
  
  // Database field filters - any field from the orders table can be filtered
  id?: number;
  reference_id?: string;
  total?: number;
  status_on?: number;
  uid?: string;
  cart_id?: number;
  currency_id?: number;
  customer_id?: number;
  payment_link_id?: number;
  billing_plan_id?: number;
  session_id?: string;
  inserted_at?: string;
  updated_at?: string;
}

// Enhanced query interface using the new query system
export type OrderQuery = OrderQueryParams;

export interface OrderListResponse {
  entries: Order[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

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
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'order') as OrderStatus,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'order') as OrderKind,
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
    
    if (response.data) {
      const translatedOrder = this.translateOrderToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedOrder
      };
    }
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
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
    
    if (response.data) {
      const translatedOrder = this.translateOrderToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedOrder
      };
    }
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Get order status (public endpoint - no auth required)
   */
  async getStatus(id: number): Promise<ApiResponse<Order>> {
    const response = await this.client.get<InternalOrder>(`/orders/status/${id}`);
    
    if (response.data) {
      const translatedOrder = this.translateOrderToUserFacing(response.data);
      return {
        state: response.state,
        data: translatedOrder
      };
    }
    
    if (response.result) {
      const translatedOrder = this.translateOrderToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedOrder
      };
    }
    
    return {
      state: response.state,
      data: response.data as any,
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
    
    if (response.data?.entries) {
      const translatedEntries = response.data.entries.map(order => this.translateOrderToUserFacing(order));
      return {
        state: response.state,
        data: {
          entries: translatedEntries,
          page_info: response.data.page_info
        }
      };
    }
    
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
      data: response.data as any,
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
   * orders.query({ status: 'confirmed', kind: 'online' })
   * 
   * // Array queries (IN operations)
   * orders.query({ id: [1, 2, 3], status: ['confirmed', 'shipped'] })
   * 
   * // Range queries
   * orders.query({ total: { min: 100, max: 1000 } })
   * 
   * // String searches
   * orders.query({ reference_id: { contains: 'ORDER-2024' } })
   * 
   * // Date range queries
   * orders.query({ inserted_at: { after: '2024-01-01', before: '2024-12-31' } })
   * 
   * // Combined queries
   * orders.query({
   *   status: 'confirmed',
   *   total: { min: 50 },
   *   inserted_at: { after: '2024-01-01' },
   *   page: 1,
   *   page_size: 20
   * })
   */
  async query(params?: OrderQuery): Promise<ApiResponse<OrderListResponse>> {
    // Process the query through the transformation system with validation
    const processedQuery = processQuery(params || {}, ORDER_FIELD_TYPES, { validate: true });
    
    // Apply contextual translations for status and kind
    const translatedQuery = this.translateFilters(processedQuery);
    
    const response = await this.client.get<{ entries: InternalOrder[]; page_info: any }>('/orders', translatedQuery);
    
    if (response.data?.entries) {
      const translatedEntries = response.data.entries.map(order => this.translateOrderToUserFacing(order));
      return {
        state: response.state,
        data: {
          entries: translatedEntries,
          page_info: response.data.page_info
        }
      };
    }
    
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
      data: response.data as any,
      result: response.result as any
    };
  }

  /**
   * Create a query builder for orders
   * Provides a fluent interface for building complex queries
   * 
   * @example
   * const orders = await sdk.orders.createQueryBuilder()
   *   .where('status', 'confirmed')
   *   .whereRange('total', 100, 1000)
   *   .whereContains('reference_id', 'ORDER-2024')
   *   .paginate(1, 20)
   *   .orderBy('inserted_at', 'desc')
   *   .execute();
   */
  createQueryBuilder(initialQuery?: OrderQuery): OrderQueryBuilder {
    return new OrderQueryBuilder(this, initialQuery);
  }
}

/**
 * Query builder class for orders
 * Provides a fluent interface for building complex queries
 */
export class OrderQueryBuilder extends QueryBuilder<Order> {
  constructor(private ordersResource: OrdersResource, initialQuery?: OrderQuery) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<OrderListResponse>> {
    return this.ordersResource.query(this.getRawQuery());
  }

  /**
   * Add a status condition with contextual values
   */
  whereStatus(status: OrderStatus | OrderStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Add a kind condition with contextual values
   */
  whereKind(kind: OrderKind | OrderKind[]): this {
    if (Array.isArray(kind)) {
      return this.whereIn('kind', kind as any);
    }
    return this.where('kind', kind as any);
  }

  /**
   * Add a total amount range condition
   */
  whereTotalRange(min?: number, max?: number): this {
    return this.whereRange('total', min, max);
  }

  /**
   * Add a reference ID search condition
   */
  whereReferenceContains(value: string): this {
    return this.whereContains('reference_id', value);
  }

  /**
   * Add a date range condition for creation date
   */
  whereCreatedBetween(after?: string, before?: string): this {
    return this.whereDateRange('inserted_at', after, before);
  }
}
