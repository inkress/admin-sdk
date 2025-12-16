import { HttpClient } from '../client';
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  ApiResponse,
  InternalCategory,
  CategoryKind,
} from '../types';
import {
  KindTranslator,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { CategoryQueryBuilder } from '../utils/query-builders';
import {
  CategoryFilterParams,
  CategoryQueryParams,
  CategoryListResponse,
  CATEGORY_FIELD_TYPES,
} from '../types/resources';

/**
 * @deprecated Use CategoryFilterParams from types/resources instead
 */
export interface LegacyCategoryFilterParams {
  // Legacy interface - kept for backward compatibility
}

export class CategoriesResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal category data (integers) to user-facing data (strings)
   */
  private translateCategoryToUserFacing(internal: InternalCategory): Category {
    return {
      ...internal,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'product') as CategoryKind,
    };
  }

  /**
   * Convert user-facing category data (strings) to internal data (integers)
   */
  private translateCategoryToInternal(userFacing: CreateCategoryData | UpdateCategoryData): any {
    const internal: any = { ...userFacing };
    
    if ('kind' in userFacing && userFacing.kind) {
      if (typeof userFacing.kind === 'string') {
        internal.kind = KindTranslator.toIntegerWithContext(userFacing.kind as CategoryKind | KindKey, 'product');
      } else {
        internal.kind = userFacing.kind;
      }
    }
    
    return internal;
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: CategoryFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind as CategoryKind | KindKey, 'product');
    }
    
    return translated;
  }

  /**
   * List categories with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: CategoryFilterParams): Promise<ApiResponse<CategoryListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalCategory[]; page_info: any }>('/categories', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(category => this.translateCategoryToUserFacing(category));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.page_info
        }
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Get a specific category by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Category>> {
    const response = await this.client.get<InternalCategory>(`/categories/${id}`);
    
    if (response.result) {
      const translatedCategory = this.translateCategoryToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedCategory
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new category
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    const internalData = this.translateCategoryToInternal(data);
    const response = await this.client.post<InternalCategory>('/categories', internalData);
    
    if (response.result) {
      const translatedCategory = this.translateCategoryToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedCategory
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Update an existing category
   * Requires Client-Id header to be set in the configuration
   * Note: parent_id is immutable and cannot be changed after creation
   */
  async update(id: number, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    const internalData = this.translateCategoryToInternal(data);
    const response = await this.client.put<InternalCategory>(`/categories/${id}`, internalData);
    
    if (response.result) {
      const translatedCategory = this.translateCategoryToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedCategory
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Query categories with enhanced query support
   * @example
   * await categories.query({ kind: 'published', parent_id: null })
   */
  async query(params?: CategoryQueryParams): Promise<ApiResponse<CategoryListResponse>> {
    const processedQuery = processQuery(params || {}, CATEGORY_FIELD_TYPES, { validate: true });
    const translatedQuery = this.translateFilters(processedQuery);
    const response = await this.client.get<{ entries: InternalCategory[]; page_info: any }>('/categories', translatedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(c => this.translateCategoryToUserFacing(c));
      return {
        state: response.state,
        result: { entries: translatedEntries, page_info: response.result.page_info }
      };
    }
    
    return { state: response.state, result: response.result as any };
  }

  /**
   * Create a query builder for categories
   * @example
   * await sdk.categories.createQueryBuilder().whereKind('published').execute()
   */
  createQueryBuilder(initialQuery?: CategoryQueryParams): CategoryQueryBuilder {
    return new CategoryQueryBuilder(this, initialQuery);
  }
}
