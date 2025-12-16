/**
 * Resource-specific query builders
 * 
 * This file provides fluent query builder interfaces for each resource type,
 * offering excellent IntelliSense and type safety for complex queries.
 */

import { QueryBuilder } from './query-transformer';
import type { ApiResponse } from '../types';
import type {
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
  PostListResponse,
  TransactionEntryListResponse,
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
  PostQueryParams,
  TransactionEntryQueryParams,
} from '../types/resources';
import type {
  Order,
  Product,
  User,
  Merchant,
  Category,
  BillingPlan,
  Subscription,
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
  Post,
  TransactionEntry,
  OrderStatus,
  OrderKind,
  ProductStatus,
  AccountStatus,
  UserKind,
  CategoryKind,
  BillingPlanKind,
  SubscriptionStatus,
} from '../types';
import type { FeeStructureKey } from './translators';

/**
 * Interface for resources that support querying
 */
export interface Queryable<TResponse> {
  query(params?: any): Promise<ApiResponse<TResponse>>;
}

/**
 * Order Query Builder
 * Provides a fluent interface for building complex order queries
 * 
 * @example
 * const orders = await sdk.orders.createQueryBuilder()
 *   .whereStatus('confirmed')
 *   .whereTotalRange(100, 1000)
 *   .whereReferenceContains('ORDER-2024')
 *   .paginate(1, 20)
 *   .orderBy('inserted_at', 'desc')
 *   .execute();
 */
