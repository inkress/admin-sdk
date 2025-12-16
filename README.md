# @inkress/admin-sdk

Official Inkress Commerce API SDK for JavaScript/TypeScript applications.

[![npm version](https://badge.fury.io/js/@inkress%2Fadmin-sdk.svg)](https://badge.fury.io/js/@inkress%2Fadmin-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Modern TypeScript SDK** - Built with TypeScript for excellent developer experience
- 🔒 **Secure Authentication** - JWT-based authentication with automatic token management
- 🌐 **Public Endpoints** - Access public merchant information without authentication
- 📦 **Comprehensive API Coverage** - 23+ resources with full CRUD operations
- 🎯 **100% Type-Safe** - Every method fully typed with specific interfaces
- 🔄 **Advanced Query System** - Fluent query builder with intelligent transformations
- 🌍 **Contextual Translations** - Human-readable strings automatically converted to API integers
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
  accessToken: 'your-jwt-token',
  username: 'merchant-username', // Optional - automatically prepended with 'm-'
  mode: 'live', // Optional - 'live' (default) or 'sandbox'
});
```

### Configuration Options

```typescript
const inkress = new InkressSDK({
  // Required
  accessToken: 'your-jwt-token',
  
  // Optional
  username: 'merchant-username',    // Prepended with 'm-' for Client-Id header
  mode: 'live',                     // 'live' = api.inkress.com, 'sandbox' = api-dev.inkress.com
  apiVersion: 'v1',                 // API version (default: 'v1')
  timeout: 30000,                   // Request timeout in ms (default: 30000)
  retries: 3,                       // Number of retry attempts (default: 0)
  headers: {                        // Custom headers for all requests
    'X-Custom-Header': 'value'
  }
});
```

### Why This SDK?

**🎯 100% Type-Safe** - Every single method across all 23 resources is fully typed:
```typescript
// Every parameter and return value has explicit types
const balances: ApiResponse<MerchantBalance> = await inkress.merchants.balances();
// balances.data: { available: number, pending: number, currency: string }
```

**🌍 Human-Readable API** - Use contextual strings instead of cryptic integers:
```typescript
// Clear, self-documenting code with contextual strings
await inkress.orders.update(123, {
  status: 'confirmed',
  kind: 'online'
});
// SDK automatically converts to integers for the API
```

**🔍 Powerful Queries** - Intuitive query syntax or fluent builders:
```typescript
// Direct query syntax
await inkress.orders.query({
  status: ['confirmed', 'shipped'],
  total: { min: 100, max: 1000 },
  reference_id: { contains: 'VIP' }
});

// Fluent query builder
await inkress.orders.createQueryBuilder()
  .whereStatus(['confirmed', 'shipped'])
  .whereTotalRange(100, 1000)
  .whereReferenceContains('VIP')
  .execute();
```

**📦 Complete Coverage** - 22 resources with 125+ fully-typed methods:
- Core: Merchants, Products, Categories, Orders, Users
- Billing: Plans, Subscriptions, Payment Links, Payment Methods
- Financial: Accounts, Requests, Fees, Currencies, Exchange Rates
- Identity: Addresses, Tokens, Webhooks
- Content: Public Data
- And more...

---

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

### Authenticated Operations with Contextual Values

The SDK automatically translates human-readable strings to API integers:

```typescript
// Create order with contextual strings
const order = await inkress.orders.create({
  total: 99.99,
  currency_code: 'USD',
  status: 'pending',      // SDK converts 'pending' → integer
  kind: 'online',         // SDK converts 'online' → integer
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  reference_id: 'order-123'
});

// Update merchant with contextual values
const merchant = await inkress.merchants.update(123, {
  status: 'approved',               // SDK converts to integer
  platform_fee_structure: 'customer_pay',  // SDK converts to integer
  provider_fee_structure: 'merchant_absorb'
});

