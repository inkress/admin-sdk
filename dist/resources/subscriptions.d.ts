import { HttpClient } from '../client';
import { type SavedCardChargeOutcome, type SavedCardChargeStatus, type SavedCardWaitOptions } from './saved-cards';
import { Subscription, SubscriptionPeriod, CreateSubscriptionData, SubscriptionUsageData, SubscriptionUsageResponse, SubscriptionCancelResponse, ApiResponse, PaginationParams } from '../types';
import { SubscriptionQueryBuilder } from '../utils/query-builders';
import { SubscriptionFilterParams, SubscriptionQueryParams, SubscriptionListResponse } from '../types/resources';
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
    /**
     * Optional first billing period (INK-781). ISO 8601 date or date-time. The subscription starts on
     * `start_date` (default: today) and its first period ends on `end_date` (default: a month later,
     * at most a month); from there it renews every calendar month on `end_date`'s day.
     */
    start_date?: string;
    end_date?: string;
    /** Charge the plan price for the share of a month the first period covers, instead of in full. */
    prorate?: boolean;
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
export declare function isSubscriptionChargeQueued(value: ChargeSubscriptionResponse): value is SubscriptionChargeQueued;
/** `GET /billing_subscriptions/:uid/charges/:reference` — the same read model as saved-card charges. */
export interface SubscriptionChargeOutcome extends SavedCardChargeOutcome {
    subscription_uid: string;
}
/** INK-694: plan-change types (`POST/DELETE /billing_subscriptions/:uid/plan-change`). */
export type PlanChangeOutcome = 'created' | 'unchanged' | 'replaced';
export type PlanChangeResolution = 'applied' | 'cancelled' | 'rejected';
export type PlanChangeErrorCode = 'not_found' | 'subscription_not_active' | 'subscription_cancelled' | 'trial_active' | 'dunning_in_progress' | 'renewal_in_progress' | 'already_on_plan' | 'target_plan_not_found' | 'target_plan_inactive' | 'currency_mismatch' | 'charge_mode_mismatch' | 'billing_model_mismatch' | 'no_pending_plan_change';
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
    requested_by: {
        kind: 'user' | 'oauth_app' | 'staff';
        id: number | string | null;
    };
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
    /** Omit to change at period end; `'now'` for an immediate, pro-rated upgrade (INK-804). */
    effective?: 'now';
}
/** Extra refusal codes of an immediate upgrade (`effective: 'now'`), on top of `PlanChangeErrorCode`. */
export type ImmediateUpgradeErrorCode = 'card_on_file_required' | 'billing_cycle_mismatch' | 'arrears_plan' | 'not_an_upgrade' | 'plan_change_pending' | 'upgrade_in_progress' | 'too_close_to_renewal' | 'period_unknown';
/**
 * `202` answer of an immediate upgrade: the pro-rated charge is queued; poll `reference` with
 * `chargeStatus` / `waitForCharge`. The plan switches only once that charge is paid.
 */
