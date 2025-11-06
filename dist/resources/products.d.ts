import { HttpClient } from '../client';
import { Product, CreateProductData, UpdateProductData, ApiResponse, BaseFilterParams, ProductStatus } from '../types';
import { StatusKey } from '../utils/translators';
export interface ProductFilterParams extends BaseFilterParams {
    search?: string;
    status?: ProductStatus | StatusKey | number;
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
    currency_id?: number;
    user_id?: number;
    inserted_at?: string;
    updated_at?: string;
}
export interface ProductListResponse {
    entries: Product[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
}
export declare class ProductsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal product data (integers) to user-facing data (strings)
     */
    private translateProductToUserFacing;
    /**
     * Convert user-facing product data (strings) to internal data (integers)
     */
    private translateProductToInternal;
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List products with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: ProductFilterParams): Promise<ApiResponse<ProductListResponse>>;
    /**
     * Get a specific product by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<Product>>;
    /**
     * Create a new product
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateProductData): Promise<ApiResponse<Product>>;
    /**
     * Update an existing product
     * Requires Client-Id header to be set in the configuration
     */
    update(id: number, data: UpdateProductData): Promise<ApiResponse<Product>>;
    /**
     * Delete a product
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
}
//# sourceMappingURL=products.d.ts.map