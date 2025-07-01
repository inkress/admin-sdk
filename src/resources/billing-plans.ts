import { HttpClient } from '../client';
import {
  BillingPlan,
  CreateBillingPlanData,
  UpdateBillingPlanData,
  ApiResponse,
  PaginationParams,
} from '../types';

export interface BillingPlanListParams extends PaginationParams {
  status?: number; // 1=active, 2=inactive
  kind?: number; // 1=payments, 2=subscription
  limit?: number;
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
   * List billing plans with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: BillingPlanListParams): Promise<ApiResponse<BillingPlanListResponse>> {
    return this.client.get<BillingPlanListResponse>('/billing_plans', params);
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
