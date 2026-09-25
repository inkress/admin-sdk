import { HttpClient, InkressApiError } from '../client';
import type { ApiResponse } from '../types';
import type { PageInfo } from '../types/resources';

/**
 * A card a customer saved with your merchant (Ink Pay). Display metadata only — the vaulted
 * credential never leaves the Inkress API.
 */
export interface SavedCard {
  id: number;
  brand: string | null;
  last_4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  /** e.g. "Visa ****4242" */
  display: string;
  active: boolean;
  /** True when the card holds a live vaulted credential and can be charged on demand. */
  chargeable: boolean;
  /** The cardholder's user id. */
  owner_id: number | null;
  inserted_at: string;
}

export interface SavedCardListParams {
  page?: number;
  /** Max 100. */
  page_size?: number;
}

export interface SavedCardListResponse {
  entries: SavedCard[];
  page_info: PageInfo;
}

/** `disconnected` for a merchant caller: the card is removed from YOUR merchant only. */
export type SavedCardRemovalAction = 'removed' | 'disconnected';

export interface SavedCardRemovalResult {
  id: number;
  action: SavedCardRemovalAction;
  /**
   * Your non-cancelled subscriptions still pointing at this card. After a disconnect their renewals
   * charge nothing and go through dunning (`card_not_authorized`) until the customer updates the card.
   */
  active_subscriptions: number;
}

export interface SavedCardChargeData {
  /** The base amount (>= 0.01, at most 2 decimals). With a customer-pays fee structure the card is charged amount + fees. */
  amount: number;
  currency: string;
  /** Required, 8-255 bytes. Reuse the SAME key when retrying - a new key is a new charge; the same key with a different charge is a 409. */
  idempotency_key: string;
  /** At most 255 characters. */
  description?: string;
}

export type SavedCardChargeStatus = 'queued' | 'processing' | 'succeeded' | 'declined' | 'under_review' | 'failed';

/**
 * Why a charge FAILED before/without reaching a normal terminal state (a card-network decline is
 * status `declined`, not one of these). Mirrors commerce-api's `Api.Services.Cards.ChargeOutcome`
 * `failure_reason()` on `origin/main` (re-verified 2026-09-25 — see `t14-contract.md`): the 9
 * merged atoms (`not_authorized` .. `processing_error`, including P4's linked-subscription
 * `subscription_*` trio and the merchant-gates `merchant_not_verified` amendment), PLUS
 * `fee_consent_missing`, decided ahead of the server — Task 6 adds it there.
 */
export type SavedCardChargeFailureReason =
  | 'not_authorized'
  | 'invalid_request'
  | 'card_unavailable'
  | 'reconciliation_required'
  | 'subscription_not_found'
  | 'subscription_mismatch'
  | 'subscription_not_active'
  | 'merchant_not_verified'
  | 'processing_error'
  | 'fee_consent_missing';

export interface SavedCardChargeOrder {
  id: number;
  /** The base amount you charged. */
  total: number;
  /** What the card was charged (base + customer-paid fees). */
  customer_total: number;
  fee_total: number;
  currency: string;
  status: number;
}

/** The 202 answer to `charge`: a new charge is `queued`; a replayed key reports its current status. */
export interface SavedCardChargeAccepted {
  status: SavedCardChargeStatus;
  /** `null` when a replayed key's job is no longer retained. */
  job_id: number | null;
  /** Poll with `chargeStatus` / `waitForCharge`. */
  status_url: string;
}

export interface SavedCardChargeOutcome {
  status: SavedCardChargeStatus;
  job_id: number | null;
  reference: string;
  order: SavedCardChargeOrder | null;
  failure_reason: SavedCardChargeFailureReason | null;
}

