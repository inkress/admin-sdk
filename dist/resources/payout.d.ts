import { HttpClient } from '../client';
import { PayoutRequest, CreatePayoutRequestData, ApiResponse, BaseFilterParams } from '../types';
export interface PayoutRequestFilterParams extends BaseFilterParams {
    status?: number;
    requester_id?: number;
    limit?: number;
    id?: number;
    total?: number;
    balance_on_request?: number;
    reference_id?: string;
    evidence_file_id?: number;
    merchant_id?: number;
    type?: number;
    sub_type?: number;
    reviewer_id?: number;
    reviewed_at?: string;
    due_at?: string;
    fee_total?: number;
    currency_id?: number;
    inserted_at?: string;
    updated_at?: string;
}
export interface PayoutRequestListResponse {
    entries: PayoutRequest[];
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
export declare class PayoutResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List payout requests with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: PayoutRequestFilterParams): Promise<ApiResponse<PayoutRequestListResponse>>;
    /**
     * Get a specific payout request by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<PayoutRequest>>;
    /**
     * Create a new payout request
     * Requires Client-Id header to be set in the configuration
     */
    request(data: CreatePayoutRequestData): Promise<ApiResponse<PayoutRequest>>;
}
//# sourceMappingURL=payout.d.ts.map