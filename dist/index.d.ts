import { InkressConfig } from './types';
import { MerchantsResource } from './resources/merchants';
import { CategoriesResource } from './resources/categories';
import { OrdersResource } from './resources/orders';
import { ProductsResource } from './resources/products';
import { BillingPlansResource } from './resources/billing-plans';
import { SubscriptionsResource } from './resources/subscriptions';
import { SavedCardsResource } from './resources/saved-cards';
import { UsersResource } from './resources/users';
import { PublicResource } from './resources/public';
import { KycResource } from './resources/kyc';
import { PaymentLinksResource } from './resources/payment-links';
import { FinancialAccountsResource } from './resources/financial-accounts';
import { FinancialRequestsResource } from './resources/financial-requests';
import { WebhookUrlsResource } from './resources/webhook-urls';
import { TokensResource } from './resources/tokens';
import { AddressesResource } from './resources/addresses';
import { BookingsResource } from './resources/bookings';
import { AccessResource } from './resources/access';
import { FlagsResource } from './resources/flags';
import { CurrenciesResource } from './resources/currencies';
import { ExchangeRatesResource } from './resources/exchange-rates';
import { FeesResource } from './resources/fees';
import { PaymentMethodsResource } from './resources/payment-methods';
import { TransactionEntriesResource } from './resources/transaction-entries';
import { GenericsResource } from './resources/generics';
import { CheckoutSessionsResource } from './resources/checkout-sessions';
import { WebhookDeliveriesResource } from './resources/webhook-deliveries';
import { PartnerActivationResource } from './resources/partner-activation';
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
export declare class InkressSDK {
    private client;
    readonly merchants: MerchantsResource;
    readonly categories: CategoriesResource;
    readonly orders: OrdersResource;
    readonly products: ProductsResource;
    readonly billingPlans: BillingPlansResource;
    readonly subscriptions: SubscriptionsResource;
    readonly savedCards: SavedCardsResource;
    readonly users: UsersResource;
    readonly public: PublicResource;
    readonly kyc: KycResource;
    readonly paymentLinks: PaymentLinksResource;
    readonly financialAccounts: FinancialAccountsResource;
    readonly financialRequests: FinancialRequestsResource;
    readonly webhookUrls: WebhookUrlsResource;
    readonly tokens: TokensResource;
    readonly addresses: AddressesResource;
    readonly bookings: BookingsResource;
    readonly access: AccessResource;
    readonly flags: FlagsResource;
    readonly currencies: CurrenciesResource;
    readonly exchangeRates: ExchangeRatesResource;
    readonly fees: FeesResource;
    readonly paymentMethods: PaymentMethodsResource;
    readonly transactionEntries: TransactionEntriesResource;
    readonly generics: GenericsResource;
    readonly checkoutSessions: CheckoutSessionsResource;
    readonly webhookDeliveries: WebhookDeliveriesResource;
    readonly partnerActivation: PartnerActivationResource;
    constructor(config: InkressConfig);
    /**
     * Update the SDK configuration
     */
    updateConfig(newConfig: Partial<InkressConfig>): void;
    /**
     * Get current configuration (without sensitive data)
     */
    getConfig(): Omit<InkressConfig, 'accessToken'>;
}
export * from './types';
export * from './client';
export type { WebhookPayload, WebhookVerificationOptions, IncomingWebhookRequest, } from './resources/webhook-urls';
export { KYC_DOCUMENT_REQUIREMENTS, type EntityType, type KycDocumentType, type KycDocumentStatus, type KycRequirements, type KycVerifyLink, } from './resources/kyc';
export { isSubscriptionChargeQueued, type CreateCardUpdateLinkData, type CardUpdateLinkResponse, type ChargeSubscriptionData, type ChargeSubscriptionResponse, type SubscriptionChargeQueued, type SubscriptionChargeSettled, type SubscriptionChargeOutcome, type PlanChangeOutcome, type PlanChangeResolution, type PlanChangeErrorCode, type PlanChangePlanSummary, type PendingPlanChange, type ResolvedPlanChange, type ChangeSubscriptionPlanData, type ChangeSubscriptionPlanResponse, type CancelSubscriptionPlanChangeResponse, type ImmediateUpgradeErrorCode, type ImmediateUpgradeResponse, type OwnerCancelTiming, type OwnerCancelSubscriptionData, type OwnerCancelSubscriptionResponse, type OwnerCancelErrorCode, type SubscriptionGraceResponse, type SubscriptionGraceErrorCode, type PauseSubscriptionData, type SubscriptionPauseResponse, type SubscriptionPauseErrorCode, } from './resources/subscriptions';
export type { AccessState, AccessSubscription, AccessResult, AccessOptions, } from './resources/access';
export type { FlagContext, FlagReason, FlagErrorCode, FlagEvaluation, EvaluateAllOptions, EvaluateAllResult, } from './resources/flags';
export { SavedCardChargeInProgressError, SavedCardChargeRefusedError, SavedCardChargePendingError, SavedCardAlreadyRemovedError, type SavedCard, type SavedCardListParams, type SavedCardListResponse, type SavedCardRemovalAction, type SavedCardRemovalResult, type SavedCardChargeData, type SavedCardChargeStatus, type SavedCardChargeFailureReason, type SavedCardChargeRefusalReason, type SavedCardChargeOrder, type SavedCardChargeAccepted, type SavedCardChargeOutcome, type SavedCardWaitOptions, } from './resources/saved-cards';
export { type Booking, type CreateBookingData, type UpdateBookingData, type BookingFilterParams, type BookingListResponse, type BookingItem, type BookingItemInput, } from './resources/bookings';
export { OrderRefundPendingError, type OrderRefund, type OrderRefundStatus, type OrderRefundReason, type OrderRefundErrorCode, type CreateOrderRefundData, type WaitForRefundOptions, } from './resources/order-refunds';
export type { CheckoutSession, CheckoutSessionStatus, CheckoutSessionFees, CheckoutSessionFeeMapping, CheckoutSessionTotals, CheckoutSessionCurrency, CheckoutSessionCustomer, CreateCheckoutSessionResponseData, DeleteCheckoutSessionResponseData, } from './resources/checkout-sessions';
export type { BankInfoUpdateRequestData, BankAccountUpdateRequestResponse, BankAccountUpdateConfirmResponse, MergedBusiness, MergedHistoryMode, } from './resources/merchants';
export type { WebhookDelivery, WebhookDeliveryState, WebhookDeliveryKind, WebhookDeliverySubjectType, WebhookDeliveryFilterParams, WebhookDeliveryPagination, WebhookDeliveryListResponse, WebhookDeliveryErrorCode, WebhookTestSource, WebhookTestData, WebhookTestEvent, WebhookTestEventsResponse, WebhookTestPreview, } from './resources/webhook-deliveries';
export type { PartnerActivationState, PartnerActivationLink, PartnerMerchantSummary, PartnerKeys, PartnerVouch, PartnerVouchLimitKind, PartnerMerchantProfile, PartnerOwner, PartnerActivateData, PartnerActivationResult, PartnerStatusResult, PartnerLinkResult, PartnerVerifyLinkResult, PartnerDisconnectData, PartnerDisconnectResult, PartnerConnectData, PartnerActivationErrorCode, } from './resources/partner-activation';
export { BUSINESS_CLOSED_CODE, type OrderTenderType, type OrderFulfilmentStatus, type RecordOrderPaymentData, type FulfilOrderData, type DeclineOrderPaymentData, type CancelOrderData, type OrderMoveResult, type OrderMoveErrorCode, type CustomOrderItem, type TransactionLimitCode, } from './resources/order-status';
export { InkressSDK as default };
export type { OrderQueryParams, ProductQueryParams, UserQueryParams, MerchantQueryParams, CategoryQueryParams, BillingPlanQueryParams, SubscriptionQueryParams, PaymentLinkQueryParams, FinancialAccountQueryParams, FinancialRequestQueryParams, WebhookUrlQueryParams, TokenQueryParams, AddressQueryParams, CurrencyQueryParams, ExchangeRateQueryParams, FeeQueryParams, PaymentMethodQueryParams, TransactionEntryQueryParams, OrderFilterParams, ProductFilterParams, UserFilterParams, MerchantFilterParams, CategoryFilterParams, BillingPlanFilterParams, SubscriptionFilterParams, PaymentLinkFilterParams, FinancialAccountFilterParams, FinancialRequestFilterParams, WebhookUrlFilterParams, TokenFilterParams, AddressFilterParams, CurrencyFilterParams, ExchangeRateFilterParams, FeeFilterParams, PaymentMethodFilterParams, TransactionEntryFilterParams, OrderListResponse, ProductListResponse, UserListResponse, MerchantListResponse, CategoryListResponse, BillingPlanListResponse, SubscriptionListResponse, PaymentLinkListResponse, FinancialAccountListResponse, FinancialRequestListResponse, WebhookUrlListResponse, TokenListResponse, AddressListResponse, CurrencyListResponse, ExchangeRateListResponse, FeeListResponse, PaymentMethodListResponse, TransactionEntryListResponse, PageInfo, } from './types/resources';
export { ORDER_FIELD_TYPES, PRODUCT_FIELD_TYPES, USER_FIELD_TYPES, MERCHANT_FIELD_TYPES, CATEGORY_FIELD_TYPES, BILLING_PLAN_FIELD_TYPES, SUBSCRIPTION_FIELD_TYPES, PAYMENT_LINK_FIELD_TYPES, FINANCIAL_ACCOUNT_FIELD_TYPES, FINANCIAL_REQUEST_FIELD_TYPES, WEBHOOK_URL_FIELD_TYPES, TOKEN_FIELD_TYPES, ADDRESS_FIELD_TYPES, CURRENCY_FIELD_TYPES, EXCHANGE_RATE_FIELD_TYPES, FEE_FIELD_TYPES, PAYMENT_METHOD_FIELD_TYPES, TRANSACTION_ENTRY_FIELD_TYPES, } from './types/resources';
export { processQuery, QueryBuilder, type QueryParams, type RangeQuery, type StringQuery, type DateQuery, type JsonQueryParams, } from './utils/query-transformer';
export { OrderQueryBuilder, ProductQueryBuilder, UserQueryBuilder, MerchantQueryBuilder, CategoryQueryBuilder, BillingPlanQueryBuilder, SubscriptionQueryBuilder, PaymentLinkQueryBuilder, FinancialAccountQueryBuilder, FinancialRequestQueryBuilder, WebhookUrlQueryBuilder, TokenQueryBuilder, AddressQueryBuilder, CurrencyQueryBuilder, ExchangeRateQueryBuilder, FeeQueryBuilder, PaymentMethodQueryBuilder, TransactionEntryQueryBuilder, type Queryable, } from './utils/query-builders';
//# sourceMappingURL=index.d.ts.map