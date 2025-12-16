import { HttpClient } from '../client';
import {
  Currency,
  CreateCurrencyData,
  UpdateCurrencyData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { CurrencyQueryBuilder } from '../utils/query-builders';
import {
  CurrencyFilterParams,
  CurrencyQueryParams,
  CurrencyListResponse,
  CURRENCY_FIELD_TYPES,
} from '../types/resources';

export class CurrenciesResource {
  constructor(private client: HttpClient) {}

  /**
   * List currencies with filtering
   */
  async list(params?: CurrencyFilterParams): Promise<ApiResponse<CurrencyListResponse>> {
    return this.client.get<CurrencyListResponse>('/currencies', params);
  }

  /**
   * Get currency by ID
   */
  async get(id: number): Promise<ApiResponse<Currency>> {
    return this.client.get<Currency>(`/currencies/${id}`);
  }

  /**
   * Create a new currency
   */
  async create(data: CreateCurrencyData): Promise<ApiResponse<Currency>> {
    return this.client.post<Currency>('/currencies', data);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const currencies = await sdk.currencies.query({
   *   code: ['USD', 'EUR'],
   *   is_float: true
   * });
   */
  async query(params: CurrencyQueryParams): Promise<ApiResponse<CurrencyListResponse>> {
    const processedQuery = processQuery(params, CURRENCY_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for currencies
   * 
   * @example
   * const currencies = await sdk.currencies.createQueryBuilder()
   *   .whereCodeIn(['USD', 'EUR'])
   *   .whereIsFloatEquals(true)
   *   .execute();
   */
  createQueryBuilder(): CurrencyQueryBuilder {
    return new CurrencyQueryBuilder(this);
  }
}
