import { HttpClient } from '../client';
import { Product, PublicMerchantFees, ApiResponse, PaginationParams, PublicMerchant } from '../types';
export interface PublicProductListParams extends PaginationParams {
    search?: string;
    category?: string;
    limit?: number;
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
    getMerchantFees(merchantUsername: string, params: {
        currency: string;
        total: number;
    }): Promise<ApiResponse<PublicMerchantFees>>;
    /**
     * Get merchant products (public endpoint - no auth required)
     */
    getMerchantProducts(merchantUsername: string, params?: PublicProductListParams): Promise<ApiResponse<PublicProductListResponse>>;
}
//# sourceMappingURL=public.d.ts.map