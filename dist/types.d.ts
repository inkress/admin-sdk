import type { FeeStructureKey, KindKey, StatusKey } from './utils/translators';
/**
 * IMPORTANT: Types have been updated to match the database schema:
 *
 * 1. Field naming: Uses `inserted_at` and `updated_at` (not `created_at`)
 * 2. Filtering: All list operations support filtering on any database field
 * 3. Immutable fields: `id`, `uid`, `inserted_at`, and `updated_at` are never included in Create/Update types
 * 4. Status/Kind values: Use contextual string codes (e.g., 'confirmed' instead of 'order_confirmed')
 * 5. Fee structures: Use string codes that are automatically translated to integers
 * 6. Translation: All status, kind, and fee structure fields accept contextual strings and return contextual strings
 */
export type OrderStatus = 'pending' | 'error' | 'paid' | 'partial' | 'confirmed' | 'cancelled' | 'prepared' | 'shipped' | 'delivered' | 'completed' | 'returned' | 'refunded' | 'verifying' | 'stale' | 'archived';
export type OrderKind = 'online' | 'payment_link' | 'cart' | 'subscription' | 'invoice' | 'offline';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type ProductKind = 'draft' | 'published' | 'archived';
export type AccountStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'disabled';
export type UserKind = 'address' | 'preset' | 'organisation' | 'store';
export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'adhoc_charged';
export type TransactionStatus = 'pending' | 'authorized' | 'hold' | 'captured' | 'voided' | 'refunded' | 'processed';
export type BillingPlanKind = 'subscription' | 'payout';
export type BillingStatus = 'active' | 'inactive';
export type CategoryKind = ProductKind;
export type KycKind = 'document_submission' | 'bank_info_update' | 'limit_increase';
export type KycStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type { QueryParams, RangeQuery, StringQuery, DateQuery, JsonQueryParams } from './utils/query-transformer';
export type { OrderQueryParams, ProductQueryParams, CategoryQueryParams, UserQueryParams, MerchantQueryParams, BillingPlanQueryParams, SubscriptionQueryParams, } from './types/resources';
export interface InkressConfig {
    /** Access token for authentication */
    accessToken: string;
    /** API mode - 'live' (https://api.inkress.com) or 'sandbox' (https://api-dev.inkress.com) */
    mode?: 'live' | 'sandbox';
    /** API version */
    apiVersion?: string;
    /** Merchant username (will be prepended with 'm-' for client ID) */
    username?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Number of retry attempts */
    retries?: number;
    /** Custom headers to include with requests */
    headers?: Record<string, string>;
}
export interface PaginationParams {
    page?: number;
    per_page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    order_by?: string;
    limit?: number;
}
export interface BaseFilterParams extends PaginationParams {
    /** General search query - searches across multiple fields automatically */
    q?: string;
    /** Legacy search field - use 'q' instead for new implementations */
    search?: string;
    /** Exclude specific records */
    exclude?: string | number;
    /** Return distinct values */
    distinct?: string;
    /** Override page behavior */
    override_page?: string | boolean;
    [key: string]: any;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}