export interface SavedCardWaitOptions {
  /** Polls before giving up (default 12 - >= 60s total budget: a fresh decline is Oban-retryable and can take ~40s+). */
  attempts?: number;
  /** First delay; doubles each poll (default 500 ms). */
  initialDelayMs?: number;
  /** Delay cap (default 8000 ms). */
  maxDelayMs?: number;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

interface SavedCardListResult {
  entries: SavedCard[];
  pagination: PageInfo;
}

// CHARGE_STATUSES is every status the wire can send (used to validate a charge/outcome body).
// RESOLVED_STATUSES is the narrower set waitForCharge stops on: 'under_review' is a STOP status
// (it resolves, never throws) alongside the three that always meant "done" - so it belongs here,
// not in a separate "terminal-only" set that nothing then reads.
const CHARGE_STATUSES: readonly SavedCardChargeStatus[] = ['queued', 'processing', 'succeeded', 'declined', 'under_review', 'failed'];
const RESOLVED_STATUSES: readonly SavedCardChargeStatus[] = ['succeeded', 'declined', 'failed', 'under_review'];
const FAILURE_REASONS: readonly SavedCardChargeFailureReason[] = [
  'not_authorized',
  'invalid_request',
  'card_unavailable',
  'reconciliation_required',
  'subscription_not_found',
  'subscription_mismatch',
  'subscription_not_active',
  'merchant_not_verified',
  'processing_error',
  'fee_consent_missing',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChargeStatus(value: unknown): value is SavedCardChargeStatus {
  return typeof value === 'string' && (CHARGE_STATUSES as readonly string[]).includes(value);
}

function isJobId(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isChargeAccepted(value: unknown): value is SavedCardChargeAccepted {
  return isRecord(value) && isChargeStatus(value.status) && isJobId(value.job_id) && typeof value.status_url === 'string';
}

function isChargeOrder(value: unknown): value is SavedCardChargeOrder {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.total === 'number' &&
    typeof value.customer_total === 'number' &&
    typeof value.fee_total === 'number' &&
    typeof value.currency === 'string' &&
    typeof value.status === 'number'
  );
}

function isChargeOutcome(value: unknown): value is SavedCardChargeOutcome {
  return (
    isRecord(value) &&
    isChargeStatus(value.status) &&
    isJobId(value.job_id) &&
    typeof value.reference === 'string' &&
    (value.order === null || isChargeOrder(value.order)) &&
    (value.failure_reason === null ||
      (typeof value.failure_reason === 'string' && (FAILURE_REASONS as readonly string[]).includes(value.failure_reason)))
  );
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Saved cards connected to your merchant (Ink Pay, INK-438). Requires a merchant access token and
 * `username` (Client-Id); the caller must be a member of that merchant - D-18: for an `sk_` API
 * key this means the key's OWNER must hold a card-management role at the merchant, the same rule
 * P3 already applies to charging ("staff-minted keys can't charge"). A merchant-scoped key minted
 * by staff with no real membership there gets a 403, not the list/charge it might expect.
 */
export class SavedCardsResource {
  constructor(private client: HttpClient) {}

  async list(params?: SavedCardListParams): Promise<ApiResponse<SavedCardListResponse>> {
    const response = await this.client.get<SavedCardListResult>('/cards', params ? { ...params } : undefined);
    if (!response.result) return { state: response.state };
    return { state: response.state, result: { entries: response.result.entries, page_info: response.result.pagination } };
  }

  async get(id: number): Promise<ApiResponse<SavedCard>> {
    return this.client.get<SavedCard>(`/cards/${id}`);
  }

  /** Disconnect the card from your merchant. It stays usable by other merchants the customer connected it to. */
  async remove(id: number): Promise<ApiResponse<SavedCardRemovalResult>> {
    return this.client.delete<SavedCardRemovalResult>(`/cards/${id}`);
  }

  /**
   * Queue an on-demand merchant-initiated charge (INK-436). The endpoint answers 202 with a FLAT
   * body `{status, job_id, status_url}` (not the usual envelope), validated here before it is
   * returned. Retrying with the same `idempotency_key` and the same charge details never charges
   * twice: it reports the existing charge's current status instead of enqueuing a new one.
   *
   * Rejections propagate as `InkressApiError` (never swallowed) — notably:
   *  - `422` with a message starting `merchant_not_verified: ...` or `merchant_incomplete_profile: ...`
   *    (the merchant KYC/profile gate), or a validation error (bad `amount`/`description`/currency,
   *    or a refused `customer`/`subscription_id` field);
   *  - `409` `idempotency_key_reuse_with_different_payload` when the same key was already used for a
   *    charge with a different account, amount, currency or description.
   */
  async charge(id: number, data: SavedCardChargeData): Promise<ApiResponse<SavedCardChargeAccepted>> {
    const raw: unknown = await this.client.post<unknown>(`/cards/${id}/charge`, { ...data });
    if (!isChargeAccepted(raw)) {
      throw new InkressApiError('Unexpected response from the saved-card charge endpoint', 0, raw);
    }
    return { state: 'ok', result: { status: raw.status, job_id: raw.job_id, status_url: raw.status_url } };
  }

  /** The current outcome of the charge made with `idempotencyKey` on this card. 404 -> `InkressApiError`. */
  async chargeStatus(id: number, idempotencyKey: string): Promise<ApiResponse<SavedCardChargeOutcome>> {
    const response = await this.client.get<unknown>(`/cards/${id}/charges/${encodeURIComponent(idempotencyKey)}`);
    const body: unknown = (response as { result?: unknown }).result;
    if (!isChargeOutcome(body)) {
      throw new InkressApiError('Unexpected response from the saved-card charge status endpoint', 0, response);
    }
    return { state: 'ok', result: body };
  }

  /**
   * Poll `chargeStatus` with doubling backoff until the charge reaches a resolved state:
   * `succeeded`, `declined`, `failed` or `under_review`.
   *
   * `under_review` RESOLVES rather than throwing — the worker cancelled the job because, past the
   * processor's idempotency window, it found no clean-decline evidence, so money MAY be held. Do
   * NOT retry with a new idempotency key in that case (a second authorize risks a second capture);
   * poll the SAME key again later or contact support to reconcile manually.
   *
   * Default budget is >= 60s (12 polls, 500ms initial delay doubling up to an 8s cap): a fresh
   * decline is Oban-retryable server-side and can take ~40s+ to become `declined`. Throws
   * `InkressApiError` (carrying the last outcome as `result`) when the budget runs out while the
   * charge is still `queued`/`processing` — the message says to poll again with the SAME
   * idempotency key, never a new one.
   */
  async waitForCharge(id: number, idempotencyKey: string, options: SavedCardWaitOptions = {}): Promise<SavedCardChargeOutcome> {
    const attempts = options.attempts ?? 12;
    const maxDelay = options.maxDelayMs ?? 8000;
    const sleep = options.sleep ?? defaultSleep;
    let delay = options.initialDelayMs ?? 500;
    let last: SavedCardChargeOutcome | undefined;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const { result } = await this.chargeStatus(id, idempotencyKey);
      last = result;
      if (result && (RESOLVED_STATUSES as readonly string[]).includes(result.status)) return result;
      if (attempt < attempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }

    throw new InkressApiError(
      `Charge still ${last?.status ?? 'unknown'} after ${attempts} polls — poll again with the SAME idempotency key; never retry with a new key`,
      0,
      last,
    );
  }
}
