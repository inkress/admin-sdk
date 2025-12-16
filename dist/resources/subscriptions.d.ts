import { HttpClient } from '../client';
import { Subscription, SubscriptionPeriod, CreateSubscriptionData, SubscriptionChargeData, SubscriptionUsageResponse, SubscriptionCancelResponse, ApiResponse, PaginationParams } from '../types';
import { SubscriptionQueryBuilder } from '../utils/query-builders';
import { SubscriptionFilterParams, SubscriptionQueryParams, SubscriptionListResponse } from '../types/resources';
export interface CreateSubscriptionLinkData {
    reference_id: string;
    title: string;
    plan_uid: string;
    meta_data?: Record<string, any>;
    customer: {
        first_name: string;
        last_name: string;
        email: string;
    };
}
export interface CreateSubscriptionLinkResponse {
    status: 'paid';
    total: number;
    reference: string;
    currency: string;
    subscription_status: string;
    subscription_uid: string;
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
    transaction: {
        id: number;
        amount: number;
        status: string;
        reference_id: string;
        [key: string]: any;
    };
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
     * Convert internal subscription data (integers) to user-facing data (strings)
     */
    private translateToUserFacing;
    /**
     * Convert internal billing plan data to user-facing billing plan
     */
    private translateBillingPlanToUserFacing;
    /**
     * Convert filter parameters (strings to integers where needed)
     * @deprecated This method is no longer needed as processQuery handles translation
     */
    private translateFilters;
    /**
     * Translate subscription data for API (contextual strings to integers)
     */
    private translateToInternal;
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: SubscriptionFilterParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Gets a billing subscription by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id?: number): Promise<ApiResponse<Subscription>>;
    /**
     * Create a new subscription
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>>;
    /**
     * Delete a subscription
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
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
     * Record usage for a subscription (for usage-based billing)
     * Requires Client-Id header to be set in the configuration
     */
    usage(uid: string, data: SubscriptionChargeData): Promise<ApiResponse<SubscriptionUsageResponse>>;
    /**
     * Get subscription billing periods
     * Requires Client-Id header to be set in the configuration
     */
    getPeriods(uid: string, params?: SubscriptionPeriodsParams): Promise<ApiResponse<SubscriptionPeriodsResponse>>;
    /**
     * Cancel a subscription
     * Requires Client-Id header to be set in the configuration
     */
    cancel(uid: number, code: string): Promise<ApiResponse<SubscriptionCancelResponse>>;
    /**
     * Query subscriptions with enhanced query support
     * @example
     * await subscriptions.query({ status: 'active', billing_plan_id: 123 })
     */
    query(params?: SubscriptionQueryParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Create a query builder for subscriptions
     * @example
     * await sdk.subscriptions.createQueryBuilder().whereStatus('active').execute()
     */
    createQueryBuilder(initialQuery?: SubscriptionQueryParams): SubscriptionQueryBuilder;
}
//# sourceMappingURL=subscriptions.d.ts.map