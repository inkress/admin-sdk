import { HttpClient, InkressApiError } from '../client';
import {
  OrderRefundPendingError,
  RESOLVED_REFUND_STATUSES,
  isOrderRefund,
  type CreateOrderRefundData,
  type OrderRefund,
  type WaitForRefundOptions,
} from './order-refunds';
import {
  Order,
  ApiResponse,
  InternalOrder,
  InternalMerchant,
  Merchant,
  OrderStatus,
  OrderKind,
  AccountStatus,
  CreateOrderData,
  CreateOrderResponseData,
  UpdateOrderData,
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
   * Convert filter parameters (strings to integers where needed)
   * @deprecated This method is no longer needed as processQuery handles translation
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
  private translateStatusUpdate(data: UpdateOrderData): any {
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
  async create(data: CreateOrderData): Promise<ApiResponse<CreateOrderResponseData>> {
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
  async update(id: number, data: UpdateOrderData): Promise<ApiResponse<Order>> {
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
    const response = await this.client.get<InternalOrder>(`/orders/status/${id}`);
    
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
    const response = await this.client.get<{ entries: InternalOrder[]; pagination: any }>('/orders', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.pagination
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
    
    const response = await this.client.get<{ entries: InternalOrder[]; pagination: any }>('/orders', processedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.pagination
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

  /**
   * INK-692: refund a captured card-on-file or subscription order, in full (no `amount`) or in
   * part. `idempotencyKey` (8-200 printable ASCII) makes retries safe: the same key and payload
   * return the same refund; a different payload is a 409. Resolves when the refund is ACCEPTED
   * (`pending`); poll with `refundStatus` / `waitForRefund`. `orderRef` is the order id, its
   * `reference_id` (e.g. the `cardchg-…` reference of a card charge) or uid.
   */
  async refund(orderRef: string | number, data: CreateOrderRefundData, idempotencyKey: string): Promise<ApiResponse<OrderRefund>> {
    return this.client.post<OrderRefund>(`/orders/${encodeURIComponent(String(orderRef))}/refunds`, {
      ...data,
      idempotency_key: idempotencyKey,
    });
  }

  /** Current state of a refund, by the idempotency key it was requested with. */
  async refundStatus(orderRef: string | number, idempotencyKey: string): Promise<ApiResponse<OrderRefund>> {
    const response = await this.client.get<unknown>(
      `/orders/${encodeURIComponent(String(orderRef))}/refunds/${encodeURIComponent(idempotencyKey)}`,
    );
    const body: unknown = (response as { result?: unknown }).result;
    if (!isOrderRefund(body)) throw new InkressApiError('Unexpected response from the refund status endpoint', 0, response);
    return { state: 'ok', result: body };
  }

  /**
   * Poll `refundStatus` until `succeeded` or `failed`. Transient misses (network, 5xx, unreadable
   * body) are retried; 4xx is thrown. Throws `OrderRefundPendingError` when the budget runs out —
   * an `unknown` refund is still being reconciled by Inkress; never re-request with a new key.
   */
  async waitForRefund(orderRef: string | number, idempotencyKey: string, options: WaitForRefundOptions = {}): Promise<OrderRefund> {
    const attempts = options.attempts ?? 15;
    const maxDelay = options.maxDelayMs ?? 15000;
    const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
    let delay = options.initialDelayMs ?? 1000;
    let last: OrderRefund | undefined;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const { result } = await this.refundStatus(orderRef, idempotencyKey);
        last = result;
        if (result && RESOLVED_REFUND_STATUSES.includes(result.status)) return result;
      } catch (error) {
        const transient = error instanceof InkressApiError && (error.status === 0 || error.status >= 500);
        if (!transient) throw error;
      }
      if (attempt < attempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }
    throw new OrderRefundPendingError(idempotencyKey, last, attempts);
  }
}
