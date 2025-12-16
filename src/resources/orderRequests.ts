// ============================================
// 1. CHECK FEES
// ============================================
interface CheckFeesParams {
  merchant_username: string;
  total: number | string;
  currency_code: string;
  fulfillment_total?: number | string;
  method_id?: string;
}

interface CheckFeesResponse {
  shipping_fee: number;
  sub_total: number;
  total: number;
  transaction_total: number;
  provider_fee: number;
  platform_fee: number;
  tax: number;
  discount: number;
  currency: string;
}

// ============================================
// 2. RECORD ORDER (Create Order)
// ============================================
interface RecordOrderParams {
  reference_id: string;
  kind: 'payment' | 'subscription' | string;
  total: number | string;
  currency_code: string;
  title?: string;
  
  // Customer information (required)
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    kind?: 'merchants' | 'customers' | string;
    kind_id?: number;
  };
  
  // Optional fields
  payment_link_id?: string;
  fulfillment_total?: number | string;
  meta_data?: Record<string, any>;
  data?: Record<string, any>;
  method_id?: string;
  skip_provider?: boolean;
  
  // Products (if applicable)
  products?: Array<{
    id: number | string;
    quantity: number;
  }>;
  
  // Subscription-related (if kind = 'subscription')
  plan_id?: string;
  subscription_token?: string;
  subscription_token_id?: string;
  
  // Addresses (optional)
  billing_address?: string;
  shipping_address?: string;
  
  // Discount/Tax (currently not implemented but structure exists)
  discount?: {
    total: number;
  };
  tax?: {
    total: number;
  };
}

interface RecordOrderResponse {
  // Order details
  id: number;
  uid: string;
  reference_id: string;
  kind: number;
  status: number;
  total: number;
  
  // Related entities
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  
  currency: {
    id: number;
    code: string;
  };
  
  merchant: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    domain?: string;
    logo?: string;
  };
  
  order_detail: {
    id: number;
    title?: string;
    data: Record<string, any>;
    billing_address_frozen?: string;
    shipping_address_frozen?: string;
    merchant_name_frozen: string;
    tax_total_frozen: number;
    discount_total_frozen: number;
  };
  
  order_lines?: Array<{
    id: number;
    variant_id: number;
    quantity: number;
    product_variant_name_frozen: string;
    product_variant_total_frozen: number;
  }>;
  
  transaction: {
    id: number;
    total: number;
    provider_fee: number;
    platform_fee: number;
    status: number;
    kind: number;
    payment_method_id: number;
  };
  
  transactions: Array<any>;
  transaction_logs: Array<any>;
  
  invoice_link: {
    id: number;
    uid: string;
  };
  
  payment_urls: {
    short_link: string;
    payment_url?: string;
    [key: string]: any;
  };
  
  billing_plan?: {
    id: number;
    uid: string;
    [key: string]: any;
  };
  
  subscription_token?: string;
  
  // Timestamps
  inserted_at: string;
  updated_at: string;
  status_on?: number;
}

// ============================================
// 3. UPDATE WITH METHOD
// ============================================
interface UpdateWithMethodParams {
  order_id: string | number;
  method_id: string | number;
  
  // Optional fields
  subscription_token?: string;
  subscription_token_id?: string;
  skip_provider?: boolean;
  discount?: {
    total: number;
  };
  tax?: {
    total: number;
  };
}

interface UpdateWithMethodResponse {
  // Same structure as RecordOrderResponse
  // The formatted order with updated payment method
  id: number;
  uid: string;
  reference_id: string;
  kind: number;
  status: number;
  total: number;
  
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  
  currency: {
    id: number;
    code: string;
  };
  
  merchant: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    domain?: string;
    logo?: string;
  };
  
  order_detail: {
    id: number;
    title?: string;
    data: Record<string, any>;
    billing_address_frozen?: string;
    shipping_address_frozen?: string;
    merchant_name_frozen: string;
    tax_total_frozen: number;
    discount_total_frozen: number;
  };
  
  transaction: {
    id: number;
    total: number;
    provider_fee: number;
    platform_fee: number;
    status: number;
    kind: number;
    payment_method_id: number;
  };
  
  transactions: Array<any>;
  transaction_logs: Array<any>;
  
  invoice_link: {
    id: number;
    uid: string;
  };
  
  payment_urls: {
    short_link: string;
    payment_url?: string;
    [key: string]: any;
  };
  
  provider_config: {
    provider_id: number;
    name: string;
    adapter: string;
    [key: string]: any;
  };
  
  // Timestamps
  inserted_at: string;
  updated_at: string;
  status_on?: number;
}

// ============================================
// EXAMPLE USAGE
// ============================================

// Example 1: Check Fees
const checkFeesRequest: CheckFeesParams = {
  merchant_username: "example-merchant",
  total: 100.00,
  currency_code: "USD",
  fulfillment_total: 10.00,
  method_id: "123"
};

// Example 2: Record Order (Payment)
const recordPaymentRequest: RecordOrderParams = {
  reference_id: "order-12345",
  kind: "payment",
  total: 150.00,
  currency_code: "JMD",
  title: "My Order",
  customer: {
    email: "customer@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+1876555555"
  },
  fulfillment_total: 20.00,
  products: [
    { id: 1, quantity: 2 },
    { id: 5, quantity: 1 }
  ],
  method_id: "456"
};

// Example 3: Record Order (Subscription)
const recordSubscriptionRequest: RecordOrderParams = {
  reference_id: "iasub-d7m08ro",
  kind: "subscription",
  total: 0,
  currency_code: "JMD",
  title: "Subscription to Pro",
  plan_id: "1ceefc2f-b0ec-4399-a92d-a096b8c077f4",
  subscription_token_id: "3c63cafc-4a0d-4417-9171-0a47f1fff958",
  products: [],
  customer: {
    kind: "merchants",
    kind_id: 35,
    first_name: "Romario",
    last_name: "Fitzgerald",
    email: "admin@fleeksite.com"
  }
};

// Example 4: Update With Method
const updateMethodRequest: UpdateWithMethodParams = {
  order_id: 123,
  method_id: 789
};