import { HttpClient } from '../client';
import { Fee, CreateFeeData, UpdateFeeData, ApiResponse } from '../types';
import { FeeQueryBuilder } from '../utils/query-builders';
import { FeeFilterParams, FeeQueryParams, FeeListResponse } from '../types/resources';
export declare class FeesResource {
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
     * List fees with filtering
     */
    list(params?: FeeFilterParams): Promise<ApiResponse<FeeListResponse>>;
    /**
     * Get fee by ID
     */
    get(id: number): Promise<ApiResponse<Fee>>;
    /**
     * Create a new fee
     */
    create(data: CreateFeeData): Promise<ApiResponse<Fee>>;
    /**
     * Update a fee
     */
    update(id: number, data: UpdateFeeData): Promise<ApiResponse<Fee>>;
    /**
     * Delete a fee
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const fees = await sdk.fees.query({
     *   kind: [1, 2],
     *   total: { gte: 100 },
     *   currency_code: 'USD'
     * });
     */
    query(params: FeeQueryParams): Promise<ApiResponse<FeeListResponse>>;
    /**
     * Create a fluent query builder for fees
     *
     * @example
     * const fees = await sdk.fees.createQueryBuilder()
     *   .whereKindIn([1, 2])
     *   .whereTotalGreaterThan(100)
     *   .execute();
     */
    createQueryBuilder(): FeeQueryBuilder;
}
//# sourceMappingURL=fees.d.ts.map