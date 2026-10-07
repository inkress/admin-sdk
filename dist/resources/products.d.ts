import { HttpClient } from '../client';
import { Product, CreateProductData, UpdateProductData, ApiResponse } from '../types';
import { ProductQueryBuilder } from '../utils/query-builders';
import { ProductFilterParams, ProductQueryParams, ProductListResponse } from '../types/resources';
/**
 * @deprecated Use ProductFilterParams from types/resources instead
 */
export interface LegacyProductFilterParams {
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
    /**
     * List products with enhanced query support
     * Supports filtering by any database field using the new query system
     * Requires Client-Id header to be set in the configuration
     *
     * @example
     * // Simple queries
     * await products.query({ status: 'published', public: true })
     *
     * // Array queries (IN operations)
     * await products.query({ category_id: [1, 2, 3], status: ['published', 'draft'] })
     *
     * // Range queries
     * await products.query({ price: { min: 10, max: 100 } })
     *
     * // String searches
     * await products.query({ title: { contains: 'shirt' } })
     *
     * // Combined queries
     * await products.query({
     *   status: 'published',
     *   price: { min: 20 },
     *   public: true,
     *   page: 1,
     *   page_size: 20
     * })
     */
    query(params?: ProductQueryParams): Promise<ApiResponse<ProductListResponse>>;
    /**
     * Create a query builder for products
     * Provides a fluent interface for building complex queries
     *
     * @example
     * const products = await sdk.products.createQueryBuilder()
     *   .whereStatus('published')
     *   .wherePriceRange(10, 100)
     *   .whereTitleContains('shirt')
     *   .wherePublic(true)
     *   .paginate(1, 20)
     *   .execute();
     */
    createQueryBuilder(initialQuery?: ProductQueryParams): ProductQueryBuilder;
}
//# sourceMappingURL=products.d.ts.map