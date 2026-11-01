import { HttpClient } from '../client';
import { PaymentLink, CreatePaymentLinkData, UpdatePaymentLinkData, ApiResponse } from '../types';
import { PaymentLinkQueryBuilder } from '../utils/query-builders';
import { PaymentLinkFilterParams, PaymentLinkQueryParams, PaymentLinkListResponse } from '../types/resources';
export declare class PaymentLinksResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal payment link data (integers) to user-facing data (strings)
     */
    private translateToUserFacing;
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * Convert user-facing data to internal format
     */
    private translateToInternal;
    /**
     * List payment links with filtering
     */
    list(params?: PaymentLinkFilterParams): Promise<ApiResponse<PaymentLinkListResponse>>;
    /**
     * Get payment link by ID
     */
    get(id: number): Promise<ApiResponse<PaymentLink>>;
    /**
     * Create a new payment link
     */
    create(data: CreatePaymentLinkData): Promise<ApiResponse<PaymentLink>>;
    /**
     * Update a payment link
     */
    update(id: number, data: UpdatePaymentLinkData): Promise<ApiResponse<PaymentLink>>;
    /**
     * Delete a payment link
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Advanced query interface with full type safety
     * Returns a QueryBuilder that compiles to the appropriate filter format
     *
     * @example
     * const links = await sdk.paymentLinks.query({
     *   total: { gte: 1000 },
     *   status: [1, 2],
     *   inserted_at: { gte: '2024-01-01' }
     * });
     */
    query(params: PaymentLinkQueryParams): Promise<ApiResponse<PaymentLinkListResponse>>;
    /**
     * Create a fluent query builder for payment links
     *
     * @example
     * const links = await sdk.paymentLinks.createQueryBuilder()
     *   .whereTotalGreaterThan(1000)
     *   .whereStatusIn([1, 2])
     *   .orderBy('inserted_at', 'desc')
     *   .limit(50)
     *   .execute();
     */
    createQueryBuilder(): PaymentLinkQueryBuilder;
}
//# sourceMappingURL=payment-links.d.ts.map