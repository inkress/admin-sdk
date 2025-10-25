import { HttpClient } from '../client';
import {
  Merchant,
  CreateMerchantData,
  UpdateMerchantData,
  ApiResponse,
  PaginationParams,
} from '../types';

export interface MerchantListParams extends PaginationParams {
  search?: string;
  status?: number;
  limit?: number;
}

export interface MerchantListResponse {
  entries: Merchant[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class MerchantsResource {
  constructor(private client: HttpClient) {}

  /**
   * List merchants with pagination and filtering
   */
  async list(params?: MerchantListParams): Promise<ApiResponse<MerchantListResponse>> {
    return this.client.get<MerchantListResponse>('/merchants', params);
  }

  /**
   * Get a specific merchant by ID
   */
  async get(id: number): Promise<ApiResponse<Merchant>> {
    return this.client.get<Merchant>(`/merchants/${id}`);
  }

  /**
   * Create a new merchant
   */
  async create(data: CreateMerchantData): Promise<ApiResponse<Merchant>> {
    return this.client.post<Merchant>('/merchants', data);
  }

  /**
   * Update an existing merchant
   */
  async update(id: number, data: UpdateMerchantData): Promise<ApiResponse<Merchant>> {
    return this.client.put<Merchant>(`/merchants/${id}`, data);
  }

  /**
   * Get merchant account balances
   */
  async balances(): Promise<ApiResponse> {
    return this.client.post(`/merchants/account/balances`, {});
  }

  /**
   * Get merchant subscription plan details
   */
  async subscription(): Promise<ApiResponse> {
    return this.client.post(`/merchants/account/plan`, {});
  }

  /**
   * Get list of merchant account invoices
   */
  async invoices(): Promise<ApiResponse> {
    return this.client.post(`/merchants/account/invoices`, {});
  }

  /**
   * Get a specific merchant invoice by ID
   */
  async invoice(invoiceId: string): Promise<ApiResponse> {
    return this.client.post(`/merchants/account/invoice/${invoiceId}`, {});
  }
  
}
