import { HttpClient } from '../client';
import {
  Fee,
  CreateFeeData,
  UpdateFeeData,
  ApiResponse,
} from '../types';
import {
  KindTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { FeeQueryBuilder } from '../utils/query-builders';
import {
  FeeFilterParams,
  FeeQueryParams,
  FeeListResponse,
  FEE_FIELD_TYPES,
} from '../types/resources';

export class FeesResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: FeeFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'fee');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreateFeeData | UpdateFeeData): any {
    const internal: any = { ...data };
    
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'fee');
    }
    
    return internal;
  }

  /**
   * List fees with filtering
   */
  async list(params?: FeeFilterParams): Promise<ApiResponse<FeeListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<FeeListResponse>('/fees', translatedParams);
  }

  /**
   * Get fee by ID
   */
  async get(id: number): Promise<ApiResponse<Fee>> {
    return this.client.get<Fee>(`/fees/${id}`);
  }

  /**
   * Create a new fee
   */
  async create(data: CreateFeeData): Promise<ApiResponse<Fee>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<Fee>('/fees', internalData);
  }

  /**
   * Update a fee
   */
  async update(id: number, data: UpdateFeeData): Promise<ApiResponse<Fee>> {
    const internalData = this.translateToInternal(data);
    return this.client.put<Fee>(`/fees/${id}`, internalData);
  }

  /**
   * Delete a fee
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/fees/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const fees = await sdk.fees.query({
   *   kind: [1, 2],
   *   total: { gte: 100 },
   *   currency_code: 'USD'
   * });
   */
  async query(params: FeeQueryParams): Promise<ApiResponse<FeeListResponse>> {
    const processedQuery = processQuery(params, FEE_FIELD_TYPES, { validate: true, context: 'fee' });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for fees
   * 
   * @example
   * const fees = await sdk.fees.createQueryBuilder()
   *   .whereKindIn([1, 2])
   *   .whereTotalGreaterThan(100)
   *   .execute();
   */
  createQueryBuilder(): FeeQueryBuilder {
    return new FeeQueryBuilder(this);
  }
}
