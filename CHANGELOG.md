# Changelog

All notable changes to the Inkress Admin SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.49] - 2026-07-29

### 🚀 Added

- **`kyc.createVerifyLink(merchantId)`** — mint a merchant-facing KYC `/verify` link for a merchant
  you own (integrator / organisation use case). Returns `{ verify_url, expires_at, single_use }`
  (exported type `KycVerifyLink`). The authenticated token must carry the `kyc:write` scope and own
  the merchant; the returned link is single-use, expires in ~3 hours, and is write-only. See the
  "Mint a Merchant Verify Link (integrators)" section in the README.
- **`subscriptions.createCardUpdateLink(uid, { storefront_base? })`** — mint a self-serve card-update
  magic-link for a subscription (`POST /billing_subscriptions/:uid/card-update-link`). Returns
  `{ link, token }` (exported type `CardUpdateLinkResponse`); send `link` to the subscriber so they
  replace the card on file — a temporary $1 authorize-only hold verifies the new card, no login or
  support ticket needed. Merchant-authed; only works while the subscription is active.

## [1.1.0] - 2024-12-16

### 🚀 Feature Release - Enhanced Type Safety & Query System

This release adds significant new features and includes breaking changes to the configuration interface.

### ⚠️ BREAKING CHANGES

#### Configuration Interface Changes
The SDK configuration has been updated for better developer experience:

**Old Configuration:**
```typescript
const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token',
  clientId: 'm-merchant-username',
  endpoint: 'https://api.inkress.com',
});
```

**New Configuration:**
```typescript
const inkress = new InkressSDK({
  accessToken: 'your-jwt-token',        // renamed from bearerToken
  username: 'merchant-username',         // renamed from clientId, SDK prepends 'm-'
  mode: 'live',                          // replaces endpoint ('live' or 'sandbox')
});
```

**Migration Guide:**
1. Replace `bearerToken` with `accessToken`
2. Replace `clientId` with `username` (remove the 'm-' prefix, SDK adds it automatically)
3. Replace `endpoint` with `mode`:
   - `'https://api.inkress.com'` → `mode: 'live'`
   - `'https://api-dev.inkress.com'` → `mode: 'sandbox'`

### ✨ Added

#### New Resources (14 additional resources)
- **Payment Links** - Payment link generation and management
- **Financial Accounts** - Financial account management
- **Financial Requests** - Payout and withdrawal requests
- **Webhook URLs** - Webhook configuration and management
- **Tokens** - API token management
- **Addresses** - Address management
- **Currencies** - Multi-currency support
- **Exchange Rates** - Currency exchange rate management
- **Fees** - Fee management and configuration
- **Payment Methods** - Payment method configuration
- **Posts** - Content management system
- **Transaction Entries** - Transaction tracking
- **Generics** - Dynamic endpoint access
- **KYC** - Know Your Customer operations

#### Advanced Query System
- **Query Builder Pattern** - Fluent query builder for all resources
  ```typescript
  const orders = await inkress.orders.createQueryBuilder()
    .whereStatus(['confirmed', 'shipped'])
    .whereTotalRange(100, 1000)
    .whereReferenceContains('VIP')
    .execute();
  ```
- **Direct Query Method** - Intuitive object-based query syntax
  ```typescript
  const products = await inkress.products.query({
    status: ['published', 'featured'],
    price: { min: 100, max: 1000 },
    title: { contains: 'laptop' }
  });
  ```
- **Automatic Query Transformation** - SDK automatically converts clean queries to API format
- **Runtime Field Type Validation** - Prevents type mismatches before API calls
- **18 Query Builder Classes** - One for each resource with query support

#### Contextual Translation System
- **Human-Readable API** - Use contextual strings instead of integers
  ```typescript
  // Before: await inkress.orders.update(123, { status: 4, kind: 1 });
  // Now: await inkress.orders.update(123, { status: 'confirmed', kind: 'online' });
  ```
- **Automatic Conversion** - SDK converts strings to integers for API calls
- **Three Translator Classes**:
  - `StatusTranslator` - For status fields across all resources
  - `KindTranslator` - For kind/type fields
  - `FeeStructureTranslator` - For fee structure fields
- **Bidirectional Translation** - API responses converted back to readable strings
- **Backward Compatible** - Integer values still work

#### 100% Type Safety
- **128+ Fully Typed Methods** - Every method has explicit input and return types
- **Zero `any` Types** - No untyped parameters or responses
- **Specific Response Interfaces** - All responses use specific types:
  - `MerchantBalance`, `MerchantLimits`, `MerchantSubscription`, `MerchantInvoice`
  - `SubscriptionUsageResponse`, `SubscriptionCancelResponse`
  - `CreateSubscriptionLinkResponse`, `ChargeSubscriptionResponse`
  - And many more...
- **Field Type Mappings** - Runtime validation for all resource fields
- **Query Type Safety** - Fully typed query parameters for all resources

#### Enhanced Merchant Methods
- `balances()` - Get merchant account balances (properly typed)
- `limits()` - Get merchant account limits (properly typed)
- `subscription()` - Get merchant subscription plan (properly typed)
- `invoices()` - Get merchant invoices (properly typed)
- `invoice(id)` - Get specific invoice (properly typed)