export class OrderQueryBuilder extends QueryBuilder<Order> {
  constructor(
    private resource: Queryable<OrderListResponse>,
    initialQuery?: OrderQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<OrderListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by order status (contextual values)
   */
  whereStatus(status: OrderStatus | OrderStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Filter by order kind/type (contextual values)
   */
  whereKind(kind: OrderKind | OrderKind[]): this {
    if (Array.isArray(kind)) {
      return this.whereIn('kind', kind as any);
    }
    return this.where('kind', kind as any);
  }

  /**
   * Filter by total amount range
   */
  whereTotalRange(min?: number, max?: number): this {
    return this.whereRange('total', min, max);
  }

  /**
   * Filter by reference ID containing a string
   */
  whereReferenceContains(value: string): this {
    return this.whereContains('reference_id', value);
  }

  /**
   * Filter by creation date range
   */
  whereCreatedBetween(after?: string, before?: string): this {
    return this.whereDateRange('inserted_at', after, before);
  }

  /**
   * Filter by customer ID
   */
  whereCustomer(customerId: number | number[]): this {
    if (Array.isArray(customerId)) {
      return this.whereIn('customer_id', customerId);
    }
    return this.where('customer_id', customerId);
  }

  /**
   * Filter by billing plan ID
   */
  whereBillingPlan(planId: number | number[]): this {
    if (Array.isArray(planId)) {
      return this.whereIn('billing_plan_id', planId);
    }
    return this.where('billing_plan_id', planId);
  }
}

/**
 * Product Query Builder
 * Provides a fluent interface for building complex product queries
 * 
 * @example
 * const products = await sdk.products.createQueryBuilder()
 *   .whereStatus('published')
 *   .wherePriceRange(10, 100)
 *   .whereTitleContains('shirt')
 *   .wherePublic(true)
 *   .paginate(1, 20)
 *   .execute();
 */
export class ProductQueryBuilder extends QueryBuilder<Product> {
  constructor(
    private resource: Queryable<ProductListResponse>,
    initialQuery?: ProductQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<ProductListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by product status
   */
  whereStatus(status: ProductStatus | ProductStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Filter by price range
   */
  wherePriceRange(min?: number, max?: number): this {
    return this.whereRange('price', min, max);
  }

  /**
   * Filter by title containing a string
   */
  whereTitleContains(value: string): this {
    return this.whereContains('title', value);
  }

  /**
   * Filter by public visibility
   */
  wherePublic(isPublic: boolean): this {
    return this.where('public', isPublic);
  }

  /**
   * Filter by category
   */
  whereCategory(categoryId: number | number[]): this {
    if (Array.isArray(categoryId)) {
      return this.whereIn('category_id', categoryId);
    }
    return this.where('category_id', categoryId);
  }

  /**
   * Filter by availability (units remaining)
   */
  whereUnitsRemainingRange(min?: number, max?: number): this {
    return this.whereRange('units_remaining', min, max);
  }

  /**
   * Filter by unlimited flag
   */
  whereUnlimited(isUnlimited: boolean): this {
    return this.where('unlimited', isUnlimited);
  }
}

/**
 * User Query Builder
 * Provides a fluent interface for building complex user queries
 * 
 * @example
 * const users = await sdk.users.createQueryBuilder()
 *   .whereStatus('approved')
 *   .whereKind('organisation')
 *   .whereEmailContains('@example.com')
 *   .whereLevelRange(5, 10)
 *   .paginate(1, 20)
 *   .execute();
 */
export class UserQueryBuilder extends QueryBuilder<User> {
  constructor(
    private resource: Queryable<UserListResponse>,
    initialQuery?: UserQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<UserListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by account status
   */
  whereStatus(status: AccountStatus | AccountStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Filter by user kind/type
   */
  whereKind(kind: UserKind | UserKind[]): this {
    if (Array.isArray(kind)) {
      return this.whereIn('kind', kind as any);
    }
    return this.where('kind', kind as any);
  }

  /**
   * Filter by email containing a string
   */
  whereEmailContains(value: string): this {
    return this.whereContains('email', value);
  }

  /**
   * Filter by username containing a string
   */
  whereUsernameContains(value: string): this {
    return this.whereContains('username', value);
  }

  /**
   * Filter by user level range
   */
  whereLevelRange(min?: number, max?: number): this {
    return this.whereRange('level', min, max);
  }

  /**
   * Filter by organization
   */
  whereOrganisation(orgId: number | number[]): this {
    if (Array.isArray(orgId)) {
      return this.whereIn('organisation_id', orgId);
    }
    return this.where('organisation_id', orgId);
  }

  /**
   * Filter by role
   */
  whereRole(roleId: number | number[]): this {
    if (Array.isArray(roleId)) {
      return this.whereIn('role_id', roleId);
    }
    return this.where('role_id', roleId);
  }
}

/**
 * Merchant Query Builder
 * Provides a fluent interface for building complex merchant queries
 * 
 * @example
 * const merchants = await sdk.merchants.createQueryBuilder()
 *   .whereStatus('approved')
 *   .whereNameContains('Store')
 *   .whereSector('retail')
 *   .paginate(1, 20)
 *   .execute();
 */
export class MerchantQueryBuilder extends QueryBuilder<Merchant> {
  constructor(
    private resource: Queryable<MerchantListResponse>,
    initialQuery?: MerchantQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<MerchantListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by merchant status
   */
  whereStatus(status: AccountStatus | AccountStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Filter by name containing a string
   */
  whereNameContains(value: string): this {
    return this.whereContains('name', value);
  }

  /**
   * Filter by email containing a string
   */
  whereEmailContains(value: string): this {
    return this.whereContains('email', value);
  }

  /**
   * Filter by sector
   */
  whereSector(sector: string | string[]): this {
    if (Array.isArray(sector)) {
      return this.whereIn('sector', sector);
    }
    return this.where('sector', sector);
  }

  /**
   * Filter by business type
   */
  whereBusinessType(type: string | string[]): this {
    if (Array.isArray(type)) {
      return this.whereIn('business_type', type);
    }
    return this.where('business_type', type);
  }

  /**
   * Filter by platform fee structure
   */
  wherePlatformFeeStructure(structure: FeeStructureKey | FeeStructureKey[]): this {
    if (Array.isArray(structure)) {
      return this.whereIn('platform_fee_structure', structure as any);
    }
    return this.where('platform_fee_structure', structure as any);
  }

  /**
   * Filter by organisation
   */
  whereOrganisation(orgId: number | number[]): this {
    if (Array.isArray(orgId)) {
      return this.whereIn('organisation_id', orgId);
    }
    return this.where('organisation_id', orgId);
  }
}

/**
 * Category Query Builder
 * Provides a fluent interface for building complex category queries
 * 
 * @example
 * const categories = await sdk.categories.createQueryBuilder()
 *   .whereKind('published')
 *   .whereNameContains('Electronics')
 *   .whereParent(null)
 *   .paginate(1, 20)
 *   .execute();
 */
export class CategoryQueryBuilder extends QueryBuilder<Category> {
  constructor(
    private resource: Queryable<CategoryListResponse>,
    initialQuery?: CategoryQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<CategoryListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by category kind
   */
  whereKind(kind: CategoryKind | CategoryKind[]): this {
    if (Array.isArray(kind)) {
      return this.whereIn('kind', kind as any);
    }
    return this.where('kind', kind as any);
  }

  /**
   * Filter by name containing a string
   */
  whereNameContains(value: string): this {
    return this.whereContains('name', value);
  }

  /**
   * Filter by parent category
   */
  whereParent(parentId: number | number[] | null): this {
    if (parentId === null) {
      return this.where('parent_id', null);
    }
    if (Array.isArray(parentId)) {
      return this.whereIn('parent_id', parentId);
    }
    return this.where('parent_id', parentId);
  }

  /**
   * Filter by root categories only (no parent)
   */
  whereRootOnly(): this {
    return this.where('parent_id', null);
  }
}

/**
 * Billing Plan Query Builder
 * Provides a fluent interface for building complex billing plan queries
 * 
 * @example
 * const plans = await sdk.billingPlans.createQueryBuilder()
 *   .whereKind('subscription')
 *   .wherePriceRange(10, 100)
 *   .wherePublic(true)
 *   .paginate(1, 20)
 *   .execute();
 */
export class BillingPlanQueryBuilder extends QueryBuilder<BillingPlan> {
  constructor(
    private resource: Queryable<BillingPlanListResponse>,
    initialQuery?: BillingPlanQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<BillingPlanListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by plan kind/type
   */
  whereKind(kind: BillingPlanKind | BillingPlanKind[]): this {
    if (Array.isArray(kind)) {
      return this.whereIn('kind', kind as any);
    }
    return this.where('kind', kind as any);
  }

  /**
   * Filter by flat rate range
   */
  whereFlatRateRange(min?: number, max?: number): this {
    return this.whereRange('flat_rate', min, max);
  }

  /**
   * Filter by transaction fee range
   */
  whereTransactionFeeRange(min?: number, max?: number): this {
    return this.whereRange('transaction_fee', min, max);
  }

  /**
   * Filter by public visibility
   */
  wherePublic(isPublic: boolean): this {
    return this.where('public', isPublic);
  }

  /**
   * Filter by auto charge
   */
  whereAutoCharge(autoCharge: boolean): this {
    return this.where('auto_charge', autoCharge);
  }

  /**
   * Filter by name containing a string
   */
  whereNameContains(value: string): this {
    return this.whereContains('name', value);
  }

  /**
   * Filter by duration range (in days)
   */
  whereDurationRange(min?: number, max?: number): this {
    return this.whereRange('duration', min, max);
  }
}

/**
 * Subscription Query Builder
 * Provides a fluent interface for building complex subscription queries
 * 
 * @example
 * const subscriptions = await sdk.subscriptions.createQueryBuilder()
 *   .whereStatus('active')
 *   .whereBillingPlan(123)
 *   .whereStartDateAfter('2024-01-01')
 *   .paginate(1, 20)
 *   .execute();
 */
export class SubscriptionQueryBuilder extends QueryBuilder<Subscription> {
  constructor(
    private resource: Queryable<SubscriptionListResponse>,
    initialQuery?: SubscriptionQueryParams
  ) {
    super(initialQuery);
  }

  /**
   * Execute the query and return the results
   */
  async execute(): Promise<ApiResponse<SubscriptionListResponse>> {
    return this.resource.query(this.getRawQuery());
  }

  /**
   * Filter by subscription status
   */
  whereStatus(status: SubscriptionStatus | SubscriptionStatus[]): this {
    if (Array.isArray(status)) {
      return this.whereIn('status', status as any);
    }
    return this.where('status', status as any);
  }

  /**
   * Filter by billing plan
   */
  whereBillingPlan(planId: number | number[]): this {
    if (Array.isArray(planId)) {
      return this.whereIn('billing_plan_id', planId);
    }
    return this.where('billing_plan_id', planId);
  }

  /**
   * Filter by customer
   */
  whereCustomer(customerId: number | number[]): this {
    if (Array.isArray(customerId)) {
      return this.whereIn('customer_id', customerId);
    }
    return this.where('customer_id', customerId);
  }

  /**
   * Filter by start date after a specific date
   */
  whereStartDateAfter(date: string): this {
    return this.whereDateRange('start_date', date, undefined);
  }

  /**
   * Filter by start date before a specific date
   */
  whereStartDateBefore(date: string): this {
    return this.whereDateRange('start_date', undefined, date);
  }

  /**
   * Filter by active subscriptions (not canceled)
   */
  whereActive(): this {
    return this.where('canceled_at', null);
  }

  /**
   * Filter by canceled subscriptions
   */
  whereCanceled(): this {
    // This would need a "not null" check which might require additional logic
    // For now, we can use a date range that's been filled
    return this.whereDateRange('canceled_at', '1970-01-01', undefined);
  }
}

/**
 * Payment Link Query Builder
 */
export class PaymentLinkQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereTotalGreaterThan(amount: number): this {
    return this.whereRange('total', amount, undefined);
  }

  whereTotalLessThan(amount: number): this {
    return this.whereRange('total', undefined, amount);
  }

  whereStatusIn(statuses: number[]): this {
    return this.whereIn('status', statuses);
  }

  whereKindIn(kinds: number[]): this {
    return this.whereIn('kind', kinds);
  }
}

/**
 * Financial Account Query Builder
 */
export class FinancialAccountQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereTypeEquals(type: string): this {
    return this.where('type', type);
  }

  whereProviderContains(provider: string): this {
    return this.whereContains('provider', provider);
  }

  whereActiveEquals(active: boolean): this {
    return this.where('active', active);
  }

  whereIsExternalEquals(isExternal: boolean): this {
    return this.where('is_external', isExternal);
  }
}

/**
 * Financial Request Query Builder
 */
export class FinancialRequestQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereStatusIn(statuses: number[]): this {
    return this.whereIn('status', statuses);
  }

  whereTotalGreaterThan(amount: number): this {
    return this.whereRange('total', amount, undefined);
  }

  whereTotalLessThan(amount: number): this {
    return this.whereRange('total', undefined, amount);
  }

  whereMerchantIdEquals(merchantId: number): this {
    return this.where('merchant_id', merchantId);
  }
}

/**
 * Webhook URL Query Builder
 */
export class WebhookUrlQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereEventEquals(event: string): this {
    return this.where('event', event);
  }

  whereMerchantIdEquals(merchantId: number): this {
    return this.where('merchant_id', merchantId);
  }

  whereOrgIdEquals(orgId: number): this {
    return this.where('org_id', orgId);
  }

  whereUrlContains(url: string): this {
    return this.whereContains('url', url);
  }
}

/**
 * Token Query Builder
 */
export class TokenQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereEnabledEquals(enabled: boolean): this {
    return this.where('enabled', enabled);
  }

  whereKindIn(kinds: number[]): this {
    return this.whereIn('kind', kinds);
  }

  whereUserIdEquals(userId: number): this {
    return this.where('user_id', userId);
  }

  whereProviderEquals(provider: string): this {
    return this.where('provider', provider);
  }
}

/**
 * Address Query Builder
 */
export class AddressQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereCountryEquals(country: string): this {
    return this.where('country', country);
  }

  whereStateEquals(state: string): this {
    return this.where('state', state);
  }

  whereCityContains(city: string): this {
    return this.whereContains('city', city);
  }

  whereKindIn(kinds: number[]): this {
    return this.whereIn('kind', kinds);
  }
}

/**
 * Currency Query Builder
 */
export class CurrencyQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereCodeIn(codes: string[]): this {
    return this.whereIn('code', codes);
  }

  whereIsFloatEquals(isFloat: boolean): this {
    return this.where('is_float', isFloat);
  }
}

/**
 * Exchange Rate Query Builder
 */
export class ExchangeRateQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereSourceIdEquals(sourceId: number): this {
    return this.where('source_id', sourceId);
  }

  whereDestinationIdEquals(destinationId: number): this {
    return this.where('destination_id', destinationId);
  }

  whereRateGreaterThan(rate: number): this {
    return this.whereRange('rate', rate, undefined);
  }
}

/**
 * Fee Query Builder
 */
export class FeeQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereKindIn(kinds: number[]): this {
    return this.whereIn('kind', kinds);
  }

  whereTotalGreaterThan(amount: number): this {
    return this.whereRange('total', amount, undefined);
  }

  whereCurrencyCodeEquals(code: string): this {
    return this.where('currency_code', code);
  }

  whereCompoundEquals(compound: boolean): this {
    return this.where('compound', compound);
  }
}

/**
 * Payment Method Query Builder
 */
export class PaymentMethodQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereActiveEquals(active: boolean): this {
    return this.where('active', active);
  }

