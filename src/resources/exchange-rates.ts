import { HttpClient } from '../client';
import {
  ExchangeRate,
  CreateExchangeRateData,
  UpdateExchangeRateData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { ExchangeRateQueryBuilder } from '../utils/query-builders';
import {
  ExchangeRateFilterParams,
  ExchangeRateQueryParams,
  ExchangeRateListResponse,
  EXCHANGE_RATE_FIELD_TYPES,
} from '../types/resources';

export class ExchangeRatesResource {
  constructor(private client: HttpClient) {}

  /**
   * List exchange rates with filtering
   */
  async list(params?: ExchangeRateFilterParams): Promise<ApiResponse<ExchangeRateListResponse>> {
    return this.client.get<ExchangeRateListResponse>('/exchange_rates', params);
  }

  /**
   * Get exchange rate by ID
   */
  async get(id: number): Promise<ApiResponse<ExchangeRate>> {
    return this.client.get<ExchangeRate>(`/exchange_rates/${id}`);
  }

  /**
   * Create a new exchange rate
   */
  async create(data: CreateExchangeRateData): Promise<ApiResponse<ExchangeRate>> {
    return this.client.post<ExchangeRate>('/exchange_rates', data);
  }

  /**
   * Update an exchange rate
   */
  async update(id: number, data: UpdateExchangeRateData): Promise<ApiResponse<ExchangeRate>> {
    return this.client.put<ExchangeRate>(`/exchange_rates/${id}`, data);
  }

  /**
   * Delete an exchange rate
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/exchange_rates/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const rates = await sdk.exchangeRates.query({
   *   source_id: 1,
   *   destination_id: 2,
   *   rate: { gte: 1.0 }
   * });
   */
  async query(params: ExchangeRateQueryParams): Promise<ApiResponse<ExchangeRateListResponse>> {
    const processedQuery = processQuery(params, EXCHANGE_RATE_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for exchange rates
   * 
   * @example
   * const rates = await sdk.exchangeRates.createQueryBuilder()
   *   .whereSourceIdEquals(1)
   *   .whereDestinationIdEquals(2)
   *   .execute();
   */
  createQueryBuilder(): ExchangeRateQueryBuilder {
    return new ExchangeRateQueryBuilder(this);
  }
}
