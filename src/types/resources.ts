/**
 * Resource-specific types and interfaces
 * 
 * This file contains all filter parameters, list responses, and field type mappings
 * for each resource in the SDK. This provides clear IntelliSense and type safety.
 */

import type {
  BaseFilterParams,
  Order,
  InternalOrder,
  OrderStatus,
  OrderKind,
  Product,
  InternalProduct,
  ProductStatus,
  User,
  InternalUser,
  AccountStatus,
  UserKind,
  Merchant,
  InternalMerchant,
  Category,
  InternalCategory,
  CategoryKind,
  BillingPlan,
  InternalBillingPlan,
  BillingPlanKind,
  Subscription,
  InternalSubscription,
  SubscriptionStatus,
  PaymentLink,
  FinancialAccount,
  FinancialRequest,
  WebhookUrl,
  Token,
  Address,
  Currency,
  ExchangeRate,
  Fee,
  PaymentMethod,
  TransactionEntry,
} from '../types';
import type { StatusKey, KindKey, FeeStructureKey } from '../utils/translators';
import type { RangeQuery, StringQuery, DateQuery } from '../utils/query-transformer';

// ============================================================================
// FIELD TYPE MAPPINGS
// ============================================================================
// These define what operations are available on each field for type-safe querying

/**
 * Order field types - defines what operations are available on each field
 */
