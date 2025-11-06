import { HttpClient } from '../client';
import { Category, CreateCategoryData, UpdateCategoryData, ApiResponse, BaseFilterParams, CategoryKind } from '../types';
import { KindKey } from '../utils/translators';
export interface CategoryFilterParams extends BaseFilterParams {
    search?: string;
    kind?: CategoryKind | KindKey | number;
    parent_id?: number;
    limit?: number;
    id?: number;
    name?: string;
    description?: string;
    kind_id?: number;
    uid?: string;
    inserted_at?: string;
    updated_at?: string;
}
export interface CategoryListResponse {
    entries: Category[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
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
     * Delete a category
     * Requires Client-Id header to be set in the configuration
     * Note: Categories with assigned products or child categories cannot be deleted
     */
    delete(id: number): Promise<ApiResponse<void>>;
}
//# sourceMappingURL=categories.d.ts.map