import { HttpClient } from '../client';
import { Subscription, SubscriptionPeriod, ApiResponse, PaginationParams } from '../types';
export interface SubscriptionListParams extends PaginationParams {
    status?: number;
    billing_plan_id?: number;
    customer_id?: number;
    limit?: number;
}
export interface SubscriptionListResponse {
    entries: Subscription[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
}
export interface CreateSubscriptionLinkData {
    reference_id: string;
    title: string;
    plan_id: string;
    customer: {
        first_name: string;
        last_name: string;
        email: string;
    };
}
export interface CreateSubscriptionLinkResponse {
    id: number;
    payment_urls: {
        short_link: string;
    };
    subscription: Subscription;
}
export interface ChargeSubscriptionData {
    reference_id: string;
    total: number;
    title: string;
}
export interface ChargeSubscriptionResponse {
    id: number;
    payment_urls: {
        short_link: string;
    };
    transaction: any;
}
export interface SubscriptionPeriodsParams extends PaginationParams {
    status?: 'pending' | 'paid' | 'failed' | 'cancelled';
    limit?: number;
}
export interface SubscriptionPeriodsResponse {
    entries: SubscriptionPeriod[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
}
export declare class SubscriptionsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: SubscriptionListParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Create a subscription payment link
     * Requires Client-Id header to be set in the configuration
     */
    createLink(data: CreateSubscriptionLinkData): Promise<ApiResponse<CreateSubscriptionLinkResponse>>;
    /**
     * Charge an existing subscription
     * Requires Client-Id header to be set in the configuration
     */
    charge(uid: string, data: ChargeSubscriptionData): Promise<ApiResponse<ChargeSubscriptionResponse>>;
    /**
     * Get subscription billing periods
     * Requires Client-Id header to be set in the configuration
     */
    getPeriods(uid: string, params?: SubscriptionPeriodsParams): Promise<ApiResponse<SubscriptionPeriodsResponse>>;
    /**
     * Cancel a subscription
     * Requires Client-Id header to be set in the configuration
     */
    cancel(uid: number, code: string): Promise<ApiResponse<any>>;
}
//# sourceMappingURL=subscriptions.d.ts.map