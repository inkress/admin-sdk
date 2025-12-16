import { HttpClient } from '../client';
import {
  PaymentLink,
  CreatePaymentLinkData,
  UpdatePaymentLinkData,
  ApiResponse,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { PaymentLinkQueryBuilder } from '../utils/query-builders';
import {
  PaymentLinkFilterParams,
  PaymentLinkQueryParams,
  PaymentLinkListResponse,
  PAYMENT_LINK_FIELD_TYPES,
} from '../types/resources';

export class PaymentLinksResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: PaymentLinkFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'payment_link');
    }
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'payment_link');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreatePaymentLinkData | UpdatePaymentLinkData): any {
    const internal: any = { ...data };
    
    if ('status' in data && data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status, 'payment_link');
    }
    
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'payment_link');
    }
    
    return internal;
  }

  /**
   * List payment links with filtering
   */
  async list(params?: PaymentLinkFilterParams): Promise<ApiResponse<PaymentLinkListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<PaymentLinkListResponse>('/payment_links', translatedParams);
  }

  /**
   * Get payment link by ID
   */
  async get(id: number): Promise<ApiResponse<PaymentLink>> {
    return this.client.get<PaymentLink>(`/payment_links/${id}`);
  }

  /**
   * Create a new payment link
   */
  async create(data: CreatePaymentLinkData): Promise<ApiResponse<PaymentLink>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<PaymentLink>('/payment_links', internalData);
  }

  /**
   * Update a payment link
   */
  async update(id: number, data: UpdatePaymentLinkData): Promise<ApiResponse<PaymentLink>> {
    const internalData = this.translateToInternal(data);
    return this.client.put<PaymentLink>(`/payment_links/${id}`, internalData);
  }

  /**
   * Delete a payment link
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/payment_links/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * Returns a QueryBuilder that compiles to the appropriate filter format
   * 
   * @example
   * const links = await sdk.paymentLinks.query({
   *   total: { gte: 1000 },
   *   status: [1, 2],
   *   inserted_at: { gte: '2024-01-01' }
   * });
   */
  async query(params: PaymentLinkQueryParams): Promise<ApiResponse<PaymentLinkListResponse>> {
    const processedQuery = processQuery(params, PAYMENT_LINK_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for payment links
   * 
   * @example
   * const links = await sdk.paymentLinks.createQueryBuilder()
   *   .whereTotalGreaterThan(1000)
   *   .whereStatusIn([1, 2])
   *   .orderBy('inserted_at', 'desc')
   *   .limit(50)
   *   .execute();
   */
  createQueryBuilder(): PaymentLinkQueryBuilder {
    return new PaymentLinkQueryBuilder(this);
  }
}
