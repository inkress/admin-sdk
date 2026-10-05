import { HttpClient, InkressApiError } from '../client';
import {
  RESOLVED_STATUSES,
  defaultSleep,
  isChargeOutcome,
  isChargeStatus,
  isJobId,
  isRecord,
  isTransientError,
  validateWaitOptions,
} from './card-charge-shared';
import {
  SavedCardChargePendingError,
  type SavedCardChargeOutcome,
  type SavedCardChargeStatus,
  type SavedCardWaitOptions,
} from './saved-cards';
import {
  Subscription,
  InternalSubscription,
  InternalBillingPlan,
  BillingPlan,
  BillingPlanKind,
  SubscriptionPeriod,
  CreateSubscriptionData,
  SubscriptionLinkData,
  SubscriptionUsageData,
  SubscriptionUsageResponse,
  SubscriptionCancelResponse,
  ApiResponse,
  PaginationParams,
  SubscriptionStatus,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { SubscriptionQueryBuilder } from '../utils/query-builders';
import {
  SubscriptionFilterParams,
  SubscriptionQueryParams,
  SubscriptionListResponse,
  SUBSCRIPTION_FIELD_TYPES,
} from '../types/resources';

export interface CreateSubscriptionLinkData {
  reference_id: string;
  title: string;
  plan_uid: string;
  meta_data?: Record<string, any>;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSubscriptionLinkResponse {
  status: 'paid';
  total: number;
  reference: string;
  currency: string;
  subscription_status: string;
  subscription_uid: string;
}

export interface CreateCardUpdateLinkData {
  /** Storefront base URL the magic-link is built on (falls back to the API's STOREFRONT_BASE_URL). */
  storefront_base?: string;
}

export interface CardUpdateLinkResponse {
  /** The signed self-serve magic-link to send the subscriber — they open it to update the card on file. */
  link: string;
  /** The raw HMAC token embedded in `link` (scoped to this one subscription uid). */
  token: string;
}

export interface ChargeSubscriptionData {
  reference_id: string;
  total: number;
  title: string;
}

/**
 * A charge on a subscription LINKED to a card on file (every subscription created through hosted
 * checkout on current commerce-api): HTTP 202, charged asynchronously on the vaulted card. Poll
 * with `chargeStatus` / `waitForCharge`, by `reference` or by your own `reference_id` (INK-690/691).
 */
export interface SubscriptionChargeQueued {
  /** `queued` for a new charge; a same-reference replay reports the existing charge's status. */
  status: SavedCardChargeStatus;
  /** `null` when a replayed charge's job is no longer retained. */
  job_id: number | null;
  /** The durable order reference (`cardchg-…`). */
  reference: string;
  subscription_uid: string;
}

/**
 * A charge on an UNLINKED (legacy) subscription: answered synchronously with the order the charge
 * created. With no stored card that order is unpaid (`status: 'pending'`) and the customer pays it
 * by link; `chargeStatus` does not apply (404).
 */
export interface SubscriptionChargeSettled {
  total: number | null;
  currency: string | null;
  /** Order status key, e.g. `paid` or `pending`. */
  status: string | null;
  reference: string | null;
  subscription_uid: string;
  subscription_status: string | null;
}

/**
 * The `charge` result. The previous single-object type (`id` / `payment_urls` / `transaction`)
 * never matched what the API returns; narrow with `isSubscriptionChargeQueued`.
 */
export type ChargeSubscriptionResponse = SubscriptionChargeQueued | SubscriptionChargeSettled;

/** True for the linked (asynchronous, 202) charge answer. */
export function isSubscriptionChargeQueued(value: ChargeSubscriptionResponse): value is SubscriptionChargeQueued {
  return isRecord(value) && 'job_id' in value && isJobId(value.job_id) && isChargeStatus(value.status);
}

/** `GET /billing_subscriptions/:uid/charges/:reference` — the same read model as saved-card charges. */
export interface SubscriptionChargeOutcome extends SavedCardChargeOutcome {
  subscription_uid: string;
}

function isSubscriptionChargeOutcome(value: unknown): value is SubscriptionChargeOutcome {
  return isChargeOutcome(value) && isRecord(value) && typeof value.subscription_uid === 'string';
}

function requireReference(reference: string): string {
  const trimmed = reference.trim();
  if (trimmed === '') throw new Error('reference is required');
  return trimmed;
}

/** INK-694: plan-change types (`POST/DELETE /billing_subscriptions/:uid/plan-change`). */
export type PlanChangeOutcome = 'created' | 'unchanged' | 'replaced';
export type PlanChangeResolution = 'applied' | 'cancelled' | 'rejected';
export type PlanChangeErrorCode =
  | 'not_found'
  | 'subscription_not_active'
  | 'subscription_cancelled'
  | 'trial_active'
  | 'dunning_in_progress'
  | 'renewal_in_progress'
  | 'already_on_plan'
  | 'target_plan_not_found'
  | 'target_plan_inactive'
  | 'currency_mismatch'
  | 'charge_mode_mismatch'
  | 'billing_model_mismatch'
  | 'no_pending_plan_change';

export interface PlanChangePlanSummary {
  uid: string;
  name: string | null;
  total: number | null;
  currency: string | null;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
}

/** Stored on the subscription as `data.pending_plan_change` until the next renewal applies it. */
export interface PendingPlanChange {
  id: string;
  from_plan_id: number;
  from_plan_uid: string;
  to_plan_id: number;
  to_plan_uid: string;
  from_plan: PlanChangePlanSummary;
  to_plan: PlanChangePlanSummary;
  requested_at: string;
  requested_by: { kind: 'user' | 'oauth_app' | 'staff'; id: number | string | null };
  /** The current period end when requested; the change applies at the renewal that ends it. */
  effective_at: string | null;
}

/** `data.last_plan_change` once a change is applied, cancelled or rejected at renewal. */
export interface ResolvedPlanChange extends PendingPlanChange {
  outcome: PlanChangeResolution;
  resolved_at: string;
  /** Why a change was rejected at renewal (e.g. `target_plan_inactive`); null otherwise. */
  reason: string | null;
}

export interface ChangeSubscriptionPlanData {
  plan_uid: string;
}

export interface ChangeSubscriptionPlanResponse {
  subscription_uid: string;
  outcome: PlanChangeOutcome;
  pending_plan_change: PendingPlanChange;
}

export interface CancelSubscriptionPlanChangeResponse {
  subscription_uid: string;
  cancelled_plan_change: PendingPlanChange;
}

export interface SubscriptionPeriodsParams extends PaginationParams {
  status?: 'pending' | 'paid' | 'failed' | 'cancelled';
  limit?: number;
}

export interface SubscriptionPeriodsResponse {
  entries: SubscriptionPeriod[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class SubscriptionsResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal subscription data (integers) to user-facing data (strings)
   */
  private translateToUserFacing(internal: InternalSubscription): Subscription {
    const result: any = {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_subscription') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_subscription') as KindKey,
    };
    
    // Translate nested billing plan if present
    if (internal.billing_plan) {
      result.billing_plan = this.translateBillingPlanToUserFacing(internal.billing_plan);
    }
    
    return result;
  }

  /**
   * Convert internal billing plan data to user-facing billing plan
   */
  private translateBillingPlanToUserFacing(internal: InternalBillingPlan): BillingPlan {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_plan') as StatusKey,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_plan') as BillingPlanKind,
    };
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   * @deprecated This method is no longer needed as processQuery handles translation
   */
  private translateFilters(params?: SubscriptionFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status as SubscriptionStatus | StatusKey, 'billing_subscription');
    }
    
    return translated;
  }

  /**
   * Translate subscription data for API (contextual strings to integers)
   */
  private translateToInternal(data: CreateSubscriptionData): any {
    const internal: any = { ...data };
    
    // Translate status if present and is a string
    if (data.status && typeof data.status === 'string') {
      internal.status = StatusTranslator.toIntegerWithContext(data.status as StatusKey, 'billing_subscription');
    }
    
    // Translate kind if present and is a string
    if (data.kind && typeof data.kind === 'string') {
      internal.kind = KindTranslator.toInteger(data.kind as KindKey);
    }
    
    return internal;
  }

  /**
   * List billing subscriptions with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: SubscriptionFilterParams): Promise<ApiResponse<SubscriptionListResponse>> {
    const translatedParams = this.translateFilters(params);
    const response = await this.client.get<{ entries: InternalSubscription[]; pagination: any }>('/billing_subscriptions', translatedParams);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(sub => this.translateToUserFacing(sub));
      return {
        state: response.state,
        result: {
          entries: translatedEntries,
          page_info: response.result.pagination
        }
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Gets a billing subscription by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id?: number): Promise<ApiResponse<Subscription>> {
    const response = await this.client.get<InternalSubscription>(`/billing_subscriptions/${id}`);
    
    if (response.result) {
      const translatedSub = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedSub
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Create a new subscription
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>> {
    const internalData = this.translateToInternal(data);
    const response = await this.client.post<InternalSubscription>('/billing_subscriptions', internalData);
    
    if (response.result) {
      const translatedSub = this.translateToUserFacing(response.result);
      return {
        state: response.state,
        result: translatedSub
      };
    }
    
    return {
      state: response.state,
      result: response.result as any
    };
  }

  /**
   * Delete a subscription
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/billing_subscriptions/${id}`);
  }

  /**
   * Create a subscription payment link
   * Requires Client-Id header to be set in the configuration
   */
  async createLink(data: CreateSubscriptionLinkData): Promise<ApiResponse<CreateSubscriptionLinkResponse>> {
    return this.client.post<CreateSubscriptionLinkResponse>('/billing_subscriptions/link', {...data, plan_id: data.plan_uid });
  }

  /**
   * Mint a self-serve card-update magic-link for a subscription.
   *
   * Merchant-authed. Returns a signed, single-subscription link you send the subscriber; they open
   * it to replace the card on file — a small temporary ($1 authorize-only) hold verifies the new
   * card, so no login or support ticket is needed. Only works while the subscription is ACTIVE
   * (a cancelled/ended subscription returns an error).
   *
   * @param uid - The subscription uid
   * @param data - Optional `{ storefront_base }` to override the magic-link host
   * @returns `{ link, token }` — hand `link` to the subscriber
   *
   * @example
   * const { result } = await inkress.subscriptions.createCardUpdateLink('sub_abc');
   * // send result.link to the subscriber (email / SMS)
   */
  async createCardUpdateLink(uid: string, data?: CreateCardUpdateLinkData): Promise<ApiResponse<CardUpdateLinkResponse>> {
    return this.client.post<CardUpdateLinkResponse>(`/billing_subscriptions/${uid}/card-update-link`, data ?? {});
  }

  /**
   * Charge an existing subscription (one-off, on the subscription's card).
   * Requires Client-Id header to be set in the configuration; a LINKED subscription additionally
   * needs a credential bound to the plan-owning merchant with a charging role (merchant_admin /
   * organisation_admin) — organisation-level keys and bot keys are refused (403).
   *
   * `reference_id` is your idempotency key: a retry with the same value never charges twice. It is
   * also sent as `reference`, the name older API versions read.
   *
   * @example
   * const { result } = await inkress.subscriptions.charge(uid, { total: 12, title: 'Domain', reference_id: 'dom-123-2026' });
   * if (result && isSubscriptionChargeQueued(result)) {
   *   const outcome = await inkress.subscriptions.waitForCharge(uid, 'dom-123-2026');
   * }
   */
  async charge(uid: string, data: ChargeSubscriptionData): Promise<ApiResponse<ChargeSubscriptionResponse>> {
    return this.client.post<ChargeSubscriptionResponse>(`/billing_subscriptions/${uid}/charge`, {
      ...data,
      reference: data.reference_id,
    });
  }

  /**
   * Current outcome of a linked subscription's charge, by the `reference` from `charge` or by
   * your own `reference_id`. 404 (`InkressApiError`) when no such charge exists on this
   * subscription — including any charge on an unlinked subscription.
   */
  async chargeStatus(uid: string, reference: string): Promise<ApiResponse<SubscriptionChargeOutcome>> {
    const ref = requireReference(reference);
    const response = await this.client.get<unknown>(
      `/billing_subscriptions/${uid}/charges/${encodeURIComponent(ref)}`,
    );
    const body: unknown = (response as { result?: unknown }).result;
    if (!isSubscriptionChargeOutcome(body)) {
      throw new InkressApiError('Unexpected response from the subscription charge status endpoint', 0, response);
    }
    return { state: 'ok', result: body };
  }

  /**
   * Poll `chargeStatus` until the charge resolves (`succeeded`, `declined`, `failed` or
   * `under_review`), same budget and semantics as `savedCards.waitForCharge`. Transient misses
   * (network, 5xx, unparseable body) are retried; any 4xx is thrown. Throws
   * `SavedCardChargePendingError` (carrying the last outcome seen) when the budget runs out —
   * never retry the charge with a NEW reference then; poll again with the same one.
   */
  async waitForCharge(
    uid: string,
    reference: string,
    options: SavedCardWaitOptions = {},
  ): Promise<SubscriptionChargeOutcome> {
    validateWaitOptions(options);
    const ref = requireReference(reference);
    const attempts = options.attempts ?? 12;
    const maxDelay = options.maxDelayMs ?? 8000;
    const sleep = options.sleep ?? defaultSleep;
    let delay = options.initialDelayMs ?? 500;
    let last: SubscriptionChargeOutcome | undefined;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const { result } = await this.chargeStatus(uid, ref);
        last = result;
        if (result && (RESOLVED_STATUSES as readonly string[]).includes(result.status)) return result;
      } catch (error) {
        if (!isTransientError(error)) throw error;
      }
      if (attempt < attempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }

    throw new SavedCardChargePendingError(ref, last, attempts);
  }

  /**
   * Record usage for a usage-based subscription (INK-781). Adds `metric_count` (default 1) to the
   * metric's total for the subscription's current billing period and returns the new total.
   * Usage settings are set on the plan's `data` and copied to each subscription.
   * At renewal Inkress bills each metric in the subscription's `data.usage_metrics`
   * (`{ metric, rate, allotment? }`): units above `allotment` times `rate`, added to the plan price
   * when `data.apply_usage_charge_to_flat_rate` is true.
   * Requires Client-Id header to be set in the configuration
   */
  async usage(uid: string, data: SubscriptionUsageData): Promise<ApiResponse<SubscriptionUsageResponse>> {
    return this.client.post<SubscriptionUsageResponse>(`/billing_subscriptions/usage/${uid}`, data);
  }

  /**
   * Get subscription billing periods
   * Requires Client-Id header to be set in the configuration
   */
  async getPeriods(uid: string, params?: SubscriptionPeriodsParams): Promise<ApiResponse<SubscriptionPeriodsResponse>> {
    return this.client.get<SubscriptionPeriodsResponse>(`/billing_subscriptions/${uid}/periods`, params);
  }

  /**
   * Move a subscription to another plan of the same merchant at the end of its current period
   * (no proration). The card on file stays linked. Idempotent per target plan. Refusals are
   * `InkressApiError`s whose `result.result.code` is a `PlanChangeErrorCode` (404/409/422).
   * Needs a credential bound to the plan-owning merchant (merchant_admin / organisation_admin).
   */
  async changePlan(uid: string, data: ChangeSubscriptionPlanData): Promise<ApiResponse<ChangeSubscriptionPlanResponse>> {
    return this.client.post<ChangeSubscriptionPlanResponse>(`/billing_subscriptions/${uid}/plan-change`, data);
  }

  /** Cancel a pending plan change (404 `no_pending_plan_change` when none is pending). */
  async cancelPlanChange(uid: string): Promise<ApiResponse<CancelSubscriptionPlanChangeResponse>> {
    return this.client.delete<CancelSubscriptionPlanChangeResponse>(`/billing_subscriptions/${uid}/plan-change`);
  }

  /**
   * Cancel a subscription
   * Requires Client-Id header to be set in the configuration
   */
  async cancel(uid: number, code: string): Promise<ApiResponse<SubscriptionCancelResponse>> {
    return this.client.post<SubscriptionCancelResponse>(`/billing_subscriptions/${uid}/cancel/${code}`);
  }

  /**
   * Query subscriptions with enhanced query support
   * @example
   * await subscriptions.query({ status: 'active', billing_plan_id: 123 })
   */
  async query(params?: SubscriptionQueryParams): Promise<ApiResponse<SubscriptionListResponse>> {
    const processedQuery = processQuery(params || {}, SUBSCRIPTION_FIELD_TYPES, { validate: true, context: 'billing_subscription' });
    return this.client.get<SubscriptionListResponse>('/billing_subscriptions', processedQuery);
  }

  /**
   * Create a query builder for subscriptions
   * @example
   * await sdk.subscriptions.createQueryBuilder().whereStatus('active').execute()
   */
  createQueryBuilder(initialQuery?: SubscriptionQueryParams): SubscriptionQueryBuilder {
    return new SubscriptionQueryBuilder(this, initialQuery);
  }
}