export interface ApiResponse<T = any> {
    state: 'ok' | 'error';
    result?: T;
}
export interface ErrorResponse {
    state: 'error';
    result: {
        result: string;
    } | {
        reason: string;
    } | string | Record<string, string[]>;
}
export interface ValidationError {
    state: 'error';
    result: Record<string, string[]>;
}
export interface Currency {
    id: number;
    code: string;
    symbol: string;
    name: string;
    flag?: string;
    is_float: boolean;
    inserted_at?: string;
    updated_at?: string;
}
export interface CreateCurrencyData {
    code: string;
    symbol: string;
    name: string;
    flag?: string;
    is_float: boolean;
}
export interface UpdateCurrencyData {
    code?: string;
    symbol?: string;
    name?: string;
    flag?: string;
    is_float?: boolean;
}
export interface Organisation {
    id: number;
    uid: string;
    name: string;
    email?: string;
    phone?: string;
    about?: string;
    logo?: string;
    business_type?: string;
    status: AccountStatus;
    timezone?: string;
    data?: Record<string, any>;
    domain_id?: number;
    owner_id?: number;
    default_merchant_id?: number;
    inserted_at: string;
    updated_at: string;
}
export interface Address {
    id?: number;
    hash?: string;
    kind: number;
    kind_id: number;
    lang?: number;
    lat?: number;
    street: string;
    street_optional?: string;
    city: string;
    state: string;
    country: string;
    region: string;
    town: string;
    inserted_at?: string;
    updated_at?: string;
}
export interface CreateAddressData {
    kind: number;
    kind_id: number;
    lang?: number;
    lat?: number;
    street: string;
    street_optional?: string;
    city: string;
    state: string;
    country: string;
    region: string;
    town: string;
}
export interface UpdateAddressData {
    lang?: number;
    lat?: number;
    street?: string;
    street_optional?: string;
    city?: string;
    state?: string;
    country?: string;
    region?: string;
    town?: string;
}
export interface Merchant {
    id: number;
    name: string;
    email: string;
    username: string;
    about?: string;
    logo?: string;
    sector?: string;
    status: AccountStatus;
    phone?: string;
    business_type?: string;
    theme_colour?: string;
    uid: string;
    address_id?: number;
    owner_id?: number;
    domain_id?: number;
    organisation_id?: number;
    platform_fee_structure: FeeStructureKey;
    provider_fee_structure: FeeStructureKey;
    parent_merchant_id?: number;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
    address?: Address;
    owner?: User;
    organisation?: Organisation;
    parent_merchant?: Merchant;
}
export interface CreateMerchantData {
    name: string;
    email: string;
    phone?: string;
    about?: string;
    username?: string;
    logo?: string;
    sector?: string;
    business_type?: string;
    theme_colour?: string;
    address_id?: number;
    owner_id?: number;
    domain_id?: number;
    organisation_id?: number;
    platform_fee_structure?: FeeStructureKey;
    provider_fee_structure?: FeeStructureKey;
    parent_merchant_id?: number;
    data?: Record<string, any>;
}
export interface UpdateMerchantData {
    name?: string;
    email?: string;
    phone?: string;
    about?: string;
    username?: string;
    logo?: string;
    sector?: string;
    status?: AccountStatus;
    business_type?: string;
    theme_colour?: string;
    address_id?: number;
    owner_id?: number;
    domain_id?: number;
    organisation_id?: number;
    platform_fee_structure?: FeeStructureKey;
    provider_fee_structure?: FeeStructureKey;
    parent_merchant_id?: number;
    data?: Record<string, any>;
}
/**
 * @deprecated These interfaces may not align with current API - endpoints not found in OpenAPI spec
 */
export interface MerchantBalance {
    available: number;
    pending: number;
    currency: string;
}
/**
 * @deprecated These interfaces may not align with current API - endpoints not found in OpenAPI spec
 */
export interface MerchantLimits {
    transaction_limit: number;
    daily_limit: number;
    monthly_limit: number;
    currency: string;
}
/**
 * @deprecated These interfaces may not align with current API - endpoints not found in OpenAPI spec
 */
export interface MerchantSubscription {
    plan_name: string;
    status: string;
    billing_cycle: string;
    price: number;
    currency: string;
    features: string[];
    next_billing_date?: string;
}
/**
 * @deprecated These interfaces may not align with current API - endpoints not found in OpenAPI spec
 */
