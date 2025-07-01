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
// List products with pagination and filtering
await inkress.products.list({
  page: 1,
  per_page: 50,
  category_id: 1,
  search: 'laptop'
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

// Update product
await inkress.products.update(productId, { price: 1199.99 });

// Delete product
await inkress.products.delete(productId);
```

### Categories Resource

```typescript
// List categories
await inkress.categories.list({ kind: 1 });

// Get category details
await inkress.categories.get(categoryId);

// Create category
await inkress.categories.create({
  name: 'Electronics',
  description: 'Electronic devices',
  kind: 1
});

// Update category
await inkress.categories.update(categoryId, { name: 'Updated Name' });

// Delete category
await inkress.categories.delete(categoryId);
```

### Orders Resource

```typescript
// Create an order
await inkress.orders.create({
  currency_code: 'USD',
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  total: 99.99,
  reference_id: 'order-123',
  kind: 'online'
});

// Get order details
await inkress.orders.get(orderId);

// Update order status
await inkress.orders.update(orderId, { status: 2 });

// Get order status (public endpoint)
await inkress.orders.getStatus(orderId);

// List orders
await inkress.orders.list();
```

### Users Resource

```typescript
// List users
await inkress.users.list();

// Get user details
await inkress.users.get(userId);

// Create user
await inkress.users.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer'
});

// Update user
await inkress.users.update(userId, { first_name: 'Jane' });

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