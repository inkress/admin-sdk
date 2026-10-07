import { HttpClient } from '../client';
import {
  TransactionEntry,
  CreateTransactionEntryData,
  UpdateTransactionEntryData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { TransactionEntryQueryBuilder } from '../utils/query-builders';
import {
  TransactionEntryFilterParams,
  TransactionEntryQueryParams,
  TransactionEntryListResponse,
  TRANSACTION_ENTRY_FIELD_TYPES,
} from '../types/resources';

/**
 * Transaction Entries Resource
 * 
 * ⚠️ READ-ONLY RESOURCE:
 * This resource is READ-ONLY for organisation_admin and owner roles.
 * Only view and list operations are supported.
 * Create/update/delete operations require super_admin privileges.
 */
export class TransactionEntriesResource {
  constructor(private client: HttpClient) {}

  /**
   * List transaction entries with filtering
   */
  async list(params?: TransactionEntryFilterParams): Promise<ApiResponse<TransactionEntryListResponse>> {
    return this.client.get<TransactionEntryListResponse>('/transaction_entries', params);
  }

  /**
   * Get transaction entry by ID
   */
  async get(id: number): Promise<ApiResponse<TransactionEntry>> {
    return this.client.get<TransactionEntry>(`/transaction_entries/${id}`);
  }

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
  async query(params: TransactionEntryQueryParams): Promise<ApiResponse<TransactionEntryListResponse>> {
    const processedQuery = processQuery(params, TRANSACTION_ENTRY_FIELD_TYPES, { validate: true, context: 'ledger_entry' });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for transaction entries
   * 
   * @example
   * const entries = await sdk.transactionEntries.createQueryBuilder()
   *   .whereAmountGreaterThan(100)
   *   .whereTypeIn([1, 2])
   *   .execute();
   */
  createQueryBuilder(): TransactionEntryQueryBuilder {
    return new TransactionEntryQueryBuilder(this);
  }
}