// Create user with contextual status and kind
const user = await inkress.users.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'secure-password',
  status: 'pending',       // SDK converts to account_pending integer
  kind: 'organisation'     // SDK converts to user_organisation integer
});
```

### Advanced Query System

Use the intuitive query system for powerful filtering:

```typescript
// Query with multiple conditions
const orders = await inkress.orders.query({
  status: ['confirmed', 'shipped'],  // Array → IN query
  total: { min: 100, max: 1000 },   // Range query
  reference_id: { contains: 'VIP' }, // String search
  inserted_at: { after: '2024-01-01' },
  page: 1,
  page_size: 20
});

// Or use fluent query builder
const products = await inkress.products
  .createQueryBuilder()
  .whereStatus('published')
  .wherePriceRange(50, 500)
  .whereTitleContains('laptop')
  .whereCategory(5)
  .paginate(1, 20)
  .orderBy('price', 'desc')
  .execute();
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

The SDK provides access to 23+ fully-typed resources:

### Core Resources
- **Merchants** - Merchant management and account operations
- **Products** - Product catalog with full CRUD
- **Categories** - Product categorization  
- **Orders** - Order processing and tracking
- **Users** - User and account management

### Billing & Subscriptions
- **Billing Plans** - Subscription plan management
- **Subscriptions** - Recurring billing and subscriptions
- **Payment Links** - Payment link generation
- **Payment Methods** - Payment method configuration

### Financial
- **Financial Accounts** - Account management
- **Financial Requests** - Payout and withdrawal requests
- **Transaction Entries** - Transaction tracking
- **Fees** - Fee management and configuration
- **Exchange Rates** - Currency exchange rates
- **Currencies** - Multi-currency support

### Identity & Access
- **Addresses** - Address management
- **Tokens** - API token management
- **Webhook URLs** - Webhook configuration

### Content & Other
- **Generics** - Dynamic endpoint access
- **KYC** - Know Your Customer operations
- **Payout** - Payout processing
- **Public** - Public-facing merchant data

---

## Core Resource Examples

### Merchants Resource

### Merchants Resource

Full merchant management with contextual translations and account methods:

```typescript
// List merchants with contextual filtering
const merchants = await inkress.merchants.list({
  status: 'approved',                 // Contextual: converts to integer
  platform_fee_structure: 'customer_pay',
  organisation_id: 123,
  q: 'coffee shop'
});

// Query merchants with advanced filtering
const merchants = await inkress.merchants.query({
  status: ['approved', 'active'],
  platform_fee_structure: 'customer_pay',
  inserted_at: { after: '2024-01-01' }
});

// Get merchant details
const merchant = await inkress.merchants.get(merchantId);

// Create merchant with contextual values
const newMerchant = await inkress.merchants.create({
  name: 'My Store',
  email: 'store@example.com',
  username: 'mystore',
  status: 'pending',                  // Contextual
  platform_fee_structure: 'customer_pay',
  provider_fee_structure: 'merchant_absorb'
});

// Update merchant
await inkress.merchants.update(merchantId, { 
  name: 'Updated Store Name',
  status: 'approved'
});

// Merchant account methods (properly typed)
const balances = await inkress.merchants.balances();
// Returns: { available: number, pending: number, currency: string }

const limits = await inkress.merchants.limits();
// Returns: { transaction_limit: number, daily_limit: number, monthly_limit: number, currency: string }

const subscription = await inkress.merchants.subscription();
// Returns: { plan_name: string, status: string, billing_cycle: string, price: number, ... }

const invoices = await inkress.merchants.invoices();
// Returns: MerchantInvoice[]

const invoice = await inkress.merchants.invoice('invoice-123');
// Returns: MerchantInvoice

// Query builder
const merchants = await inkress.merchants
  .createQueryBuilder()
  .whereStatus('approved')
  .wherePlatformFeeStructure('customer_pay')
  .whereOrganisation(123)
  .search('electronics')
  .execute();
```

### Products Resource

Complete product management with status translations and advanced querying:

