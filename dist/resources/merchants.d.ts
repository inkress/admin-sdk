import { HttpClient } from '../client';
import { Merchant, CreateMerchantData, UpdateMerchantData, ApiResponse, PaginationParams } from '../types';
export interface MerchantListParams extends PaginationParams {
    search?: string;
    status?: number;
    limit?: number;
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
     * List merchants with pagination and filtering
     */
    list(params?: MerchantListParams): Promise<ApiResponse<MerchantListResponse>>;
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