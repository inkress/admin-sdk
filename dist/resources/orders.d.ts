import { HttpClient } from '../client';
import { Order, ApiResponse, BaseFilterParams, OrderStatus, OrderKind, OrderQueryParams } from '../types';
import { StatusKey, KindKey } from '../utils/translators';
import { QueryBuilder } from '../utils/query-transformer';
export interface OrderFilterParams extends BaseFilterParams {
    search?: string;
    status?: OrderStatus | StatusKey | number;
    kind?: OrderKind | KindKey | number;
    limit?: number;
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
    query(params?: OrderQuery): Promise<ApiResponse<OrderListResponse>>;
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
    createQueryBuilder(initialQuery?: OrderQuery): OrderQueryBuilder;
}
/**
 * Query builder class for orders
 * Provides a fluent interface for building complex queries
 */
export declare class OrderQueryBuilder extends QueryBuilder<Order> {
    private ordersResource;
    constructor(ordersResource: OrdersResource, initialQuery?: OrderQuery);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<OrderListResponse>>;
    /**
     * Add a status condition with contextual values
     */
    whereStatus(status: OrderStatus | OrderStatus[]): this;
    /**
     * Add a kind condition with contextual values
     */
    whereKind(kind: OrderKind | OrderKind[]): this;
    /**
     * Add a total amount range condition
     */
    whereTotalRange(min?: number, max?: number): this;
    /**
     * Add a reference ID search condition
     */
    whereReferenceContains(value: string): this;
    /**
     * Add a date range condition for creation date
     */
    whereCreatedBetween(after?: string, before?: string): this;
}
//# sourceMappingURL=orders.d.ts.map