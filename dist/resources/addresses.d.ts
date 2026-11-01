import { HttpClient } from '../client';
import { Address, CreateAddressData, UpdateAddressData, ApiResponse } from '../types';
import { AddressQueryBuilder } from '../utils/query-builders';
import { AddressFilterParams, AddressQueryParams, AddressListResponse } from '../types/resources';
export declare class AddressesResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * Convert user-facing data to internal format
     */
    private translateToInternal;
    /**
     * List addresses with filtering
     */
    list(params?: AddressFilterParams): Promise<ApiResponse<AddressListResponse>>;
    /**
     * Get address by ID
     */
    get(id: number): Promise<ApiResponse<Address>>;
    /**
     * Create a new address
     */
    create(data: CreateAddressData): Promise<ApiResponse<Address>>;
    /**
     * Update an address
     */
    update(id: number, data: UpdateAddressData): Promise<ApiResponse<Address>>;
    /**
     * Delete an address
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const addresses = await sdk.addresses.query({
     *   country: 'US',
     *   state: 'CA',
     *   kind: [1, 2]
     * });
     */
    query(params: AddressQueryParams): Promise<ApiResponse<AddressListResponse>>;
    /**
     * Create a fluent query builder for addresses
     *
     * @example
     * const addresses = await sdk.addresses.createQueryBuilder()
     *   .whereCountryEquals('US')
     *   .whereStateEquals('CA')
     *   .execute();
     */
    createQueryBuilder(): AddressQueryBuilder;
}
//# sourceMappingURL=addresses.d.ts.map