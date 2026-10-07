import { HttpClient } from '../client';
import {
  FinancialRequest,
  CreateFinancialRequestData,
  UpdateFinancialRequestData,
  ApiResponse,
} from '../types';
import {
  StatusTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { FinancialRequestQueryBuilder } from '../utils/query-builders';
import {
  FinancialRequestFilterParams,
  FinancialRequestQueryParams,
  FinancialRequestListResponse,
  FINANCIAL_REQUEST_FIELD_TYPES,
} from '../types/resources';

export class FinancialRequestsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: FinancialRequestFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'financial_request');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreateFinancialRequestData | UpdateFinancialRequestData): any {
    const internal: any = { ...data };
    
    if ('status' in data && data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status, 'financial_request');
    }
    
    return internal;
  }

  /**
   * List financial requests with filtering
   */
  async list(params?: FinancialRequestFilterParams): Promise<ApiResponse<FinancialRequestListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<FinancialRequestListResponse>('/financial_requests', translatedParams);
  }

  /**
   * Get financial request by ID
   */
  async get(id: number): Promise<ApiResponse<FinancialRequest>> {
    return this.client.get<FinancialRequest>(`/financial_requests/${id}`);
  }

  /**
   * Create a new financial request
   */
  async create(data: CreateFinancialRequestData): Promise<ApiResponse<FinancialRequest>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<FinancialRequest>('/financial_requests', internalData);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const requests = await sdk.financialRequests.query({
   *   status: [1, 2],
   *   total: { gte: 5000 },
   *   merchant_id: 123
   * });
   */
  async query(params: FinancialRequestQueryParams): Promise<ApiResponse<FinancialRequestListResponse>> {
    const processedQuery = processQuery(params, FINANCIAL_REQUEST_FIELD_TYPES, { validate: true, context: 'financial_request' });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for financial requests
   * 
   * @example
   * const requests = await sdk.financialRequests.createQueryBuilder()
   *   .whereStatusIn([1, 2])
   *   .whereTotalGreaterThan(5000)
   *   .orderBy('inserted_at', 'desc')
   *   .execute();
   */
  createQueryBuilder(): FinancialRequestQueryBuilder {
    return new FinancialRequestQueryBuilder(this);
  }
}
