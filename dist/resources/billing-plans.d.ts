import { HttpClient } from '../client';
import { BillingPlan, CreateBillingPlanData, UpdateBillingPlanData, ApiResponse } from '../types';
import { BillingPlanQueryBuilder } from '../utils/query-builders';
import { BillingPlanFilterParams, BillingPlanQueryParams, BillingPlanListResponse } from '../types/resources';
/**
 * @deprecated Use BillingPlanFilterParams from types/resources instead
 */
export interface LegacyBillingPlanFilterParams {
}
export declare class BillingPlansResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * Translate billing plan data for API (contextual strings to integers)
     */
    private translateToInternal;
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
    /**
     * Query billing plans with enhanced query support
     * @example
     * await billingPlans.query({ kind: 'subscription', public: true })
     */
    query(params?: BillingPlanQueryParams): Promise<ApiResponse<BillingPlanListResponse>>;
    /**
     * Create a query builder for billing plans
     * @example
     * await sdk.billingPlans.createQueryBuilder().whereKind('subscription').execute()
     */
    createQueryBuilder(initialQuery?: BillingPlanQueryParams): BillingPlanQueryBuilder;
}
//# sourceMappingURL=billing-plans.d.ts.map