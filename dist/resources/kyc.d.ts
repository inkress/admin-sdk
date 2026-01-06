import { HttpClient } from '../client';
import { KycRequest, ApiResponse, KycKind, KycStatus } from '../types';
import { KycQueryBuilder } from '../utils/query-builders';
/**
 * Entity types for KYC requirements
 */
export type EntityType = 'personal' | 'sole-trader' | 'llc' | 'non-profit' | 'alumni' | 'other';
/**
 * KYC document types
 */
export type KycDocumentType = 'Proof of Identity' | 'Proof of Address' | 'Proof of Bank Account Ownership' | 'Business Certificate' | 'Articles of Incorporation' | 'Annual Return' | 'Notice of Directors' | 'Notice of Secretary' | 'Tax Compliance Certificate';
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
export declare const KYC_DOCUMENT_REQUIREMENTS: Record<EntityType, KycDocumentType[]>;
export interface KycRequestListParams {
    id?: number | number[];
    status?: KycStatus | KycStatus[] | number | number[];
    kind?: KycKind | KycKind[] | number | number[];
    subject_id?: number | number[];
    user_id?: number | number[];
    inserted_at?: string | {
        after?: string;
        before?: string;
        on?: string;
    };
    updated_at?: string | {
        after?: string;
        before?: string;
        on?: string;
    };
    page?: number;
    page_size?: number;
    per_page?: number;
    limit?: number;
    order_by?: string;
    sort?: string;
    order?: 'asc' | 'desc';
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
export declare class KycResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List KYC records with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     *
     * @example
     * await kyc.list({ status: 'pending' })
     */
    list(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>>;
    /**
     * Query KYC records with advanced filtering
     * Supports all query system features (ranges, arrays, date ranges, etc.)
     *
     * @example
     * await kyc.query({ status: ['pending', 'in_review'], inserted_at: { after: '2024-01-01' } })
     */
    query(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>>;
    /**
     * Create a fluent query builder for KYC requests
     *
     * @example
     * await sdk.kyc.createQueryBuilder().whereStatus('pending').execute()
     */
    createQueryBuilder(initialQuery?: KycRequestListParams): KycQueryBuilder;
    /**
     * List KYC records with pagination and filtering (alias for list)
     * @deprecated Use list() or query() instead
     * Requires Client-Id header to be set in the configuration
     */
    listRequests(params?: KycRequestListParams): Promise<ApiResponse<KycRequestListResponse>>;
    /**
     * Get a specific KYC request by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<KycRequest>>;
    /**
     * Request a limit increase
     * Requires Client-Id header to be set in the configuration
     */
    requestLimitIncrease(data: CreateKycRequestPayload<LimitIncreaseRequestData>): Promise<ApiResponse<KycRequest>>;
    /**
     * Upload a document for KYC verification
     * Requires Client-Id header to be set in the configuration
     */
    uploadDocument(data: CreateKycRequestPayload<DocumentSubmissionRequestData>): Promise<ApiResponse<KycRequest>>;
    /**
     * Update bank information
     * Requires Client-Id header to be set in the configuration
     */
    updateBankInfo(data: CreateKycRequestPayload<BankInfoUpdateRequestData>): Promise<ApiResponse<KycRequest>>;
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
    getRequiredDocuments(entityType: EntityType): KycDocumentType[];
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
    getAllRequirements(): Record<EntityType, KycDocumentType[]>;
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
    getRequirementsStatus(entityType: EntityType): Promise<ApiResponse<KycRequirements>>;
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
    isKycComplete(entityType: EntityType): Promise<boolean>;
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
    getMissingDocuments(entityType: EntityType): Promise<KycDocumentType[]>;
}
//# sourceMappingURL=kyc.d.ts.map