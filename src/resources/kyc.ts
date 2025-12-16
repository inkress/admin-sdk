import { HttpClient } from '../client';
import {
  KycRequest,
  CreateKycRequestData,
  UpdateKycRequestData,
  ApiResponse,
  KycKind,
  KycStatus,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { KycQueryBuilder } from '../utils/query-builders';

export interface KycRequestListParams {
  // Filters
  id?: number | number[];
  status?: KycStatus | KycStatus[] | number | number[];
  kind?: KycKind | KycKind[] | number | number[];
  subject_id?: number | number[];
  user_id?: number | number[];
  
  // Date filters
  inserted_at?: string | { after?: string; before?: string; on?: string };
  updated_at?: string | { after?: string; before?: string; on?: string };
  
  // Pagination
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  
  // Ordering
  order_by?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  
  // Search
  q?: string;
  search?: string;
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

// Field type definitions for query validation
const KYC_FIELD_TYPES = {
  id: 'number',
  status: 'number',
  kind: 'number',
  subject_id: 'number',
  user_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

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

export interface CreateKycRequestPayload<T> {
  kind: 'limit_increase' | 'document_submission' | 'bank_info_update';
  data: T;
}

export class KycResource {
  constructor(private client: HttpClient) {}

  /**
   * List KYC records with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   * 
   * @example
   * await kyc.list({ status: 'pending' })
   */
  async list(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>> {
    return this.client.get<KycRequestListResponse>('/legal_requests', params);
  }

  /**
   * Query KYC records with advanced filtering
   * Supports all query system features (ranges, arrays, date ranges, etc.)
   * 
   * @example
   * await kyc.query({ status: ['pending', 'in_review'], inserted_at: { after: '2024-01-01' } })
   */
  async query(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>> {
    const processedQuery = processQuery(params || {}, KYC_FIELD_TYPES, { validate: true, context: 'legal_request' });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for KYC requests
   * 
   * @example
   * await sdk.kyc.createQueryBuilder().whereStatus('pending').execute()
   */
  createQueryBuilder(initialQuery?: KycRequestListParams): KycQueryBuilder {
    return new KycQueryBuilder(this, initialQuery);
  }

  /**
   * List KYC records with pagination and filtering (alias for list)
   * @deprecated Use list() or query() instead
   * Requires Client-Id header to be set in the configuration
   */
  async listRequests(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>> {
    return this.list(params);
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
  async requestLimitIncrease(data: CreateKycRequestPayload<LimitIncreaseRequestData>): Promise<ApiResponse<KycRequest>> {
    return this.client.post<KycRequest>('/legal_requests', data);
  }

  /**
   * Upload a document for KYC verification
   * Requires Client-Id header to be set in the configuration
   */
  async uploadDocument(data: CreateKycRequestPayload<DocumentSubmissionRequestData>): Promise<ApiResponse<KycRequest>> {
    return this.client.post<KycRequest>('/legal_requests', data);
  }

  /**
   * Update bank information
   * Requires Client-Id header to be set in the configuration
   */
  async updateBankInfo(data: CreateKycRequestPayload<BankInfoUpdateRequestData>): Promise<ApiResponse<KycRequest>> {
    return this.client.post<KycRequest>('/legal_requests', data);
  }
}
