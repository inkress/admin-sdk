import { HttpClient } from '../client';
import {
  Subscription,
  SubscriptionPeriod,
  CreateSubscriptionData,
  SubscriptionLinkData,
  SubscriptionChargeData,
  ApiResponse,
  PaginationParams,
  BaseFilterParams,
  SubscriptionStatus,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';

export interface SubscriptionListParams extends BaseFilterParams {
  // Common filters (note: 'q' field is available for general search via BaseFilterParams)
  status?: SubscriptionStatus | StatusKey | number; // Accept contextual, full string, and integer for compatibility
  billing_plan_id?: number;
  customer_id?: number;
  limit?: number;
  
  // Database field filters - any field from the billing_subscriptions table can be filtered
  id?: number;
  record_id?: number;
  record?: string;
  start_date?: string;
  end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  uid?: string;
  kind?: number;
  token?: string;
  inserted_at?: string;
  updated_at?: string;
}

export interface SubscriptionListResponse {
  entries: Subscription[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export interface CreateSubscriptionLinkData {
  reference_id: string;
  title: string;
  plan_uid: string;
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
  transaction: any;
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
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: SubscriptionListParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status as SubscriptionStatus | StatusKey, 'billing_subscription');
    }
    
    return translated;
  }

  /**
   * List billing subscriptions with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: SubscriptionListParams): Promise<ApiResponse<SubscriptionListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<SubscriptionListResponse>('/billing_subscriptions', translatedParams);
  }

  /**
   * Gets a billing subscription by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id?: number): Promise<ApiResponse<Subscription>> {
    return this.client.get<Subscription>(`/billing_subscriptions/${id}`);
  }

  /**
   * Create a subscription payment link
   * Requires Client-Id header to be set in the configuration
   */
  async createLink(data: CreateSubscriptionLinkData): Promise<ApiResponse<CreateSubscriptionLinkResponse>> {
    return this.client.post<CreateSubscriptionLinkResponse>('/billing_subscriptions/link', data);
  }

  /**
   * Charge an existing subscription
   * Requires Client-Id header to be set in the configuration
   */
  async charge(uid: string, data: ChargeSubscriptionData): Promise<ApiResponse<ChargeSubscriptionResponse>> {
    return this.client.post<ChargeSubscriptionResponse>(`/billing_subscriptions/${uid}/charge`, data);
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
  async cancel(uid: number, code: string): Promise<ApiResponse<any>> {
    return this.client.post<any>(`/billing_subscriptions/${uid}/cancel/${code}`);
  }
}
