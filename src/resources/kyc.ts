import { HttpClient } from '../client';
import {
  Product,
  ApiResponse,
  PaginationParams,
  BaseFilterParams,
  // CreateKycRequestData,
  // KycRequest,
} from '../types';

export interface KycRequestListParams extends BaseFilterParams {
  // Common filters (note: 'q' field is available for general search via BaseFilterParams)
  status?: number;
  subject_id?: number;
  user_id?: number;
  
  // Database field filters - any field from the legal_requests table can be filtered
  id?: number;
  kind?: number;
  inserted_at?: string;
  updated_at?: string;
}

export interface KycRequestListResponse {
  entries: KycRequest[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export interface LimitIncreaseRequestData {
  requested_limit: number;
  reason: string;
}

export interface DocumentSubmissionRequestData {
  document_type: string;
  document_url: string;
  [key: string]: string;
}

export interface BankInfoUpdateRequestData {
  account_holder_name: string;
  account_holder_type: "Personal" | "Business";
  account_number: number;
  account_type: "Checking" | "Saving";
  bank_name: string;
  branch_name: string;
  branch_code?: string;
  routing_number?: string;
  swift_code?: string;
  country_code: string;
  currency_code: string;
}

export interface CreateKycRequestData<T> {
  kind: 'limit_increase' | 'document_submission';
  data: T;
}

export interface KycRequest {
  kind: number;
  subject_id: number;
  user_id: number;
  data: Record<string, any>;
  status: number;
  created_at: string;
  updated_at: string;
}

export class KycResource {
  constructor(private client: HttpClient) {}

  /**
   * List KYC records with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async listRequests(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>> {
    return this.client.get<KycRequestListResponse>('/legal_requests', params);
  }

  /**
   * Get a specific KYC request by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<KycRequest>> {
    return this.client.get<KycRequest>(`/legal_requests/${id}`);
  }

  /**
   * Request a limit increase
   * Requires Client-Id header to be set in the configuration
   */
  async requestLimitIncrease(data: CreateKycRequestData<LimitIncreaseRequestData>): Promise<ApiResponse<KycRequest>> {
    return this.client.post<KycRequest>('/legal_requests', data);
  }

  /**
   * Upload a document for KYC verification
   * Requires Client-Id header to be set in the configuration
   */
  async uploadDocument(data: CreateKycRequestData<DocumentSubmissionRequestData>): Promise<ApiResponse<KycRequest>> {
    return this.client.post<KycRequest>('/legal_requests', data);
  }
}