export interface MerchantInvoice {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    due_date: string;
    issued_date: string;
    paid_date?: string;
}
export interface PublicMerchant {
    id: number;
    name: string;
    username: string;
    about?: string;
    logo?: string;
    sector?: string;
    business_type?: string;
    theme_colour?: string;
    data?: any;
}
export interface Category {
    id: number;
    name: string;
    description?: string | null;
    kind: CategoryKind;
    kind_id?: number | null;
    parent_id?: number | null;
    uid: string;
    inserted_at: string;
    updated_at: string;
    parent?: Category;
}
export interface CreateCategoryData {
    name: string;
    description?: string;
    kind: CategoryKind;
    kind_id?: number;
    parent_id?: number;
}
export interface UpdateCategoryData {
    name?: string;
    description?: string;
    kind?: KindKey;
    kind_id?: number;
}
export interface Product {
    id: number;
    title: string;
    teaser?: string;
    price: number;
    permalink: string;
    image?: string | null;
    status: ProductStatus;
    public: boolean;
    unlimited: boolean;
    units_remaining?: number | null;
    units_sold?: number | null;
    rating_sum?: number | null;
    rating_count?: number | null;
    tag_ids: number[];
    data?: Record<string, any>;
    meta?: Record<string, any>;
    uid: string;
    category_id?: number;
    currency_id?: number;
    user_id?: number;
    inserted_at: string;
    updated_at: string;
    category?: Category;
    currency?: Currency;
    user?: User;
}
export interface CreateProductData {
    title: string;
    teaser?: string;
    price: number;
    permalink: string;
    image?: string;
    public?: boolean;
    unlimited?: boolean;
    units_remaining?: number;
    tag_ids?: number[];
    data?: Record<string, any>;
    meta?: Record<string, any>;
    category_id?: number;
    currency_id?: number;
    user_id?: number;
}
export interface UpdateProductData {
    title?: string;
    teaser?: string;
    price?: number;
    permalink?: string;
    image?: string;
    status?: StatusKey;
    public?: boolean;
    unlimited?: boolean;
    units_remaining?: number;
    tag_ids?: number[];
    data?: Record<string, any>;
    meta?: Record<string, any>;
    category_id?: number;
    currency_id?: number;
    user_id?: number;
}
export interface Order {
    id: number;
    reference_id?: string;
    total: number;
    kind: OrderKind;
    status: OrderStatus;
    status_on: number;
    uid: string;
    cart_id?: number | null;
    currency_id?: number;
    customer_id?: number;
    payment_link_id?: number;
    billing_plan_id?: number;
    billing_subscription_id?: number;
    meta_data?: Record<string, any>;
    session_id?: string;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
    currency?: Currency;
    customer?: Customer;
    payment_link?: PaymentLink;
    billing_plan?: BillingPlan;
    billing_subscription?: Subscription;
    merchant?: Merchant;
    organisation?: Organisation;
}
/**
 * @deprecated OrderLine interface - not found in current OpenAPI spec
 * Only used in internal order representations
 */
export interface OrderLine {
    product_id: number;
    quantity: number;
    price: number;
}
/**
 * Fulfillment type for order delivery
 */
export type FulfillmentType = 'shipping' | 'pickup' | 'digital';
/**
 * OrderAddress information for shipping/billing
 */
export interface OrderAddress {
    street?: string;
    street_optional?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
}
/**
 * Pickup location information
 */
export interface PickupLocation {
    name?: string;
    OrderAddress?: string;
    contact?: string;
    instructions?: string;
}
export interface OrderDetailData {
    /** Lynk payment system ID */
    lynk_id?: string;
    /** Customer information override */
    customer?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    };
    /** Subscription plan ID */
    plan_id?: number;
    /** Shipping OrderAddress details */
    shipping_OrderAddress?: OrderAddress;
    /** Type of fulfillment */
    fulfillment_type?: FulfillmentType;
    /** Cost of fulfillment/shipping */
    fulfillment_total?: number;
    /** Pickup location details */
    pickup_location?: PickupLocation;
}
/**
 * Product item for order creation
 */
export interface ProductItem {
    /** Product variant ID */
    id: number;
    /** Quantity to order */
    quantity: number;
}
/**
 * Payment URLs returned after order creation
 */
export interface PaymentUrls {
    cancel_url?: string;
    return_url?: string;
    approval_url?: string;
    payment_url: string;
    short_link: string;
    qr_url: string;
    embed_url?: string;
}
/**
 * Customer information for order creation
 */
export interface CustomerInfo {
    /** Required */
    email: string;
    /** Optional */
    first_name: string;
    last_name: string;
    phone?: string;
    dob?: string;
    /** Customer type/classification */
    kind?: 'merchants' | 'users' | string;
    kind_id?: number;
}
export interface CreateOrderMetaData {
    return_url?: string;
    [key: string]: any;
}
export interface RecordOrderMetaData {
    [key: string]: any;
}
/**
 * Parameters for Service.Order.Processor.record/1
 *
 * Creates a complete order with customer, products, transactions, and payment URLs
 */
export interface CreateOrderData {
    /** Required fields */
    currency_code: string;
    total: number;
    /** Customer information */
    customer: CustomerInfo;
    /** Products to order */
    products: ProductItem[];
    /** Optional order identification */
    reference_id?: string;
    /** Optional fields */
    fulfillment_total?: number;
    /** Payment method */
    method_id?: number;
    /** Order classification */
    kind?: string;
    /** Source payment link ID (if creating from existing payment link) */
    payment_link_id?: string;
    /** Subscription fields (if kind = 'subscription' or OrderKind.SUBSCRIPTION) */
    plan_id?: string;
    subscription_token?: string;
    /** Additional data */
    data?: OrderDetailData;
    meta_data?: CreateOrderMetaData;
    title?: string;
}
/**
 * Response from record function
 * Returns formatted order with all associations
 */
