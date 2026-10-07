# @inkress/admin-sdk

Server-side TypeScript/JavaScript client for the Inkress Commerce API.

[![npm version](https://badge.fury.io/js/@inkress%2Fadmin-sdk.svg)](https://badge.fury.io/js/@inkress%2Fadmin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Version.** This README describes the source on this branch, package version `1.0.0`. The `latest`
> release on npm (1.1.x) is built from a different line of development, with a different configuration
> (`accessToken`, `username`, `mode`) and more resources. Check `package.json` in the installed package
> before following this README.

## Installation

```bash
npm install @inkress/admin-sdk
```

## Quick start

```typescript
import { InkressSDK } from '@inkress/admin-sdk';

const inkress = new InkressSDK({
  bearerToken: process.env.INKRESS_TOKEN!,   // JWT or API token; '' for public endpoints only
  clientId: 'm-your-merchant-username',      // sent as the Client-Id header
  endpoint: 'https://api.inkress.com',       // default; https://api-dev.inkress.com for development
});

const { result } = await inkress.orders.create({
  currency_code: 'USD',
  total: 29.99,
  reference_id: 'order-123',
  customer: { email: 'customer@example.com', first_name: 'Jane', last_name: 'Doe' },
});
```

## Configuration

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `bearerToken` | `string` | Yes | — | Sent as `Authorization: Bearer <token>` |
| `clientId` | `string` | No | `''` | Sent as `Client-Id` when set. Format `m-{merchant username}`. Required for merchant resources. |
| `endpoint` | `string` | No | `https://api.inkress.com` | API origin |
| `apiVersion` | `string` | No | `v1` | Requests go to `{endpoint}/api/{apiVersion}` |
| `timeout` | `number` | No | `30000` | Request timeout in ms |
| `retries` | `number` | No | `0` | Retries for 5xx responses and network errors/timeouts, with a 1 s, 2 s, … delay |
| `headers` | `Record<string, string>` | No | `{}` | Extra headers on every request |

## Responses and errors

Every method resolves to the API envelope `ApiResponse<T>`: `{ state: 'ok' | 'error', result?: T, data?: T }`.
Most endpoints put the payload in `result`.

A non-2xx response throws `InkressApiError` with `status` (HTTP status, `0` for network errors and
timeouts), `message` and `data` (the parsed error body):

```typescript
import { InkressApiError } from '@inkress/admin-sdk';

try {
  await inkress.products.get(123);
} catch (err) {
  if (err instanceof InkressApiError && err.status === 404) {
    // not found
  } else {
    throw err;
  }
}
```

Some subscription endpoints answer HTTP 200 with `state: 'error'` (for example an unknown
subscription), so check `state` as well as catching errors.

List methods resolve to `{ entries, pagination }` under `result`. The SDK's list response types name
the pagination block `page_info`; the API returns it as `pagination` (`page`, `page_size`,
`total_entries`, `total_pages`, `more`, …).

## Resources

Every method below maps to one API route (paths are relative to `/api/v1`).

### `inkress.public` (no authentication)

| Method | Route |
|---|---|
| `getMerchant({ username } \| { 'domain.cname': cname })` | `GET /public/m` |
| `getMerchantFees(username, { currency, total })` | `GET /public/m/{username}/fees` |
| `getMerchantProducts(username, params?)` | `GET /public/m/{username}/products` |

```typescript
const merchant = await inkress.public.getMerchant({ username: 'mystore' });
const fees = await inkress.public.getMerchantFees('mystore', { currency: 'JMD', total: 1000 });
const products = await inkress.public.getMerchantProducts('mystore', { search: 'laptop', limit: 20 });
```

### `inkress.merchants`

| Method | Route |
|---|---|
| `list(params?)` | `GET /merchants` |
| `get(id)` | `GET /merchants/{id}` |
| `create({ name, email, phone?, about? })` | `POST /merchants` |
| `update(id, data)` | `PUT /merchants/{id}` |

### `inkress.products`

| Method | Route |
|---|---|
| `list(params?)` | `GET /products` |
| `get(id)` | `GET /products/{id}` |
| `create(data)` | `POST /products` |
| `update(id, data)` | `PUT /products/{id}` |
| `delete(id)` | `DELETE /products/{id}` |

```typescript
await inkress.products.create({
  title: 'Gaming Laptop',
  permalink: 'gaming-laptop',
  price: 1299.99,
  teaser: 'High-performance gaming laptop',
  public: true,
});
```

### `inkress.categories`

| Method | Route |
|---|---|
| `list(params?)` | `GET /categories` |
| `get(id)` | `GET /categories/{id}` |
| `create({ name, kind, description?, kind_id?, parent_id? })` | `POST /categories` |
| `update(id, data)` | `PUT /categories/{id}` (`parent_id` cannot change) |
| `delete(id)` | `DELETE /categories/{id}` |

### `inkress.orders`

| Method | Route |
|---|---|
| `create({ currency_code, total, customer, reference_id?, kind? })` | `POST /orders` |
| `get(id)` | `GET /orders/{id}` |
| `update(id, { status })` | `PUT /orders/{id}` |
| `getStatus(id)` | `GET /orders/status/{id}` (public) |
| `list()` | `GET /orders` |

### `inkress.users`

| Method | Route |
|---|---|
| `list(params?)` | `GET /users` |
| `get(id)` | `GET /users/{id}` |
| `create({ email, password, first_name?, last_name?, phone?, username?, role_id?, ... })` | `POST /users` |
| `update(id, data)` | `PUT /users/{id}` |
| `delete(id)` | `DELETE /users/{id}` |

### `inkress.billingPlans`

| Method | Route |
|---|---|
| `list(params?)` | `GET /billing_plans` |
| `get(id)` | `GET /billing_plans/{id}` |
| `create(data)` | `POST /billing_plans` |
| `update(id, data)` | `PUT /billing_plans/{id}` |
| `delete(id)` | `DELETE /billing_plans/{id}` |

```typescript
await inkress.billingPlans.create({
  name: 'Courier monthly',
  kind: 1,                 // 1 = subscription plan
  flat_rate: 40,
  billing_cycle: 3,        // 1 daily, 2 weekly, 3 monthly (calendar month), 4 yearly
  duration: 12,
  auto_charge: true,       // renewals charge the saved card
  charge_strategy: 1,      // 1 = charge at period start, 2 = at period end
  currency_id: 1,
  transaction_fee: 0,
  transaction_percentage: 0,
});
```

`CreateBillingPlanData` types the core plan fields. The API also accepts `billing_model`, `public`,
`meta_data` and `data` (usage-based billing: `is_usage_based`, `apply_usage_charge_to_flat_rate`,
`usage_metrics` with `allotment` and `tiers`); see `BillingPlan` in the API's `openapi.yaml`. The
type declares `features` as `string[]`; the API stores any JSON object there.

### `inkress.subscriptions`

| Method | Route |
|---|---|
| `list(params?)` | `GET /billing_subscriptions` |
| `createLink({ plan_id, reference_id, title, customer })` | `POST /billing_subscriptions/link` |
| `charge(uid, { total, reference_id, title })` | `POST /billing_subscriptions/{uid}/charge` |
| `getPeriods(uid, params?)` | `GET /billing_subscriptions/{uid}/periods` |
| `cancel(uid, code)` | `POST /billing_subscriptions/{uid}/cancel/{code}` (public cancel-by-code) |

```typescript
// Sign-up link for a plan (plan_id is the plan's uid)
const link = await inkress.subscriptions.createLink({
  plan_id: 'plan_courier_monthly',
  reference_id: 'cp-sub-0042',
  title: 'Courier Portal subscription',
  customer: { first_name: 'Spanish', last_name: 'Town', email: 'billing@example.com' },
});
const payUrl = link.result?.payment_urls.short_link;

// Ad-hoc charge
const charge = await inkress.subscriptions.charge('sub_7f3a9c', {
  total: 12.5,
  reference_id: 'cp-usage-2026-10',
  title: 'Extra packages',
});
```

Differences between these types and what the API returns:

- `createLink` resolves to the full sign-up order (`id`, `reference_id`, `payment_urls`, `total`,
  `plan`, …); there is no `subscription` key. The API also accepts `start_date`, `end_date`, `prorate`
  and `meta_data`, which the type does not declare.
- `charge` on a card-linked subscription answers `202` with `{ status: 'queued', job_id, reference,
  subscription_uid }`; on other subscriptions `{ total, currency, status, reference, subscription_uid,
  subscription_status }`. Neither matches the declared `ChargeSubscriptionResponse`
  (`id`, `payment_urls`, `transaction`).
- `getPeriods`: period `status` is an integer in the API, not the declared string values.
- `cancel` declares `uid` as a `number`; the API route takes the subscription's string `uid`.

API routes this version does not wrap: `POST /billing_subscriptions/usage/{uid}`,
`GET /billing_subscriptions/{uid}/charges/{reference}`, `POST /billing_subscriptions/{uid}/card-update-link`,
`POST|DELETE /billing_subscriptions/{uid}/plan-change`, `DELETE /billing_subscriptions/{id}`, and the
public `/subscription-card-update/*` endpoints. Call them with any HTTP client using the same headers.

## Webhooks

This SDK does not verify webhooks. Inkress signs them with an `X-Inkress-Webhook-Signature` header
(base64 HMAC-SHA256 of the raw body); see `docs/webhooks.md` in commerce-api.

## License

MIT — see [LICENSE](LICENSE).
