import { HttpClient } from '../client';
import { ApiResponse, GenericResource } from '../types';

/**
 * Generic resource handler for any endpoint
 * Provides CRUD operations for resources not yet implemented with specific types
 */
export class GenericsResource {
  constructor(private client: HttpClient) {}

  /**
   * List resources from a generic endpoint
   * 
   * @example
   * const data = await sdk.generics.list('/subscription_periods', { status: 1 });
   */
  async list(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<GenericResource[]>> {
    return this.client.get<GenericResource[]>(endpoint, params);
  }

  /**
   * Get a single resource by ID from a generic endpoint
   * 
   * @example
   * const data = await sdk.generics.get('/subscription_periods', 123);
   */
  async get(endpoint: string, id: number): Promise<ApiResponse<GenericResource>> {
    return this.client.get<GenericResource>(`${endpoint}/${id}`);
  }

  /**
   * Create a new resource on a generic endpoint
   * 
   * @example
   * const data = await sdk.generics.create('/subscription_periods', { name: 'Monthly', days: 30 });
   */
  async create(endpoint: string, data: Record<string, any>): Promise<ApiResponse<GenericResource>> {
    return this.client.post<GenericResource>(endpoint, data);
  }

  /**
   * Update a resource on a generic endpoint
   * 
   * @example
   * const data = await sdk.generics.update('/subscription_periods', 123, { name: 'Monthly Premium' });
   */
  async update(endpoint: string, id: number, data: Record<string, any>): Promise<ApiResponse<GenericResource>> {
    return this.client.put<GenericResource>(`${endpoint}/${id}`, data);
  }

  /**
   * Delete a resource from a generic endpoint
   * 
   * @example
   * await sdk.generics.delete('/subscription_periods', 123);
   */
  async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${endpoint}/${id}`);
  }
}
