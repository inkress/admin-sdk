import { HttpClient } from '../client';
import { Merchant, CreateMerchantData, UpdateMerchantData, ApiResponse, BaseFilterParams, AccountStatus } from '../types';
import { StatusKey, FeeStructureKey } from '../utils/translators';
export interface MerchantFilterParams extends BaseFilterParams {
    search?: string;
    status?: AccountStatus | StatusKey | number;
    limit?: number;
    id?: number;
    name?: string;
    email?: string;
    username?: string;
    about?: string;
    logo?: string;
    sector?: string;
    phone?: string;
    business_type?: string;
    theme_colour?: string;
    uid?: string;
    address_id?: number;
    owner_id?: number;
    domain_id?: number;
    organisation_id?: number;
    platform_fee_structure?: FeeStructureKey | number;
    provider_fee_structure?: FeeStructureKey | number;
    parent_merchant_id?: number;
    inserted_at?: string;
    updated_at?: string;
}
export interface MerchantListResponse {
    entries: Merchant[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
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
    balances(): Promise<ApiResponse>;
    /**
     * Get merchant account limits
     */
    limits(): Promise<ApiResponse>;
    /**
     * Get merchant subscription plan details
     */
    subscription(): Promise<ApiResponse>;
    /**
     * Get list of merchant account invoices
     */
    invoices(): Promise<ApiResponse>;
    /**
     * Get a specific merchant invoice by ID
     */
    invoice(invoiceId: string): Promise<ApiResponse>;
}
//# sourceMappingURL=merchants.d.ts.map