```typescript
// List products with contextual filtering
await inkress.products.list({
  status: 'published',      // Contextual: 'published' instead of integer
  category_id: 1,
  price: { min: 50, max: 500 },
  q: 'laptop'
});

// Query products with advanced filters
const products = await inkress.products.query({
  status: ['published', 'featured'],  // Array query
  category_id: [1, 2, 3],
  price: { min: 100 },
  title: { contains: 'gaming' },
  inserted_at: { after: '2024-01-01' }
});

// Get product details
await inkress.products.get(productId);

// Create product with contextual status
await inkress.products.create({
  name: 'Gaming Laptop',
  description: 'High-performance gaming laptop',
  price: 1299.99,
  category_id: 1,
  status: 'draft',          // Contextual
  kind: 'published'         // Contextual
});

// Update product
await inkress.products.update(productId, { 
  price: 1199.99,
  status: 'published'       // Contextual translation
});

// Delete product
await inkress.products.delete(productId);

// Query builder
const products = await inkress.products
  .createQueryBuilder()
  .whereStatus('published')
  .wherePriceRange(50, 500)
  .whereCategory(5)
  .whereTitleContains('laptop')
  .paginate(1, 20)
  .orderBy('price', 'desc')
  .search('gaming')
  .execute();
```

### Categories Resource

Category management with kind translations:

```typescript
// List categories with contextual filtering
await inkress.categories.list({ 
  kind: 'published',        // Contextual translation
  q: 'electronics'
});

// Query categories
const categories = await inkress.categories.query({
  kind: ['published', 'featured'],
  parent_id: 1
});

// Get category details
await inkress.categories.get(categoryId);

// Create category with contextual kind
await inkress.categories.create({
  name: 'Electronics',
  description: 'Electronic devices',
  kind: 'published',        // Contextual
  parent_id: null
});

// Update category
await inkress.categories.update(categoryId, { 
  name: 'Updated Name',
  kind: 'featured'          // Contextual
});

// Query builder
const categories = await inkress.categories
  .createQueryBuilder()
  .whereKind('published')
  .whereParent(1)
  .search('electronics')
  .execute();
```

### Orders Resource

Order processing with full status and kind translations:

```typescript
// Create order with contextual strings
await inkress.orders.create({
  total: 99.99,
  currency_code: 'USD',
  customer: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  reference_id: 'order-123',
  kind: 'online',           // Contextual: converts to integer
  status: 'pending'         // Contextual: converts to integer
});

// Get order details
await inkress.orders.get(orderId);

// Update order status with contextual string
await inkress.orders.update(orderId, { 
  status: 'confirmed'       // Contextual translation
});

// List orders with contextual filtering
await inkress.orders.list({
  status: 'shipped',        // Contextual
  kind: 'online',          // Contextual
  customer_id: 123,
  q: 'electronics'
});

// Query orders with advanced filters
const orders = await inkress.orders.query({
  status: ['confirmed', 'shipped'],
  kind: ['online', 'subscription'],
  total: { min: 100, max: 1000 },
  reference_id: { contains: 'VIP' },
  inserted_at: { after: '2024-01-01' }
});

// Delete order
await inkress.orders.delete(orderId);

// Get order status (public endpoint)
await inkress.orders.getStatus(orderId);

// Query builder
const orders = await inkress.orders
  .createQueryBuilder()
  .whereStatus(['confirmed', 'shipped'])
  .whereKind('online')
  .whereTotalRange(100, 1000)
  .whereReferenceContains('PREMIUM')
  .whereCustomer(123)
  .paginate(1, 20)
  .execute();
```

### Users Resource

User management with status and kind translations:

```typescript
// List users with contextual filtering
await inkress.users.list({
  status: 'approved',       // Contextual: account_approved
  kind: 'organisation',     // Contextual: user_organisation
  organisation_id: 123,
  q: 'admin'
});

// Query users
const users = await inkress.users.query({
  status: ['approved', 'active'],
  kind: ['organisation', 'merchant'],
  inserted_at: { after: '2024-01-01' }
});

// Get user details
await inkress.users.get(userId);

// Create user with contextual values
await inkress.users.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'secure-password',
  status: 'pending',        // Contextual
  kind: 'organisation'      // Contextual
});

// Update user with contextual status
await inkress.users.update(userId, { 
  first_name: 'Jane',
  status: 'approved'        // Contextual
});

// Delete user
await inkress.users.delete(userId);

// Query builder
const users = await inkress.users
  .createQueryBuilder()
  .whereStatus('approved')
  .whereKind('organisation')
  .whereOrganisation(123)
  .search('john')
  .execute();
```