#### Enhanced Subscription Methods
- `createLink()` - Create subscription payment link
- `charge()` - Charge existing subscription
- `usage()` - Record usage for usage-based billing (now properly typed)
- `cancel()` - Cancel subscription (now properly typed)
- `getPeriods()` - Get subscription billing periods

#### Webhook Verification
- **`WebhookUtils.verifySignature()`** - Verify webhook signature with body, signature, and secret
- **`WebhookUtils.verifyRequest()`** - Automatic verification from HTTP request object
- **`createWebhookMiddleware()`** - Express middleware for automatic webhook verification
- **Shopify-style signatures** - HMAC SHA256 with Base64 encoding
- **Header format** - `X-Inkress-Webhook-Signature`
- See `examples/webhook-server.ts` for complete implementation

### 🔄 Changed

#### Configuration Interface (BREAKING)
- **accessToken** replaces `bearerToken` - More standard terminology
- **username** replaces `clientId` - SDK automatically prepends 'm-' prefix
- **mode** replaces `endpoint` - Choose 'live' or 'sandbox' instead of full URLs

#### Improvements
- **Consistent Request Patterns** - All resources follow same patterns
- **Proper HTTP Verbs** - GET for reads, POST for creates, PUT for updates, DELETE for deletes
- **Translation in CRUD** - All create/update methods use translators
- **Query Support** - 18 resources now have query() and createQueryBuilder()
- **Automatic endpoint resolution** - SDK computes API URL from mode

### 🐛 Fixed

#### Critical Bugs
- Fixed `addresses.update()` - Was passing `data` instead of `internalData`
- Fixed `fees.update()` - Was passing `data` instead of `internalData`
- Fixed merchant account methods - Changed from POST to GET
- Fixed merchant account methods - Added proper type safety

#### Translation Fixes
- Fixed `billing-plans` - Now translates kind and status in create/update
- Fixed `subscriptions` - Now translates kind and status in create
- Fixed `users` - Now uses translator in create method

#### Type Safety Fixes
- Fixed `subscriptions.usage()` - Returns `SubscriptionUsageResponse` instead of `any`
- Fixed `subscriptions.cancel()` - Returns `SubscriptionCancelResponse` instead of `any`
- Fixed `public.getMerchantFees()` - Uses `MerchantFeesParams` interface
- Fixed `ChargeSubscriptionResponse` - Transaction field properly typed

### 📚 Documentation
- **Complete README Rewrite** - Comprehensive documentation with all features
- **Advanced Query Examples** - Detailed examples for both query syntaxes
- **TypeScript Guide** - Complete guide to type-safe usage
- **Resource Examples** - Examples for all 23 resources
- **Migration Guide** - Available in CONSISTENCY_IMPROVEMENTS.md

### 🎯 Statistics
- **23 Resources** - Up from 9 in v1.0.0 (156% increase)
- **128+ Methods** - All fully typed
- **100% Type Coverage** - Zero any types in new code
- **18 Query Builders** - Fluent API for complex queries
- **3 Translator Classes** - Automatic contextual conversions

### 📦 Upgrading from 1.0.0

**Configuration Changes (Required):**

```typescript
// OLD (v1.0.0)
const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token',
  clientId: 'm-merchant-username',
  endpoint: 'https://api.inkress.com',
});

// NEW (v1.1.0)
const inkress = new InkressSDK({
  accessToken: 'your-jwt-token',        // renamed
  username: 'merchant-username',         // renamed, remove 'm-' prefix
  mode: 'live',                          // replaces endpoint
});
```

**New Features (Optional):**

```typescript
// Use contextual strings for better readability
await inkress.orders.update(123, { status: 'confirmed' });

// Use advanced query system
await inkress.orders.query({
  status: ['confirmed', 'shipped'],
  total: { min: 100, max: 1000 }
});

// Import new types
import { 
  MerchantBalance,
  SubscriptionUsageResponse,
  // ... other new types
} from '@inkress/admin-sdk';
```

See `CONSISTENCY_IMPROVEMENTS.md` for complete details.

---

## [1.0.0] - 2025-07-01

### Added
- Initial release of the Inkress Admin SDK
- TypeScript support with comprehensive type definitions
- Public endpoints for accessing merchant information without authentication
- Full CRUD operations for merchants, products, categories, orders, and users
- Billing plans and subscriptions management
- Automatic retry logic and error handling
- Configurable API endpoints and authentication
- Support for Node.js, browsers, and React Native environments

### Features
- **Public Resource**: Access merchant data, products, and fees without authentication
- **Merchants Resource**: Complete merchant management capabilities
- **Products Resource**: Full product lifecycle management with pagination and filtering
- **Categories Resource**: Category management with hierarchical support
- **Orders Resource**: Order creation, tracking, and status management
- **Users Resource**: User management and role-based access control
- **Billing Plans Resource**: Subscription and payment plan management
- **Subscriptions Resource**: Recurring billing and subscription management

### Security
- JWT-based authentication
- Secure token management
- Support for custom headers and request configuration

### Developer Experience
- Comprehensive TypeScript definitions
- Detailed JSDoc documentation
- Intuitive API design following REST conventions
- Built-in error handling with structured error responses
- Debug logging support for development

## [Unreleased]

### Planned
- Webhook management endpoints
- Enhanced filtering and search capabilities
- Rate limiting utilities
- SDK analytics and monitoring
- Advanced caching strategies
