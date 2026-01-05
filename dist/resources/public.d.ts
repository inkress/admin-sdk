import { HttpClient } from '../client';
import { Product, PublicMerchantFees, ApiResponse, BaseFilterParams, PublicMerchant } from '../types';
export interface PublicProductFilterParams extends BaseFilterParams {
    search?: string;
    category?: string;
    limit?: number;
    id?: number;
    title?: string;
    teaser?: string;
    price?: number;
    permalink?: string;
    image?: string;
    public?: boolean;
    unlimited?: boolean;
    units_remaining?: number;
    units_sold?: number;
    rating_sum?: number;
    rating_count?: number;
    tag_ids?: number[];
    uid?: string;
    category_id?: number;
    currency_code?: string;
    user_id?: number;
    inserted_at?: string;
    updated_at?: string;
}
export interface PublicProductListResponse {
    entries: Product[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
}
export interface PublicMerchantParams {
    username?: string;
    'domain.cname'?: string;
}
export interface MerchantFeesParams {
    /** Order total amount (required) */
    total: number;
    /** Currency code (required) */
    currency_code: string;
    /** Optional fulfillment/shipping cost */
    fulfillment_total?: number;
    /** Optional payment method ID */
    method_id?: number;
}
export declare class PublicResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Get public information about a merchant by username or cname
     */
    getMerchant(params: PublicMerchantParams): Promise<ApiResponse<PublicMerchant>>;
    /**
     * Get merchant fees (public endpoint - no auth required)
     */
    getMerchantFees(merchantUsername: string, params: MerchantFeesParams): Promise<ApiResponse<PublicMerchantFees>>;
    /**
     * Get merchant products (public endpoint - no auth required)
     */
    getMerchantProducts(merchantUsername: string, params?: PublicProductFilterParams): Promise<ApiResponse<PublicProductListResponse>>;
}
//# sourceMappingURL=public.d.ts.map