### Billing Plans Resource

Billing plan management with kind translations:

```typescript
// List billing plans
await inkress.billingPlans.list({
  kind: 'subscription',     // Contextual
  status: 'active'
});

// Query plans
const plans = await inkress.billingPlans.query({
  kind: 'subscription',
  public: true,
  amount: { min: 10, max: 100 }
});

// Get plan details
await inkress.billingPlans.get(planId);

// Create billing plan with contextual kind
await inkress.billingPlans.create({
  name: 'Premium Plan',
  amount: 29.99,
  currency: 'USD',
  kind: 'subscription',     // Contextual
  status: 'active'
});

// Update plan
await inkress.billingPlans.update(planId, {
  amount: 24.99,
  status: 'active'
});

// Delete plan
await inkress.billingPlans.delete(planId);

// Query builder
const plans = await inkress.billingPlans
  .createQueryBuilder()
  .whereKind('subscription')
  .wherePublic(true)
  .whereAmountRange(10, 50)
  .execute();
```

### Subscriptions Resource

Subscription management with proper typing for all methods:

```typescript
// List subscriptions
await inkress.subscriptions.list({
  status: 'active',         // Contextual
  billing_plan_id: 1,
  customer_id: 123
});

// Query subscriptions
const subscriptions = await inkress.subscriptions.query({
  status: ['active', 'trialing'],
  billing_plan_id: [1, 2, 3],
  inserted_at: { after: '2024-01-01' }
});

// Get subscription details
await inkress.subscriptions.get(subscriptionId);

// Create subscription with contextual values
await inkress.subscriptions.create({
  billing_plan_id: 1,
  record: 'customer',
  record_id: 123,
  start_date: '2024-01-01',
  status: 'active',         // Contextual
  kind: 'recurring'         // Contextual
});

// Delete subscription
await inkress.subscriptions.delete(subscriptionId);

// Create subscription link (fully typed)
const link = await inkress.subscriptions.createLink({
  reference_id: 'sub-123',
  title: 'Premium Subscription',
  plan_uid: 'plan-abc',
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com'
  }
});
// Returns: CreateSubscriptionLinkResponse

// Charge subscription (fully typed)
const charge = await inkress.subscriptions.charge('sub-uid', {
  reference_id: 'charge-123',
  total: 29.99,
  title: 'Monthly charge'
});
// Returns: ChargeSubscriptionResponse with typed transaction

// Record usage (fully typed)
const usage = await inkress.subscriptions.usage('sub-uid', {
  reference_id: 'usage-123',
  total: 5.00,
  title: 'API calls'
});
// Returns: SubscriptionUsageResponse

// Cancel subscription (fully typed)
const cancelled = await inkress.subscriptions.cancel(123, 'reason-code');
// Returns: SubscriptionCancelResponse

// Get subscription periods
const periods = await inkress.subscriptions.getPeriods('sub-uid', {
  status: 'paid',
  limit: 10
});

// Query builder
const subscriptions = await inkress.subscriptions
  .createQueryBuilder()
  .whereStatus('active')
  .whereBillingPlan(1)
  .whereCustomer(123)
  .execute();
```

---

## Additional Resources

### Payment Links

```typescript
// List payment links
await inkress.paymentLinks.list({ status: 'active' });

// Create payment link
await inkress.paymentLinks.create({
  title: 'Product Payment',
  amount: 99.99,
  currency: 'USD',
  status: 'active'
});

// Update payment link
await inkress.paymentLinks.update(linkId, { amount: 89.99 });

// Delete payment link
await inkress.paymentLinks.delete(linkId);
```

