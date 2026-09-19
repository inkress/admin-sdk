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
    /** Optional discount code to include in the quote. Invalid codes are ignored here
     * (discount_total stays 0); use getDiscount() to surface a rejection reason. */
    discount_code?: string;
}
export interface DiscountQuoteParams {
    /** The discount code the buyer entered (matched case-insensitively) */
    code: string;
    /** Currency code (required) */
    currency_code: string;
    /** Cart subtotal, in currency units (required) */
    total: number;
    /** Optional shipping cost, in currency units */
    fulfillment_total?: number;
}
/**
 * Result of validating + quoting a discount code
 * (GET /public/m/:username/discount). Always returned with HTTP 200.
 */
export interface DiscountQuoteResult {
    /** Whether the code is valid for this cart */
    valid: boolean;
    /** Echoed code */
    discount_code?: string;
    /** Machine-readable rejection reason when valid=false
     * (not_found | inactive | expired | usage_limit_reached | currency_mismatch | min_spend_not_met) */
    reason?: string;
    /** Human-readable message when valid=false */
    message?: string;
    /** Discounted totals when valid=true (fees-shaped subset) */
    discount_total?: number;
    sub_total?: number;
    shipping_total?: number;
    tax_total?: number;
    total?: number;
    currency?: string;
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
     * Validate + quote a discount code against a cart (public endpoint - no auth required).
     * Returns { valid: true, discount_total, ...totals } or { valid: false, reason, message }.
     */
    getDiscount(merchantUsername: string, params: DiscountQuoteParams): Promise<ApiResponse<DiscountQuoteResult>>;
    /**
     * Get merchant products (public endpoint - no auth required)
     */
    getMerchantProducts(merchantUsername: string, params?: PublicProductFilterParams): Promise<ApiResponse<PublicProductListResponse>>;
}
//# sourceMappingURL=public.d.ts.map