export const ORDER_FIELD_TYPES = {
  id: 'number',
  reference_id: 'string',
  total: 'number',
  status: 'number',
  kind: 'number',
  status_on: 'number',
  uid: 'string',
  cart_id: 'number',
  currency_code: 'string',
  customer_id: 'number',
  payment_link_id: 'number',
  billing_plan_id: 'number',
  session_id: 'string',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Product field types
 */
export const PRODUCT_FIELD_TYPES = {
  id: 'number',
  title: 'string',
  teaser: 'string',
  price: 'number',
  permalink: 'string',
  image: 'string',
  status: 'number',
  public: 'boolean',
  unlimited: 'boolean',
  units_remaining: 'number',
  units_sold: 'number',
  rating_sum: 'number',
  rating_count: 'number',
  tag_ids: 'array',
  uid: 'string',
  category_id: 'number',
  currency_code: 'string',
  user_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * User field types
 */
export const USER_FIELD_TYPES = {
  id: 'number',
  email: 'string',
  phone: 'string',
  first_name: 'string',
  last_name: 'string',
  username: 'string',
  status: 'number',
  kind: 'number',
  level: 'number',
  dob: 'number',
  sex: 'number',
  image: 'string',
  uid: 'string',
  organisation_id: 'number',
  role_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Merchant field types
 */
export const MERCHANT_FIELD_TYPES = {
  id: 'number',
  name: 'string',
  email: 'string',
  username: 'string',
  about: 'string',
  logo: 'string',
  sector: 'string',
  status: 'number',
  phone: 'string',
  business_type: 'string',
  theme_colour: 'string',
  uid: 'string',
  address_id: 'number',
  owner_id: 'number',
  domain_id: 'number',
  organisation_id: 'number',
  platform_fee_structure: 'number',
  provider_fee_structure: 'number',
  parent_merchant_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Category field types
 */
export const CATEGORY_FIELD_TYPES = {
  id: 'number',
  name: 'string',
  description: 'string',
  kind: 'number',
  kind_id: 'number',
  parent_id: 'number',
  uid: 'string',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Billing Plan field types
 */
export const BILLING_PLAN_FIELD_TYPES = {
  id: 'number',
  name: 'string',
  description: 'string',
  flat_rate: 'number',
  transaction_fee: 'number',
  transaction_percentage: 'number',
  transaction_percentage_additional: 'number',
  transaction_minimum_fee: 'number',
  minimum_fee: 'number',
  duration: 'number',
  status: 'number',
  kind: 'number',
  billing_cycle: 'number',
  trial_period: 'number',
  charge_strategy: 'number',
  auto_charge: 'boolean',
  public: 'boolean',
  payout_period: 'number',
  payout_value_limit: 'number',
  payout_percentage_limit: 'number',
  uid: 'string',
  currency_code: 'string',
  payment_provider_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Subscription field types
 */
export const SUBSCRIPTION_FIELD_TYPES = {
  id: 'number',
  status: 'number',
  kind: 'number',
  record_id: 'number',
  record: 'string',
  start_date: 'date',
  end_date: 'date',
  current_period_start: 'date',
  current_period_end: 'date',
  trial_end: 'date',
  canceled_at: 'date',
  uid: 'string',
  token: 'string',
  billing_plan_id: 'number',
  customer_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Payment Link field types
 */
export const PAYMENT_LINK_FIELD_TYPES = {
  id: 'number',
  uid: 'string',
  title: 'string',
  description: 'string',
  total: 'number',
  usage_limit: 'number',
  expires_at: 'date',
  status: 'number',
  kind: 'number',
  customer_id: 'number',
  currency_code: 'string',
  order_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Financial Account field types
 */
export const FINANCIAL_ACCOUNT_FIELD_TYPES = {
  id: 'number',
  name: 'string',
  type: 'string',
  provider: 'string',
  is_external: 'boolean',
  fingerprint: 'string',
  record: 'string',
  record_id: 'number',
  active: 'boolean',
  code: 'string',
  adapter: 'string',
  logo: 'string',
  website: 'string',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Financial Request field types
 */
export const FINANCIAL_REQUEST_FIELD_TYPES = {
  id: 'number',
  total: 'number',
  status: 'number',
  type: 'number',
  sub_type: 'number',
  fee_total: 'number',
  reference_id: 'string',
  reviewed_at: 'date',
  due_at: 'date',
  balance_on_request: 'number',
  source_id: 'number',
  destination_id: 'number',
  merchant_id: 'number',
  requester_id: 'number',
  reviewer_id: 'number',
  currency_code: 'string',
  evidence_file_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Webhook URL field types
 */
export const WEBHOOK_URL_FIELD_TYPES = {
  id: 'number',
  url: 'string',
  event: 'string',
  uid: 'string',
  merchant_id: 'number',
  org_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Token field types
 */
export const TOKEN_FIELD_TYPES = {
  id: 'number',
  public_key: 'string',
  title: 'string',
  provider: 'string',
  kind: 'number',
  enabled: 'boolean',
  expires: 'number',
  user_id: 'number',
  role_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Address field types
 */
export const ADDRESS_FIELD_TYPES = {
  id: 'number',
  hash: 'string',
  kind: 'number',
  kind_id: 'number',
  lang: 'number',
  lat: 'number',
  street: 'string',
  street_optional: 'string',
  city: 'string',
  state: 'string',
  country: 'string',
  region: 'string',
  town: 'string',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Currency field types
 */
export const CURRENCY_FIELD_TYPES = {
  id: 'number',
  code: 'string',
  flag: 'string',
  is_float: 'boolean',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Exchange Rate field types
 */
export const EXCHANGE_RATE_FIELD_TYPES = {
  id: 'number',
  source_id: 'number',
  destination_id: 'number',
  rate: 'number',
  expires: 'number',
  source: 'string',
  user_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Fee field types
 */
export const FEE_FIELD_TYPES = {
  id: 'number',
  title: 'string',
  total: 'number',
  unit: 'number',
  kind: 'number',
  priority: 'number',
  compound: 'boolean',
  fee_payer: 'number',
  currency_code: 'string',
  hash: 'string',
  fee_set_id: 'number',
  user_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Payment Method field types
 */
export const PAYMENT_METHOD_FIELD_TYPES = {
  id: 'number',
  name: 'string',
  code: 'string',
  provider: 'string',
  active: 'boolean',
  payment_provider_id: 'number',
  financial_account_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

/**
 * Transaction Entry field types
 */
export const TRANSACTION_ENTRY_FIELD_TYPES = {
  id: 'number',
  amount: 'number',
  type: 'number',
  transaction_id: 'number',
  financial_account_id: 'number',
  inserted_at: 'date',
  updated_at: 'date',
} as const;

// ============================================================================
// QUERY PARAMETER INTERFACES
// ============================================================================
// Type-safe query parameters for each resource with full IntelliSense support

/**
 * Order query parameters with full type safety
 * Supports direct values, arrays (IN), ranges, and string operations
 */
export interface OrderQueryParams {
  // Numeric fields - support direct values, arrays, and ranges
  id?: number | number[] | RangeQuery<number>;
  total?: number | number[] | RangeQuery<number>;
  status_on?: number | number[] | RangeQuery<number>;
  cart_id?: number | number[];
  currency_code?: string | string[] | StringQuery;
  customer_id?: number | number[];
  payment_link_id?: number | number[];
  billing_plan_id?: number | number[];
  billing_subscription_id?: number | number[];
  
  // String fields - support direct values, arrays, and string operations
  reference_id?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  session_id?: string | string[] | StringQuery;
  
  // Status and kind fields - support contextual strings
  status?: OrderStatus | OrderStatus[] | StatusKey | number | number[];
  kind?: OrderKind | OrderKind[] | KindKey | number | number[];
  
  // Date fields - support date queries
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // JSON field queries
  data?: any; // Allow any structure for JSON queries
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Product query parameters with full type safety
 */
export interface ProductQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  price?: number | number[] | RangeQuery<number>;
  units_remaining?: number | number[] | RangeQuery<number>;
  units_sold?: number | number[] | RangeQuery<number>;
  rating_sum?: number | number[] | RangeQuery<number>;
  rating_count?: number | number[] | RangeQuery<number>;
  category_id?: number | number[];
  currency_code?: string | string[] | StringQuery;
  user_id?: number | number[];
  
  // String fields
  title?: string | string[] | StringQuery;
  teaser?: string | string[] | StringQuery;
  permalink?: string | string[] | StringQuery;
  image?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Status field
  status?: ProductStatus | ProductStatus[] | StatusKey | number | number[];
  
  // Boolean fields
  public?: boolean;
  unlimited?: boolean;
  
  // Array fields
  tag_ids?: number[];
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * User query parameters with full type safety
 */
export interface UserQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  level?: number | number[] | RangeQuery<number>;
  dob?: number | number[] | RangeQuery<number>;
  sex?: number | number[];
  organisation_id?: number | number[];
  role_id?: number | number[];
  
  // String fields
  email?: string | string[] | StringQuery;
  phone?: string | string[] | StringQuery;
  first_name?: string | string[] | StringQuery;
  last_name?: string | string[] | StringQuery;
  username?: string | string[] | StringQuery;
  image?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Status and kind fields
  status?: AccountStatus | AccountStatus[] | StatusKey | number | number[];
  kind?: UserKind | UserKind[] | KindKey | number | number[];
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Merchant query parameters with full type safety
 */
export interface MerchantQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  address_id?: number | number[];
  owner_id?: number | number[];
  domain_id?: number | number[];
  organisation_id?: number | number[];
  parent_merchant_id?: number | number[];
  platform_fee_structure?: FeeStructureKey | number | number[];
  provider_fee_structure?: FeeStructureKey | number | number[];
  
  // String fields
  name?: string | string[] | StringQuery;
  email?: string | string[] | StringQuery;
  username?: string | string[] | StringQuery;
  about?: string | string[] | StringQuery;
  logo?: string | string[] | StringQuery;
  sector?: string | string[] | StringQuery;
  phone?: string | string[] | StringQuery;
  business_type?: string | string[] | StringQuery;
  theme_colour?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Status field
  status?: AccountStatus | AccountStatus[] | StatusKey | number | number[];
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Category query parameters with full type safety
 */
export interface CategoryQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  kind_id?: number | number[];
  parent_id?: number | number[];
  
  // String fields
  name?: string | string[] | StringQuery;
  description?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Kind field
  kind?: CategoryKind | CategoryKind[] | KindKey | number | number[];
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Billing Plan query parameters with full type safety
 */
export interface BillingPlanQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  flat_rate?: number | number[] | RangeQuery<number>;
  transaction_fee?: number | number[] | RangeQuery<number>;
  transaction_percentage?: number | number[] | RangeQuery<number>;
  transaction_percentage_additional?: number | number[] | RangeQuery<number>;
  transaction_minimum_fee?: number | number[] | RangeQuery<number>;
  minimum_fee?: number | number[] | RangeQuery<number>;
  duration?: number | number[] | RangeQuery<number>;
  billing_cycle?: number | number[] | RangeQuery<number>;
  trial_period?: number | number[] | RangeQuery<number>;
  charge_strategy?: number | number[];
  payout_period?: number | number[] | RangeQuery<number>;
  payout_value_limit?: number | number[] | RangeQuery<number>;
  payout_percentage_limit?: number | number[] | RangeQuery<number>;
  currency_code?: string | string[] | StringQuery;
  payment_provider_id?: number | number[];
  
  // String fields
  name?: string | string[] | StringQuery;
  description?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Status and kind fields
  status?: StatusKey | number | number[];
  kind?: BillingPlanKind | BillingPlanKind[] | KindKey | number | number[];
  
  // Boolean fields
  auto_charge?: boolean;
  public?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Subscription query parameters with full type safety
 */
export interface SubscriptionQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  record_id?: number | number[] | RangeQuery<number>;
  billing_plan_id?: number | number[];
  customer_id?: number | number[];
  order_id?: number | number[];
  
  // String fields
  record?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  token?: string | string[] | StringQuery;
  
  // Status and kind fields
  status?: SubscriptionStatus | SubscriptionStatus[] | StatusKey | number | number[];
  kind?: KindKey | number | number[];
  
  // Date fields
  start_date?: string | DateQuery;
  end_date?: string | DateQuery;
  current_period_start?: string | DateQuery;
  current_period_end?: string | DateQuery;
  trial_end?: string | DateQuery;
  canceled_at?: string | DateQuery;
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Payment Link query parameters with full type safety
 */
export interface PaymentLinkQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  total?: number | number[] | RangeQuery<number>;
  usage_limit?: number | number[] | RangeQuery<number>;
  status?: number | number[];
  kind?: number | number[];
  customer_id?: number | number[];
  currency_code?: string | string[] | StringQuery;
  order_id?: number | number[];
  
  // String fields
  uid?: string | string[] | StringQuery;
  title?: string | string[] | StringQuery;
  description?: string | string[] | StringQuery;
  
  // Date fields
  expires_at?: string | DateQuery;
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Financial Account query parameters with full type safety
 */
export interface FinancialAccountQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  record_id?: number | number[];
  
  // String fields
  name?: string | string[] | StringQuery;
  type?: string | string[] | StringQuery;
  provider?: string | string[] | StringQuery;
  fingerprint?: string | string[] | StringQuery;
  record?: string | string[] | StringQuery;
  code?: string | string[] | StringQuery;
  adapter?: string | string[] | StringQuery;
  logo?: string | string[] | StringQuery;
  website?: string | string[] | StringQuery;
  
  // Boolean fields
  is_external?: boolean;
  active?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Financial Request query parameters with full type safety
 */
export interface FinancialRequestQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  total?: number | number[] | RangeQuery<number>;
  status?: number | number[];
  type?: number | number[];
  sub_type?: number | number[];
  fee_total?: number | number[] | RangeQuery<number>;
  balance_on_request?: number | number[] | RangeQuery<number>;
  source_id?: number | number[];
  destination_id?: number | number[];
  merchant_id?: number | number[];
  requester_id?: number | number[];
  reviewer_id?: number | number[];
  currency_code?: string | string[] | StringQuery;
  evidence_file_id?: number | number[];
  
  // String fields
  reference_id?: string | string[] | StringQuery;
  
  // Date fields
  reviewed_at?: string | DateQuery;
  due_at?: string | DateQuery;
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Webhook URL query parameters with full type safety
 */
export interface WebhookUrlQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  merchant_id?: number | number[];
  org_id?: number | number[];
  
  // String fields
  url?: string | string[] | StringQuery;
  event?: string | string[] | StringQuery;
  uid?: string | string[] | StringQuery;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Token query parameters with full type safety
 */
export interface TokenQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  kind?: number | number[];
  expires?: number | number[] | RangeQuery<number>;
  user_id?: number | number[];
  role_id?: number | number[];
  
  // String fields
  public_key?: string | string[] | StringQuery;
  title?: string | string[] | StringQuery;
  provider?: string | string[] | StringQuery;
  
  // Boolean fields
  enabled?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Address query parameters with full type safety
 */
export interface AddressQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  kind?: number | number[];
  kind_id?: number | number[];
  lang?: number | number[] | RangeQuery<number>;
  lat?: number | number[] | RangeQuery<number>;
  
  // String fields
  hash?: string | string[] | StringQuery;
  street?: string | string[] | StringQuery;
  street_optional?: string | string[] | StringQuery;
  city?: string | string[] | StringQuery;
  state?: string | string[] | StringQuery;
  country?: string | string[] | StringQuery;
  region?: string | string[] | StringQuery;
  town?: string | string[] | StringQuery;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Currency query parameters with full type safety
 */
export interface CurrencyQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  
  // String fields
  code?: string | string[] | StringQuery;
  flag?: string | string[] | StringQuery;
  
  // Boolean fields
  is_float?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Exchange Rate query parameters with full type safety
 */
export interface ExchangeRateQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  source_id?: number | number[];
  destination_id?: number | number[];
  rate?: number | number[] | RangeQuery<number>;
  expires?: number | number[] | RangeQuery<number>;
  user_id?: number | number[];
  
  // String fields
  source?: string | string[] | StringQuery;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Fee query parameters with full type safety
 */
export interface FeeQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  total?: number | number[] | RangeQuery<number>;
  unit?: number | number[];
  kind?: number | number[];
  priority?: number | number[] | RangeQuery<number>;
  fee_payer?: number | number[];
  fee_set_id?: number | number[];
  user_id?: number | number[];
  
  // String fields
  title?: string | string[] | StringQuery;
  currency_code?: string | string[] | StringQuery;
  hash?: string | string[] | StringQuery;
  
  // Boolean fields
  compound?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Payment Method query parameters with full type safety
 */
export interface PaymentMethodQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  payment_provider_id?: number | number[];
  financial_account_id?: number | number[];
  
  // String fields
  name?: string | string[] | StringQuery;
  code?: string | string[] | StringQuery;
  provider?: string | string[] | StringQuery;
  
  // Boolean fields
  active?: boolean;
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Transaction Entry query parameters with full type safety
 */
export interface TransactionEntryQueryParams {
  // Numeric fields
  id?: number | number[] | RangeQuery<number>;
  amount?: number | number[] | RangeQuery<number>;
  type?: number | number[];
  transaction_id?: number | number[];
  financial_account_id?: number | number[];
  
  // Date fields
  inserted_at?: string | DateQuery;
  updated_at?: string | DateQuery;
  
  // Special query fields
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ============================================================================
// FILTER PARAMETER INTERFACES (Legacy - for backward compatibility)
// ============================================================================

/**
 * Order filter parameters (legacy)
 * @deprecated Use OrderQueryParams with the query() method instead
 */
export interface OrderFilterParams extends BaseFilterParams {
  search?: string;
  status?: OrderStatus | StatusKey | number;
  kind?: OrderKind | KindKey | number;
  limit?: number;
  id?: number;
  reference_id?: string;
  total?: number;
  status_on?: number;
  uid?: string;
  cart_id?: number;
  currency_code?: string;
  customer_id?: number;
  payment_link_id?: number;
  billing_plan_id?: number;
  session_id?: string;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Product filter parameters (legacy)
 * @deprecated Use ProductQueryParams with the query() method instead
 */
export interface ProductFilterParams extends BaseFilterParams {
  search?: string;
  status?: ProductStatus | StatusKey | number;
  category?: string;
  limit?: number;
  id?: number;
  title?: string;
  teaser?: string;
  price?: number;
  permalink?: string;
  image?: string;
  public?: boolean;
  unlimited?: boolean;
  units_remaining?: number;
  units_sold?: number;
  rating_sum?: number;
  rating_count?: number;
  tag_ids?: number[];
  uid?: string;
  category_id?: number;
  currency_code?: string;
  user_id?: number;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * User filter parameters (legacy)
 * @deprecated Use UserQueryParams with the query() method instead
 */
export interface UserFilterParams extends BaseFilterParams {
  search?: string;
  status?: AccountStatus | StatusKey | number;
  kind?: UserKind | KindKey | number;
  level?: number;
  role_id?: number;
  organisation_id?: number;
  limit?: number;
  id?: number;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  dob?: number;
  sex?: number;
  image?: string;
  uid?: string;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Merchant filter parameters (legacy)
 * @deprecated Use MerchantQueryParams with the query() method instead
 */
export interface MerchantFilterParams extends BaseFilterParams {
  search?: string;
  status?: AccountStatus | StatusKey | number;
  limit?: number;
  id?: number;
  name?: string;
  email?: string;
  username?: string;
  about?: string;
  logo?: string;
  sector?: string;
  phone?: string;
  business_type?: string;
  theme_colour?: string;
  uid?: string;
  address_id?: number;
  owner_id?: number;
  domain_id?: number;
  organisation_id?: number;
  platform_fee_structure?: FeeStructureKey | number;
  provider_fee_structure?: FeeStructureKey | number;
  parent_merchant_id?: number;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Category filter parameters (legacy)
 * @deprecated Use CategoryQueryParams with the query() method instead
 */
export interface CategoryFilterParams extends BaseFilterParams {
  search?: string;
  kind?: CategoryKind | KindKey | number;
  parent_id?: number;
  limit?: number;
  id?: number;
  name?: string;
  description?: string;
  kind_id?: number;
  uid?: string;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Billing Plan filter parameters (legacy)
 * @deprecated Use BillingPlanQueryParams with the query() method instead
 */
export interface BillingPlanFilterParams extends BaseFilterParams {
  status?: StatusKey | number;
  kind?: BillingPlanKind | KindKey | number;
  limit?: number;
  id?: number;
  name?: string;
  description?: string;
  flat_rate?: number;
  transaction_fee?: number;
  transaction_percentage?: number;
  transaction_percentage_additional?: number;
  transaction_minimum_fee?: number;
  minimum_fee?: number;
  duration?: number;
  billing_cycle?: number;
  trial_period?: number;
  charge_strategy?: number;
  auto_charge?: boolean;
  public?: boolean;
  payout_period?: number;
  payout_value_limit?: number;
  payout_percentage_limit?: number;
  uid?: string;
  currency_code?: string;
  payment_provider_id?: number;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Subscription filter parameters (legacy)
 * @deprecated Use SubscriptionQueryParams with the query() method instead
 */
export interface SubscriptionFilterParams extends BaseFilterParams {
  status?: SubscriptionStatus | StatusKey | number;
  billing_plan_id?: number;
  customer_id?: number;
  limit?: number;
  id?: number;
  record_id?: number;
  record?: string;
  start_date?: string;
  end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  uid?: string;
  kind?: number;
  token?: string;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Payment Link filter parameters (legacy)
 * @deprecated Use PaymentLinkQueryParams with the query() method instead
 */
export interface PaymentLinkFilterParams extends BaseFilterParams {
  status?: number;
  kind?: number;
  total?: number;
  customer_id?: number;
  currency_code?: string;
  order_id?: number;
  uid?: string;
  title?: string;
  limit?: number;
}

/**
 * Financial Account filter parameters (legacy)
 * @deprecated Use FinancialAccountQueryParams with the query() method instead
 */
export interface FinancialAccountFilterParams extends BaseFilterParams {
  type?: string;
  provider?: string;
  active?: boolean;
  is_external?: boolean;
  record_id?: number;
  limit?: number;
}

/**
 * Financial Request filter parameters (legacy)
 * @deprecated Use FinancialRequestQueryParams with the query() method instead
 */
export interface FinancialRequestFilterParams extends BaseFilterParams {
  status?: number;
  type?: number;
  total?: number;
  merchant_id?: number;
  currency_code?: string;
  limit?: number;
}

/**
 * Webhook URL filter parameters (legacy)
 * @deprecated Use WebhookUrlQueryParams with the query() method instead
 */
export interface WebhookUrlFilterParams extends BaseFilterParams {
  event?: string;
  merchant_id?: number;
  org_id?: number;
  url?: string;
  limit?: number;
}

/**
 * Token filter parameters (legacy)
 * @deprecated Use TokenQueryParams with the query() method instead
 */
export interface TokenFilterParams extends BaseFilterParams {
  kind?: number;
  enabled?: boolean;
  user_id?: number;
  provider?: string;
  limit?: number;
}

/**
 * Address filter parameters (legacy)
 * @deprecated Use AddressQueryParams with the query() method instead
 */
export interface AddressFilterParams extends BaseFilterParams {
  kind?: number;
  country?: string;
  state?: string;
  city?: string;
  limit?: number;
}

/**
 * Currency filter parameters (legacy)
 * @deprecated Use CurrencyQueryParams with the query() method instead
 */
export interface CurrencyFilterParams extends BaseFilterParams {
  code?: string;
  is_float?: boolean;
  limit?: number;
}

/**
 * Exchange Rate filter parameters (legacy)
 * @deprecated Use ExchangeRateQueryParams with the query() method instead
 */
export interface ExchangeRateFilterParams extends BaseFilterParams {
  source_id?: number;
  destination_id?: number;
  rate?: number;
  limit?: number;
}

/**
 * Fee filter parameters (legacy)
 * @deprecated Use FeeQueryParams with the query() method instead
 */
export interface FeeFilterParams extends BaseFilterParams {
  kind?: number;
  total?: number;
  currency_code?: string;
  compound?: boolean;
  limit?: number;
}

/**
 * Payment Method filter parameters (legacy)
 * @deprecated Use PaymentMethodQueryParams with the query() method instead
 */
export interface PaymentMethodFilterParams extends BaseFilterParams {
  active?: boolean;
  provider?: string;
  code?: string;
  limit?: number;
}

/**
 * Transaction Entry filter parameters (legacy)
 * @deprecated Use TransactionEntryQueryParams with the query() method instead
 */
export interface TransactionEntryFilterParams extends BaseFilterParams {
  type?: number;
  amount?: number;
  transaction_id?: number;
  financial_account_id?: number;
  limit?: number;
}

// ============================================================================
// LIST RESPONSE INTERFACES
// ============================================================================

export interface PageInfo {
  current_page: number;
  total_pages: number;
  total_entries: number;
  page_size: number;
}

export interface OrderListResponse {
  entries: Order[];
  page_info: PageInfo;
}

export interface ProductListResponse {
  entries: Product[];
  page_info: PageInfo;
}

export interface UserListResponse {
  entries: User[];
  page_info: PageInfo;
}

export interface MerchantListResponse {
  entries: Merchant[];
  page_info: PageInfo;
}

export interface CategoryListResponse {
  entries: Category[];
  page_info: PageInfo;
}

export interface BillingPlanListResponse {
  entries: BillingPlan[];
  page_info: PageInfo;
}

export interface SubscriptionListResponse {
  entries: Subscription[];
  page_info: PageInfo;
}

export interface PaymentLinkListResponse {
  entries: PaymentLink[];
  page_info: PageInfo;
}

export interface FinancialAccountListResponse {
  entries: FinancialAccount[];
  page_info: PageInfo;
}

export interface FinancialRequestListResponse {
  entries: FinancialRequest[];
  page_info: PageInfo;
}

export interface WebhookUrlListResponse {
  entries: WebhookUrl[];
  page_info: PageInfo;
}

export interface TokenListResponse {
  entries: Token[];
  page_info: PageInfo;
}

export interface AddressListResponse {
  entries: Address[];
  page_info: PageInfo;
}

export interface CurrencyListResponse {
  entries: Currency[];
  page_info: PageInfo;
}

export interface ExchangeRateListResponse {
  entries: ExchangeRate[];
  page_info: PageInfo;
}

export interface FeeListResponse {
  entries: Fee[];
  page_info: PageInfo;
}

export interface PaymentMethodListResponse {
  entries: PaymentMethod[];
  page_info: PageInfo;
}

export interface TransactionEntryListResponse {
  entries: TransactionEntry[];
  page_info: PageInfo;
}
