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
  FinancialAccount,
  RevenueByAppResponse,
  AppContributionResponse,
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

export interface BankInfoUpdateRequestData {
  account_holder_name: string;
  account_holder_type: "Personal" | "Business";
  account_number: number;
  account_type: "Checking" | "Saving";
  bank_name: string;
  branch_name: string;
  branch_code?: string;
  routing_number?: string;
  swift_code?: string;
  country_code: string;
  currency_code: string;
}

export interface BankAccountUpdateRequestResponse {
  message: string | null;
  success: boolean;
  error: string | null;
  reason: string | null;
}

export interface BankAccountUpdateConfirmResponse {
  account: FinancialAccount | null;
  saved: boolean;
  success: boolean;
  error: string | null;
  reason: string | null;
}

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
    return this.client.post<MerchantBalance>('/merchants/account/balances');
  }

  /**
   * Get merchant account limits
   */
  async limits(): Promise<ApiResponse<MerchantLimits>> {
    return this.client.post<MerchantLimits>('/merchants/account/limits');
  }

  /**
   * Get merchant subscription plan details
   */
  async subscription(): Promise<ApiResponse<MerchantSubscription>> {
    return this.client.post<MerchantSubscription>('/merchants/account/plan');
  }

  /**
   * Get list of merchant account invoices
   */
  async invoices(): Promise<ApiResponse<MerchantInvoice[]>> {
    return this.client.post<MerchantInvoice[]>('/merchants/account/invoices');
  }

  /**
   * Get a specific merchant invoice by ID
   */
  async invoice(invoiceId: string): Promise<ApiResponse<MerchantInvoice>> {
    return this.client.post<MerchantInvoice>(`/merchants/account/invoice/${invoiceId}`);
  }

  /**
   * Per-app revenue + activity rollup for the merchant — drives the
   * Connected Apps performance section of the dashboard. First-party
   * dashboard callers only; OAuth tokens get 403 (cross-app leak).
   *
   * @param params.window         "7d" | "30d" | "90d" | "all_time" (default "30d")
   * @param params.currency_code  optional ISO-4217 to narrow the report
   */
  async revenueByApp(params?: { window?: '7d' | '30d' | '90d' | 'all_time'; currency_code?: string }): Promise<ApiResponse<RevenueByAppResponse>> {
    return this.client.post<RevenueByAppResponse>('/merchants/account/revenue_by_app', params || {});
  }

  /**
   * The calling OAuth app's net contribution to the merchant's wallet
   * — SUM (credits − debits) over the entries tagged with this app.
   * OAuth-only; the app id is taken from the bearer token, never from
   * params. Returns 403 for first-party callers.
   *
   * Note: contribution ≠ balance. A merchant payout the app didn't
   * initiate doesn't decrease this number — it's "what did my
   * activity contribute," not "what's mine to draw on."
   *
   * @param params.currency_code  optional ISO-4217 to narrow the figure
   */
  async contribution(params?: { currency_code?: string }): Promise<ApiResponse<AppContributionResponse>> {
    return this.client.post<AppContributionResponse>('/merchants/account/contribution', params || {});
  }

  /**
   * Request for bank account update
   */
  async updateBankInfo(data: BankInfoUpdateRequestData): Promise<ApiResponse<BankAccountUpdateRequestResponse>> {
    return this.client.post<BankAccountUpdateRequestResponse>('/merchants/bank_account/update_request', { bank_account: data });
  }


  /**
   * Confirm bank account information update with OTP codde
   */
  async confirmBankInfo(otp: string): Promise<ApiResponse<BankAccountUpdateConfirmResponse>> {
    return this.client.post<BankAccountUpdateConfirmResponse>('/merchants/bank_account/update_confirm', { otp });
  }

  /**
   * Query merchants with enhanced query support
   * @example
   * await merchants.query({ status: 'approved', sector: 'retail' })
   */
  async query(params?: MerchantQueryParams): Promise<ApiResponse<MerchantListResponse>> {
    const processedQuery = processQuery(params || {}, MERCHANT_FIELD_TYPES, { validate: true, context: 'account' });
    const response = await this.client.get<{ entries: InternalMerchant[]; page_info: any }>('/merchants', processedQuery);
    
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
