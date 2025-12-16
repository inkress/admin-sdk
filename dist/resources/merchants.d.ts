import { HttpClient } from '../client';
import { Merchant, CreateMerchantData, UpdateMerchantData, ApiResponse, MerchantBalance, MerchantLimits, MerchantSubscription, MerchantInvoice } from '../types';
import { MerchantQueryBuilder } from '../utils/query-builders';
import { MerchantFilterParams, MerchantQueryParams, MerchantListResponse } from '../types/resources';
/**
 * @deprecated Use MerchantFilterParams from types/resources instead
 */
export interface LegacyMerchantFilterParams {
}
export declare class MerchantsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal merchant data (integers) to user-facing data (strings)
     */
    private translateMerchantToUserFacing;
    /**
     * Convert user-facing merchant data (strings) to internal data (integers)
     */
    private translateMerchantToInternal;
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List merchants with pagination and filtering
     */
    list(params?: MerchantFilterParams): Promise<ApiResponse<MerchantListResponse>>;
    /**
     * Get a specific merchant by ID
     */
    get(id: number): Promise<ApiResponse<Merchant>>;
    /**
     * Create a new merchant
     */
    create(data: CreateMerchantData): Promise<ApiResponse<Merchant>>;
    /**
     * Update an existing merchant
     */
    update(id: number, data: UpdateMerchantData): Promise<ApiResponse<Merchant>>;
    /**
     * Get merchant account balances
     */
    balances(): Promise<ApiResponse<MerchantBalance>>;
    /**
     * Get merchant account limits
     */
    limits(): Promise<ApiResponse<MerchantLimits>>;
    /**
     * Get merchant subscription plan details
     */
    subscription(): Promise<ApiResponse<MerchantSubscription>>;
    /**
     * Get list of merchant account invoices
     */
    invoices(): Promise<ApiResponse<MerchantInvoice[]>>;
    /**
     * Get a specific merchant invoice by ID
     */
    invoice(invoiceId: string): Promise<ApiResponse<MerchantInvoice>>;
    /**
     * Query merchants with enhanced query support
     * @example
     * await merchants.query({ status: 'approved', sector: 'retail' })
     */
    query(params?: MerchantQueryParams): Promise<ApiResponse<MerchantListResponse>>;
    /**
     * Create a query builder for merchants
     * @example
     * await sdk.merchants.createQueryBuilder().whereStatus('approved').execute()
     */
    createQueryBuilder(initialQuery?: MerchantQueryParams): MerchantQueryBuilder;
}
//# sourceMappingURL=merchants.d.ts.map