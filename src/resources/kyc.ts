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
import { StatusTranslator } from '../utils/translators';

/**
 * Entity types for KYC requirements
 */
export type EntityType = 'personal' | 'sole-trader' | 'llc' | 'non-profit' | 'alumni' | 'other';

/**
 * KYC document types
 */
export type KycDocumentType = 
  | 'Proof of Identity'
  | 'Proof of Address'
  | 'Proof of Bank Account Ownership'
  | 'Business Certificate'
  | 'Articles of Incorporation'
  | 'Annual Return'
  | 'Notice of Directors'
  | 'Notice of Secretary'
  | 'Tax Compliance Certificate';

/**
 * Document status for tracking submission state
 */
export interface KycDocumentStatus {
  document_type: KycDocumentType;
  required: boolean;
  submitted: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

/**
 * Complete KYC requirements and status for an entity
 */
export interface KycRequirements {
  entity_type: EntityType;
  required_documents: KycDocumentType[];
  document_statuses: KycDocumentStatus[];
  total_required: number;
  total_submitted: number;
  total_approved: number;
  total_rejected: number;
  total_pending: number;
  completion_percentage: number;
  is_complete: boolean;
}

/**
 * KYC document requirements by entity type
 * These are the standard documents required for each type of business entity
 */
export const KYC_DOCUMENT_REQUIREMENTS: Record<EntityType, KycDocumentType[]> = {
  personal: [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
  ],
  'sole-trader': [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
    'Business Certificate',
    'Articles of Incorporation',
  ],
  llc: [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
    'Business Certificate',
    'Articles of Incorporation',
    'Annual Return',
    'Notice of Directors',
    'Notice of Secretary',
    'Tax Compliance Certificate',
  ],
  'non-profit': [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
    'Business Certificate',
    'Articles of Incorporation',
    'Annual Return',
  ],
  alumni: [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
    'Business Certificate',
    'Articles of Incorporation',
    'Annual Return',
  ],
  other: [
    'Proof of Identity',
    'Proof of Address',
    'Proof of Bank Account Ownership',
    'Business Certificate',
    'Articles of Incorporation',
    'Annual Return',
    'Notice of Directors',
    'Notice of Secretary',
    'Tax Compliance Certificate',
  ],
};

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

export interface CreateKycRequestPayload<T> {
  kind: 'limit_increase' | 'document_submission';
  data: T;
}

/**
 * A minted merchant KYC verify link — a single-use, ~3-hour capability link you send to a
 * merchant so they complete identity verification. It is write-only (it cannot read KYC data).
 */
export interface KycVerifyLink {
  /** The URL to hand to the merchant to start the `/verify` capture flow. */
  verify_url: string;
  /** ISO-8601 expiry timestamp (~3 hours out), or null if not reported. */
  expires_at: string | null;
  /** Always true — the link becomes invalid once used. */
  single_use: boolean;
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
   * Mint a merchant-facing KYC `/verify` link for a merchant you own, to send the merchant so
   * they complete identity verification.
   *
   * Intended for integrator (organisation) tokens: the authenticated token must carry the
   * `kyc:write` scope and own `merchantId`. The returned link is a single-use, ~3-hour, write-only
   * capability — it can start the verify flow but can't read any KYC data. If the merchant needs a
   * fresh link (e.g. it expired), mint another.
   *
   * @param merchantId - The owned merchant to mint a verify link for
   * @returns `{ verify_url, expires_at, single_use }`
   *
   * @example
   * const { result } = await inkress.kyc.createVerifyLink(123);
   * // hand result.verify_url to your merchant (email/SMS/in-app)
   */
  async createVerifyLink(merchantId: number): Promise<ApiResponse<KycVerifyLink>> {
    return this.client.post<KycVerifyLink>(`/merchants/${merchantId}/kyc/verify-link`, {});
  }

  // ============================================================================
  // KYC DOCUMENT REQUIREMENTS & STATUS
  // ============================================================================

  /**
   * Get required KYC documents for a specific entity type
   * This is a client-side method that doesn't make an API call
   * 
   * @param entityType - The type of business entity
   * @returns Array of required document types
   * 
   * @example
   * const docs = kyc.getRequiredDocuments('llc');
   * // Returns: ['Proof of Identity', 'Proof of Address', ...]
   */
  getRequiredDocuments(entityType: EntityType): KycDocumentType[] {
    return [...KYC_DOCUMENT_REQUIREMENTS[entityType]];
  }

  /**
   * Get all KYC document requirements (without making an API call)
   * Useful for displaying the full list in your application
   * 
   * @returns Complete mapping of entity types to required documents
   * 
   * @example
   * const allRequirements = kyc.getAllRequirements();
   * console.log(allRequirements.llc); // ['Proof of Identity', ...]
   */
  getAllRequirements(): Record<EntityType, KycDocumentType[]> {
    return { ...KYC_DOCUMENT_REQUIREMENTS };
  }

