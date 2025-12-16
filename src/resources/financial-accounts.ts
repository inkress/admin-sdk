import { HttpClient } from '../client';
import {
  FinancialAccount,
  CreateFinancialAccountData,
  UpdateFinancialAccountData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { FinancialAccountQueryBuilder } from '../utils/query-builders';
import {
  FinancialAccountFilterParams,
  FinancialAccountQueryParams,
  FinancialAccountListResponse,
  FINANCIAL_ACCOUNT_FIELD_TYPES,
} from '../types/resources';

export class FinancialAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * List financial accounts with filtering
   */
  async list(params?: FinancialAccountFilterParams): Promise<ApiResponse<FinancialAccountListResponse>> {
    return this.client.get<FinancialAccountListResponse>('/financial_accounts', params);
  }

  /**
   * Get financial account by ID
   */
  async get(id: number): Promise<ApiResponse<FinancialAccount>> {
    return this.client.get<FinancialAccount>(`/financial_accounts/${id}`);
  }

  /**
   * Create a new financial account
   */
  async create(data: CreateFinancialAccountData): Promise<ApiResponse<FinancialAccount>> {
    return this.client.post<FinancialAccount>('/financial_accounts', data);
  }

  /**
   * Update a financial account
   */
  async update(id: number, data: UpdateFinancialAccountData): Promise<ApiResponse<FinancialAccount>> {
    return this.client.put<FinancialAccount>(`/financial_accounts/${id}`, data);
  }

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
  async query(params: FinancialAccountQueryParams): Promise<ApiResponse<FinancialAccountListResponse>> {
    const processedQuery = processQuery(params, FINANCIAL_ACCOUNT_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

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
  createQueryBuilder(): FinancialAccountQueryBuilder {
    return new FinancialAccountQueryBuilder(this);
  }
}
