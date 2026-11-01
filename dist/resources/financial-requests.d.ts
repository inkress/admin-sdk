import { HttpClient } from '../client';
import { FinancialRequest, CreateFinancialRequestData, ApiResponse } from '../types';
import { FinancialRequestQueryBuilder } from '../utils/query-builders';
import { FinancialRequestFilterParams, FinancialRequestQueryParams, FinancialRequestListResponse } from '../types/resources';
export declare class FinancialRequestsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * Convert user-facing data to internal format
     */
    private translateToInternal;
    /**
     * List financial requests with filtering
     */
    list(params?: FinancialRequestFilterParams): Promise<ApiResponse<FinancialRequestListResponse>>;
    /**
     * Get financial request by ID
     */
    get(id: number): Promise<ApiResponse<FinancialRequest>>;
    /**
     * Create a new financial request
     */
    create(data: CreateFinancialRequestData): Promise<ApiResponse<FinancialRequest>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const requests = await sdk.financialRequests.query({
     *   status: [1, 2],
     *   total: { gte: 5000 },
     *   merchant_id: 123
     * });
     */
    query(params: FinancialRequestQueryParams): Promise<ApiResponse<FinancialRequestListResponse>>;
    /**
     * Create a fluent query builder for financial requests
     *
     * @example
     * const requests = await sdk.financialRequests.createQueryBuilder()
     *   .whereStatusIn([1, 2])
     *   .whereTotalGreaterThan(5000)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder(): FinancialRequestQueryBuilder;
}
//# sourceMappingURL=financial-requests.d.ts.map