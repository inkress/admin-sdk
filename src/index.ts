import { HttpClient } from './client';
import { InkressConfig } from './types';

// Import resources
import { MerchantsResource } from './resources/merchants';
import { CategoriesResource } from './resources/categories';
import { OrdersResource } from './resources/orders';
import { ProductsResource } from './resources/products';
import { BillingPlansResource } from './resources/billing-plans';
import { SubscriptionsResource } from './resources/subscriptions';
import { UsersResource } from './resources/users';
import { PublicResource } from './resources/public';
import { KycResource } from './resources/kyc';
import { PaymentLinksResource } from './resources/payment-links';
import { FinancialAccountsResource } from './resources/financial-accounts';
import { FinancialRequestsResource } from './resources/financial-requests';
import { WebhookUrlsResource } from './resources/webhook-urls';
import { TokensResource } from './resources/tokens';
import { AddressesResource } from './resources/addresses';
import { CurrenciesResource } from './resources/currencies';
import { ExchangeRatesResource } from './resources/exchange-rates';
import { FeesResource } from './resources/fees';
import { PaymentMethodsResource } from './resources/payment-methods';
import { TransactionEntriesResource } from './resources/transaction-entries';
import { GenericsResource } from './resources/generics';

/**
 * Main Inkress Commerce API SDK class
 * 
 * @example
 * ```typescript
 * import { InkressSDK } from '@inkress/admin-sdk';
 * 
 * const inkress = new InkressSDK({
 *   accessToken: 'your-jwt-token',
 *   username: 'merchant-username', // Optional - automatically prepended with 'm-'
 *   mode: 'live', // Optional - 'live' (default) or 'sandbox'
 *   apiVersion: 'v1', // Optional, defaults to v1
 * });
 * 
 * // List merchants
 * const merchants = await inkress.merchants.list();
 * 
 * // Get public merchant information (no auth required)
 * const publicMerchant = await inkress.public.getMerchant({ username: 'merchant-username' });
 * 
 * // List categories
 * const categories = await inkress.categories.list();
 * 
 * // Create a category
 * const category = await inkress.categories.create({
 *   name: 'Electronics',
 *   description: 'Electronic devices and accessories',
 *   kind: 1
 * });
 * 
 * // Create an order
 * const order = await inkress.orders.create({
 *   currency_code: 'USD',
 *   customer: {
 *     email: 'customer@example.com',
 *     first_name: 'John',
 *     last_name: 'Doe'
 *   },
 *   total: 29.99,
 *   reference_id: 'order-123'
 * });
 * ```
 */
export class InkressSDK {
  private client: HttpClient;
  
  // Resource instances
  public readonly merchants: MerchantsResource;
  public readonly categories: CategoriesResource;
  public readonly orders: OrdersResource;
  public readonly products: ProductsResource;
  public readonly billingPlans: BillingPlansResource;
  public readonly subscriptions: SubscriptionsResource;
  public readonly users: UsersResource;
  public readonly public: PublicResource;
  public readonly kyc: KycResource;
  public readonly paymentLinks: PaymentLinksResource;
  public readonly financialAccounts: FinancialAccountsResource;
  public readonly financialRequests: FinancialRequestsResource;
  public readonly webhookUrls: WebhookUrlsResource;
  public readonly tokens: TokensResource;
  public readonly addresses: AddressesResource;
  public readonly currencies: CurrenciesResource;
  public readonly exchangeRates: ExchangeRatesResource;
  public readonly fees: FeesResource;
  public readonly paymentMethods: PaymentMethodsResource;
  public readonly transactionEntries: TransactionEntriesResource;
  public readonly generics: GenericsResource;

  constructor(config: InkressConfig) {
    this.client = new HttpClient(config);
    
    // Initialize resources
    this.merchants = new MerchantsResource(this.client);
    this.categories = new CategoriesResource(this.client);
    this.orders = new OrdersResource(this.client);
    this.products = new ProductsResource(this.client);
    this.billingPlans = new BillingPlansResource(this.client);
    this.subscriptions = new SubscriptionsResource(this.client);
    this.users = new UsersResource(this.client);
    this.public = new PublicResource(this.client);
    this.kyc = new KycResource(this.client);
    this.paymentLinks = new PaymentLinksResource(this.client);
    this.financialAccounts = new FinancialAccountsResource(this.client);
    this.financialRequests = new FinancialRequestsResource(this.client);
    this.webhookUrls = new WebhookUrlsResource(this.client);
    this.tokens = new TokensResource(this.client);
    this.addresses = new AddressesResource(this.client);
    this.currencies = new CurrenciesResource(this.client);
    this.exchangeRates = new ExchangeRatesResource(this.client);
    this.fees = new FeesResource(this.client);
    this.paymentMethods = new PaymentMethodsResource(this.client);
    this.transactionEntries = new TransactionEntriesResource(this.client);
    this.generics = new GenericsResource(this.client);
  }

