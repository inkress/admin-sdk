import { HttpClient } from '../client';
import { TransactionEntry, ApiResponse } from '../types';
import { TransactionEntryQueryBuilder } from '../utils/query-builders';
import { TransactionEntryFilterParams, TransactionEntryQueryParams, TransactionEntryListResponse } from '../types/resources';
/**
 * Transaction Entries Resource
 *
 * ⚠️ READ-ONLY RESOURCE:
 * This resource is READ-ONLY for organisation_admin and owner roles.
 * Only view and list operations are supported.
 * Create/update/delete operations require super_admin privileges.
 */
export declare class TransactionEntriesResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List transaction entries with filtering
     */
    list(params?: TransactionEntryFilterParams): Promise<ApiResponse<TransactionEntryListResponse>>;
    /**
     * Get transaction entry by ID
     */
    get(id: number): Promise<ApiResponse<TransactionEntry>>;
    /**
     * Advanced query interface with full type safety
     * Note: Transaction entries are read-only for organisation_admin.
     * Create/update/delete operations require super_admin privileges.
     *
     * @example
     * const entries = await sdk.transactionEntries.query({
     *   amount: { gte: 100 },
     *   type: [1, 2],
     *   transaction_id: 123
     * });
     */
    query(params: TransactionEntryQueryParams): Promise<ApiResponse<TransactionEntryListResponse>>;
    /**
     * Create a fluent query builder for transaction entries
     *
     * @example
     * const entries = await sdk.transactionEntries.createQueryBuilder()
     *   .whereAmountGreaterThan(100)
     *   .whereTypeIn([1, 2])
     *   .execute();
     */
    createQueryBuilder(): TransactionEntryQueryBuilder;
}
//# sourceMappingURL=transaction-entries.d.ts.map