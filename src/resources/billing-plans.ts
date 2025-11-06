import { HttpClient } from '../client';
import {
  BillingPlan,
  CreateBillingPlanData,
  UpdateBillingPlanData,
  ApiResponse,
  BaseFilterParams,
  InternalBillingPlan,
  BillingPlanKind,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';

export interface BillingPlanFilterParams extends BaseFilterParams {
  // Common filters (note: 'q' field is available for general search via BaseFilterParams)
  status?: StatusKey | number; // Accept both string and integer for compatibility
  kind?: BillingPlanKind | KindKey | number; // Accept contextual, full string, and integer for compatibility
  limit?: number;
  
  // Database field filters - any field from the billing_plans table can be filtered
  id?: number;
  name?: string;
  description?: string;
  flat_rate?: number;
  transaction_fee?: number;
  transaction_percentage?: number;
  transaction_percentage_additional?: number;
  transaction_minimum_fee?: number;
  minimum_fee?: number;
  duration?: number;
  billing_cycle?: number;
  trial_period?: number;
  charge_strategy?: number;
  auto_charge?: boolean;
  public?: boolean;
  payout_period?: number;
  payout_value_limit?: number;
  payout_percentage_limit?: number;
  uid?: string;
  currency_id?: number;
  payment_provider_id?: number;
  inserted_at?: string;
  updated_at?: string;
}

export interface BillingPlanListResponse {
  entries: BillingPlan[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class BillingPlansResource {
  constructor(private client: HttpClient) {}

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
   * List billing plans with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: BillingPlanFilterParams): Promise<ApiResponse<BillingPlanListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<BillingPlanListResponse>('/billing_plans', translatedParams);
  }

  /**
   * Get a specific billing plan by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<BillingPlan>> {
    return this.client.get<BillingPlan>(`/billing_plans/${id}`);
  }

  /**
   * Create a new billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateBillingPlanData): Promise<ApiResponse<BillingPlan>> {
    return this.client.post<BillingPlan>('/billing_plans', data);
  }

  /**
   * Update an existing billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateBillingPlanData): Promise<ApiResponse<BillingPlan>> {
    return this.client.put<BillingPlan>(`/billing_plans/${id}`, data);
  }

  /**
   * Delete a billing plan
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/billing_plans/${id}`);
  }
}
