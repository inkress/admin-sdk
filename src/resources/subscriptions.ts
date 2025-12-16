import { HttpClient } from '../client';
import {
  Subscription,
  InternalSubscription,
  InternalBillingPlan,
  BillingPlan,
  BillingPlanKind,
  SubscriptionPeriod,
  CreateSubscriptionData,
  SubscriptionLinkData,
  SubscriptionChargeData,
  SubscriptionUsageResponse,
  SubscriptionCancelResponse,
  ApiResponse,
  PaginationParams,
  SubscriptionStatus,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { SubscriptionQueryBuilder } from '../utils/query-builders';
import {
  SubscriptionFilterParams,
  SubscriptionQueryParams,
  SubscriptionListResponse,
  SUBSCRIPTION_FIELD_TYPES,
} from '../types/resources';

export interface CreateSubscriptionLinkData {
  reference_id: string;
  title: string;
  plan_uid: string;
  meta_data?: Record<string, any>;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSubscriptionLinkResponse {
  status: 'paid';
  total: number;
  reference: string;
  currency: string;
  subscription_status: string;
  subscription_uid: string;
}

export interface ChargeSubscriptionData {
  reference_id: string;
  total: number;
  title: string;
}

export interface ChargeSubscriptionResponse {
  id: number;
  payment_urls: {
    short_link: string;
  };
  transaction: {
    id: number;
    amount: number;
    status: string;
    reference_id: string;
    [key: string]: any;
  };
}

export interface SubscriptionPeriodsParams extends PaginationParams {
  status?: 'pending' | 'paid' | 'failed' | 'cancelled';
  limit?: number;
}

export interface SubscriptionPeriodsResponse {
  entries: SubscriptionPeriod[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class SubscriptionsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal subscription data (integers) to user-facing data (strings)
   */
  private translateToUserFacing(internal: InternalSubscription): Subscription {
    const result: any = {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_subscription') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_subscription') as KindKey,
    };
    
    // Translate nested billing plan if present
    if (internal.billing_plan) {
      result.billing_plan = this.translateBillingPlanToUserFacing(internal.billing_plan);
    }
    
    return result;
  }

  /**
   * Convert internal billing plan data to user-facing billing plan
   */
  private translateBillingPlanToUserFacing(internal: InternalBillingPlan): BillingPlan {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_plan') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_plan') as BillingPlanKind,
    };
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   * @deprecated This method is no longer needed as processQuery handles translation
   */
  private translateFilters(params?: SubscriptionFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status as SubscriptionStatus | StatusKey, 'billing_subscription');
    }
    
    return translated;
  }

  /**
   * Translate subscription data for API (contextual strings to integers)
   */
  private translateToInternal(data: CreateSubscriptionData): any {
    const internal: any = { ...data };
    
    // Translate status if present and is a string
    if (data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status as StatusKey, 'billing_subscription');
    }
    
    // Translate kind if present and is a string
    if (data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toInteger(data.kind as KindKey);
    }
    
    return internal;
  }

  /**
   * List billing subscriptions with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: SubscriptionFilterParams): Promise<ApiResponse<SubscriptionListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalSubscription[]; page_info: any }>('/billing_subscriptions', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(sub => this.translateToUserFacing(sub));
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
   * Gets a billing subscription by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id?: number): Promise<ApiResponse<Subscription>> {
    const response = await this.client.get<InternalSubscription>(`/billing_subscriptions/${id}`);
    
    if (response.result) {
      const translatedSub = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedSub
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new subscription
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.post<InternalSubscription>('/billing_subscriptions', internalData);
    
    if (response.result) {
      const translatedSub = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedSub
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Delete a subscription
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/billing_subscriptions/${id}`);
  }

  /**
   * Create a subscription payment link
   * Requires Client-Id header to be set in the configuration
   */
  async createLink(data: CreateSubscriptionLinkData): Promise<ApiResponse<CreateSubscriptionLinkResponse>> {
    return this.client.post<CreateSubscriptionLinkResponse>('/billing_subscriptions/link', {...data, plan_id: data.plan_uid });
  }

  /**
   * Charge an existing subscription
   * Requires Client-Id header to be set in the configuration
   */
  async charge(uid: string, data: ChargeSubscriptionData): Promise<ApiResponse<ChargeSubscriptionResponse>> {
    return this.client.post<ChargeSubscriptionResponse>(`/billing_subscriptions/${uid}/charge`, data);
  }

  /**
   * Record usage for a subscription (for usage-based billing)
   * Requires Client-Id header to be set in the configuration
   */
  async usage(uid: string, data: SubscriptionChargeData): Promise<ApiResponse<SubscriptionUsageResponse>> {
    return this.client.post<SubscriptionUsageResponse>(`/billing_subscriptions/${uid}/usage`, data);
  }

  /**
   * Get subscription billing periods
   * Requires Client-Id header to be set in the configuration
   */
  async getPeriods(uid: string, params?: SubscriptionPeriodsParams): Promise<ApiResponse<SubscriptionPeriodsResponse>> {
    return this.client.get<SubscriptionPeriodsResponse>(`/billing_subscriptions/${uid}/periods`, params);
  }

  /**
   * Cancel a subscription
   * Requires Client-Id header to be set in the configuration
   */
  async cancel(uid: number, code: string): Promise<ApiResponse<SubscriptionCancelResponse>> {
    return this.client.post<SubscriptionCancelResponse>(`/billing_subscriptions/${uid}/cancel/${code}`);
  }

  /**
   * Query subscriptions with enhanced query support
   * @example
   * await subscriptions.query({ status: 'active', billing_plan_id: 123 })
   */
  async query(params?: SubscriptionQueryParams): Promise<ApiResponse<SubscriptionListResponse>> {
    const processedQuery = processQuery(params || {}, SUBSCRIPTION_FIELD_TYPES, { validate: true, context: 'billing_subscription' });
    return this.client.get<SubscriptionListResponse>('/billing_subscriptions', processedQuery);
  }

  /**
   * Create a query builder for subscriptions
   * @example
   * await sdk.subscriptions.createQueryBuilder().whereStatus('active').execute()
   */
  createQueryBuilder(initialQuery?: SubscriptionQueryParams): SubscriptionQueryBuilder {
    return new SubscriptionQueryBuilder(this, initialQuery);
  }
}
