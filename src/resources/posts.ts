import { HttpClient } from '../client';
import {
  Post,
  CreatePostData,
  UpdatePostData,
  ApiResponse,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { PostQueryBuilder } from '../utils/query-builders';
import {
  PostFilterParams,
  PostQueryParams,
  PostListResponse,
  POST_FIELD_TYPES,
} from '../types/resources';

export class PostsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: PostFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'post');
    }
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'post');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreatePostData | UpdatePostData): any {
    const internal: any = { ...data };
    
    if ('status' in data && data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status, 'post');
    }
    
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'post');
    }
    
    return internal;
  }

  /**
   * List posts with filtering
   */
  async list(params?: PostFilterParams): Promise<ApiResponse<PostListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<PostListResponse>('/posts', translatedParams);
  }

  /**
   * Get post by ID
   */
  async get(id: number): Promise<ApiResponse<Post>> {
    return this.client.get<Post>(`/posts/${id}`);
  }

  /**
   * Create a new post
   */
  async create(data: CreatePostData): Promise<ApiResponse<Post>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<Post>('/posts', internalData);
  }

  /**
   * Update a post
   */
  async update(id: number, data: UpdatePostData): Promise<ApiResponse<Post>> {
    const internalData = this.translateToInternal(data);
    return this.client.put<Post>(`/posts/${id}`, internalData);
  }

  /**
   * Delete a post
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/posts/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const posts = await sdk.posts.query({
   *   status: [1, 2],
   *   kind: [1],
   *   author_id: 123
   * });
   */
  async query(params: PostQueryParams): Promise<ApiResponse<PostListResponse>> {
    const processedQuery = processQuery(params, POST_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for posts
   * 
   * @example
   * const posts = await sdk.posts.createQueryBuilder()
   *   .whereStatusIn([1, 2])
   *   .whereAuthorIdEquals(123)
   *   .execute();
   */
  createQueryBuilder(): PostQueryBuilder {
    return new PostQueryBuilder(this);
  }
}
