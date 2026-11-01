import { HttpClient } from '../client';
import { ExchangeRate, CreateExchangeRateData, UpdateExchangeRateData, ApiResponse } from '../types';
import { ExchangeRateQueryBuilder } from '../utils/query-builders';
import { ExchangeRateFilterParams, ExchangeRateQueryParams, ExchangeRateListResponse } from '../types/resources';
export declare class ExchangeRatesResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List exchange rates with filtering
     */
    list(params?: ExchangeRateFilterParams): Promise<ApiResponse<ExchangeRateListResponse>>;
    /**
     * Get exchange rate by ID
     */
    get(id: number): Promise<ApiResponse<ExchangeRate>>;
    /**
     * Create a new exchange rate
     */
    create(data: CreateExchangeRateData): Promise<ApiResponse<ExchangeRate>>;
    /**
     * Update an exchange rate
     */
    update(id: number, data: UpdateExchangeRateData): Promise<ApiResponse<ExchangeRate>>;
    /**
     * Delete an exchange rate
     */
    delete(id: number): Promise<ApiResponse<void>>;
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
    query(params: ExchangeRateQueryParams): Promise<ApiResponse<ExchangeRateListResponse>>;
    /**
     * Create a fluent query builder for exchange rates
     *
     * @example
     * const rates = await sdk.exchangeRates.createQueryBuilder()
     *   .whereSourceIdEquals(1)
     *   .whereDestinationIdEquals(2)
     *   .execute();
     */
    createQueryBuilder(): ExchangeRateQueryBuilder;
}
//# sourceMappingURL=exchange-rates.d.ts.map