export interface CreateOrderResponseData {
    /** Order identification */
    id: number;
    reference_id: string;
    /** Status */
    status: number;
    status_on?: number;
    /** Financial */
    total: number;
    /** Timestamps */
    created_at: string;
    inserted_at: string;
    updated_at: string;
    /** Customer information */
    customer: {
        first_name: string;
        last_name: string;
        email: string;
    };
    /** Currency code */
    currency: string;
    /** Merchant information */
    merchant: {
        name: string;
        email: string;
        phone?: string;
        logo?: string;
        username: string;
        theme_colour?: string;
    };
    /** Order details */
    details: {
        title?: string;
        data?: OrderDetailData;
        updated_at: string;
    };
    /** Order line items */
    lines: Array<{
        product_variant_name_frozen: string;
        product_variant_total_frozen: number;
        quantity: number;
    }>;
    /** Transactions */
    transactions: Array<{
        total?: number;
        provider_fee?: number;
        platform_fee?: number;
        payment_method_order_id?: string;
        updated_at: string;
    }>;
    /** Transaction logs */
    transaction_logs: Array<{
        id: number;
        message: string;
    }>;
    /** Payment provider info */
    provider: {
        id: number;
        name: string;
        logo: string;
    };
    /** Payment URLs */
    payment_urls?: PaymentUrls;
    return_url?: string;
    invoice_url: string;
    /** Additional metadata */
    meta_data?: RecordOrderMetaData;
}
export interface UpdateOrderData {
    status?: string;
    total?: number;
    fulfillment_total?: number;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
}
export interface OrderStats {
    [key: string]: any;
}
export interface PaymentMethod {
    id: number;
    name: string;
    code?: string;
    provider?: string;
    active: boolean;
    payment_provider_id: number;
    financial_account_id?: number;
    inserted_at: string;
    updated_at: string;
    financial_account?: FinancialAccount;
}
export interface CreatePaymentMethodData {
    name: string;
    payment_provider_id: number;
    financial_account_id?: number;
    active?: boolean;
}
export interface UpdatePaymentMethodData {
    name?: string;
    payment_provider_id?: number;
    financial_account_id?: number;
    active?: boolean;
}
export interface Customer {
    id: number;
    uid?: string;
    email: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    image?: string;
    dob?: number;
    sex?: number;
    status?: number;
    inserted_at: string;
    updated_at: string;
    merchant?: Merchant;
    organisation?: Organisation;
}
export interface PaymentLink {
    id: number;
    uid: string;
    title: string;
    description?: string;
    total: number;
    usage_limit: number;
    expires_at?: string;
    status: StatusKey;
    kind: KindKey;
    data?: Record<string, any>;
    customer_id?: number;
    currency_id: number;
    order_id?: number;
    inserted_at: string;
    updated_at: string;
    customer?: Customer;
    currency?: Currency;
    order?: Order;
}
export interface CreatePaymentLinkData {
    title: string;
    description?: string;
    total?: number;
    usage_limit?: number;
    expires_at?: string;
    status?: number;
    kind?: number;
    data?: Record<string, any>;
    customer_id?: number;
    currency_id: number;
    order_id?: number;
}
export interface UpdatePaymentLinkData {
    title?: string;
    description?: string;
    total?: number;
    usage_limit?: number;
    expires_at?: string;
    status?: number;
    kind?: number;
    data?: Record<string, any>;
    customer_id?: number;
    currency_id?: number;
    order_id?: number;
}
export interface FinancialAccount {
    id: number;
    name: string;
    type: string;
    provider: string;
    is_external: boolean;
    fingerprint?: string;
    data?: Record<string, any>;
    record: string;
    record_id: number;
    active: boolean;
    code?: string;
    adapter?: string;
    logo?: string;
    website?: string;
    inserted_at: string;
    updated_at: string;
}
export interface CreateFinancialAccountData {
    name: string;
    type: string;
    provider: string;
    is_external?: boolean;
    fingerprint?: string;
    data?: Record<string, any>;
    record: string;
    record_id: number;
    active?: boolean;
    code?: string;
    adapter?: string;
    logo?: string;
    website?: string;
}
export interface UpdateFinancialAccountData {
    name?: string;
    type?: string;
    provider?: string;
    is_external?: boolean;
    fingerprint?: string;
    data?: Record<string, any>;
    active?: boolean;
    code?: string;
    adapter?: string;
    logo?: string;
    website?: string;
}
export interface FinancialRequest {
    id: number;
    total: number;
    status: number;
    type: number;
    sub_type?: number;
    fee_total: number;
    reference_id?: string;
    reviewed_at?: string;
    due_at?: string;
    balance_on_request: number;
    data?: Record<string, any>;
    source_id?: number;
    destination_id?: number;
    merchant_id: number;
    requester_id: number;
    reviewer_id?: number;
    currency_id: number;
    evidence_file_id?: number;
    inserted_at: string;
    updated_at: string;
    source?: FinancialAccount;
    destination?: FinancialAccount;
    merchant?: Merchant;
    requester?: User;
    reviewer?: User;
    currency?: Currency;
}
export interface CreateFinancialRequestData {
    total: number;
    type: number;
    sub_type?: number;
    reference_id?: string;
    due_at?: string;
    data?: Record<string, any>;
    source_id?: number;
    destination_id?: number;
    currency_id: number;
    evidence_file_id?: number;
}
export interface UpdateFinancialRequestData {
    total?: number;
    status?: number;
    type?: number;
    sub_type?: number;
    fee_total?: number;
    reference_id?: string;
    reviewed_at?: string;
    due_at?: string;
    data?: Record<string, any>;
    source_id?: number;
    destination_id?: number;
    reviewer_id?: number;
    currency_id?: number;
    evidence_file_id?: number;
}
export interface WebhookUrl {
    id: number;
    url: string;
    event: string;
    uid: string;
    merchant_id?: number;
    org_id?: number;
    inserted_at: string;
    updated_at: string;
    merchant?: Merchant;
    organisation?: Organisation;
}
export interface CreateWebhookUrlData {
    url: string;
    event: string;
    merchant_id?: number;
    org_id?: number;
}
export interface UpdateWebhookUrlData {
    url?: string;
    event?: string;
    merchant_id?: number;
    org_id?: number;
}
export interface Token {
    id: number;
    public_key: string;
    title?: string;
    provider: string;
    kind: number;
    enabled: boolean;
    expires?: number;
    user_id: number;
    role_id?: number;
    inserted_at: string;
    updated_at: string;
    user?: User;
}
export interface CreateTokenData {
    title?: string;
    provider: string;
    kind: number;
    enabled?: boolean;
    expires?: number;
    user_id: number;
    role_id?: number;
}
export interface UpdateTokenData {
    title?: string;
    enabled?: boolean;
    expires?: number;
    role_id?: number;
}
export interface ExchangeRate {
    id: number;
    source_id: number;
    destination_id: number;
    rate: number;
    expires?: number;
    source?: string;
    user_id?: number;
    inserted_at: string;
    updated_at: string;
    source_currency?: Currency;
    destination_currency?: Currency;
    user?: User;
}
export interface CreateExchangeRateData {
    source_id: number;
    destination_id: number;
    rate: number;
    expires?: number;
    source?: string;
    user_id?: number;
}
export interface UpdateExchangeRateData {
    rate?: number;
    expires?: number;
    source?: string;
}
export interface Fee {
    id: number;
    title?: string;
    total: number;
    unit: number;
    kind: number;
    priority: number;
    compound: boolean;
    fee_payer: number;
    currency_code?: string;
    hash?: string;
    fee_set_id?: number;
    currency_id?: number;
    user_id?: number;
    inserted_at: string;
    updated_at: string;
    currency?: Currency;
    user?: User;
}
export interface CreateFeeData {
    title?: string;
    total: number;
    unit: number;
    kind: number;
    priority?: number;
    compound?: boolean;
    fee_payer?: number;
    currency_code?: string;
    fee_set_id?: number;
    currency_id?: number;
    user_id?: number;
}
export interface UpdateFeeData {
    title?: string;
    total?: number;
    unit?: number;
    kind?: number;
    priority?: number;
    compound?: boolean;
    fee_payer?: number;
    currency_code?: string;
    fee_set_id?: number;
    currency_id?: number;
    user_id?: number;
}
export interface TransactionEntry {
    id: number;
    amount: number;
    type: number;
    transaction_id: number;
    financial_account_id: number;
    inserted_at: string;
    updated_at: string;
    financial_account?: FinancialAccount;
}
export interface CreateTransactionEntryData {
    amount: number;
    type: number;
    transaction_id: number;
    financial_account_id: number;
}
export interface UpdateTransactionEntryData {
    amount?: number;
    type?: number;
    transaction_id?: number;
    financial_account_id?: number;
}
export interface GenericResource {
    id: number;
    [key: string]: any;
    inserted_at?: string;
    updated_at?: string;
}
export interface BillingPlan {
    id: number;
    name: string;
    description?: string;
    flat_rate: number;
    transaction_fee: number;
    transaction_percentage: number;
    transaction_percentage_additional: number;
    transaction_minimum_fee: number;
    minimum_fee: number;
    duration: number;
    status: StatusKey;
    billing_cycle?: number;
    trial_period: number;
    charge_strategy: number;
    kind: BillingPlanKind;
    auto_charge: boolean;
    public: boolean;
    payout_period: number;
    payout_value_limit: number;
    payout_percentage_limit: number;
    features?: Record<string, any>;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    uid: string;
    currency_id: number;
    payment_provider_id?: number;
    inserted_at: string;
    updated_at: string;
    currency?: Currency;
}
export interface CreateBillingPlanData {
    name: string;
    description?: string;
    flat_rate: number;
    transaction_fee: number;
    transaction_percentage: number;
    transaction_percentage_additional?: number;
    transaction_minimum_fee?: number;
    minimum_fee?: number;
    duration: number;
    billing_cycle?: number;
    trial_period?: number;
    charge_strategy?: number;
    kind?: BillingPlanKind | KindKey | number;
    auto_charge?: boolean;
    public?: boolean;
    payout_period?: number;
    payout_value_limit?: number;
    payout_percentage_limit?: number;
    features?: Record<string, any>;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    currency_id: number;
    payment_provider_id?: number;
}
export interface UpdateBillingPlanData {
    name?: string;
    description?: string;
    flat_rate?: number;
    transaction_fee?: number;
    transaction_percentage?: number;
    transaction_percentage_additional?: number;
    transaction_minimum_fee?: number;
    minimum_fee?: number;
    duration?: number;
    status?: StatusKey;
    billing_cycle?: number;
    trial_period?: number;
    charge_strategy?: number;
    kind?: BillingPlanKind | KindKey | number;
    auto_charge?: boolean;
    public?: boolean;
    payout_period?: number;
    payout_value_limit?: number;
    payout_percentage_limit?: number;
    features?: Record<string, any>;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    currency_id?: number;
    payment_provider_id?: number;
}
export interface Subscription {
    id: number;
    status: StatusKey;
    kind: KindKey;
    record_id: number;
    record: string;
    start_date: string;
    end_date?: string;
    current_period_start?: string;
    current_period_end?: string;
    trial_end?: string;
    canceled_at?: string;
    uid: string;
    token?: string;
    billing_plan_id: number;
    customer_id?: number;
    order_id?: number;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
    billing_plan?: BillingPlan;
    customer?: Customer;
    order?: Order;
    subscription_periods?: SubscriptionPeriod[];
}
export interface CreateSubscriptionData {
    billing_plan_id: number;
    record: string;
    record_id: number;
    start_date: string;
    end_date?: string;
    status?: StatusKey;
    kind?: KindKey;
    current_period_start?: string;
    current_period_end?: string;
    trial_end?: string;
    token?: string;
    customer_id?: number;
    order_id?: number;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
}
export interface SubscriptionPeriod {
    id: number;
    subscription_id: string;
    start_date: string;
    end_date: string;
    status: string;
    inserted_at: string;
    updated_at: string;
}
export interface SubscriptionUsageResponse {
    id: number;
    subscription_id: string;
    usage_amount: number;
    recorded_at: string;
    description?: string;
}
export interface SubscriptionCancelResponse {
    id: number;
    uid: string;
    status: string;
    canceled_at: string;
    cancellation_reason?: string;
}
export interface SubscriptionLinkData {
    uid: string;
    token: string;
}
export interface SubscriptionChargeData {
    amount?: number;
    description?: string;
}
export interface User {
    id: number;
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    username?: string;
    status: AccountStatus;
    level: number;
    dob?: number | null;
    sex?: number | null;
    image?: string | null;
    uid: string;
    kind?: UserKind;
    organisation_id?: number;
    role_id?: number;
    inserted_at: string;
    updated_at: string;
    organisation?: Organisation;
}
export interface CreateUserData {
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    username?: string;
    password: string;
    status?: AccountStatus | StatusKey | number;
    level?: number;
    dob?: number;
    sex?: number;
    image?: string;
    kind?: UserKind | KindKey | number;
    organisation_id?: number;
    role_id?: number;
}
export interface UpdateUserData {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    status?: AccountStatus | StatusKey | number;
    level?: number;
    dob?: number;
    sex?: number;
    image?: string;
    kind?: UserKind | KindKey | number;
    organisation_id?: number;
    role_id?: number;
}
export interface WebhookEvent {
    action: string;
    jwt: string;
    webhook_id?: string;
    data: Record<string, any>;
}
export interface RegistrationWebhookEvent extends WebhookEvent {
    action: 'registration';
    data: {
        client_id: string;
        client_secret: string;
    };
}
export interface PaymentWebhookEvent extends WebhookEvent {
    action: 'payment';
    data: {
        order: Order;
        payment_status: string;
        transaction_id?: string;
    };
}
export interface APIToken {
    id: number;
    public_key: string;
    title?: string;
    provider: string;
    kind: number;
    enabled: boolean;
    expires?: number | null;
    user_id: number;
    role_id?: number | null;
    inserted_at: string;
    updated_at: string;
}
export interface PublicMerchantFees {
    /** New detailed fee breakdown (Oct 2, 2025) */
    sub_total: number;
    discount_total: number;
    shipping_total: number;
    pre_tax_fee_total: number;
    tax_total: number;
    post_tax_fee_total: number;
    /** Party totals */
    customer_total: number;
    platform_total: number;
    provider_total: number;
    merchant_total: number;
    /** Legacy fields for compatibility */
    total: number;
    provider_fee: number;
    platform_fee: number;
    /** Merchant information */
    merchant: {
        username: string;
        name: string;
        email: string;
        phone?: string;
        logo?: string;
        theme_colour?: string;
    };
    /** Currency code */
    currency: string;
}
export interface PublicMerchantProducts {
    products: Product[];
    [key: string]: any;
}
export interface KycRequest {
    id: number;
    kind: KycKind | KindKey;
    status: KycStatus | StatusKey;
    user_id?: number;
    subject_id?: number;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
    user?: User;
}
export interface CreateKycRequestData {
    kind: KycKind | KindKey;
    status?: KycStatus | StatusKey;
    user_id?: number;
    subject_id?: number;
    data?: Record<string, any>;
}
export interface UpdateKycRequestData {
    kind?: KycKind | KindKey;
    status?: KycStatus | StatusKey;
    user_id?: number;
    subject_id?: number;
    data?: Record<string, any>;
}
export interface PayoutRequest {
    id: number;
    total: number;
    status: StatusKey;
    balance_on_request: number;
    reference_id?: string;
    evidence_file_id?: number;
    merchant_id: number;
    requester_id: number;
    type: KindKey;
    sub_type: KindKey;
    reviewer_id?: number;
    reviewed_at?: string;
    due_at: string;
    fee_total: number;
    currency_id: number;
    inserted_at: string;
    updated_at: string;
    merchant?: Merchant;
    requester?: User;
    reviewer?: User;
    currency?: Currency;
}
export interface CreatePayoutRequestData {
    total: number;
    type?: KindKey;
    sub_type?: KindKey;
    reference_id?: string;
    evidence_file_id?: number;
    due_at?: string;
    currency_id?: number;
}
export interface UpdatePayoutRequestData {
    total?: number;
    status?: StatusKey;
    type?: KindKey;
    sub_type?: KindKey;
    reference_id?: string;
    evidence_file_id?: number;
    reviewer_id?: number;
    reviewed_at?: string;
    due_at?: string;
    fee_total?: number;
    currency_id?: number;
}
export interface InternalMerchant {
    id: number;
    name: string;
    email: string;
    username: string;
    about?: string;
    logo?: string;
    sector?: string;
    status: number;
    phone?: string;
    business_type?: string;
    theme_colour?: string;
    uid: string;
    address_id?: number;
    owner_id?: number;
    domain_id?: number;
    organisation_id?: number;
    platform_fee_structure: number;
    provider_fee_structure: number;
    parent_merchant_id?: number;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
}
export interface InternalCreateMerchantData {
    name: string;
    email: string;
    phone?: string;
    about?: string;
    status?: number;
    platform_fee_structure?: number;
    provider_fee_structure?: number;
}
export interface InternalUpdateMerchantData {
    name?: string;
    email?: string;
    phone?: string;
    about?: string;
    status?: number;
    platform_fee_structure?: number;
    provider_fee_structure?: number;
}
export interface InternalCategory {
    id: number;
    name: string;
    description?: string | null;
    kind: number;
    kind_id?: number | null;
    parent_id?: number | null;
    uid: string;
    inserted_at: string;
    updated_at: string;
}
export interface InternalProduct {
    id: number;
    title: string;
    teaser?: string;
    price: number;
    permalink: string;
    image?: string | null;
    status: number;
    public: boolean;
    unlimited: boolean;
    units_remaining?: number | null;
    units_sold?: number | null;
    rating_sum?: number | null;
    rating_count?: number | null;
    tag_ids: number[];
    data?: Record<string, any>;
    meta?: Record<string, any>;
    uid: string;
    category_id?: number;
    currency_id?: number;
    user_id?: number;
    inserted_at: string;
    updated_at: string;
}
export interface InternalOrder {
    id: number;
    reference_id?: string;
    total: number;
    kind: number;
    status: number;
    status_on: number;
    uid: string;
    cart_id?: number | null;
    customer?: Customer;
    currency: Currency;
    billing_plan?: any | null;
    billing_subscription_id?: number;
    order_detail?: Record<string, any>;
    transactions?: any[];
    payment_methods?: PaymentMethod[];
    order_lines: OrderLine[];
    merchant: InternalMerchant;
    organisation: Organisation;
    payment_urls?: {
        short_link: string;
    };
    meta_data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
}
export interface InternalUser {
    id: number;
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    username?: string;
    status: number;
    kind: number;
    level: number;
    dob?: number | null;
    sex?: number | null;
    image?: string | null;
    uid: string;
    organisation_id?: number;
    role_id?: number;
    inserted_at: string;
    updated_at: string;
}
export interface InternalPaymentLink {
    id: number;
    uid: string;
    title: string;
    description?: string;
    total: number;
    usage_limit: number;
    expires_at?: string;
    status: number;
    kind: number;
    data?: Record<string, any>;
    customer_id?: number;
    currency_id: number;
    order_id?: number;
    inserted_at: string;
    updated_at: string;
}
export interface InternalBillingPlan {
    id: number;
    name: string;
    description?: string;
    flat_rate: number;
    transaction_fee: number;
    transaction_percentage: number;
    transaction_percentage_additional: number;
    transaction_minimum_fee: number;
    minimum_fee: number;
    duration: number;
    status: number;
    kind: number;
    billing_cycle?: number;
    trial_period: number;
    charge_strategy: number;
    auto_charge: boolean;
    public: boolean;
    payout_period: number;
    payout_value_limit: number;
    payout_percentage_limit: number;
    features?: Record<string, any>;
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    uid: string;
    currency_id: number;
    payment_provider_id?: number;
    inserted_at: string;
    updated_at: string;
    currency?: Currency;
}
export interface InternalSubscription {
    id: number;
    status: number;
    kind: number;
    current_period_start: string;
    current_period_end: string;
    trial_end?: string;
    canceled_at?: string;
    start_date: string;
    end_date?: string;
    record: string;
    record_id: number;
    customer_id?: number;
    order_id?: number;
    uid: string;
    token?: string;
    billing_plan_id: number;
    has_token: boolean;
    billing_plan: InternalBillingPlan;
    subscription_periods?: SubscriptionPeriod[];
    data?: Record<string, any>;
    meta_data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
}
export interface InternalKycRequest {
    id: number;
    kind: number;
    status: number;
    data?: Record<string, any>;
    user_id: number;
    merchant_id?: number;
    uid: string;
    inserted_at: string;
    updated_at: string;
}
export interface InternalPayoutRequest {
    id: number;
    amount: number;
    currency_code: string;
    status: number;
    type: number;
    sub_type: number;
    data?: Record<string, any>;
    merchant_id: number;
    uid: string;
    inserted_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map