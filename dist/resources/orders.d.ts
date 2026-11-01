import { HttpClient } from '../client';
import { type CreateOrderRefundData, type OrderRefund, type WaitForRefundOptions } from './order-refunds';
import type { CancelOrderData, DeclineOrderPaymentData, FulfilOrderData, OrderMoveResult, RecordOrderPaymentData } from './order-status';
import { Order, ApiResponse, CreateOrderData, CreateOrderResponseData, UpdateOrderData } from '../types';
import { OrderQueryBuilder } from '../utils/query-builders';
import { OrderFilterParams, OrderQueryParams, OrderListResponse } from '../types/resources';
export declare class OrdersResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal order data (integers) to user-facing data (strings)
     */
    private translateOrderToUserFacing;
    /**
     * Convert internal merchant data to user-facing merchant
     */
    private translateMerchantToUserFacing;
    /**
     * Convert filter parameters (strings to integers where needed)
     * @deprecated This method is no longer needed as processQuery handles translation
     */
    private translateFilters;
    /**
     * Convert status update data (strings to integers where needed)
     */
    private translateStatusUpdate;
    /**
     * Create a new order
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateOrderData): Promise<ApiResponse<CreateOrderResponseData>>;
    /**
     * Get order details by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<Order>>;
    /**
     * Update order status
     * Requires Client-Id header to be set in the configuration
     */
    update(id: number, data: UpdateOrderData): Promise<ApiResponse<Order>>;
    /**
     * Delete an order
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Get order status (public endpoint - no auth required)
     */
    getStatus(id: number): Promise<ApiResponse<Order>>;
    /**
     * Get order list with pagination and filtering
     * Supports filtering by any database field
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: OrderFilterParams): Promise<ApiResponse<OrderListResponse>>;
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
    query(params?: OrderQueryParams): Promise<ApiResponse<OrderListResponse>>;
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
    createQueryBuilder(initialQuery?: OrderQueryParams): OrderQueryBuilder;
    /**
     * INK-692: refund a captured card-on-file or subscription order, in full (no `amount`) or in
     * part. `idempotencyKey` (8-200 printable ASCII) makes retries safe: the same key and payload
     * return the same refund; a different payload is a 409. Resolves when the refund is ACCEPTED
     * (`pending`); poll with `refundStatus` / `waitForRefund`. `orderRef` is the order id, its
     * `reference_id` (e.g. the `cardchg-…` reference of a card charge) or uid.
     */
    refund(orderRef: string | number, data: CreateOrderRefundData, idempotencyKey: string): Promise<ApiResponse<OrderRefund>>;
    /** Current state of a refund, by the idempotency key it was requested with. */
    refundStatus(orderRef: string | number, idempotencyKey: string): Promise<ApiResponse<OrderRefund>>;
    /**
     * Poll `refundStatus` until `succeeded` or `failed`. Transient misses (network, 5xx, unreadable
     * body) are retried; 4xx is thrown. Throws `OrderRefundPendingError` when the budget runs out —
     * an `unknown` refund is still being reconciled by Inkress; never re-request with a new key.
     */
    waitForRefund(orderRef: string | number, idempotencyKey: string, options?: WaitForRefundOptions): Promise<OrderRefund>;
    /**
     * Record a payment made outside Inkress (cash, bank transfer, other) on one of your orders
     * (INK-1079). Pending, failed, partly paid, verifying or stale orders only; subscription orders are
     * refused and a paid order is a 409. No fee, ledger entry or wallet credit is booked.
     */
    recordPayment(orderRef: string | number, data: RecordOrderPaymentData): Promise<ApiResponse<OrderMoveResult>>;
    /** Move a paid order forward through fulfilment (INK-1079, INK-1307). */
    fulfil(orderRef: string | number, data: FulfilOrderData): Promise<ApiResponse<OrderMoveResult>>;
    /** A bank transfer the order was waiting for didn't arrive: the order fails (INK-1307). */
    declinePayment(orderRef: string | number, data?: DeclineOrderPaymentData): Promise<ApiResponse<OrderMoveResult>>;
    /**
     * Cancel an unpaid (pending, failed or stale) order; its open payment links close and
     * `orders.cancelled` is sent (INK-1307). Refund a paid order instead.
     */
    cancel(orderRef: string | number, data?: CancelOrderData): Promise<ApiResponse<OrderMoveResult>>;
}
//# sourceMappingURL=orders.d.ts.map