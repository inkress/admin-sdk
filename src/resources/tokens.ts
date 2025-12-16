import { HttpClient } from '../client';
import {
  Token,
  CreateTokenData,
  UpdateTokenData,
  ApiResponse,
} from '../types';
import {
  KindTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { TokenQueryBuilder } from '../utils/query-builders';
import {
  TokenFilterParams,
  TokenQueryParams,
  TokenListResponse,
  TOKEN_FIELD_TYPES,
} from '../types/resources';

/**
 * Tokens Resource
 * 
 * ⚠️ LIMITED ACCESS WARNING:
 * This resource is primarily for super_admin and platform_affiliate roles.
 * organisation_admin has limited access (view/list/create/delete only, no update).
 * Use with caution and be aware of permission restrictions.
 */
export class TokensResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: TokenFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'token');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreateTokenData | UpdateTokenData): any {
    const internal: any = { ...data };
    
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'token');
    }
    
    return internal;
  }

  /**
   * List tokens with filtering
   */
  async list(params?: TokenFilterParams): Promise<ApiResponse<TokenListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<TokenListResponse>('/tokens', translatedParams);
  }

  /**
   * Get token by ID
   */
  async get(id: number): Promise<ApiResponse<Token>> {
    return this.client.get<Token>(`/tokens/${id}`);
  }

  /**
   * Create a new token
   */
  async create(data: CreateTokenData): Promise<ApiResponse<Token>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<Token>('/tokens', internalData);
  }

  /**
   * Delete a token
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/tokens/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const tokens = await sdk.tokens.query({
   *   enabled: true,
   *   kind: [1, 2],
   *   user_id: 123
   * });
   */
  async query(params: TokenQueryParams): Promise<ApiResponse<TokenListResponse>> {
    const processedQuery = processQuery(params, TOKEN_FIELD_TYPES, { validate: true, context: 'token' });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for tokens
   * 
   * @example
   * const tokens = await sdk.tokens.createQueryBuilder()
   *   .whereEnabledEquals(true)
   *   .whereKindIn([1, 2])
   *   .execute();
   */
  createQueryBuilder(): TokenQueryBuilder {
    return new TokenQueryBuilder(this);
  }
}