  whereProviderEquals(provider: string): this {
    return this.where('provider', provider);
  }

  whereCodeEquals(code: string): this {
    return this.where('code', code);
  }
}

/**
 * Post Query Builder
 */
export class PostQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereStatusIn(statuses: number[]): this {
    return this.whereIn('status', statuses);
  }

  whereKindIn(kinds: number[]): this {
    return this.whereIn('kind', kinds);
  }

  whereAuthorIdEquals(authorId: number): this {
    return this.where('author_id', authorId);
  }

  whereTitleContains(title: string): this {
    return this.whereContains('title', title);
  }
}

/**
 * Transaction Entry Query Builder
 */
export class TransactionEntryQueryBuilder extends QueryBuilder<any> {
  constructor(
    private resource: Queryable<any>,
    initialQuery?: any
  ) {
    super(initialQuery);
  }

  async execute(): Promise<ApiResponse<any>> {
    return this.resource.query(this.getRawQuery());
  }

  whereAmountGreaterThan(amount: number): this {
    return this.whereRange('amount', amount, undefined);
  }

  whereAmountLessThan(amount: number): this {
    return this.whereRange('amount', undefined, amount);
  }

  whereTypeIn(types: number[]): this {
    return this.whereIn('type', types);
  }

  whereTransactionIdEquals(transactionId: number): this {
    return this.where('transaction_id', transactionId);
  }

  whereFinancialAccountIdEquals(accountId: number): this {
    return this.where('financial_account_id', accountId);
  }
}
