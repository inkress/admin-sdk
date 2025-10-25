import { HttpClient } from '../client';
import { Category, CreateCategoryData, UpdateCategoryData, ApiResponse, PaginationParams } from '../types';
export interface CategoryListParams extends PaginationParams {
    search?: string;
    kind?: number;
    parent_id?: number;
    limit?: number;
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
     * List categories with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: CategoryListParams): Promise<ApiResponse<CategoryListResponse>>;
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
//# sourceMappingURL=tokens.d.ts.map