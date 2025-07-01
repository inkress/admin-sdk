// Configuration and base types
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
  sort?: string;
  order?: 'asc' | 'desc';
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

// Standard API response types
export interface ApiResponse<T = any> {
  state: 'ok' | 'error';
  data?: T;
  result?: T;
}

export interface ErrorResponse {
  state: 'error';
  data: 
    | { result: string }
    | { reason: string }
    | string
    | Record<string, string[]>; // validation errors
}

export interface ValidationError {
  state: 'error';
  data: Record<string, string[]>;
}

// Currency type
export interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
}

// Organisation type
export interface Organisation {
  id: number;
  name: string;
  description: string;
}

// Address type
export interface Address {
  address: string;
  address2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// Merchant types
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
  address?: {
    street?: string;
    street_optional?: string;
    town?: string;
    city?: string;
    province?: string;
    region?: string;
  };
  data?: {
    pickup_locations?: Array<{
      name: string;
      address: string;
    }>;
    support_phone?: string;
    support_email?: string;
    business_setup?: string;
    bank_info?: {
      account_holder_name?: string;
      account_holder_type?: 'Business' | 'Individual';
      account_number?: string;
      account_type?: 'Checking' | 'Savings';
      bank_name?: string;
      branch_name?: string;
      branch_code?: string;
      routing_number?: string;
      swift_code?: string;
    };
    registration_webhook?: string;
  };
  organisation?: Organisation;
  domain?: {
    cname?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateMerchantData {
  name: string;
  email: string;
  phone?: string;
  about?: string;
}

export interface UpdateMerchantData {
  name?: string;
  email?: string;
  phone?: string;
  about?: string;
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

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string | null;
  kind: number;
  kind_id?: number | null;
  parent_id?: number | null;
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
  // parent_id is immutable after creation
}

// Product types
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
  organisation: Organisation;
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

// Order types
export interface Order {
  id: number;
  reference_id?: string;
  total: number;
  kind: number; // 1=offline, 2=online, 3=subscription
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
  meta_data?: Record<string, any>;
  created_at: string;
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
  kind?: number;
  order_lines: OrderLine[];
  meta_data?: Record<string, any>;
}

export interface UpdateOrderData {
  status?: number;
  meta_data?: Record<string, any>;
}

export interface OrderStats {
  // This would be defined based on the actual response from /orders/stats
  [key: string]: any;
}

// Payment Method types
export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  provider: string;
  active: boolean;
}

// Customer types
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

// Billing Plan types
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
  status: number; // 1=active, 2=inactive
  billing_cycle: number; // 1=daily, 2=weekly, 3=monthly, 4=yearly
  trial_period: number;
  charge_strategy: number; // 1=immediate, 2=delayed
  kind: number; // 1=payments, 2=subscription
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

// Subscription types
export interface Subscription {
  id: number;
  status: number; // 1=pending, 2=active, 3=cancelled
  kind: number; // 1=invoice, 2=subscription
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  canceled_at?: string;
  start_date: string;
  end_date?: string;
  record: string; // e.g., "merchants", "users"
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

// User types
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
  sex?: number | null; // 1=male, 2=female, 3=other
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

// Webhook types
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

// API Token types (if there are endpoints for token management)
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

// Public merchant data types (for public endpoints)
export interface PublicMerchantFees {
  // Structure would depend on actual API response
  [key: string]: any;
}

export interface PublicMerchantProducts {
  products: Product[];
  // Additional pagination or metadata
  [key: string]: any;
}
