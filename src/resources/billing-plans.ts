import { HttpClient } from '../client';
import {
  BillingPlan,
  CreateBillingPlanData,
  UpdateBillingPlanData,
  ApiResponse,
  InternalBillingPlan,
  BillingPlanKind,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { BillingPlanQueryBuilder } from '../utils/query-builders';
import {
  BillingPlanFilterParams,
  BillingPlanQueryParams,
  BillingPlanListResponse,
  BILLING_PLAN_FIELD_TYPES,
} from '../types/resources';

/**
 * @deprecated Use BillingPlanFilterParams from types/resources instead
 */
export interface LegacyBillingPlanFilterParams {
  // Legacy interface - kept for backward compatibility
}

export class BillingPlansResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal billing plan data (integers) to user-facing data (strings)
   */
  private translateToUserFacing(internal: InternalBillingPlan): BillingPlan {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_plan') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_plan') as BillingPlanKind,
    };
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: BillingPlanFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toInteger(params.status as StatusKey);
    }
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind as BillingPlanKind | KindKey, 'billing_plan');
    }
    
    return translated;
  }

  /**
   * Translate billing plan data for API (contextual strings to integers)
   */
  private translateToInternal(data: CreateBillingPlanData | UpdateBillingPlanData): any {
    const internal: any = { ...data };
    
    // Translate kind if present and is a string
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind as BillingPlanKind | KindKey, 'billing_plan');
    }
    
    // Translate status if present and is a string (for updates)
    if ('status' in data && data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toInteger(data.status as StatusKey);
    }
    
    return internal;
  }

  /**
   * List billing plans with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: BillingPlanFilterParams): Promise<ApiResponse<BillingPlanListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalBillingPlan[]; page_info: any }>('/billing_plans', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(plan => this.translateToUserFacing(plan));
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
   * Get a specific billing plan by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<BillingPlan>> {
    const response = await this.client.get<InternalBillingPlan>(`/billing_plans/${id}`);
    
    if (response.result) {
      const translatedPlan = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedPlan
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateBillingPlanData): Promise<ApiResponse<BillingPlan>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.post<InternalBillingPlan>('/billing_plans', internalData);
    
    if (response.result) {
      const translatedPlan = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedPlan
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Update an existing billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateBillingPlanData): Promise<ApiResponse<BillingPlan>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.put<InternalBillingPlan>(`/billing_plans/${id}`, internalData);
    
    if (response.result) {
      const translatedPlan = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedPlan
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Delete a billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/billing_plans/${id}`);
  }

  /**
   * Query billing plans with enhanced query support
   * @example
   * await billingPlans.query({ kind: 'subscription', public: true })
   */
  async query(params?: BillingPlanQueryParams): Promise<ApiResponse<BillingPlanListResponse>> {
    const processedQuery = processQuery(params || {}, BILLING_PLAN_FIELD_TYPES, { validate: true });
    const translatedQuery = this.translateFilters(processedQuery);
    const response = await this.client.get<{ entries: InternalBillingPlan[]; page_info: any }>('/billing_plans', translatedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(plan => this.translateToUserFacing(plan));
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
   * Create a query builder for billing plans
   * @example
   * await sdk.billingPlans.createQueryBuilder().whereKind('subscription').execute()
   */
  createQueryBuilder(initialQuery?: BillingPlanQueryParams): BillingPlanQueryBuilder {
    return new BillingPlanQueryBuilder(this, initialQuery);
  }
}
