import { HttpClient } from '../client';
import {
  Address,
  CreateAddressData,
  UpdateAddressData,
  ApiResponse,
} from '../types';
import {
  KindTranslator,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { AddressQueryBuilder } from '../utils/query-builders';
import {
  AddressFilterParams,
  AddressQueryParams,
  AddressListResponse,
  ADDRESS_FIELD_TYPES,
} from '../types/resources';

export class AddressesResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: AddressFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'address');
    }
    
    return translated;
  }

  /**
   * Convert user-facing data to internal format
   */
  private translateToInternal(data: CreateAddressData | UpdateAddressData): any {
    const internal: any = { ...data };
    
    if ('kind' in data && data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'address');
    }
    
    return internal;
  }

  /**
   * List addresses with filtering
   */
  async list(params?: AddressFilterParams): Promise<ApiResponse<AddressListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<AddressListResponse>('/addresses', translatedParams);
  }

  /**
   * Get address by ID
   */
  async get(id: number): Promise<ApiResponse<Address>> {
    return this.client.get<Address>(`/addresses/${id}`);
  }

  /**
   * Create a new address
   */
  async create(data: CreateAddressData): Promise<ApiResponse<Address>> {
    const internalData = this.translateToInternal(data);
    return this.client.post<Address>('/addresses', internalData);
  }

  /**
   * Update an address
   */
  async update(id: number, data: UpdateAddressData): Promise<ApiResponse<Address>> {
    const internalData = this.translateToInternal(data);
    return this.client.put<Address>(`/addresses/${id}`, internalData);
  }

  /**
   * Delete an address
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/addresses/${id}`);
  }

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
  async query(params: AddressQueryParams): Promise<ApiResponse<AddressListResponse>> {
    const processedQuery = processQuery(params, ADDRESS_FIELD_TYPES, { validate: true });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for addresses
   * 
   * @example
   * const addresses = await sdk.addresses.createQueryBuilder()
   *   .whereCountryEquals('US')
   *   .whereStateEquals('CA')
   *   .execute();
   */
  createQueryBuilder(): AddressQueryBuilder {
    return new AddressQueryBuilder(this);
  }
}
