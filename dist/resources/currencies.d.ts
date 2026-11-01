import { HttpClient } from '../client';
import { Currency, CreateCurrencyData, ApiResponse } from '../types';
import { CurrencyQueryBuilder } from '../utils/query-builders';
import { CurrencyFilterParams, CurrencyQueryParams, CurrencyListResponse } from '../types/resources';
export declare class CurrenciesResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List currencies with filtering
     */
    list(params?: CurrencyFilterParams): Promise<ApiResponse<CurrencyListResponse>>;
    /**
     * Get currency by ID
     */
    get(id: number): Promise<ApiResponse<Currency>>;
    /**
     * Create a new currency
     */
    create(data: CreateCurrencyData): Promise<ApiResponse<Currency>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const currencies = await sdk.currencies.query({
     *   code: ['USD', 'EUR'],
     *   is_float: true
     * });
     */
    query(params: CurrencyQueryParams): Promise<ApiResponse<CurrencyListResponse>>;
    /**
     * Create a fluent query builder for currencies
     *
     * @example
     * const currencies = await sdk.currencies.createQueryBuilder()
     *   .whereCodeIn(['USD', 'EUR'])
     *   .whereIsFloatEquals(true)
     *   .execute();
     */
    createQueryBuilder(): CurrencyQueryBuilder;
}
//# sourceMappingURL=currencies.d.ts.map