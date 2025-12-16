import { HttpClient } from '../client';
import {
  Merchant,
  CreateMerchantData,
  UpdateMerchantData,
  ApiResponse,
  InternalMerchant,
  InternalCreateMerchantData,
  InternalUpdateMerchantData,
  AccountStatus,
  MerchantBalance,
  MerchantLimits,
  MerchantSubscription,
  MerchantInvoice,
} from '../types';
import {
  StatusTranslator,
  FeeStructureTranslator,
  StatusKey,
  FeeStructureKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { MerchantQueryBuilder } from '../utils/query-builders';
import {
  MerchantFilterParams,
  MerchantQueryParams,
  MerchantListResponse,
  MERCHANT_FIELD_TYPES,
} from '../types/resources';

/**
 * @deprecated Use MerchantFilterParams from types/resources instead
 */
export interface LegacyMerchantFilterParams {
  // Legacy interface - kept for backward compatibility
}

export class MerchantsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal merchant data (integers) to user-facing data (strings)
   */
  private translateMerchantToUserFacing(internal: InternalMerchant): Merchant {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'account') as AccountStatus,
      platform_fee_structure: FeeStructureTranslator.toString(internal.platform_fee_structure),
      provider_fee_structure: FeeStructureTranslator.toString(internal.provider_fee_structure),
    };
  }

  /**
   * Convert user-facing merchant data (strings) to internal data (integers)
   */
  private translateMerchantToInternal(userFacing: CreateMerchantData | UpdateMerchantData): InternalCreateMerchantData | InternalUpdateMerchantData {
    const internal: any = { ...userFacing };
    
    if ('status' in userFacing && userFacing.status) {
      internal.status = typeof userFacing.status === 'string' 
        ? StatusTranslator.toIntegerWithContext(userFacing.status, 'account')
        : userFacing.status;
    }
    
    if ('platform_fee_structure' in userFacing && userFacing.platform_fee_structure) {
      internal.platform_fee_structure = typeof userFacing.platform_fee_structure === 'string'
        ? FeeStructureTranslator.toInteger(userFacing.platform_fee_structure as FeeStructureKey)
        : userFacing.platform_fee_structure;
    }
    
    if ('provider_fee_structure' in userFacing && userFacing.provider_fee_structure) {
      internal.provider_fee_structure = typeof userFacing.provider_fee_structure === 'string'
        ? FeeStructureTranslator.toInteger(userFacing.provider_fee_structure as FeeStructureKey)
        : userFacing.provider_fee_structure;
    }
    
    return internal;
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: MerchantFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status, 'account');
    }
    
    if (params.platform_fee_structure && typeof params.platform_fee_structure === 'string') {
      translated.platform_fee_structure = FeeStructureTranslator.toInteger(params.platform_fee_structure as FeeStructureKey);
    }
    
    if (params.provider_fee_structure && typeof params.provider_fee_structure === 'string') {
      translated.provider_fee_structure = FeeStructureTranslator.toInteger(params.provider_fee_structure as FeeStructureKey);
    }
    
    return translated;
  }

  /**
   * List merchants with pagination and filtering
   */
  async list(params?: MerchantFilterParams): Promise<ApiResponse<MerchantListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalMerchant[]; page_info: any }>('/merchants', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(merchant => this.translateMerchantToUserFacing(merchant));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.page_info
        }
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Get a specific merchant by ID
   */
  async get(id: number): Promise<ApiResponse<Merchant>> {
    const response = await this.client.get<InternalMerchant>(`/merchants/${id}`);
    
    if (response.result) {
      const translatedMerchant = this.translateMerchantToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedMerchant
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new merchant
   */
  async create(data: CreateMerchantData): Promise<ApiResponse<Merchant>> {
    const internalData = this.translateMerchantToInternal(data) as InternalCreateMerchantData;
    const response = await this.client.post<InternalMerchant>('/merchants', internalData);
    
    if (response.result) {
      const translatedMerchant = this.translateMerchantToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedMerchant
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Update an existing merchant
   */
  async update(id: number, data: UpdateMerchantData): Promise<ApiResponse<Merchant>> {
    const internalData = this.translateMerchantToInternal(data) as InternalUpdateMerchantData;
    const response = await this.client.put<InternalMerchant>(`/merchants/${id}`, internalData);
    
    if (response.result) {
      const translatedMerchant = this.translateMerchantToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedMerchant
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Get merchant account balances
   */
  async balances(): Promise<ApiResponse<MerchantBalance>> {
    return this.client.get<MerchantBalance>('/merchants/account/balances');
  }

  /**
   * Get merchant account limits
   */
  async limits(): Promise<ApiResponse<MerchantLimits>> {
    return this.client.get<MerchantLimits>('/merchants/account/limits');
  }

  /**
   * Get merchant subscription plan details
   */
  async subscription(): Promise<ApiResponse<MerchantSubscription>> {
    return this.client.get<MerchantSubscription>('/merchants/account/plan');
  }

  /**
   * Get list of merchant account invoices
   */
  async invoices(): Promise<ApiResponse<MerchantInvoice[]>> {
    return this.client.get<MerchantInvoice[]>('/merchants/account/invoices');
  }

  /**
   * Get a specific merchant invoice by ID
   */
  async invoice(invoiceId: string): Promise<ApiResponse<MerchantInvoice>> {
    return this.client.get<MerchantInvoice>(`/merchants/account/invoice/${invoiceId}`);
  }

  /**
   * Query merchants with enhanced query support
   * @example
   * await merchants.query({ status: 'approved', sector: 'retail' })
   */
  async query(params?: MerchantQueryParams): Promise<ApiResponse<MerchantListResponse>> {
    const processedQuery = processQuery(params || {}, MERCHANT_FIELD_TYPES, { validate: true });
    const translatedQuery = this.translateFilters(processedQuery);
    const response = await this.client.get<{ entries: InternalMerchant[]; page_info: any }>('/merchants', translatedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(m => this.translateMerchantToUserFacing(m));
      return {
        state: response.state,
        result: { entries: translatedEntries, page_info: response.result.page_info }
      };
    }
    
    return { state: response.state, result: response.result as any };
  }

  /**
   * Create a query builder for merchants
   * @example
   * await sdk.merchants.createQueryBuilder().whereStatus('approved').execute()
   */
  createQueryBuilder(initialQuery?: MerchantQueryParams): MerchantQueryBuilder {
    return new MerchantQueryBuilder(this, initialQuery);
  }
  
}
