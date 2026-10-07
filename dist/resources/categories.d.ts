import { HttpClient } from '../client';
import { Category, CreateCategoryData, UpdateCategoryData, ApiResponse } from '../types';
import { CategoryQueryBuilder } from '../utils/query-builders';
import { CategoryFilterParams, CategoryQueryParams, CategoryListResponse } from '../types/resources';
/**
 * @deprecated Use CategoryFilterParams from types/resources instead
 */
export interface LegacyCategoryFilterParams {
}
export declare class CategoriesResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal category data (integers) to user-facing data (strings)
     */
    private translateCategoryToUserFacing;
    /**
     * Convert user-facing category data (strings) to internal data (integers)
     */
    private translateCategoryToInternal;
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List categories with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: CategoryFilterParams): Promise<ApiResponse<CategoryListResponse>>;
    /**
     * Get a specific category by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<Category>>;
    /**
     * Create a new category
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateCategoryData): Promise<ApiResponse<Category>>;
    /**
     * Update an existing category
     * Requires Client-Id header to be set in the configuration
     * Note: parent_id is immutable and cannot be changed after creation
     */
    update(id: number, data: UpdateCategoryData): Promise<ApiResponse<Category>>;
    /**
     * Query categories with enhanced query support
     * @example
     * await categories.query({ kind: 'published', parent_id: null })
     */
    query(params?: CategoryQueryParams): Promise<ApiResponse<CategoryListResponse>>;
    /**
     * Create a query builder for categories
     * @example
     * await sdk.categories.createQueryBuilder().whereKind('published').execute()
     */
    createQueryBuilder(initialQuery?: CategoryQueryParams): CategoryQueryBuilder;
}
//# sourceMappingURL=categories.d.ts.map