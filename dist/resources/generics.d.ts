import { HttpClient } from '../client';
import { ApiResponse, GenericResource } from '../types';
/**
 * Generic resource handler for any endpoint
 * Provides CRUD operations for resources not yet implemented with specific types
 */
export declare class GenericsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List resources from a generic endpoint
     *
     * @example
     * const data = await sdk.generics.list('/subscription_periods', { status: 1 });
     */
    list(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<GenericResource[]>>;
    /**
     * Query resources from a generic endpoint with advanced filtering
     * Supports all query system features (ranges, arrays, date ranges, etc.)
     *
     * @example
     * await sdk.generics.query('/subscription_periods', {
     *   status: [1, 2],
     *   inserted_at: { after: '2024-01-01' }
     * })
     */
    query(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<GenericResource[]>>;
    /**
     * Get a single resource by ID from a generic endpoint
     *
     * @example
     * const data = await sdk.generics.get('/subscription_periods', 123);
     */
    get(endpoint: string, id: number): Promise<ApiResponse<GenericResource>>;
    /**
     * Create a new resource on a generic endpoint
     *
     * @example
     * const data = await sdk.generics.create('/subscription_periods', { name: 'Monthly', days: 30 });
     */
    create(endpoint: string, data: Record<string, any>): Promise<ApiResponse<GenericResource>>;
    /**
     * Update a resource on a generic endpoint
     *
     * @example
     * const data = await sdk.generics.update('/subscription_periods', 123, { name: 'Monthly Premium' });
     */
    update(endpoint: string, id: number, data: Record<string, any>): Promise<ApiResponse<GenericResource>>;
    /**
     * Delete a resource from a generic endpoint
     *
     * @example
     * await sdk.generics.delete('/subscription_periods', 123);
     */
    delete(endpoint: string, id: number): Promise<ApiResponse<void>>;
}
//# sourceMappingURL=generics.d.ts.map