export interface ImmediateUpgradeResponse {
    subscription_uid: string;
    outcome: 'charging';
    /** Decimal string, e.g. "26.67". */
    amount: string;
    currency: string | null;
    reference: string;
    pending_upgrade: Record<string, unknown>;
}
/** Answer of `setGrace`. */
export interface SubscriptionGraceResponse {
    subscription_uid: string;
    /** The subscription's override, or null when the plan's applies. */
    grace_days: number | null;
    /** The grace days now in effect (the override, else the plan's). */
    effective_grace_days: number;
}
export type SubscriptionGraceErrorCode = 'not_found' | 'invalid_grace_days';
export interface PauseSubscriptionData {
    /** ISO 8601 date-time in the future, at most 365 days ahead; Inkress resumes then. */
    resume_at?: string;
}
/** Answer of `pause` and `resume`. */
export interface SubscriptionPauseResponse {
    subscription_uid: string;
    status: 'paused' | 'active';
    paused_at: string | null;
    resume_at: string | null;
    current_period_end: string | null;
    /** Resume only: the period ended while paused, its end moved to now and the renewal was queued. */
    renewal_due: boolean;
}
export type SubscriptionPauseErrorCode = 'not_found' | 'subscription_cancelled' | 'dunning_in_progress' | 'subscription_not_active' | 'trial_active' | 'renewal_in_progress' | 'already_paused' | 'not_paused' | 'invalid_resume_at';
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
/** When a plan owner's cancel takes effect (INK-1306). */
export type OwnerCancelTiming = 'now' | 'period_end';
export interface OwnerCancelSubscriptionData {
    /** Defaults to `now`. */
    at?: OwnerCancelTiming;
}
export interface OwnerCancelSubscriptionResponse {
    subscription_uid: string;
    /** `cancelled` now, or `canceling` until the period ends. */
    status: 'cancelled' | 'canceling';
    canceled_at: string | null;
    ends_at: string | null;
}
export type OwnerCancelErrorCode = 'not_found' | 'already_cancelled' | 'invalid_timing' | 'cancel_failed';
export declare class SubscriptionsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal subscription data (integers) to user-facing data (strings)
     */
    private translateToUserFacing;
    /**
     * Convert internal billing plan data to user-facing billing plan
     */
    private translateBillingPlanToUserFacing;
    /**
     * Convert filter parameters (strings to integers where needed)
     * @deprecated This method is no longer needed as processQuery handles translation
     */
    private translateFilters;
    /**
     * Translate subscription data for API (contextual strings to integers)
     */
    private translateToInternal;
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: SubscriptionFilterParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Gets a billing subscription by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id?: number): Promise<ApiResponse<Subscription>>;
    /**
     * Create a new subscription
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>>;
    /**
     * Delete a subscription
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Create a subscription payment link
     * Requires Client-Id header to be set in the configuration
     */
    createLink(data: CreateSubscriptionLinkData): Promise<ApiResponse<CreateSubscriptionLinkResponse>>;
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
    createCardUpdateLink(uid: string, data?: CreateCardUpdateLinkData): Promise<ApiResponse<CardUpdateLinkResponse>>;
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
    charge(uid: string, data: ChargeSubscriptionData): Promise<ApiResponse<ChargeSubscriptionResponse>>;
    /**
     * Current outcome of a linked subscription's charge, by the `reference` from `charge` or by
     * your own `reference_id`. 404 (`InkressApiError`) when no such charge exists on this
     * subscription — including any charge on an unlinked subscription.
     */
    chargeStatus(uid: string, reference: string): Promise<ApiResponse<SubscriptionChargeOutcome>>;
    /**
     * Poll `chargeStatus` until the charge resolves (`succeeded`, `declined`, `failed` or
     * `under_review`), same budget and semantics as `savedCards.waitForCharge`. Transient misses
     * (network, 5xx, unparseable body) are retried; any 4xx is thrown. Throws
     * `SavedCardChargePendingError` (carrying the last outcome seen) when the budget runs out —
     * never retry the charge with a NEW reference then; poll again with the same one.
     */
    waitForCharge(uid: string, reference: string, options?: SavedCardWaitOptions): Promise<SubscriptionChargeOutcome>;
    /**
     * Record usage for a usage-based subscription (INK-781, INK-803). `mode` decides how `metric_count`
     * (default 1) combines with the metric's total for the current billing period: `increment` (default)
     * adds it, `set` replaces it, `max` keeps the higher value. Returns the new total.
     * Usage settings are set on the plan's `data` and copied to each subscription.
     * At renewal Inkress bills each metric in the subscription's `data.usage_metrics`
     * (`{ metric, rate, allotment? }`): units above `allotment` times `rate`, added to the plan price
     * when `data.apply_usage_charge_to_flat_rate` is true.
     * Requires Client-Id header to be set in the configuration
     */
    usage(uid: string, data: SubscriptionUsageData): Promise<ApiResponse<SubscriptionUsageResponse>>;
    /**
     * Get subscription billing periods
     * Requires Client-Id header to be set in the configuration
     */
    getPeriods(uid: string, params?: SubscriptionPeriodsParams): Promise<ApiResponse<SubscriptionPeriodsResponse>>;
    /**
     * Move a subscription to another plan of the same merchant at the end of its current period
     * (no proration). The card on file stays linked. Idempotent per target plan. Refusals are
     * `InkressApiError`s whose `result.result.code` is a `PlanChangeErrorCode` (404/409/422).
     * Needs a credential bound to the plan-owning merchant (merchant_admin / organisation_admin).
     */
    changePlan(uid: string, data: ChangeSubscriptionPlanData & {
        effective: 'now';
    }): Promise<ApiResponse<ImmediateUpgradeResponse>>;
    changePlan(uid: string, data: ChangeSubscriptionPlanData): Promise<ApiResponse<ChangeSubscriptionPlanResponse>>;
    /**
     * Upgrade to a more expensive plan now (INK-804): charges the pro-rated difference to the linked
     * card and answers with the charge reference. The plan switches once that charge is paid; poll with
     * `waitForCharge(uid, reference)`. Refusals carry a `PlanChangeErrorCode` or `ImmediateUpgradeErrorCode`.
     */
    upgradeNow(uid: string, planUid: string): Promise<ApiResponse<ImmediateUpgradeResponse>>;
    /**
     * Set how many days this subscription keeps access after its unpaid period end once renewal
     * retries are exhausted (0–90), or `null` to use the plan's `grace_days` (INK-801).
     */
    setGrace(uid: string, graceDays: number | null): Promise<ApiResponse<SubscriptionGraceResponse>>;
    /**
     * Pause collection (INK-802): the subscription is not charged until resumed, automatically at
     * `resume_at` when given. Refusals carry a `SubscriptionPauseErrorCode`.
     */
    pause(uid: string, data?: PauseSubscriptionData): Promise<ApiResponse<SubscriptionPauseResponse>>;
    /** Resume a paused subscription (INK-802). */
    resume(uid: string): Promise<ApiResponse<SubscriptionPauseResponse>>;
    /** Cancel a pending plan change (404 `no_pending_plan_change` when none is pending). */
    cancelPlanChange(uid: string): Promise<ApiResponse<CancelSubscriptionPlanChangeResponse>>;
    /**
     * Cancel a subscription
     * Requires Client-Id header to be set in the configuration
     */
    cancel(uid: number, code: string): Promise<ApiResponse<SubscriptionCancelResponse>>;
    /**
     * Cancel a subscription as the plan owner (INK-1306), now or at the end of its period. `now`
     * emails the subscriber and sends `subscription.cancelled`. Needs a credential bound to the
     * plan-owning merchant (merchant_admin / organisation_admin); bot keys are refused. Refusals carry
     * an `OwnerCancelErrorCode`. For the subscriber's own cancel link, use `cancel(uid, code)`.
     */
    cancelAsOwner(uid: string, data?: OwnerCancelSubscriptionData): Promise<ApiResponse<OwnerCancelSubscriptionResponse>>;
    /**
     * Query subscriptions with enhanced query support
     * @example
     * await subscriptions.query({ status: 'active', billing_plan_id: 123 })
     */
    query(params?: SubscriptionQueryParams): Promise<ApiResponse<SubscriptionListResponse>>;
    /**
     * Create a query builder for subscriptions
     * @example
     * await sdk.subscriptions.createQueryBuilder().whereStatus('active').execute()
     */
    createQueryBuilder(initialQuery?: SubscriptionQueryParams): SubscriptionQueryBuilder;
}
//# sourceMappingURL=subscriptions.d.ts.map