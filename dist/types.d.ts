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
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginationMeta {
    page: number;
    page_size: number;
    total_entries: number;
    total_pages: number;
    more: boolean;
    next_page?: number;
    last_page?: number;
    next_pages: number[];
    last_pages: number[];
}
export interface PaginatedResponse<T> {
    entries: T[];
    pagination: PaginationMeta;
}
export interface ApiResponse<T = any> {
    state: 'ok' | 'error';
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
    street: string;
    street_optional?: string;
    town?: string;
    city?: string;
    state: string;
    region?: string;
    postal_code?: string;
    country_code?: string;
    country: string;
}
export interface BankInfo {
    account_holder_name: string;
    account_holder_type: 'Business' | 'Individual';
    account_number: string;
    account_type: 'Checking' | 'Savings';
    bank_name: string;
    branch_name?: string;
    branch_code?: string;
    routing_number?: string;
    swift_code?: string;
}
export interface PublicMerchant {
    id: number;
    name: string;
    username: string;
    about?: string;
    logo?: string;
    sector?: string;
    theme_colour?: string;
    domain?: {
        cname?: string;
    };
}
export interface Merchant {
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
    is_pre_verified: boolean;
    webhook_url?: string;
    plan_id?: number;
    payment_provider_plan_id?: number;
    platform_fee_structure: 'customer_pay' | 'merchant_absorb';
    provider_fee_structure: 'customer_pay' | 'merchant_absorb';
    address?: Address;
    data: {
        pickup_locations?: Array<{
            name: string;
            address: Address;
        }>;
        support?: {
            phone: string;
            email: string;
            whatsapp?: string;
        };
        presence?: "Virtual" | "Physical";
        bank_info?: BankInfo;
        registration_webhook?: string;
        secure?: {
            [key: string]: any;
        };
        [key: string]: any;
    };
    organisation?: Organisation;
    domain?: {
        cname?: string;
    };
    created_at: string;
    updated_at: string;
}
export interface SupportData {
    phone: string;
    email: string;
    whatsapp?: string;
}
export interface CreateMerchantData {
    name: string;
    email: string;
    username: string;
    phone: string;
    about?: string;
    logo?: string;
    sector?: string;
    business_type?: string;
    theme_colour?: string;
    is_pre_verified?: boolean;
    webhook_url?: string;
    plan_id?: number;
    payment_provider_plan_id?: number;
    platform_fee_structure: 'customer_pay' | 'merchant_absorb';
    provider_fee_structure: 'customer_pay' | 'merchant_absorb';
    address?: Address;
    data?: {
        pickup_locations?: Array<{
            name: string;
            address: Address;
        }>;
        support: SupportData;
        presence?: "Virtual" | "Physical";
        bank_info?: BankInfo;
        registration_webhook?: string;
        secure?: {
            [key: string]: any;
        };
        [key: string]: any;
    };
    domain?: {
        cname?: string;
    };
}
export interface UpdateMerchantData {
    name?: string;
    username?: string;
    phone?: string;
    about?: string;
    logo?: string;
    sector?: string;
    business_type?: string;
    theme_colour?: string;
    is_pre_verified?: boolean;
    webhook_url?: string;
    plan_id?: number;
    payment_provider_plan_id?: number;
    platform_fee_structure?: 'customer_pay' | 'merchant_absorb';
    provider_fee_structure?: 'customer_pay' | 'merchant_absorb';
    address?: Address;
    data?: {
        pickup_locations?: Array<{
            name: string;
            address: Partial<Address>;
        }>;
        support?: Partial<SupportData>;
        presence?: "Virtual" | "Physical";
        bank_info?: BankInfo;
        registration_webhook?: string;
        secure?: {
            [key: string]: any;
        };
        [key: string]: any;
        any: any;
    };
    domain?: {
        cname?: string;
    };
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
    domain?: {
        cname?: string;
    };
}
export interface Category {
    id: number;
    name: string;
    description?: string | null;
    kind: number;
    kind_id?: number | null;
    parent_id?: number | null;
    merchant_id: number | null;
    merchant?: Merchant | null;
    parent?: {
        id: number;
        name: string;
    } | null;
    children?: {
        id: number;
        name: string;
    }[];
    created_at: string;
    updated_at: string;
}
export interface CreateCategoryData {
    name: string;
    description?: string;
    kind: number;
    kind_id?: number;
    parent_id?: number;
}
export interface UpdateCategoryData extends Partial<Omit<CreateCategoryData, 'parent_id'>> {
}
export interface Product {
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
    currency: Currency;
    category?: Category;
    merchant: Merchant;
    created_at: string;
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
}
export interface UpdateProductData extends Partial<CreateProductData> {
    status?: number;
}
export interface Order {
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
    merchant: Merchant;
    organisation: Organisation;
    payment_urls?: {
        short_link: string;
    };
    created_at: string;
    updated_at: string;
}
export interface OrderLine {
    product_id: number;
    quantity: number;
    price?: number;
}
export interface OrderCreateRequest {
    reference_id?: string;
    kind: string;
    total?: number;
    currency_code: string;
    customer?: {
        email: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
    };
    products?: OrderLine[];
    method_id?: string;
    data?: {
        shipping_address?: Partial<Address>;
        fulfillment_type?: 'delivery' | 'pickup';
        pickup_location?: string;
    };
    payment_link_id?: string;
}
export interface UpdateOrderData {
    status?: number;
    meta_data?: Record<string, any>;
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
    data?: Record<string, any>;
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
    status: number;
    billing_cycle: number;
    trial_period: number;
    charge_strategy: number;
    kind: number;
    auto_charge: boolean;
    currency: Currency;
    features?: string[];
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
    billing_cycle: number;
    trial_period?: number;
    charge_strategy?: number;
    kind?: number;
    auto_charge?: boolean;
    currency_id: number;
    features?: string[];
}
export interface UpdateBillingPlanData extends Partial<CreateBillingPlanData> {
    status?: number;
}
export interface Subscription {
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
    billing_plan: BillingPlan;
    subscription_periods?: SubscriptionPeriod[];
}
export interface CreateSubscriptionData {
    billing_plan_id: number;
    record: string;
    record_id: number;
    start_date: string;
    end_date?: string;
    status: number;
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
    first_name?: string;
    last_name?: string;
    username?: string;
    status: number;
    level: number;
    dob?: number | null;
    sex?: number | null;
    image?: string | null;
    uid: string;
    role?: {
        id: number;
        name: string;
    };
    organisation?: Organisation;
    merchant?: Merchant;
    created_at: string;
    updated_at: string;
}
export interface CreateUserData {
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    password: string;
    role_id?: number;
}
export interface UpdateUserData {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    status?: number;
    level?: number;
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
export interface CreateKycRequestData {
    subject_id: number;
    user_id: number;
    data: Record<string, any>;
}
export interface KycRequest {
    kind: number;
    subject_id: number;
    user_id: number;
    data: Record<string, any>;
    status: number;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map