import { HttpClient } from '../client';
import {
  PaymentLink,
  InternalPaymentLink,
  CreatePaymentLinkData,
  UpdatePaymentLinkData,
  ApiResponse,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
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
   * Convert internal payment link data (integers) to user-facing data (strings)
   */
  private translateToUserFacing(internal: InternalPaymentLink): PaymentLink {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'payment_link') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'order') as KindKey,
    };
  }

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
    const response = await this.client.get<{ entries: InternalPaymentLink[]; page_info: any }>('/payment_links', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(link => this.translateToUserFacing(link));
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
   * Get payment link by ID
   */
  async get(id: number): Promise<ApiResponse<PaymentLink>> {
    const response = await this.client.get<InternalPaymentLink>(`/payment_links/${id}`);
    
    if (response.result) {
      const translatedLink = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedLink
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new payment link
   */
  async create(data: CreatePaymentLinkData): Promise<ApiResponse<PaymentLink>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.post<InternalPaymentLink>('/payment_links', internalData);
    
    if (response.result) {
      const translatedLink = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedLink
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Update a payment link
   */
  async update(id: number, data: UpdatePaymentLinkData): Promise<ApiResponse<PaymentLink>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.put<InternalPaymentLink>(`/payment_links/${id}`, internalData);
    
    if (response.result) {
      const translatedLink = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedLink
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
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