  /**
   * Update the SDK configuration
   */
  updateConfig(newConfig: Partial<InkressConfig>): void {
    this.client.updateConfig(newConfig);
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<InkressConfig, 'accessToken'> {
    return this.client.getConfig();
  }
}

// Export everything users might need
export * from './types';
export * from './client';
export { InkressSDK as default };

// Export resource-specific types for better IntelliSense
export type {
  // Query parameter types
  OrderQueryParams,
  ProductQueryParams,
  UserQueryParams,
  MerchantQueryParams,
  CategoryQueryParams,
  BillingPlanQueryParams,
  SubscriptionQueryParams,
  PaymentLinkQueryParams,
  FinancialAccountQueryParams,
  FinancialRequestQueryParams,
  WebhookUrlQueryParams,
  TokenQueryParams,
  AddressQueryParams,
  CurrencyQueryParams,
  ExchangeRateQueryParams,
  FeeQueryParams,
  PaymentMethodQueryParams,
  TransactionEntryQueryParams,
  
  // Filter parameter types (legacy, but still supported)
  OrderFilterParams,
  ProductFilterParams,
  UserFilterParams,
  MerchantFilterParams,
  CategoryFilterParams,
  BillingPlanFilterParams,
  SubscriptionFilterParams,
  PaymentLinkFilterParams,
  FinancialAccountFilterParams,
  FinancialRequestFilterParams,
  WebhookUrlFilterParams,
  TokenFilterParams,
  AddressFilterParams,
  CurrencyFilterParams,
  ExchangeRateFilterParams,
  FeeFilterParams,
  PaymentMethodFilterParams,
  TransactionEntryFilterParams,
  
  // List response types
  OrderListResponse,
  ProductListResponse,
  UserListResponse,
  MerchantListResponse,
  CategoryListResponse,
  BillingPlanListResponse,
  SubscriptionListResponse,
  PaymentLinkListResponse,
  FinancialAccountListResponse,
  FinancialRequestListResponse,
  WebhookUrlListResponse,
  TokenListResponse,
  AddressListResponse,
  CurrencyListResponse,
  ExchangeRateListResponse,
  FeeListResponse,
  PaymentMethodListResponse,
  TransactionEntryListResponse,
  
  // Field type constants for advanced usage
  PageInfo,
} from './types/resources';

// Export field type mappings for advanced usage
export {
  ORDER_FIELD_TYPES,
  PRODUCT_FIELD_TYPES,
  USER_FIELD_TYPES,
  MERCHANT_FIELD_TYPES,
  CATEGORY_FIELD_TYPES,
  BILLING_PLAN_FIELD_TYPES,
  SUBSCRIPTION_FIELD_TYPES,
  PAYMENT_LINK_FIELD_TYPES,
  FINANCIAL_ACCOUNT_FIELD_TYPES,
  FINANCIAL_REQUEST_FIELD_TYPES,
  WEBHOOK_URL_FIELD_TYPES,
  TOKEN_FIELD_TYPES,
  ADDRESS_FIELD_TYPES,
  CURRENCY_FIELD_TYPES,
  EXCHANGE_RATE_FIELD_TYPES,
  FEE_FIELD_TYPES,
  PAYMENT_METHOD_FIELD_TYPES,
  TRANSACTION_ENTRY_FIELD_TYPES,
} from './types/resources';

// Export query system utilities and types
export {
  processQuery,
  QueryBuilder,
  type QueryParams,
  type RangeQuery,
  type StringQuery,
  type DateQuery,
  type JsonQueryParams,
} from './utils/query-transformer';

// Export all resource query builders
export {
  OrderQueryBuilder,
  ProductQueryBuilder,
  UserQueryBuilder,
  MerchantQueryBuilder,
  CategoryQueryBuilder,
  BillingPlanQueryBuilder,
  SubscriptionQueryBuilder,
  PaymentLinkQueryBuilder,
  FinancialAccountQueryBuilder,
  FinancialRequestQueryBuilder,
  WebhookUrlQueryBuilder,
  TokenQueryBuilder,
  AddressQueryBuilder,
  CurrencyQueryBuilder,
  ExchangeRateQueryBuilder,
  FeeQueryBuilder,
  PaymentMethodQueryBuilder,
  TransactionEntryQueryBuilder,
  type Queryable,
} from './utils/query-builders';
