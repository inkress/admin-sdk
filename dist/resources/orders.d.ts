import { HttpClient } from '../client';
import { Order, ApiResponse } from '../types';
import { OrderQueryBuilder } from '../utils/query-builders';
import { OrderFilterParams, OrderQueryParams, OrderListResponse } from '../types/resources';
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
export declare class OrdersResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal order data (integers) to user-facing data (strings)
     */
    private translateOrderToUserFacing;
    /**
     * Convert user-facing order data (strings) to internal data (integers)
     */
    private translateOrderToInternal;
    /**
     * Convert filter parameters (strings to integers where needed)
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
    create(data: CreateOrderRequestData): Promise<ApiResponse<CreateOrderResponseData>>;
    /**
     * Get order details by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<Order>>;
    /**
     * Update order status
     * Requires Client-Id header to be set in the configuration
     */
    update(id: number, data: UpdateOrderStatusData): Promise<ApiResponse<Order>>;
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
}
//# sourceMappingURL=orders.d.ts.map