### Financial Accounts

```typescript
// List financial accounts
await inkress.financialAccounts.list();

// Create account
await inkress.financialAccounts.create({
  name: 'Main Account',
  type: 'checking',
  currency: 'USD'
});

// Update account
await inkress.financialAccounts.update(accountId, { name: 'Updated Name' });
```

### Tokens

```typescript
// List tokens
await inkress.tokens.list({ kind: 'api', enabled: true });

// Create token
await inkress.tokens.create({
  title: 'Production API Key',
  provider: 'stripe',
  kind: 'api'
});

// Delete token
await inkress.tokens.delete(tokenId);
```

### Addresses

```typescript
// List addresses
await inkress.addresses.list({ country: 'US' });

// Create address
await inkress.addresses.create({
  line1: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'US',
  postal_code: '10001'
});

// Update address
await inkress.addresses.update(addressId, { line1: '456 Broadway' });

// Delete address
await inkress.addresses.delete(addressId);
```

### Fees

```typescript
// List fees
await inkress.fees.list({ active: true });

// Create fee
await inkress.fees.create({
  name: 'Processing Fee',
  amount: 2.50,
  percentage: 2.9,
  kind: 'transaction'
});

// Update fee
await inkress.fees.update(feeId, { amount: 2.75 });

// Delete fee
await inkress.fees.delete(feeId);
```

### Exchange Rates & Currencies

```typescript
// List currencies
await inkress.currencies.list();

// Create currency
await inkress.currencies.create({
  code: 'USD',
  name: 'US Dollar',
  symbol: '$'
});

// List exchange rates
await inkress.exchangeRates.list({ from_currency: 'USD' });

// Create exchange rate
await inkress.exchangeRates.create({
  from_currency: 'USD',
  to_currency: 'EUR',
  rate: 0.85
});

// Update exchange rate
await inkress.exchangeRates.update(rateId, { rate: 0.86 });
```

### Public Resource

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

// Get merchant fees (fully typed)
const fees = await inkress.public.getMerchantFees('merchant-name', {
  currency: 'USD',
  total: 100
});
// Returns: PublicMerchantFees
```

## Advanced Query System

The SDK provides a powerful type-safe query system with two interfaces:

### 1. Direct Query Method

Use the `query()` method with an intuitive object-based syntax:

```typescript
// Simple equality
await inkress.orders.query({
  status: 'confirmed',
  customer_id: 123
});

// Array queries (IN operations)
await inkress.orders.query({
  status: ['confirmed', 'shipped', 'delivered'],
  id: [1, 2, 3, 4, 5]
});

// Range queries
await inkress.products.query({
  price: { min: 100, max: 1000 },
  rating: { min: 4 }
});

// String contains
await inkress.products.query({
  title: { contains: 'laptop' },
  description: { contains: 'gaming' }
});

// Date ranges
await inkress.orders.query({
  inserted_at: { after: '2024-01-01', before: '2024-12-31' },
  updated_at: { on: '2024-06-15' }
});

// Complex combined queries
await inkress.orders.query({
  status: ['confirmed', 'shipped'],
  kind: 'online',
  total: { min: 50, max: 500 },
  reference_id: { contains: 'VIP' },
  customer_id: [100, 101, 102],
  inserted_at: { after: '2024-01-01' },
  page: 1,
  page_size: 20,
  q: 'electronics'
});
```

### 2. Fluent Query Builder

Use the query builder for a fluent, chainable interface:

```typescript
// Products query builder
const products = await inkress.products
  .createQueryBuilder()
  .whereStatus('published')
  .whereStatusIn(['published', 'featured'])
  .whereCategory(5)
  .whereCategoryIn([1, 2, 3])
  .wherePriceRange(50, 500)
  .wherePriceMin(50)
  .wherePriceMax(500)
  .whereTitleContains('gaming')
  .whereDescriptionContains('RGB')
  .whereCreatedAfter('2024-01-01')
  .whereCreatedBefore('2024-12-31')
  .whereCreatedBetween('2024-01-01', '2024-12-31')
  .paginate(1, 20)
  .orderBy('price', 'desc')
  .search('laptop')
  .execute();

