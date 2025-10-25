import { InkressConfig } from './types';
import { MerchantsResource } from './resources/merchants';
import { CategoriesResource } from './resources/categories';
import { OrdersResource } from './resources/orders';
import { ProductsResource } from './resources/products';
import { BillingPlansResource } from './resources/billing-plans';
import { SubscriptionsResource } from './resources/subscriptions';
import { UsersResource } from './resources/users';
import { PublicResource } from './resources/public';
import { KycResource } from './resources/kyc';
import { PayoutResource } from './resources/payout';
/**
 * Main Inkress Commerce API SDK class
 *
 * @example
 * ```typescript
 * import { InkressSDK } from '@inkress/admin-sdk';
 *
 * const inkress = new InkressSDK({
 *   bearerToken: 'your-jwt-token',
 *   clientId: 'm-merchant-username', // Required for merchant-specific endpoints
 *   endpoint: 'https://api.inkress.com', // Optional, defaults to production
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
    readonly users: UsersResource;
    readonly public: PublicResource;
    readonly kyc: KycResource;
    readonly payout: PayoutResource;
    constructor(config: InkressConfig);
    /**
     * Update the SDK configuration
     */
    updateConfig(newConfig: Partial<InkressConfig>): void;
    /**
     * Get current configuration (without sensitive data)
     */
    getConfig(): Omit<InkressConfig, 'bearerToken'>;
}
export * from './types';
export * from './client';
export { InkressSDK as default };
//# sourceMappingURL=index.d.ts.map