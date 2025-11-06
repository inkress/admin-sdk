# @inkress/admin-sdk

Official Inkress Commerce API SDK for JavaScript/TypeScript applications.

[![npm version](https://badge.fury.io/js/@inkress%2Fadmin-sdk.svg)](https://badge.fury.io/js/@inkress%2Fadmin-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Modern TypeScript SDK** - Built with TypeScript for excellent developer experience
- 🔒 **Secure Authentication** - JWT-based authentication with automatic token management
- 🌐 **Public Endpoints** - Access public merchant information without authentication
- 📦 **Comprehensive API Coverage** - Full coverage of Inkress Commerce API endpoints
- 🛠️ **Easy Integration** - Simple setup and intuitive API design
- 🔄 **Automatic Retries** - Built-in retry logic for resilient applications
- 📱 **Cross-Platform** - Works in Node.js, browsers, and React Native

## Installation

```bash
npm install @inkress/admin-sdk
```

```bash
yarn add @inkress/admin-sdk
```

```bash
pnpm add @inkress/admin-sdk
```

## Quick Start

### Basic Setup

```typescript
import { InkressSDK } from '@inkress/admin-sdk';

const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token', // Can be an empty string for public endpoints
  clientId: 'm-merchant-username', // Required for merchant-specific endpoints
  endpoint: 'https://api.inkress.com', // Optional, defaults to production
});
```

### Public Endpoints (No Authentication Required)

```typescript
// Get public merchant information
const merchant = await inkress.public.getMerchant({ 
  username: 'merchant-username' 
});

// Get merchant products
const products = await inkress.public.getMerchantProducts('merchant-username', {
  limit: 20,
  search: 'laptop'
});

// Get merchant fees
const fees = await inkress.public.getMerchantFees('merchant-username', {
    currency: 'JMD',
    total: 1000
});
```

### Authenticated Operations

```typescript
// List categories
const categories = await inkress.categories.list({ kind: 1 });

// Create a new category
const category = await inkress.categories.create({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
  kind: 1
});

// List products
const products = await inkress.products.list({
  limit: 50,
  category_id: 1
});

// Create an order
const order = await inkress.orders.create({
  currency_code: 'USD',
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  total: 29.99,
  reference_id: 'order-123'
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `bearerToken` | `string` | Yes | - | JWT token for API authentication |
| `clientId` | `string` | No | - | Client ID for merchant-specific requests (format: `m-{username}`) |
| `endpoint` | `string` | No | `https://api.inkress.com` | API endpoint URL |
| `apiVersion` | `string` | No | `v1` | API version to use |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `retries` | `number` | No | `3` | Number of retry attempts for failed requests |
| `headers` | `Record<string, string>` | No | `{}` | Custom headers to include with requests |

## API Resources

### Public Resource (No Authentication)

Access public merchant information without authentication:

```typescript
// Get merchant by username or domain
await inkress.public.getMerchant({ username: 'merchant-name' });
await inkress.public.getMerchant({ 'domain.cname': 'store.example.com' });

// Get merchant products with filtering
await inkress.public.getMerchantProducts('merchant-name', {
  search: 'laptop',
  category: 'electronics',
  limit: 20
});

// Get merchant fees
await inkress.public.getMerchantFees('merchant-name');
```

### Merchants Resource

```typescript
// List merchants
await inkress.merchants.list();

// Get merchant details
await inkress.merchants.get(merchantId);

// Update merchant
await inkress.merchants.update(merchantId, { name: 'New Name' });
```

### Products Resource

```typescript
// List products with contextual filtering
await inkress.products.list({
  page: 1,
  per_page: 50,
  status: 'published',  // Contextual: 'published' instead of 'product_published'
  category_id: 1,
  q: 'laptop'  // General search across multiple fields
});

// Alternative: use legacy search field
await inkress.products.list({
  search: 'laptop'  // Legacy search field
});

// Get product details
await inkress.products.get(productId);

// Create a new product
await inkress.products.create({
  name: 'Gaming Laptop',
  description: 'High-performance gaming laptop',
  price: 1299.99,
  category_id: 1
});

// Update product with contextual status
await inkress.products.update(productId, { 
  price: 1199.99,
  status: 'published'  // Contextual: 'published' instead of 'product_published'
});

// Delete product
await inkress.products.delete(productId);
```

### Categories Resource

```typescript
// List categories with contextual filtering
await inkress.categories.list({ 
  kind: 'published'  // Contextual: 'published' instead of 'product_published'
});

// Get category details
await inkress.categories.get(categoryId);

// Create category with contextual kind
await inkress.categories.create({
  name: 'Electronics',
  description: 'Electronic devices',
  kind: 'published'  // Contextual: 'published' instead of 'product_published'
});

// Update category
await inkress.categories.update(categoryId, { name: 'Updated Name' });

// Delete category
await inkress.categories.delete(categoryId);
```

### Orders Resource

```typescript
// Create an order with contextual strings
await inkress.orders.create({
  currency_code: 'USD',
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  total: 99.99,
  reference_id: 'order-123',
  kind: 'online',      // Contextual: 'online' instead of 'order_online'
  status: 'pending'    // Contextual: 'pending' instead of 'order_pending'
});

// Get order details
await inkress.orders.get(orderId);

// Update order status using contextual strings
await inkress.orders.update(orderId, { 
  status: 'confirmed'  // Contextual: 'confirmed' instead of 'order_confirmed'
});

// List orders with contextual filtering
await inkress.orders.list({
  status: 'shipped',   // Contextual: 'shipped' instead of 'order_shipped'
  kind: 'online',      // Contextual: 'online' instead of 'order_online'
  q: 'electronics'
});

// Backward compatibility - integers and full strings still work
await inkress.orders.list({
  status: 2,                    // Integer still works
  kind: 'order_subscription',   // Full string still works
  q: 'monthly'
});

// Get order status (public endpoint)
await inkress.orders.getStatus(orderId);
```

### Users Resource

```typescript
// List users with contextual filtering
await inkress.users.list({
  status: 'approved',     // Contextual: 'approved' instead of 'account_approved'
  kind: 'organisation',   // Contextual: 'organisation' instead of 'user_organisation'
  q: 'admin'
});

// Get user details
await inkress.users.get(userId);

// Create user with contextual values
await inkress.users.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'secure-password',
  status: 'pending',      // Contextual: 'pending' instead of 'account_pending'
  kind: 'organisation'    // Contextual: 'organisation' instead of 'user_organisation'
});

// Update user with contextual status
await inkress.users.update(userId, { 
  first_name: 'Jane',
  status: 'approved'      // Contextual: 'approved' instead of 'account_approved'
});

// Delete user
await inkress.users.delete(userId);
```

### Billing Plans Resource

```typescript
// List billing plans
await inkress.billingPlans.list();

// Get plan details
await inkress.billingPlans.get(planId);

// Create billing plan
await inkress.billingPlans.create({
  name: 'Premium Plan',
  amount: 29.99,
  currency: 'USD'
});
```

### Subscriptions Resource

```typescript
// List subscriptions
await inkress.subscriptions.list();

// Get subscription details
await inkress.subscriptions.get(subscriptionId);

// Create subscription
await inkress.subscriptions.create({
  plan_id: 1,
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  }
});
```

## Advanced Query System

The SDK includes a powerful type-based query system that automatically transforms clean, intuitive queries into the API-compatible format:

### Query Types

```typescript
// Import query system
import { InkressSDK, QueryParams, RangeQuery } from '@inkress/admin-sdk';

// Simple equality queries
await inkress.orders.query({
  status: 'confirmed',     // Direct value → equality
  kind: 'online'
});

// Array queries (IN operations)
await inkress.orders.query({
  status: ['confirmed', 'shipped'],  // Array → _in suffix
  id: [1, 2, 3, 4]
});

// Range queries (min/max)
await inkress.orders.query({
  total: { min: 100, max: 1000 },   // Range → _min/_max suffixes
  inserted_at: { after: '2024-01-01', before: '2024-12-31' }
});

// String search queries
await inkress.orders.query({
  reference_id: { contains: 'ORDER-2024' }  // String → contains. prefix
});

// Combined complex queries
await inkress.orders.query({
  status: ['confirmed', 'shipped'],
  total: { min: 50 },
  reference_id: { contains: 'MOBILE' },
  inserted_at: { after: '2024-10-01' },
  customer_id: 123,
  page: 1,
  page_size: 20,
  q: 'electronics'
});
```

### Query Builder Pattern

For complex queries, use the fluent query builder:

```typescript
const orders = await inkress.orders
  .createQueryBuilder()
  .whereStatus('confirmed')
  .whereKind(['online', 'subscription'])
  .whereTotalRange(100, 1000)
  .whereReferenceContains('PREMIUM')
  .whereCreatedBetween('2024-01-01', '2024-12-31')
  .paginate(1, 20)
  .orderBy('inserted_at', 'desc')
  .search('laptop')
  .execute();
```

### Query Transformation Examples

The SDK automatically transforms your clean queries:

```typescript
// You write:
{ status: ['confirmed', 'shipped'], total: { min: 100 } }

// SDK transforms to:
{ status_in: [4, 7], total_min: 100 }

// You write:
{ reference_id: { contains: 'ORDER' }, inserted_at: { after: '2024-01-01' } }

// SDK transforms to:
{ "contains.reference_id": "ORDER", "after.inserted_at": "2024-01-01" }
```

### Available Query Operations

| Operation | Input | API Output | Description |
|-----------|-------|------------|-------------|
| Equality | `field: value` | `field: value` | Direct equality match |
| Array/IN | `field: [1,2,3]` | `field_in: [1,2,3]` | Value in array |
| Range Min | `field: {min: 10}` | `field_min: 10` | Minimum value |
| Range Max | `field: {max: 100}` | `field_max: 100` | Maximum value |
| Contains | `field: {contains: 'text'}` | `"contains.field": "text"` | String contains |
| Date After | `field: {after: 'date'}` | `"after.field": "date"` | Date after |
| Date Before | `field: {before: 'date'}` | `"before.field": "date"` | Date before |
| Date On | `field: {on: 'date'}` | `"on.field": "date"` | Exact date |

## Search and Filtering

All list operations support comprehensive search and filtering capabilities:

### General Search with `q`

Use the `q` parameter for intelligent searching across multiple relevant fields:

```typescript
// Search merchants - searches name, email, username, etc.
await inkress.merchants.list({ q: 'john smith' });

// Search products - searches title, description, etc.
await inkress.products.list({ q: 'gaming laptop' });

// Search orders - searches reference ID, customer details, etc.
await inkress.orders.list({ q: 'ORDER-12345' });
```

### String-Based Status and Kind Values

The SDK now supports human-readable string values instead of hard-to-remember integers:

```typescript
// ✅ NEW: Use descriptive strings
await inkress.merchants.list({
  status: 'account_approved',           // Instead of remembering "2"
  platform_fee_structure: 'customer_pay',  // Instead of remembering "1"
  q: 'electronics'
});

// ✅ NEW: Filter orders with readable values
await inkress.orders.list({
  status: 'order_confirmed',   // Instead of "4"
  kind: 'order_online',        // Instead of "1"
  q: 'laptop'
});

// ✅ NEW: Filter products by status
await inkress.products.list({
  status: 'product_published',  // Instead of "2"
  q: 'smartphone'
});

// ✅ Backward compatible: integers still work
await inkress.merchants.list({
  status: 2,                    // Still works for backward compatibility
  platform_fee_structure: 1    // Still works
});
```

### Available String Values

**Status Values:**
- Orders: `order_pending`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, etc.
- Accounts: `account_pending`, `account_approved`, `account_suspended`, etc.
- Products: `product_draft`, `product_published`, `product_archived`
- Transactions: `transaction_pending`, `transaction_authorized`, `transaction_captured`, etc.

**Kind Values:**
- Orders: `order_online`, `order_offline`, `order_subscription`, `order_invoice`
- Products: `product_draft`, `product_published`, `product_archived`
- Users: `user_address`, `role_organisation`, `role_store`
- Billing: `billing_plan_subscription`, `billing_plan_payout`

**Fee Structure Values:**
- `customer_pay` - Customer pays the fees
- `merchant_absorb` - Merchant absorbs the fees

### Database Field Filtering

Filter by any database field for precise results:

```typescript
// Filter products by specific criteria
await inkress.products.list({
  status: 'product_published',  // Published only (string format)
  category_id: 5,               // Specific category
  price: 1000,                 // Exact price
  unlimited: true,             // Unlimited quantity
  inserted_at: '2024-01-01'    // Created after date
});

// Filter merchants by organization
await inkress.merchants.list({
  organisation_id: 123,
  status: 'account_approved',
  platform_fee_structure: 'customer_pay'
});
```

### Combining Search and Filters

Mix general search with specific filters for powerful queries:

```typescript
await inkress.products.list({
  q: 'phone',                    // General search
  status: 'product_published',   // Published only
  category_id: 5,               // Electronics category
  page: 1,                      // Pagination
  per_page: 20,                 // Results per page
  sort: 'price',                // Sort by price
  order: 'desc'                 // Descending order
});
```

### Legacy Search Field

Many resources still support the legacy `search` field for backward compatibility:

```typescript
// Legacy approach (still works)
await inkress.products.list({ search: 'laptop' });

// Recommended approach
await inkress.products.list({ q: 'laptop' });
```

## Error Handling

The SDK provides structured error handling with detailed error information:

```typescript
try {
  const product = await inkress.products.get(123);
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Product not found');
  } else if (error.response?.status === 422) {
    console.log('Validation errors:', error.response.data);
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```typescript
import { 
  InkressSDK, 
  Product, 
  Category, 
  Order, 
  Merchant,
  CreateProductData,
  ApiResponse 
} from '@inkress/admin-sdk';

// All API responses are properly typed
const response: ApiResponse<Product[]> = await inkress.products.list();
const products: Product[] = response.result || response.data || [];
```

## Environment Configuration

### Development

```typescript
const inkress = new InkressSDK({
  bearerToken: process.env.INKRESS_DEV_TOKEN,
  endpoint: 'https://api-dev.inkress.com',
  clientId: 'm-your-dev-merchant'
});
```

### Production

```typescript
const inkress = new InkressSDK({
  bearerToken: process.env.INKRESS_PROD_TOKEN,
  endpoint: 'https://api.inkress.com',
  clientId: 'm-your-merchant'
});
```

## React/Next.js Integration

### Server-Side Usage (API Routes)

```typescript
// pages/api/products.ts or app/api/products/route.ts
import { InkressSDK } from '@inkress/admin-sdk';

const inkress = new InkressSDK({
  bearerToken: process.env.INKRESS_TOKEN!,
  clientId: process.env.INKRESS_CLIENT_ID!
});

export async function GET() {
  const products = await inkress.products.list();
  return Response.json(products);
}
```

### Client-Side Usage (Public Endpoints)

```typescript
// hooks/usePublicMerchant.ts
import { InkressSDK } from '@inkress/admin-sdk';

const sdk = new InkressSDK({
  bearerToken: '', // Empty for public endpoints
  endpoint: 'https://api.inkress.com'
});

export async function getPublicMerchant(username: string) {
  return await sdk.public.getMerchant({ username });
}
```

## Best Practices

### 1. Environment Variables

Store sensitive configuration in environment variables:

```env
INKRESS_TOKEN=your-jwt-token
INKRESS_CLIENT_ID=m-your-merchant
INKRESS_ENDPOINT=https://api.inkress.com
```

### 2. Error Handling

Always implement proper error handling:

```typescript
async function fetchProducts() {
  try {
    const response = await inkress.products.list();
    return response.result || response.data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}
```

### 3. Rate Limiting

Be mindful of API rate limits and implement appropriate throttling in your application.

### 4. Caching

Cache frequently accessed data like merchant information and categories:

```typescript
const merchantCache = new Map();

async function getCachedMerchant(username: string) {
  if (merchantCache.has(username)) {
    return merchantCache.get(username);
  }
  
  const merchant = await inkress.public.getMerchant({ username });
  merchantCache.set(username, merchant);
  return merchant;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📚 [API Documentation](https://docs.inkress.com)
- 💬 [Discord Community](https://discord.gg/inkress)
- 🐛 [Issue Tracker](https://github.com/inkress/admin-sdk/issues)
- 📧 [Email Support](mailto:support@inkress.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ by the [Inkress](https://inkress.com) team.