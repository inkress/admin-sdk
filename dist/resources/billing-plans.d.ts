import { HttpClient } from '../client';
import { BillingPlan, CreateBillingPlanData, UpdateBillingPlanData, ApiResponse, PaginationParams } from '../types';
export interface BillingPlanListParams extends PaginationParams {
    status?: number;
    kind?: number;
    limit?: number;
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
     * List billing plans with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: BillingPlanListParams): Promise<ApiResponse<BillingPlanListResponse>>;
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