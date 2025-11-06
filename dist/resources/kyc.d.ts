import { HttpClient } from '../client';
import { ApiResponse, BaseFilterParams } from '../types';
export interface KycRequestListParams extends BaseFilterParams {
    status?: number;
    subject_id?: number;
    user_id?: number;
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
}
export interface CreateKycRequestData<T> {
    kind: 'limit_increase' | 'bank_info_update' | 'document_submission';
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
export declare class KycResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List KYC records with pagination and filtering
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
    requestLimitIncrease(data: CreateKycRequestData<LimitIncreaseRequestData>): Promise<ApiResponse<KycRequest>>;
    /**
     * Request a bank information update
     * Requires Client-Id header to be set in the configuration
     */
    requestBankInfoUpdate(data: CreateKycRequestData<BankInfoUpdateRequestData>): Promise<ApiResponse<KycRequest>>;
    /**
     * Upload a document for KYC verification
     * Requires Client-Id header to be set in the configuration
     */
    uploadDocument(data: CreateKycRequestData<DocumentSubmissionRequestData>): Promise<ApiResponse<KycRequest>>;
}
//# sourceMappingURL=kyc.d.ts.map