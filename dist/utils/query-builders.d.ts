/**
 * Resource-specific query builders
 *
 * This file provides fluent query builder interfaces for each resource type,
 * offering excellent IntelliSense and type safety for complex queries.
 */
import { QueryBuilder } from './query-transformer';
import type { ApiResponse } from '../types';
import type { OrderListResponse, ProductListResponse, UserListResponse, MerchantListResponse, CategoryListResponse, BillingPlanListResponse, SubscriptionListResponse, PaymentLinkListResponse, FinancialAccountListResponse, FinancialRequestListResponse, WebhookUrlListResponse, TokenListResponse, AddressListResponse, CurrencyListResponse, ExchangeRateListResponse, FeeListResponse, PaymentMethodListResponse, TransactionEntryListResponse, OrderQueryParams, ProductQueryParams, UserQueryParams, MerchantQueryParams, CategoryQueryParams, BillingPlanQueryParams, SubscriptionQueryParams, PaymentLinkQueryParams, FinancialAccountQueryParams, FinancialRequestQueryParams, WebhookUrlQueryParams, TokenQueryParams, AddressQueryParams, CurrencyQueryParams, ExchangeRateQueryParams, FeeQueryParams, PaymentMethodQueryParams, TransactionEntryQueryParams } from '../types/resources';
import type { Order, Product, User, Merchant, Category, BillingPlan, Subscription, PaymentLink, FinancialAccount, FinancialRequest, WebhookUrl, Token, Address, Currency, ExchangeRate, Fee, PaymentMethod, TransactionEntry, KycRequest, OrderStatus, OrderKind, ProductStatus, AccountStatus, UserKind, CategoryKind, BillingPlanKind, SubscriptionStatus, KycKind, KycStatus } from '../types';
import type { FeeStructureKey } from './translators';
import type { KycRequestListParams, KycRequestListResponse } from '../resources/kyc';
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
export declare class OrderQueryBuilder extends QueryBuilder<Order> {
    private resource;
    constructor(resource: Queryable<OrderListResponse>, initialQuery?: OrderQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<OrderListResponse>>;
    /**
     * Filter by order status (contextual values)
     */
    whereStatus(status: OrderStatus | OrderStatus[]): this;
    /**
     * Filter by order kind/type (contextual values)
     */
    whereKind(kind: OrderKind | OrderKind[]): this;
    /**
     * Filter by total amount range
     */
    whereTotalRange(min?: number, max?: number): this;
    /**
     * Filter by reference ID containing a string
     */
    whereReferenceContains(value: string): this;
    /**
     * Filter by creation date range
     */
    whereCreatedBetween(after?: string, before?: string): this;
    /**
     * Filter by customer ID
     */
    whereCustomer(customerId: number | number[]): this;
    /**
     * Filter by billing plan ID
     */
    whereBillingPlan(planId: number | number[]): this;
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
export declare class ProductQueryBuilder extends QueryBuilder<Product> {
    private resource;
    constructor(resource: Queryable<ProductListResponse>, initialQuery?: ProductQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<ProductListResponse>>;
    /**
     * Filter by product status
     */
    whereStatus(status: ProductStatus | ProductStatus[]): this;
    /**
     * Filter by price range
     */
    wherePriceRange(min?: number, max?: number): this;
    /**
     * Filter by title containing a string
     */
    whereTitleContains(value: string): this;
    /**
     * Filter by public visibility
     */
    wherePublic(isPublic: boolean): this;
    /**
     * Filter by category
     */
    whereCategory(categoryId: number | number[]): this;
    /**
     * Filter by availability (units remaining)
     */
    whereUnitsRemainingRange(min?: number, max?: number): this;
    /**
     * Filter by unlimited flag
     */
    whereUnlimited(isUnlimited: boolean): this;
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
export declare class UserQueryBuilder extends QueryBuilder<User> {
    private resource;
    constructor(resource: Queryable<UserListResponse>, initialQuery?: UserQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<UserListResponse>>;
    /**
     * Filter by account status
     */
    whereStatus(status: AccountStatus | AccountStatus[]): this;
    /**
     * Filter by user kind/type
     */
    whereKind(kind: UserKind | UserKind[]): this;
    /**
     * Filter by email containing a string
     */
    whereEmailContains(value: string): this;
    /**
     * Filter by username containing a string
     */
    whereUsernameContains(value: string): this;
    /**
     * Filter by user level range
     */
    whereLevelRange(min?: number, max?: number): this;
    /**
     * Filter by organization
     */
    whereOrganisation(orgId: number | number[]): this;
    /**
     * Filter by role
     */
    whereRole(roleId: number | number[]): this;
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
export declare class MerchantQueryBuilder extends QueryBuilder<Merchant> {
    private resource;
    constructor(resource: Queryable<MerchantListResponse>, initialQuery?: MerchantQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<MerchantListResponse>>;
    /**
     * Filter by merchant status
     */
    whereStatus(status: AccountStatus | AccountStatus[]): this;
    /**
     * Filter by name containing a string
     */
    whereNameContains(value: string): this;
    /**
     * Filter by email containing a string
     */
    whereEmailContains(value: string): this;
    /**
     * Filter by sector
     */
    whereSector(sector: string | string[]): this;
    /**
     * Filter by business type
     */
    whereBusinessType(type: string | string[]): this;
    /**
     * Filter by platform fee structure
     */
    wherePlatformFeeStructure(structure: FeeStructureKey | FeeStructureKey[]): this;
    /**
     * Filter by organisation
     */
    whereOrganisation(orgId: number | number[]): this;
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
export declare class CategoryQueryBuilder extends QueryBuilder<Category> {
    private resource;
    constructor(resource: Queryable<CategoryListResponse>, initialQuery?: CategoryQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<CategoryListResponse>>;
    /**
     * Filter by category kind
     */
    whereKind(kind: CategoryKind | CategoryKind[]): this;
    /**
     * Filter by name containing a string
     */
    whereNameContains(value: string): this;
    /**
     * Filter by parent category
     */
    whereParent(parentId: number | number[] | null): this;
    /**
     * Filter by root categories only (no parent)
     */
    whereRootOnly(): this;
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
export declare class BillingPlanQueryBuilder extends QueryBuilder<BillingPlan> {
    private resource;
    constructor(resource: Queryable<BillingPlanListResponse>, initialQuery?: BillingPlanQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<BillingPlanListResponse>>;
    /**
     * Filter by plan kind/type
     */
    whereKind(kind: BillingPlanKind | BillingPlanKind[]): this;
    /**
     * Filter by flat rate range
     */
    whereFlatRateRange(min?: number, max?: number): this;
    /**
     * Filter by transaction fee range
     */
    whereTransactionFeeRange(min?: number, max?: number): this;
    /**
     * Filter by public visibility
     */
    wherePublic(isPublic: boolean): this;
    /**
     * Filter by auto charge
     */
    whereAutoCharge(autoCharge: boolean): this;
    /**
     * Filter by name containing a string
     */
    whereNameContains(value: string): this;
    /**
     * Filter by duration range (in days)
     */
    whereDurationRange(min?: number, max?: number): this;
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
export declare class SubscriptionQueryBuilder extends QueryBuilder<Subscription> {
    private resource;
    constructor(resource: Queryable<SubscriptionListResponse>, initialQuery?: SubscriptionQueryParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Filter by subscription status
     */
    whereStatus(status: SubscriptionStatus | SubscriptionStatus[]): this;
    /**
     * Filter by billing plan
     */
    whereBillingPlan(planId: number | number[]): this;
    /**
     * Filter by customer
     */
    whereCustomer(customerId: number | number[]): this;
    /**
     * Filter by start date after a specific date
     */
    whereStartDateAfter(date: string): this;
    /**
     * Filter by start date before a specific date
     */
    whereStartDateBefore(date: string): this;
    /**
     * Filter by active subscriptions (not canceled)
     */
    whereActive(): this;
    /**
     * Filter by canceled subscriptions
     */
    whereCanceled(): this;
}
/**
 * Payment Link Query Builder
 */
export declare class PaymentLinkQueryBuilder extends QueryBuilder<PaymentLink> {
    private resource;
    constructor(resource: Queryable<PaymentLinkListResponse>, initialQuery?: PaymentLinkQueryParams);
    execute(): Promise<ApiResponse<PaymentLinkListResponse>>;
    whereTotalGreaterThan(amount: number): this;
    whereTotalLessThan(amount: number): this;
    whereStatusIn(statuses: number[]): this;
    whereKindIn(kinds: number[]): this;
}
/**
 * Financial Account Query Builder
 */
export declare class FinancialAccountQueryBuilder extends QueryBuilder<FinancialAccount> {
    private resource;
    constructor(resource: Queryable<FinancialAccountListResponse>, initialQuery?: FinancialAccountQueryParams);
    execute(): Promise<ApiResponse<FinancialAccountListResponse>>;
    whereTypeEquals(type: string): this;
    whereProviderContains(provider: string): this;
    whereActiveEquals(active: boolean): this;
    whereIsExternalEquals(isExternal: boolean): this;
}
/**
 * Financial Request Query Builder
 */
export declare class FinancialRequestQueryBuilder extends QueryBuilder<FinancialRequest> {
    private resource;
    constructor(resource: Queryable<FinancialRequestListResponse>, initialQuery?: FinancialRequestQueryParams);
    execute(): Promise<ApiResponse<FinancialRequestListResponse>>;
    whereStatusIn(statuses: number[]): this;
    whereTotalGreaterThan(amount: number): this;
    whereTotalLessThan(amount: number): this;
    whereMerchantIdEquals(merchantId: number): this;
}
/**
 * Webhook URL Query Builder
 */
export declare class WebhookUrlQueryBuilder extends QueryBuilder<WebhookUrl> {
    private resource;
    constructor(resource: Queryable<WebhookUrlListResponse>, initialQuery?: WebhookUrlQueryParams);
    execute(): Promise<ApiResponse<WebhookUrlListResponse>>;
    whereEventEquals(event: string): this;
    whereMerchantIdEquals(merchantId: number): this;
    whereOrgIdEquals(orgId: number): this;
    whereUrlContains(url: string): this;
}
/**
 * Token Query Builder
 */
export declare class TokenQueryBuilder extends QueryBuilder<Token> {
    private resource;
    constructor(resource: Queryable<TokenListResponse>, initialQuery?: TokenQueryParams);
    execute(): Promise<ApiResponse<TokenListResponse>>;
    whereEnabledEquals(enabled: boolean): this;
    whereKindIn(kinds: number[]): this;
    whereUserIdEquals(userId: number): this;
    whereProviderEquals(provider: string): this;
}
/**
 * Address Query Builder
 */
export declare class AddressQueryBuilder extends QueryBuilder<Address> {
    private resource;
    constructor(resource: Queryable<AddressListResponse>, initialQuery?: AddressQueryParams);
    execute(): Promise<ApiResponse<AddressListResponse>>;
    whereCountryEquals(country: string): this;
    whereStateEquals(state: string): this;
    whereCityContains(city: string): this;
    whereKindIn(kinds: number[]): this;
}
/**
 * Currency Query Builder
 */
export declare class CurrencyQueryBuilder extends QueryBuilder<Currency> {
    private resource;
    constructor(resource: Queryable<CurrencyListResponse>, initialQuery?: CurrencyQueryParams);
    execute(): Promise<ApiResponse<CurrencyListResponse>>;
    whereCodeIn(codes: string[]): this;
    whereIsFloatEquals(isFloat: boolean): this;
}
/**
 * Exchange Rate Query Builder
 */
export declare class ExchangeRateQueryBuilder extends QueryBuilder<ExchangeRate> {
    private resource;
    constructor(resource: Queryable<ExchangeRateListResponse>, initialQuery?: ExchangeRateQueryParams);
    execute(): Promise<ApiResponse<ExchangeRateListResponse>>;
    whereSourceIdEquals(sourceId: number): this;
    whereDestinationIdEquals(destinationId: number): this;
    whereRateGreaterThan(rate: number): this;
}
/**
 * Fee Query Builder
 */
export declare class FeeQueryBuilder extends QueryBuilder<Fee> {
    private resource;
    constructor(resource: Queryable<FeeListResponse>, initialQuery?: FeeQueryParams);
    execute(): Promise<ApiResponse<FeeListResponse>>;
    whereKindIn(kinds: number[]): this;
    whereTotalGreaterThan(amount: number): this;
    whereCurrencyCodeEquals(code: string): this;
    whereCompoundEquals(compound: boolean): this;
}
/**
 * Payment Method Query Builder
 */
export declare class PaymentMethodQueryBuilder extends QueryBuilder<PaymentMethod> {
    private resource;
    constructor(resource: Queryable<PaymentMethodListResponse>, initialQuery?: PaymentMethodQueryParams);
    execute(): Promise<ApiResponse<PaymentMethodListResponse>>;
    whereActiveEquals(active: boolean): this;
    whereProviderEquals(provider: string): this;
    whereCodeEquals(code: string): this;
}
/**
 * Transaction Entry Query Builder
 */
export declare class TransactionEntryQueryBuilder extends QueryBuilder<TransactionEntry> {
    private resource;
    constructor(resource: Queryable<TransactionEntryListResponse>, initialQuery?: TransactionEntryQueryParams);
    execute(): Promise<ApiResponse<TransactionEntryListResponse>>;
    whereAmountGreaterThan(amount: number): this;
    whereAmountLessThan(amount: number): this;
    whereTypeIn(types: number[]): this;
    whereTransactionIdEquals(transactionId: number): this;
    whereFinancialAccountIdEquals(accountId: number): this;
}
/**
 * KYC Query Builder
 * Provides a fluent interface for building complex KYC/legal request queries
 *
 * @example
 * const requests = await sdk.kyc.createQueryBuilder()
 *   .whereStatus('pending')
 *   .whereKind('document_submission')
 *   .paginate(1, 20)
 *   .execute();
 */
export declare class KycQueryBuilder extends QueryBuilder<KycRequest> {
    private resource;
    constructor(resource: Queryable<KycRequestListResponse>, initialQuery?: KycRequestListParams);
    /**
     * Execute the query and return the results
     */
    execute(): Promise<ApiResponse<KycRequestListResponse>>;
    /**
     * Filter by KYC request status
     */
    whereStatus(status: KycStatus | KycStatus[]): this;
    /**
     * Filter by KYC request kind/type
     */
    whereKind(kind: KycKind | KycKind[]): this;
    /**
     * Filter by subject ID
     */
    whereSubject(subjectId: number | number[]): this;
    /**
     * Filter by user ID
     */
    whereUser(userId: number | number[]): this;
    /**
     * Filter by creation date range
     */
    whereCreatedBetween(after?: string, before?: string): this;
    /**
     * Filter by update date range
     */
    whereUpdatedBetween(after?: string, before?: string): this;
}
//# sourceMappingURL=query-builders.d.ts.map