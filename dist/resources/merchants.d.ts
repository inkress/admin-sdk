import { HttpClient } from '../client';
import { Merchant, CreateMerchantData, UpdateMerchantData, ApiResponse, MerchantBalance, MerchantLimits, MerchantSubscription, MerchantInvoice, FinancialAccount, RevenueByAppResponse, AppContributionResponse } from '../types';
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
     * Per-app revenue + activity rollup for the merchant — drives the
     * Connected Apps performance section of the dashboard. First-party
     * dashboard callers only; OAuth tokens get 403 (cross-app leak).
     *
     * @param params.window         "7d" | "30d" | "90d" | "all_time" (default "30d")
     * @param params.currency_code  optional ISO-4217 to narrow the report
     */
    revenueByApp(params?: {
        window?: '7d' | '30d' | '90d' | 'all_time';
        currency_code?: string;
    }): Promise<ApiResponse<RevenueByAppResponse>>;
    /**
     * The calling OAuth app's net contribution to the merchant's wallet
     * — SUM (credits − debits) over the entries tagged with this app.
     * OAuth-only; the app id is taken from the bearer token, never from
     * params. Returns 403 for first-party callers.
     *
     * Note: contribution ≠ balance. A merchant payout the app didn't
     * initiate doesn't decrease this number — it's "what did my
     * activity contribute," not "what's mine to draw on."
     *
     * @param params.currency_code  optional ISO-4217 to narrow the figure
     */
    contribution(params?: {
        currency_code?: string;
    }): Promise<ApiResponse<AppContributionResponse>>;
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