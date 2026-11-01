/**
 * Resource-specific types and interfaces
 *
 * This file contains all filter parameters, list responses, and field type mappings
 * for each resource in the SDK. This provides clear IntelliSense and type safety.
 */
import type { BaseFilterParams, Order, OrderStatus, OrderKind, Product, ProductStatus, User, AccountStatus, UserKind, Merchant, Category, CategoryKind, BillingPlan, BillingPlanKind, Subscription, SubscriptionStatus, PaymentLink, FinancialAccount, FinancialRequest, WebhookUrl, Token, Address, Currency, ExchangeRate, Fee, PaymentMethod, TransactionEntry } from '../types';
import type { StatusKey, KindKey, FeeStructureKey } from '../utils/translators';
import type { RangeQuery, StringQuery, DateQuery } from '../utils/query-transformer';
/**
 * Order field types - defines what operations are available on each field
 */
export declare const ORDER_FIELD_TYPES: {
    readonly id: "number";
    readonly reference_id: "string";
    readonly total: "number";
    readonly status: "number";
    readonly kind: "number";
    readonly status_on: "number";
    readonly uid: "string";
    readonly cart_id: "number";
    readonly currency_code: "string";
    readonly customer_id: "number";
    readonly payment_link_id: "number";
    readonly billing_plan_id: "number";
    readonly session_id: "string";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Product field types
 */
export declare const PRODUCT_FIELD_TYPES: {
    readonly id: "number";
    readonly title: "string";
    readonly teaser: "string";
    readonly price: "number";
    readonly permalink: "string";
    readonly image: "string";
    readonly status: "number";
    readonly public: "boolean";
    readonly unlimited: "boolean";
    readonly units_remaining: "number";
    readonly units_sold: "number";
    readonly rating_sum: "number";
    readonly rating_count: "number";
    readonly tag_ids: "array";
    readonly uid: "string";
    readonly category_id: "number";
    readonly currency_code: "string";
    readonly user_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * User field types
 */
export declare const USER_FIELD_TYPES: {
    readonly id: "number";
    readonly email: "string";
    readonly phone: "string";
    readonly first_name: "string";
    readonly last_name: "string";
    readonly username: "string";
    readonly status: "number";
    readonly kind: "number";
    readonly level: "number";
    readonly dob: "number";
    readonly sex: "number";
    readonly image: "string";
    readonly uid: "string";
    readonly organisation_id: "number";
    readonly role_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Merchant field types
 */
export declare const MERCHANT_FIELD_TYPES: {
    readonly id: "number";
    readonly name: "string";
    readonly email: "string";
    readonly username: "string";
    readonly about: "string";
    readonly logo: "string";
    readonly sector: "string";
    readonly status: "number";
    readonly phone: "string";
    readonly business_type: "string";
    readonly theme_colour: "string";
    readonly uid: "string";
    readonly address_id: "number";
    readonly owner_id: "number";
    readonly domain_id: "number";
    readonly organisation_id: "number";
    readonly platform_fee_structure: "number";
    readonly provider_fee_structure: "number";
    readonly parent_merchant_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Category field types
 */
export declare const CATEGORY_FIELD_TYPES: {
    readonly id: "number";
    readonly name: "string";
    readonly description: "string";
    readonly kind: "number";
    readonly kind_id: "number";
    readonly parent_id: "number";
    readonly uid: "string";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Billing Plan field types
 */
export declare const BILLING_PLAN_FIELD_TYPES: {
    readonly id: "number";
    readonly name: "string";
    readonly description: "string";
    readonly flat_rate: "number";
    readonly transaction_fee: "number";
    readonly transaction_percentage: "number";
    readonly transaction_percentage_additional: "number";
    readonly transaction_minimum_fee: "number";
    readonly minimum_fee: "number";
    readonly duration: "number";
    readonly status: "number";
    readonly kind: "number";
    readonly billing_cycle: "number";
    readonly trial_period: "number";
    readonly charge_strategy: "number";
    readonly auto_charge: "boolean";
    readonly public: "boolean";
    readonly payout_period: "number";
    readonly payout_value_limit: "number";
    readonly payout_percentage_limit: "number";
    readonly uid: "string";
    readonly currency_code: "string";
    readonly payment_provider_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Subscription field types
 */
export declare const SUBSCRIPTION_FIELD_TYPES: {
    readonly id: "number";
    readonly status: "number";
    readonly kind: "number";
    readonly record_id: "number";
    readonly record: "string";
    readonly start_date: "date";
    readonly end_date: "date";
    readonly current_period_start: "date";
    readonly current_period_end: "date";
    readonly trial_end: "date";
    readonly canceled_at: "date";
    readonly uid: "string";
    readonly token: "string";
    readonly billing_plan_id: "number";
    readonly customer_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Payment Link field types
 */
export declare const PAYMENT_LINK_FIELD_TYPES: {
    readonly id: "number";
    readonly uid: "string";
    readonly title: "string";
    readonly description: "string";
    readonly total: "number";
    readonly usage_limit: "number";
    readonly expires_at: "date";
    readonly status: "number";
    readonly kind: "number";
    readonly customer_id: "number";
    readonly currency_code: "string";
    readonly order_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Financial Account field types
 */
export declare const FINANCIAL_ACCOUNT_FIELD_TYPES: {
    readonly id: "number";
    readonly name: "string";
    readonly type: "string";
    readonly provider: "string";
    readonly is_external: "boolean";
    readonly fingerprint: "string";
    readonly record: "string";
    readonly record_id: "number";
    readonly active: "boolean";
    readonly code: "string";
    readonly adapter: "string";
    readonly logo: "string";
    readonly website: "string";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Financial Request field types
 */
export declare const FINANCIAL_REQUEST_FIELD_TYPES: {
    readonly id: "number";
    readonly total: "number";
    readonly status: "number";
    readonly type: "number";
    readonly sub_type: "number";
    readonly fee_total: "number";
    readonly reference_id: "string";
    readonly reviewed_at: "date";
    readonly due_at: "date";
    readonly balance_on_request: "number";
    readonly source_id: "number";
    readonly destination_id: "number";
    readonly merchant_id: "number";
    readonly requester_id: "number";
    readonly reviewer_id: "number";
    readonly currency_code: "string";
    readonly evidence_file_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Webhook URL field types
 */
export declare const WEBHOOK_URL_FIELD_TYPES: {
    readonly id: "number";
    readonly url: "string";
    readonly event: "string";
    readonly uid: "string";
    readonly merchant_id: "number";
    readonly org_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Token field types
 */
export declare const TOKEN_FIELD_TYPES: {
    readonly id: "number";
    readonly public_key: "string";
    readonly title: "string";
    readonly provider: "string";
    readonly kind: "number";
    readonly enabled: "boolean";
    readonly expires: "number";
    readonly user_id: "number";
    readonly role_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Address field types
 */
export declare const ADDRESS_FIELD_TYPES: {
    readonly id: "number";
    readonly hash: "string";
    readonly kind: "number";
    readonly kind_id: "number";
    readonly lang: "number";
    readonly lat: "number";
    readonly street: "string";
    readonly street_optional: "string";
    readonly city: "string";
    readonly state: "string";
    readonly country: "string";
    readonly region: "string";
    readonly town: "string";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Currency field types
 */
export declare const CURRENCY_FIELD_TYPES: {
    readonly id: "number";
    readonly code: "string";
    readonly flag: "string";
    readonly is_float: "boolean";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Exchange Rate field types
 */
export declare const EXCHANGE_RATE_FIELD_TYPES: {
    readonly id: "number";
    readonly source_id: "number";
    readonly destination_id: "number";
    readonly rate: "number";
    readonly expires: "number";
    readonly source: "string";
    readonly user_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Fee field types
 */
export declare const FEE_FIELD_TYPES: {
    readonly id: "number";
    readonly title: "string";
    readonly total: "number";
    readonly unit: "number";
    readonly kind: "number";
    readonly priority: "number";
    readonly compound: "boolean";
    readonly fee_payer: "number";
    readonly currency_code: "string";
    readonly hash: "string";
    readonly fee_set_id: "number";
    readonly user_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Payment Method field types
 */
export declare const PAYMENT_METHOD_FIELD_TYPES: {
    readonly id: "number";
    readonly name: "string";
    readonly code: "string";
    readonly provider: "string";
    readonly active: "boolean";
    readonly payment_provider_id: "number";
    readonly financial_account_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Transaction Entry field types
 */
export declare const TRANSACTION_ENTRY_FIELD_TYPES: {
    readonly id: "number";
    readonly amount: "number";
    readonly type: "number";
    readonly transaction_id: "number";
    readonly financial_account_id: "number";
    readonly inserted_at: "date";
    readonly updated_at: "date";
};
/**
 * Order query parameters with full type safety
 * Supports direct values, arrays (IN), ranges, and string operations
 */
export interface OrderQueryParams {
    id?: number | number[] | RangeQuery<number>;
    total?: number | number[] | RangeQuery<number>;
    status_on?: number | number[] | RangeQuery<number>;
    cart_id?: number | number[];
    currency_code?: string | string[] | StringQuery;
    customer_id?: number | number[];
    payment_link_id?: number | number[];
    billing_plan_id?: number | number[];
    billing_subscription_id?: number | number[];
    reference_id?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    session_id?: string | string[] | StringQuery;
    status?: OrderStatus | OrderStatus[] | StatusKey | number | number[];
    kind?: OrderKind | OrderKind[] | KindKey | number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
    data?: any;
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
    id?: number | number[] | RangeQuery<number>;
    price?: number | number[] | RangeQuery<number>;
    units_remaining?: number | number[] | RangeQuery<number>;
    units_sold?: number | number[] | RangeQuery<number>;
    rating_sum?: number | number[] | RangeQuery<number>;
    rating_count?: number | number[] | RangeQuery<number>;
    category_id?: number | number[];
    currency_code?: string | string[] | StringQuery;
    user_id?: number | number[];
    title?: string | string[] | StringQuery;
    teaser?: string | string[] | StringQuery;
    permalink?: string | string[] | StringQuery;
    image?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    status?: ProductStatus | ProductStatus[] | StatusKey | number | number[];
    public?: boolean;
    unlimited?: boolean;
    tag_ids?: number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    level?: number | number[] | RangeQuery<number>;
    dob?: number | number[] | RangeQuery<number>;
    sex?: number | number[];
    organisation_id?: number | number[];
    role_id?: number | number[];
    email?: string | string[] | StringQuery;
    phone?: string | string[] | StringQuery;
    first_name?: string | string[] | StringQuery;
    last_name?: string | string[] | StringQuery;
    username?: string | string[] | StringQuery;
    image?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    status?: AccountStatus | AccountStatus[] | StatusKey | number | number[];
    kind?: UserKind | UserKind[] | KindKey | number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    address_id?: number | number[];
    owner_id?: number | number[];
    domain_id?: number | number[];
    organisation_id?: number | number[];
    parent_merchant_id?: number | number[];
    platform_fee_structure?: FeeStructureKey | number | number[];
    provider_fee_structure?: FeeStructureKey | number | number[];
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
    status?: AccountStatus | AccountStatus[] | StatusKey | number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    kind_id?: number | number[];
    parent_id?: number | number[];
    name?: string | string[] | StringQuery;
    description?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    kind?: CategoryKind | CategoryKind[] | KindKey | number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    name?: string | string[] | StringQuery;
    description?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    status?: StatusKey | number | number[];
    kind?: BillingPlanKind | BillingPlanKind[] | KindKey | number | number[];
    auto_charge?: boolean;
    public?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    record_id?: number | number[] | RangeQuery<number>;
    billing_plan_id?: number | number[];
    customer_id?: number | number[];
    order_id?: number | number[];
    record?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    token?: string | string[] | StringQuery;
    status?: SubscriptionStatus | SubscriptionStatus[] | StatusKey | number | number[];
    kind?: KindKey | number | number[];
    start_date?: string | DateQuery;
    end_date?: string | DateQuery;
    current_period_start?: string | DateQuery;
    current_period_end?: string | DateQuery;
    trial_end?: string | DateQuery;
    canceled_at?: string | DateQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    total?: number | number[] | RangeQuery<number>;
    usage_limit?: number | number[] | RangeQuery<number>;
    status?: number | number[];
    kind?: number | number[];
    customer_id?: number | number[];
    currency_code?: string | string[] | StringQuery;
    order_id?: number | number[];
    uid?: string | string[] | StringQuery;
    title?: string | string[] | StringQuery;
    description?: string | string[] | StringQuery;
    expires_at?: string | DateQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    record_id?: number | number[];
    name?: string | string[] | StringQuery;
    type?: string | string[] | StringQuery;
    provider?: string | string[] | StringQuery;
    fingerprint?: string | string[] | StringQuery;
    record?: string | string[] | StringQuery;
    code?: string | string[] | StringQuery;
    adapter?: string | string[] | StringQuery;
    logo?: string | string[] | StringQuery;
    website?: string | string[] | StringQuery;
    is_external?: boolean;
    active?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    reference_id?: string | string[] | StringQuery;
    reviewed_at?: string | DateQuery;
    due_at?: string | DateQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    merchant_id?: number | number[];
    org_id?: number | number[];
    url?: string | string[] | StringQuery;
    event?: string | string[] | StringQuery;
    uid?: string | string[] | StringQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    kind?: number | number[];
    expires?: number | number[] | RangeQuery<number>;
    user_id?: number | number[];
    role_id?: number | number[];
    public_key?: string | string[] | StringQuery;
    title?: string | string[] | StringQuery;
    provider?: string | string[] | StringQuery;
    enabled?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    kind?: number | number[];
    kind_id?: number | number[];
    lang?: number | number[] | RangeQuery<number>;
    lat?: number | number[] | RangeQuery<number>;
    hash?: string | string[] | StringQuery;
    street?: string | string[] | StringQuery;
    street_optional?: string | string[] | StringQuery;
    city?: string | string[] | StringQuery;
    state?: string | string[] | StringQuery;
    country?: string | string[] | StringQuery;
    region?: string | string[] | StringQuery;
    town?: string | string[] | StringQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    code?: string | string[] | StringQuery;
    flag?: string | string[] | StringQuery;
    is_float?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    source_id?: number | number[];
    destination_id?: number | number[];
    rate?: number | number[] | RangeQuery<number>;
    expires?: number | number[] | RangeQuery<number>;
    user_id?: number | number[];
    source?: string | string[] | StringQuery;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    total?: number | number[] | RangeQuery<number>;
    unit?: number | number[];
    kind?: number | number[];
    priority?: number | number[] | RangeQuery<number>;
    fee_payer?: number | number[];
    fee_set_id?: number | number[];
    user_id?: number | number[];
    title?: string | string[] | StringQuery;
    currency_code?: string | string[] | StringQuery;
    hash?: string | string[] | StringQuery;
    compound?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    payment_provider_id?: number | number[];
    financial_account_id?: number | number[];
    name?: string | string[] | StringQuery;
    code?: string | string[] | StringQuery;
    provider?: string | string[] | StringQuery;
    active?: boolean;
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    id?: number | number[] | RangeQuery<number>;
    amount?: number | number[] | RangeQuery<number>;
    type?: number | number[];
    transaction_id?: number | number[];
    financial_account_id?: number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
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
    /** Payments towards one booking (INK-792). */
    booking_id?: number;
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
export interface PageInfo {
    page: number;
    page_size: number;
    total_entries: number;
    more: boolean;
    total_pages?: number;
    next_page?: number;
    next_pages?: number[];
    last_page?: number;
    last_pages?: number[];
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
//# sourceMappingURL=resources.d.ts.map