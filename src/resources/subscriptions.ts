import { HttpClient } from '../client';
import {
  Subscription,
  SubscriptionPeriod,
  CreateSubscriptionData,
  SubscriptionLinkData,
  SubscriptionChargeData,
  ApiResponse,
  PaginationParams,
} from '../types';

export interface SubscriptionListParams extends PaginationParams {
  status?: number; // 1=pending, 2=active, 3=cancelled
  billing_plan_id?: number;
  customer_id?: number;
  limit?: number;
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
  plan_id: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSubscriptionLinkResponse {
  id: number;
  payment_urls: {
    short_link: string;
  };
  subscription: Subscription;
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
   * List billing subscriptions with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: SubscriptionListParams): Promise<ApiResponse<SubscriptionListResponse>> {
    return this.client.get<SubscriptionListResponse>('/billing_subscriptions', params);
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
