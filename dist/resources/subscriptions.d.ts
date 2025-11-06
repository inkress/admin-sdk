import { HttpClient } from '../client';
import { Subscription, SubscriptionPeriod, ApiResponse, PaginationParams, BaseFilterParams, SubscriptionStatus } from '../types';
import { StatusKey } from '../utils/translators';
export interface SubscriptionListParams extends BaseFilterParams {
    status?: SubscriptionStatus | StatusKey | number;
    billing_plan_id?: number;
    customer_id?: number;
    limit?: number;
    id?: number;
    record_id?: number;
    record?: string;
    start_date?: string;
    end_date?: string;
    current_period_start?: string;
    current_period_end?: string;
    trial_end?: string;
    canceled_at?: string;
    uid?: string;
    kind?: number;
    token?: string;
    inserted_at?: string;
    updated_at?: string;
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
    plan_uid: string;
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
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: SubscriptionListParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Gets a billing subscription by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id?: number): Promise<ApiResponse<Subscription>>;
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