// Orders query builder
const orders = await inkress.orders
  .createQueryBuilder()
  .whereStatus('confirmed')
  .whereStatusIn(['confirmed', 'shipped'])
  .whereKind('online')
  .whereKindIn(['online', 'subscription'])
  .whereTotalRange(100, 1000)
  .whereReferenceContains('VIP')
  .whereCustomer(123)
  .whereCustomerIn([100, 101, 102])
  .whereCreatedBetween('2024-01-01', '2024-12-31')
  .paginate(1, 20)
  .search('electronics')
  .execute();

// Merchants query builder
const merchants = await inkress.merchants
  .createQueryBuilder()
  .whereStatus('approved')
  .wherePlatformFeeStructure('customer_pay')
  .whereProviderFeeStructure('merchant_absorb')
  .whereOrganisation(123)
  .whereNameContains('coffee')
  .paginate(1, 50)
  .execute();

// Users query builder
const users = await inkress.users
  .createQueryBuilder()
  .whereStatus('approved')
  .whereKind('organisation')
  .whereOrganisation(123)
  .whereEmailContains('@company.com')
  .paginate(1, 50)
  .search('admin')
  .execute();
```

### Query Transformation

The SDK automatically transforms your clean queries into API-compatible format:

```typescript
// You write:
{
  status: ['confirmed', 'shipped'],
  total: { min: 100, max: 1000 },
  reference_id: { contains: 'VIP' }
}

// SDK transforms to:
{
  status_in: [4, 7],           // Contextual strings → integers with _in suffix
  total_min: 100,              // min/max → _min/_max suffixes
  total_max: 1000,
  "contains.reference_id": "VIP"  // contains → prefix format
}
```

### Available Query Operations

| Operation | Input Syntax | API Output | Description |
|-----------|-------------|------------|-------------|
| **Equality** | `field: value` | `field: value` | Direct match |
| **Array (IN)** | `field: [1,2,3]` | `field_in: [1,2,3]` | Value in array |
| **Range Min** | `field: {min: 10}` | `field_min: 10` | Minimum value |
| **Range Max** | `field: {max: 100}` | `field_max: 100` | Maximum value |
| **Contains** | `field: {contains: 'text'}` | `"contains.field": "text"` | String contains |
| **Date After** | `field: {after: 'date'}` | `"after.field": "date"` | After date |
| **Date Before** | `field: {before: 'date'}` | `"before.field": "date"` | Before date |
| **Date On** | `field: {on: 'date'}` | `"on.field": "date"` | Exact date |

### Query Builder Methods

All resources with query support provide these methods:

**Equality Methods:**
- `.whereField(value)` - Direct equality
- `.whereFieldIn([values])` - Array IN query

**Range Methods:**
- `.whereFieldRange(min, max)` - Min and max
- `.whereFieldMin(value)` - Minimum value
- `.whereFieldMax(value)` - Maximum value

**String Methods:**
- `.whereFieldContains(text)` - String contains

**Date Methods:**
- `.whereCreatedAfter(date)` - After date
- `.whereCreatedBefore(date)` - Before date
- `.whereCreatedBetween(start, end)` - Date range
- `.whereUpdatedAfter(date)` - After date
- `.whereUpdatedBefore(date)` - Before date

**Utility Methods:**
- `.paginate(page, pageSize)` - Pagination
- `.orderBy(field, direction)` - Sorting
- `.search(query)` - General search (q parameter)
- `.execute()` - Execute the query

### Field Type Validation

The SDK validates field types at runtime to prevent API errors:

```typescript
// Runtime validation ensures correct types
await inkress.products.query({
  price: 99.99,           // ✅ Number field
  unlimited: true,        // ✅ Boolean field
  category_id: 5,         // ✅ Integer field
  inserted_at: '2024-01-01'  // ✅ String field
});

