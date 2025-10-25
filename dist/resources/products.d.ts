import { HttpClient } from '../client';
import { Product, CreateProductData, UpdateProductData, ApiResponse, PaginationParams } from '../types';
export interface ProductListParams extends PaginationParams {
    search?: string;
    status?: number;
    category?: string;
    limit?: number;
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
     * List products with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: ProductListParams): Promise<ApiResponse<ProductListResponse>>;
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