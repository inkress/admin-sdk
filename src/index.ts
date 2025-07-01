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
  getConfig(): Omit<InkressConfig, 'bearerToken'> {
    return this.client.getConfig();
  }
}

// Export everything users might need
export * from './types';
export * from './client';
export { InkressSDK as default };