  /**
   * Get KYC requirements and submission status for the authenticated merchant
   * Fetches all KYC requests and maps them to required documents
   * 
   * @param entityType - The merchant's business entity type
   * @returns Complete KYC requirements with submission status
   * 
   * @example
   * const status = await kyc.getRequirementsStatus('llc');
   * console.log(`Completion: ${status.completion_percentage}%`);
   * console.log(`Approved: ${status.total_approved}/${status.total_required}`);
   * 
   * // Check individual document status
   * status.document_statuses.forEach(doc => {
   *   console.log(`${doc.document_type}: ${doc.status || 'not submitted'}`);
   * });
   */
  async getRequirementsStatus(
    entityType: EntityType
  ): Promise<ApiResponse<KycRequirements>> {
    // Get required documents for this entity type
    const requiredDocuments = this.getRequiredDocuments(entityType);

    // Fetch all KYC requests for the authenticated merchant
    const params: KycRequestListParams = {
      kind: 'document_submission',
    };

    const response = await this.list(params);

    if (response.state === 'error' || !response.result) {
      return {
        state: 'error',
      } as ApiResponse<KycRequirements>;
    }

    const kycRequests = response.result.entries || [];

    // Map submitted documents
    const submittedDocs = new Map<KycDocumentType, KycRequest>();
    kycRequests.forEach(request => {
      const docType = request.data?.document_type as KycDocumentType;
      if (docType && requiredDocuments.includes(docType)) {
        // Keep the most recent submission for each document type
        const existing = submittedDocs.get(docType);
        if (!existing || new Date(request.inserted_at) > new Date(existing.inserted_at)) {
          submittedDocs.set(docType, request);
        }
      }
    });

    // Build document statuses
    const documentStatuses = requiredDocuments.map(docType => {
      const submission = submittedDocs.get(docType);
      
      if (!submission) {
        return {
          document_type: docType,
          required: true,
          submitted: false,
        } as KycDocumentStatus;
      }

      // Convert integer status to string using translator
      // The API returns status as a number, but the type says it's a string
      const statusString = StatusTranslator.toStringWithoutContext(
        submission.status as any as number, 
        'legal_request'
      );
      
      // Map to our simplified status types
      let status: 'pending' | 'approved' | 'rejected' | undefined;
      if (statusString) {
        if (statusString === 'pending' || statusString === 'in_review') {
          status = 'pending';
        } else if (statusString === 'approved') {
          status = 'approved';
        } else if (statusString === 'rejected') {
          status = 'rejected';
        }
      }

      const reviewedAt = submission.updated_at !== submission.inserted_at 
        ? submission.updated_at 
        : undefined;

      return {
        document_type: docType,
        required: true,
        submitted: true,
        status,
        submitted_at: submission.inserted_at,
        reviewed_at: reviewedAt,
        rejection_reason: submission.data?.rejection_reason,
      } as KycDocumentStatus;
    });

    // Calculate statistics
    const totalRequired = requiredDocuments.length;
    const totalSubmitted = documentStatuses.filter(d => d.submitted).length;
    const totalApproved = documentStatuses.filter(d => d.status === 'approved').length;
    const totalRejected = documentStatuses.filter(d => d.status === 'rejected').length;
    const totalPending = documentStatuses.filter(d => d.status === 'pending').length;
    const completionPercentage = totalRequired > 0 
      ? Math.round((totalApproved / totalRequired) * 100) 
      : 0;
    const isComplete = totalApproved === totalRequired;

    const requirements: KycRequirements = {
      entity_type: entityType,
      required_documents: requiredDocuments,
      document_statuses: documentStatuses,
      total_required: totalRequired,
      total_submitted: totalSubmitted,
      total_approved: totalApproved,
      total_rejected: totalRejected,
      total_pending: totalPending,
      completion_percentage: completionPercentage,
      is_complete: isComplete,
    };

    return {
      state: 'ok',
      result: requirements,
    };
  }

  /**
   * Check if all required documents have been approved for the authenticated merchant
   * 
   * @param entityType - The merchant's business entity type
   * @returns True if all required documents are approved
   * 
   * @example
   * const isComplete = await kyc.isKycComplete('llc');
   * if (isComplete) {
   *   console.log('Merchant is fully verified!');
   * }
   */
  async isKycComplete(entityType: EntityType): Promise<boolean> {
    const response = await this.getRequirementsStatus(entityType);
    return response.result?.is_complete || false;
  }

  /**
   * Get list of missing (not submitted or rejected) documents for the authenticated merchant
   * 
   * @param entityType - The merchant's business entity type
   * @returns Array of document types that need to be submitted or resubmitted
   * 
   * @example
   * const missing = await kyc.getMissingDocuments('llc');
   * if (missing.length > 0) {
   *   console.log('Please submit:', missing.join(', '));
   * }
   */
  async getMissingDocuments(
    entityType: EntityType
  ): Promise<KycDocumentType[]> {
    const response = await this.getRequirementsStatus(entityType);
    
    if (response.state === 'error' || !response.result) {
      return [];
    }

    return response.result.document_statuses
      .filter(doc => !doc.submitted || doc.status === 'rejected')
      .map(doc => doc.document_type);
  }
}
