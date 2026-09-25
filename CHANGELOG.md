# Changelog

All notable changes to the Inkress Admin SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-25

### ✨ Added

- **`savedCards` resource (Ink Pay, INK-438).** `list` / `get` / `remove` (disconnects the card from
  your merchant only — it stays usable by other merchants the customer connected it to), `charge`
  (queues an on-demand merchant-initiated charge; resolves the endpoint's flat `202
  {status, job_id, status_url}` body, validated before it's returned — never a silently-accepted
  malformed response). Replaying the same `idempotency_key` never double-charges: it reports the
  existing charge's status (409 `idempotency_key_reuse_with_different_payload` if the payload
  differs). `chargeStatus` and `waitForCharge` poll the charge's outcome through `succeeded` /
  `declined` / `failed` / `under_review` — `under_review` **resolves** rather than throwing (the
  charge may have money held past the processor's idempotency window); callers must poll again with
  the SAME idempotency key, never a new one.
- Subscription status `payment_failed` (5).

## [1.1.52] - 2026-09-18

### ✨ Added

- **Discount codes.** Surfaces the commerce-api discount rollout: `discount_code` on order-create
  input (the server re-validates and re-prices it against the authoritative subtotal — a
  client-sent discount amount is never trusted), `discount_total` / `discount_code` on the order,
  checkout session and fees response, and a new `getDiscount()` helper for the public discount
  quote endpoint (`/public/m/:username/discount`).

## [1.1.51] - 2026-08-08

### 🐛 Fixed

- **List responses now carry pagination.** Every resource's `list` / `query` read
  `response.result.page_info`, but commerce-api serialises pagination under **`pagination`**
  (`lib/api/utils/paginate.ex`), so `page_info` came back `undefined` and `total_entries` / `more`
  (what pagination and infinite scroll depend on) were silently dropped. The reshape now reads the
  wire's `pagination` and surfaces it as `page_info`. `PageInfo` is redefined to the real wire shape
  (`page`, `page_size`, `total_entries`, `more`, plus `total_pages` / `next_page` / `next_pages` /
  `last_page` / `last_pages` when `more` is true); the previous `current_page` / `total_pages`-only
  shape matched no real response.

## [1.1.50] - 2026-08-08

### 🐛 Fixed

- **Resource reads no longer crash on a partial embedded record.** The `FeeStructure`, `Kind`, and
  `Status` translators (`toString` / `toStringWithoutContext`) now pass a `null`/`undefined` value
  through instead of throwing. Previously `orders.get` and `orders.query` threw
  `Unknown fee structure value: undefined` on **every real order**, because the order's embedded
  merchant carries an id and status but no `platform_fee_structure` / `provider_fee_structure`
  column for `translateMerchantToUserFacing` to translate.
- **Payment link `kind` was translated in the wrong context on read.** `translateToUserFacing` used
  the `order` context (so `kind: 1` came back as `"online"`), disagreeing with the write/filter paths
  (`translateFilters` / `translateToInternal`), which both use `payment_link`. It now uses
  `payment_link` — `kind: 1` → `"order"`, `2` → `"invoice"`.
- **Payment link `status` had no mapping entries**, so it fell through to the `financial_request`
  reverse (a draft link came back as `"financial_request_in_review"`). Added `payment_link_active`
  (1), `payment_link_draft` (2), and `payment_link_cancelled` (3) to the Status map, matching
  commerce-web and the merchant apps' `PAYMENT_LINK_STATUS`.

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
