import { HttpClient } from '../client';
import { Merchant, CreateMerchantData, UpdateMerchantData, ApiResponse, MerchantBalance, MerchantLimits, MerchantSubscription, MerchantInvoice, FinancialAccount } from '../types';
import { MerchantQueryBuilder } from '../utils/query-builders';
import { MerchantFilterParams, MerchantQueryParams, MerchantListResponse } from '../types/resources';
export interface BankInfoUpdateRequestData {
    account_holder_name: string;
    account_holder_type: "Personal" | "Business";
    account_number: number;
    account_type: "Checking" | "Saving";
    bank_name: string;
    branch_name: string;
    branch_code?: string;
    routing_number?: string;
    swift_code?: string;
    country_code: string;
    currency_code: string;
}
export interface BankAccountUpdateRequestResponse {
    message: string | null;
    success: boolean;
    error: string | null;
    reason: string | null;
}
export interface BankAccountUpdateConfirmResponse {
    account: FinancialAccount | null;
    saved: boolean;
    success: boolean;
    error: string | null;
    reason: string | null;
}
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
     * Request for bank account update
     */
    updateBankInfo(data: BankInfoUpdateRequestData): Promise<ApiResponse<BankAccountUpdateRequestResponse>>;
    /**
     * Confirm bank account information update with OTP codde
     */
    confirmBankInfo(otp: string): Promise<ApiResponse<BankAccountUpdateConfirmResponse>>;
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