// Type mismatches are caught early
await inkress.products.query({
  price: { contains: 'text' }  // ❌ Error: price is numeric, not string
});
```

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

The SDK supports human-readable string values for better code clarity:

```typescript
// Use descriptive strings for merchants
await inkress.merchants.list({
  status: 'account_approved',
  platform_fee_structure: 'customer_pay',
  q: 'electronics'
});

// Filter orders with readable values
await inkress.orders.list({
  status: 'order_confirmed',
  kind: 'order_online',
  q: 'laptop'
});

// Filter products by status
await inkress.products.list({
  status: 'product_published',
  q: 'smartphone'
});

// Integers also work for backward compatibility
await inkress.merchants.list({
  status: 2,
  platform_fee_structure: 1
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
    console.log('Validation errors:', error.response.result);
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides **100% type safety** across all 128+ methods:

### Complete Type Coverage

Every method has:
- ✅ Fully typed input parameters (no `any` types)
- ✅ Fully typed return values with specific interfaces
- ✅ IDE autocomplete for all fields and methods
- ✅ Compile-time type checking

```typescript
import { 
  InkressSDK, 
  // Core types
  Product, 
  Category, 
  Order, 
  Merchant,
  User,
  BillingPlan,
  Subscription,
  
  // Create/Update types
  CreateProductData,
  UpdateProductData,
  CreateOrderData,
  UpdateMerchantData,
  CreateUserData,
  
  // Response types
  ApiResponse,
  ProductListResponse,
  OrderListResponse,
  MerchantBalance,
  MerchantLimits,
  MerchantSubscription,
  MerchantInvoice,
  
  // Query types
  ProductQueryParams,
  OrderQueryParams,
  RangeQuery,
  StringQuery,
  
  // Enum types
  OrderStatus,
  OrderKind,
  AccountStatus,
  UserKind,
  FeeStructureKey,
  StatusKey,
  KindKey
} from '@inkress/admin-sdk';

// All responses are properly typed
const response: ApiResponse<ProductListResponse> = await inkress.products.list();
const products: Product[] = response.result?.entries || [];

// Create operations with full typing
const createData: CreateProductData = {
  name: 'Gaming Laptop',
  price: 1299.99,
  category_id: 1,
  status: 'published',
  kind: 'published'
};
const product: ApiResponse<Product> = await inkress.products.create(createData);

// Update operations with full typing
const updateData: UpdateMerchantData = {
  name: 'Updated Store',
  status: 'approved',
  platform_fee_structure: 'customer_pay'
};
await inkress.merchants.update(123, updateData);

// Merchant account methods with specific types
const balances: ApiResponse<MerchantBalance> = await inkress.merchants.balances();
// balances.data: { available: number, pending: number, currency: string }

const limits: ApiResponse<MerchantLimits> = await inkress.merchants.limits();
// limits.data: { transaction_limit: number, daily_limit: number, monthly_limit: number, currency: string }

const subscription: ApiResponse<MerchantSubscription> = await inkress.merchants.subscription();
// subscription.data: { plan_name: string, status: string, billing_cycle: string, price: number, ... }

const invoices: ApiResponse<MerchantInvoice[]> = await inkress.merchants.invoices();
// invoices.data: Array of typed MerchantInvoice objects

// Query with full type safety
const orderQuery: OrderQueryParams = {
  status: ['confirmed', 'shipped'],
  total: { min: 100, max: 1000 },
  reference_id: { contains: 'VIP' },
  page: 1,
  page_size: 20
};
const orders: ApiResponse<OrderListResponse> = await inkress.orders.query(orderQuery);

// Contextual enums for type safety
const status: OrderStatus = 'confirmed';  // Only valid order statuses allowed
const kind: OrderKind = 'online';         // Only valid order kinds allowed
const feeStructure: FeeStructureKey = 'customer_pay';  // Only valid fee structures allowed
```

### Type-Safe Query Building

Query builders provide complete type safety:

```typescript
// Typed query builder - only valid methods for each field type
const products = await inkress.products
  .createQueryBuilder()
  .whereStatus('published')           // String field - contextual value
  .whereCategory(5)                   // Number field - direct value
  .wherePriceRange(50, 500)          // Number field - range
  .whereTitleContains('gaming')      // String field - contains
  .whereUnlimited(true)              // Boolean field - direct value
  .whereCreatedAfter('2024-01-01')   // Date field - after
  .paginate(1, 20)
  .execute();

// TypeScript ensures you can't use wrong query types
products
  .wherePrice({ contains: 'text' })  // ❌ Compile error: price is numeric
  .whereTitle(123);                  // ❌ Compile error: title is string
```

### Response Type Handling

Handle responses with full type awareness:

```typescript
async function getProduct(id: number): Promise<Product | null> {
  try {
    const response: ApiResponse<Product> = await inkress.products.get(id);
    
    // TypeScript knows the exact structure
    if (response.result) {
      return response.result;  // Product type
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

async function listProducts(): Promise<Product[]> {
  const response: ApiResponse<ProductListResponse> = await inkress.products.list();
  
  // TypeScript knows ProductListResponse structure
  const entries = response.result?.entries || [];
  
  // entries is Product[]
  return entries.map(product => ({
    ...product,
    discounted_price: product.price * 0.9  // TypeScript knows price is a number
  }));
}
```

### Discriminated Unions

Use TypeScript's discriminated unions for status/kind handling:

```typescript
type OrderStatusAction = 
  | { status: 'pending', action: 'await_payment' }
  | { status: 'confirmed', action: 'process_order' }
  | { status: 'shipped', action: 'track_shipment' }
  | { status: 'delivered', action: 'request_feedback' };

async function handleOrder(orderId: number, statusAction: OrderStatusAction) {
  await inkress.orders.update(orderId, { status: statusAction.status });
  
  // TypeScript narrows the type based on status
  switch (statusAction.status) {
    case 'pending':
      // statusAction.action is 'await_payment'
      break;
    case 'confirmed':
      // statusAction.action is 'process_order'
      break;
  }
}
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
    return response.result || [];
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

### 4. Webhook Verification

Verify incoming webhook requests from Inkress using HMAC SHA256:

```typescript
import { WebhookUtils } from '@inkress/admin-sdk';

// Method 1: Verify with signature, body, and secret
app.post('/webhooks/inkress', (req, res) => {
  const signature = req.headers['x-inkress-webhook-signature'];
  const body = JSON.stringify(req.body);
  const secret = process.env.INKRESS_WEBHOOK_SECRET;
  
  const isValid = WebhookUtils.verifySignature(body, signature, secret);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
  res.status(200).json({ received: true });
});

// Method 2: Let the SDK extract everything from the request
app.post('/webhooks/inkress', (req, res) => {
  const secret = process.env.INKRESS_WEBHOOK_SECRET;
  
  try {
    const { isValid, body } = WebhookUtils.verifyRequest(req, secret);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse the verified body
    const webhookPayload = WebhookUtils.parsePayload(body);
    
    // Process webhook...
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Method 3: Use Express middleware for automatic verification
import { createWebhookMiddleware } from '@inkress/admin-sdk';

app.use('/webhooks/inkress', createWebhookMiddleware(process.env.INKRESS_WEBHOOK_SECRET));

app.post('/webhooks/inkress', (req, res) => {
  // Request is already verified, payload attached to req.webhookPayload
  const { webhookPayload } = req;
  
  console.log(`Received event: ${webhookPayload.event.action}`);
  
  res.status(200).json({ received: true });
});
```

**Webhook Signature Format:**
- Header: `X-Inkress-Webhook-Signature`
- Algorithm: HMAC SHA256
- Encoding: Base64
- Equivalent to: `crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()`

See [examples/webhook-server.ts](examples/webhook-server.ts) for a complete implementation.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Migrating from Older Versions

See [MIGRATION.md](MIGRATION.md) for upgrade instructions and breaking changes between versions.

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