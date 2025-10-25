import { HttpClient } from '../client';
import { Order, ApiResponse } from '../types';
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
     * Supports filtering by status, kind, customer email, and date range
     * Requires Client-Id header to be set in the configuration
     */
    list(): Promise<ApiResponse<any>>;
}
//# sourceMappingURL=orders.d.ts.map