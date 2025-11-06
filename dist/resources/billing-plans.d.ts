import { HttpClient } from '../client';
import { BillingPlan, CreateBillingPlanData, UpdateBillingPlanData, ApiResponse, BaseFilterParams, BillingPlanKind } from '../types';
import { StatusKey, KindKey } from '../utils/translators';
export interface BillingPlanFilterParams extends BaseFilterParams {
    status?: StatusKey | number;
    kind?: BillingPlanKind | KindKey | number;
    limit?: number;
    id?: number;
    name?: string;
    description?: string;
    flat_rate?: number;
    transaction_fee?: number;
    transaction_percentage?: number;
    transaction_percentage_additional?: number;
    transaction_minimum_fee?: number;
    minimum_fee?: number;
    duration?: number;
    billing_cycle?: number;
    trial_period?: number;
    charge_strategy?: number;
    auto_charge?: boolean;
    public?: boolean;
    payout_period?: number;
    payout_value_limit?: number;
    payout_percentage_limit?: number;
    uid?: string;
    currency_id?: number;
    payment_provider_id?: number;
    inserted_at?: string;
    updated_at?: string;
}
export interface BillingPlanListResponse {
    entries: BillingPlan[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
}
export declare class BillingPlansResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List billing plans with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: BillingPlanFilterParams): Promise<ApiResponse<BillingPlanListResponse>>;
    /**
     * Get a specific billing plan by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<BillingPlan>>;
    /**
     * Create a new billing plan
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateBillingPlanData): Promise<ApiResponse<BillingPlan>>;
    /**
     * Update an existing billing plan
     * Requires Client-Id header to be set in the configuration
     */
    update(id: number, data: UpdateBillingPlanData): Promise<ApiResponse<BillingPlan>>;
    /**
     * Delete a billing plan
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
}
//# sourceMappingURL=billing-plans.d.ts.map