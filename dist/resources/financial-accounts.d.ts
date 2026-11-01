import { HttpClient } from '../client';
import { FinancialAccount, CreateFinancialAccountData, UpdateFinancialAccountData, ApiResponse } from '../types';
import { FinancialAccountQueryBuilder } from '../utils/query-builders';
import { FinancialAccountFilterParams, FinancialAccountQueryParams, FinancialAccountListResponse } from '../types/resources';
export declare class FinancialAccountsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List financial accounts with filtering
     */
    list(params?: FinancialAccountFilterParams): Promise<ApiResponse<FinancialAccountListResponse>>;
    /**
     * Get financial account by ID
     */
    get(id: number): Promise<ApiResponse<FinancialAccount>>;
    /**
     * Create a new financial account
     */
    create(data: CreateFinancialAccountData): Promise<ApiResponse<FinancialAccount>>;
    /**
     * Update a financial account
     */
    update(id: number, data: UpdateFinancialAccountData): Promise<ApiResponse<FinancialAccount>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const accounts = await sdk.financialAccounts.query({
     *   type: 'bank',
     *   active: true,
     *   provider: { contains: 'stripe' }
     * });
     */
    query(params: FinancialAccountQueryParams): Promise<ApiResponse<FinancialAccountListResponse>>;
    /**
     * Create a fluent query builder for financial accounts
     *
     * @example
     * const accounts = await sdk.financialAccounts.createQueryBuilder()
     *   .whereTypeEquals('bank')
     *   .whereActiveEquals(true)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder(): FinancialAccountQueryBuilder;
}
//# sourceMappingURL=financial-accounts.d.ts.map