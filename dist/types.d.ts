import type { FeeStructureKey, KindKey, StatusKey } from './utils/translators';
import type { QueryParams, RangeQuery, StringQuery, DateQuery, JsonQueryParams } from './utils/query-transformer';
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
export type { QueryParams, RangeQuery, StringQuery, DateQuery, JsonQueryParams } from './utils/query-transformer';
export type MerchantQueryParams = QueryParams<Merchant>;
export type ProductQueryParams = QueryParams<Product>;
export type CategoryQueryParams = QueryParams<Category>;
export type UserQueryParams = QueryParams<User>;
export type BillingPlanQueryParams = QueryParams<BillingPlan>;
export type SubscriptionQueryParams = QueryParams<Subscription>;
export interface OrderQueryParams {
    id?: number | number[];
    reference_id?: string | string[] | StringQuery;
    total?: number | number[] | RangeQuery<number>;
    status?: OrderStatus | OrderStatus[] | StringQuery;
    kind?: OrderKind | OrderKind[] | StringQuery;
    status_on?: number | number[] | RangeQuery<number>;
    uid?: string | string[] | StringQuery;
    cart_id?: number | number[];
    inserted_at?: string | DateQuery;
    updated_at?: string | DateQuery;
    exclude?: string | number;
    distinct?: string;
    order_by?: string;
    data?: JsonQueryParams;
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
export interface InkressConfig {
    /** Bearer token for authentication */
    bearerToken: string;
    /** API endpoint URL */
    endpoint?: string;
    /** API version */
    apiVersion?: string;
    /** Client ID for request identification (format: m-{merchant.username}) */
    clientId?: string;
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
    data?: T;
    result?: T;
}
export interface ErrorResponse {
    state: 'error';
    data: {
        result: string;
    } | {
        reason: string;
    } | string | Record<string, string[]>;
}
export interface ValidationError {
    state: 'error';
    data: Record<string, string[]>;
}
export interface Currency {
    id: number;
    code: string;
    symbol: string;
    name: string;
}
export interface Organisation {
    id: number;
    name: string;
    description: string;
}
export interface Address {
    address: string;
    address2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
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
    meta_data?: Record<string, any>;
    session_id?: string;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
}
export interface OrderLine {
    product_id: number;
    quantity: number;
    price: number;
}
export interface CreateOrderData {
    reference_id?: string;
    total: number;
    kind?: OrderKind | KindKey | number;
    status?: OrderStatus | StatusKey | number;
    status_on?: number;
    cart_id?: number;
    currency_id?: number;
    customer_id?: number;
    payment_link_id?: number;
    billing_plan_id?: number;
    meta_data?: Record<string, any>;
    session_id?: string;
    data?: Record<string, any>;
}
export interface UpdateOrderData {
    reference_id?: string;
    total?: number;
    kind?: OrderKind | KindKey | number;
    status?: OrderStatus | StatusKey | number;
    status_on?: number;
    cart_id?: number;
    currency_id?: number;
    customer_id?: number;
    payment_link_id?: number;
    billing_plan_id?: number;
    meta_data?: Record<string, any>;
    session_id?: string;
    data?: Record<string, any>;
}
export interface OrderStats {
    [key: string]: any;
}
export interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    provider: string;
    active: boolean;
}
export interface Customer {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    phone?: string;
    created_at: string;
    metadata?: Record<string, any>;
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
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
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
    data?: Record<string, any>;
}
export interface SubscriptionPeriod {
    id: number;
    subscription_id: string;
    start_date: string;
    end_date: string;
    amount: number;
    currency: Currency;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    charged_at?: string;
    created_at: string;
    metadata?: Record<string, any>;
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
    [key: string]: any;
}
export interface PublicMerchantProducts {
    products: Product[];
    [key: string]: any;
}
export interface KycRequest {
    id: number;
    kind: KindKey;
    user_id?: number;
    subject_id?: number;
    data?: Record<string, any>;
    inserted_at: string;
    updated_at: string;
}
export interface CreateKycRequestData {
    kind: KindKey;
    user_id?: number;
    subject_id?: number;
    data?: Record<string, any>;
}
export interface UpdateKycRequestData {
    kind?: KindKey;
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
    billing_cycle: number;
    trial_period: number;
    charge_strategy: number;
    auto_charge: boolean;
    currency: Currency;
    features?: string[];
    inserted_at: string;
    updated_at: string;
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
    uid: string;
    token?: string;
    billing_plan_id: number;
    has_token: boolean;
    billing_plan: InternalBillingPlan;
    subscription_periods?: SubscriptionPeriod[];
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