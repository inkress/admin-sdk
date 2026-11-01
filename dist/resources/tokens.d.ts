import { HttpClient } from '../client';
import { Token, CreateTokenData, ApiResponse } from '../types';
import { TokenQueryBuilder } from '../utils/query-builders';
import { TokenFilterParams, TokenQueryParams, TokenListResponse } from '../types/resources';
/**
 * Tokens Resource
 *
 * ⚠️ LIMITED ACCESS WARNING:
 * This resource is primarily for super_admin and platform_affiliate roles.
 * organisation_admin has limited access (view/list/create/delete only, no update).
 * Use with caution and be aware of permission restrictions.
 */
export declare class TokensResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * Convert user-facing data to internal format
     */
    private translateToInternal;
    /**
     * List tokens with filtering
     */
    list(params?: TokenFilterParams): Promise<ApiResponse<TokenListResponse>>;
    /**
     * Get token by ID
     */
    get(id: number): Promise<ApiResponse<Token>>;
    /**
     * Create a new token
     */
    create(data: CreateTokenData): Promise<ApiResponse<Token>>;
    /**
     * Delete a token
     */
    delete(id: number): Promise<ApiResponse<void>>;
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
    query(params: TokenQueryParams): Promise<ApiResponse<TokenListResponse>>;
    /**
     * Create a fluent query builder for tokens
     *
     * @example
     * const tokens = await sdk.tokens.createQueryBuilder()
     *   .whereEnabledEquals(true)
     *   .whereKindIn([1, 2])
     *   .execute();
     */
    createQueryBuilder(): TokenQueryBuilder;
}
//# sourceMappingURL=tokens.d.ts.map