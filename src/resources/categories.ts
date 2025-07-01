import { HttpClient } from '../client';
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  ApiResponse,
  PaginationParams,
} from '../types';

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

export class CategoriesResource {
  constructor(private client: HttpClient) {}

  /**
   * List categories with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: CategoryListParams): Promise<ApiResponse<CategoryListResponse>> {
    return this.client.get<CategoryListResponse>('/categories', params);
  }

  /**
   * Get a specific category by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Category>> {
    return this.client.get<Category>(`/categories/${id}`);
  }

  /**
   * Create a new category
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    return this.client.post<Category>('/categories', data);
  }

  /**
   * Update an existing category
   * Requires Client-Id header to be set in the configuration
   * Note: parent_id is immutable and cannot be changed after creation
   */
  async update(id: number, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    return this.client.put<Category>(`/categories/${id}`, data);
  }

  /**
   * Delete a category
   * Requires Client-Id header to be set in the configuration
   * Note: Categories with assigned products or child categories cannot be deleted
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/categories/${id}`);
  }
}
