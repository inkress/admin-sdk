import { HttpClient } from '../client';
import { KycRequest, ApiResponse, KycKind, KycStatus } from '../types';
import { KycQueryBuilder } from '../utils/query-builders';
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
}
//# sourceMappingURL=kyc.d.ts.map