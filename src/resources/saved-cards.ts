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
  /**
   * True only when the card holds a LIVE vaulted credential AND your merchant has a recorded
   * on-demand (MIT) fee consent for it — never plain credential liveness alone. The same card can
   * be `chargeable: true` at one merchant and `false` at another (server: `CardView.chargeable`,
   * `Api.Ledger.CardVault.on_demand_chargeable_ids/2`).
   *
   * This is a DISPLAY hint, not the enforcement, and it does **not** reflect your merchant's own
   * KYC/profile gates — `charge()` re-checks consent AND those gates at charge time. A card with
   * `chargeable: true` here can still get a 422 `merchant_not_verified` or
   * `merchant_incomplete_profile` from `charge()` (see `SavedCardChargeRefusedError`).
   */
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
  /**
   * Required, 8-200 bytes after trimming (narrower than the platform's general 8-255
   * idempotency-key rule — this endpoint's order-reference format caps it lower), and printable
   * ASCII only: no spaces, no control characters, no multi-byte UTF-8 (the server forwards it raw
   * into a downstream HTTP header and into plain-text log lines, so it restricts the charset for
   * the same reason). Validated client-side before any network call — mirrors
   * `Api.Services.Cards.ChargeRequest.idempotency_key/2` exactly, so an invalid key throws
   * immediately instead of round-tripping to a 422. Reuse the SAME key when retrying - a new key
   * is a new charge; the same key with a different charge is a 409.
   */
  idempotency_key: string;
  /** At most 255 characters. */
  description?: string;
}

export type SavedCardChargeStatus = 'queued' | 'processing' | 'succeeded' | 'declined' | 'under_review' | 'failed';

/**
 * Why a charge FAILED before/without reaching a normal terminal state (a card-network decline is
 * status `declined`, not one of these — `declined` never carries a `failure_reason`). Mirrors
 * commerce-api's `Api.Services.Cards.ChargeOutcome` `failure_reason()` (re-verified 2026-09-25
 * against `fecd2237`): the 9 merged atoms (`not_authorized` .. `processing_error`, including the
 * linked-subscription `subscription_*` trio and the merchant-gates `merchant_not_verified`
 * amendment), PLUS `fee_consent_missing` — all of them server-side as of Task 6 (`d302717c`).
 *
 * FORWARD COMPATIBLE (shared decision with the storefront SDK): the server documents this enum as
 * extensible and has already grown it 3 times (P3-P5), so an unrecognised value is typed as a
 * plain `string` here rather than rejected — `chargeStatus`/`waitForCharge` never throw just
 * because a new member showed up on an otherwise-valid, resolved outcome. `status` (the
 * money-safety field) stays a strict union below; only this DESCRIPTIVE field widens.
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
  | 'fee_consent_missing'
  // Forward-compat TS idiom: widens the union to accept any string while keeping literal-member
  // autocomplete, per the shared admin-sdk/storefront-sdk decision (KnownUnion | (string & {})).
  // eslint-disable-next-line @typescript-eslint/ban-types -- not "empty object" here; see above.
  | (string & {});

export interface SavedCardChargeOrder {
  id: number;
  /** The base amount you charged. */
  total: number;
  /** What the card was charged (base + customer-paid fees). */
  customer_total: number;
  fee_total: number;
  /**
   * Usually an ISO code, but typed nullable: the server's own `currency_code/1` can resolve to
   * `nil` for an order whose currency association wasn't preloaded the way it expects
   * (`charge_outcome.ex`'s moduledoc "Currency" section documents this as a real, if rare, gap
   * between its `@type order_summary` and what `currency_code/1` actually returns). A charge that
   * may have SUCCEEDED must never be thrown away over a missing display field — see
   * `SavedCardChargePendingError` and the `chargeStatus`/`waitForCharge` docs for why a thrown
   * error here would be actively dangerous (it would look identical to a transport failure).
   */
  currency: string | null;
  status: number;
}

/**
 * The 202 answer to `charge`: a new charge is `queued`, with only `status`/`job_id`/`status_url`
 * on the wire. A replayed key (same key, same payload) reports its current status and, on the
 * wire, also carries the stored charge's `reference`/`order`/`failure_reason` (the same fields
 * `chargeStatus` returns) — `charge` passes those through here when present rather than making a
 * caller who wants them do a second round-trip. They're absent (not `null`) on a fresh enqueue,
 * since nothing has been recorded yet to report.
 */
export interface SavedCardChargeAccepted {
  status: SavedCardChargeStatus;
  /** `null` when a replayed key's job is no longer retained. */
  job_id: number | null;
  /** Poll with `chargeStatus` / `waitForCharge`. */
  status_url: string;
  /** Present only on a replay: the stored charge's canonical reference. */
  reference?: string;
  /** Present only on a replay: `null` if the charge hasn't reached an order yet. */
  order?: SavedCardChargeOrder | null;
  /** Present only on a replay: `null` if the charge hasn't failed. */
  failure_reason?: SavedCardChargeFailureReason | null;
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

/**
 * Thrown by `charge` on a `409 request_in_progress`: an earlier request with the SAME idempotency
 * key is still being processed — a genuine in-flight race, distinct from the server's other 409
 * (`idempotency_key_reuse_with_different_payload`, a real payload conflict, which stays a plain
 * `InkressApiError`). A subclass of `InkressApiError` (so `instanceof InkressApiError` still
 * matches it) that lets a caller tell the two apart without string-matching
 * `error.result.result.reason` itself.
 *
 * Wait and poll `chargeStatus` / `waitForCharge` with the SAME key; never retry with a new one —
 * the in-flight request may still go on to complete the charge.
 */
export class SavedCardChargeInProgressError extends InkressApiError {
  constructor(result?: unknown) {
    super(
      'A charge with this idempotency key is still being processed — wait and poll with the SAME key (chargeStatus/waitForCharge); never retry with a new key.',
      409,
      result,
    );
    this.name = 'SavedCardChargeInProgressError';
  }
}

/**
 * Why `charge()` refused a request with a synchronous `422` (server: `CardController.charge_or_reuse/3`,
 * `MerchantGate.check/1`, `require_fee_consent/2`). Each reason needs a different caller action:
 *
 * | `reason` | Meaning | Action |
 * |---|---|---|
 * | `fee_consent_missing` | The card is live but YOUR merchant has no recorded on-demand fee consent for it. | The shopper must re-connect the card and accept the current fee disclosure. |
 * | `merchant_not_verified` | Your merchant isn't identity-verified. | Finish KYC. |
 * | `merchant_incomplete_profile` | Your merchant has processed before but is missing phone/logo. | Complete the merchant profile. |
 * | `merchant_not_found` | The authorized merchant no longer exists. | Not caller-fixable; contact support. |
 * | `unknown` | A validation error (bad `amount`/`description`/currency, a refused field) OR a refusal this SDK doesn't have a specific reason for yet. | `detail` still carries the server's exact message — inspect it, or fix the request if it looks like a validation error. |
 *
 * `reason` is derived from the server's message text (exact match for `fee_consent_missing` and
 * `merchant_not_found`, prefix match for the two `merchant_*` gates — their text continues with a
 * human-readable detail after a colon). Round 2 (final-review re-review, shared forward-compat
 * stance): anything that doesn't match one of those four is `unknown`, never silently mislabelled
 * `invalid_request` — a future merchant gate this SDK doesn't recognize yet is not the same thing
 * as a caller mistake, and `detail` keeps the exact text either way so nothing is lost. Mirrors
 * storefront-sdk's `CardConnectRefusalReason`, which has the same `'unknown'` catch-all. This is
 * never left for a caller to parse out of `error.message`: the HTTP layer always sets that to the
 * generic `"HTTP 422"`; the real text lives only at `error.result.result`, and `detail` on this
 * class is that same text already extracted.
 */
export type SavedCardChargeRefusalReason =
  | 'fee_consent_missing'
  | 'merchant_not_verified'
  | 'merchant_incomplete_profile'
  | 'merchant_not_found'
  | 'unknown';

export class SavedCardChargeRefusedError extends InkressApiError {
  readonly reason: SavedCardChargeRefusalReason;
  /** The server's exact message, e.g. `"merchant_not_verified: account must be identity-verified to process payments"`. */
  readonly detail: string;

  constructor(reason: SavedCardChargeRefusalReason, detail: string, result?: unknown) {
    super(detail, 422, result);
    this.name = 'SavedCardChargeRefusedError';
    this.reason = reason;
    this.detail = detail;
  }
}

/**
 * Thrown by `waitForCharge` when the attempt budget runs out while the charge is still
 * unresolved. Carries the LAST outcome actually observed (`undefined` only if every single poll
 * in the budget failed transiently — see the method doc) and the `idempotencyKey` being polled.
 *
 * The invariant for this money path: while a charge's outcome is unknown, NEVER call `charge()`
 * again with a NEW idempotency key — the original request may still go on to complete. Poll again
 * later with `chargeStatus`/`waitForCharge` using this SAME `idempotencyKey`, or contact support
 * to reconcile manually. A subclass of `InkressApiError` (so `instanceof InkressApiError` still
 * matches it, and `status` stays `0` — nothing final was decided) so callers who only check for
 * that keep working unchanged.
 */
export class SavedCardChargePendingError extends InkressApiError {
  readonly outcome: SavedCardChargeOutcome | undefined;
  readonly idempotencyKey: string;

  constructor(idempotencyKey: string, outcome: SavedCardChargeOutcome | undefined, attempts: number) {
    super(
      `Charge still ${outcome?.status ?? 'unknown'} after ${attempts} polls — poll again with the SAME idempotency key ("${idempotencyKey}"); never call charge() again with a new key while the outcome is unknown.`,
      0,
      outcome,
    );
    this.name = 'SavedCardChargePendingError';
    this.outcome = outcome;
    this.idempotencyKey = idempotencyKey;
  }
}

/**
 * Thrown by `remove()` when the SDK's OWN retry of the DELETE — issued only after the first
 * attempt's response was lost to a network/timeout error or a `5xx` — comes back `404`.
 * DISCONNECT deletes this merchant's connector row (`CardManagement.disconnect/2`), which is
 * exactly what every scoped list/get/delete query filters on, so a `404` on a RETRY of the SAME
 * delete means the first attempt already succeeded — not that the card was never connected here.
 *
 * There is no `active_subscriptions` count on this error: the response that would have carried it
 * is the one that got lost, and there is no way to re-query it once the connector is gone. Treat
 * this as a successful disconnect. A first attempt that gets `404` immediately (no prior transient
 * failure) is NOT wrapped — `remove()` still throws the plain `InkressApiError` `404` "Not Found"
 * for that, since that case is a genuine not-found (wrong id, or never connected), not a lost
 * response.
 */
export class SavedCardAlreadyRemovedError extends InkressApiError {
  readonly id: number;

  constructor(id: number, result?: unknown) {
    super(
      `Card ${id} was already disconnected from your merchant — an earlier request likely succeeded and its response was lost. No active_subscriptions count is available from this response.`,
      404,
      result,
    );
    this.name = 'SavedCardAlreadyRemovedError';
    this.id = id;
  }
}

interface SavedCardListResult {
  entries: SavedCard[];
  pagination: PageInfo;
}

// CHARGE_STATUSES is every status the wire can send (used to validate a charge/outcome body).
// RESOLVED_STATUSES is the narrower set waitForCharge stops on: 'under_review' is a STOP status
// (it resolves, never throws) alongside the three that always meant "done" - so it belongs here,
// not in a separate "terminal-only" set that nothing then reads. Both stay STRICT allow-lists:
// `status` is the money-safety field (shared decision with the storefront SDK) - an unrecognised
// status must never be treated as final; see isFailureReason below for the DESCRIPTIVE field,
// which takes the opposite (forward-compatible) stance on purpose.
const CHARGE_STATUSES: readonly SavedCardChargeStatus[] = ['queued', 'processing', 'succeeded', 'declined', 'under_review', 'failed'];
const RESOLVED_STATUSES: readonly SavedCardChargeStatus[] = ['succeeded', 'declined', 'failed', 'under_review'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChargeStatus(value: unknown): value is SavedCardChargeStatus {
  return typeof value === 'string' && (CHARGE_STATUSES as readonly string[]).includes(value);
}

function isJobId(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

// Forward-compatible (M-A2 / shared decision): failure_reason is DESCRIPTIVE, not the
// money-safety field, so any non-empty string is accepted here - typed as
// SavedCardChargeFailureReason's KnownUnion | (string & {}) above - so a server-side addition to
// the enum never makes chargeStatus/waitForCharge throw on an otherwise-valid, resolved outcome.
function isFailureReason(value: unknown): value is SavedCardChargeFailureReason {
  return typeof value === 'string' && value.length > 0;
}

function isChargeOrder(value: unknown): value is SavedCardChargeOrder {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.total === 'number' &&
    typeof value.customer_total === 'number' &&
    typeof value.fee_total === 'number' &&
    (value.currency === null || typeof value.currency === 'string') &&
    typeof value.status === 'number'
  );
}

// The 3 required keys are all a fresh enqueue ever sends. A same-key replay's superset body also
// carries reference/order/failure_reason (the same fields chargeStatus returns) - validated here,
// when present, so charge() can pass them through instead of silently dropping them.
function isChargeAccepted(value: unknown): value is SavedCardChargeAccepted {
  return (
    isRecord(value) &&
    isChargeStatus(value.status) &&
    isJobId(value.job_id) &&
    typeof value.status_url === 'string' &&
    (value.reference === undefined || typeof value.reference === 'string') &&
    (value.order === undefined || value.order === null || isChargeOrder(value.order)) &&
    (value.failure_reason === undefined || value.failure_reason === null || isFailureReason(value.failure_reason))
  );
}

function isChargeOutcome(value: unknown): value is SavedCardChargeOutcome {
  return (
    isRecord(value) &&
    isChargeStatus(value.status) &&
    isJobId(value.job_id) &&
    typeof value.reference === 'string' &&
    (value.order === null || isChargeOrder(value.order)) &&
    (value.failure_reason === null || isFailureReason(value.failure_reason))
  );
}

/**
 * The `reason` string from one of the server's 409-conflict bodies (`{state, result: {reason,
 * description, status}}` - both `ApiWeb.Idempotency` and `CardController`'s own idempotency check
 * send this exact shape), if `value` (an `InkressApiError.result`) looks like one. `undefined` for
 * anything else, including a 409 whose body doesn't match (treated as an ordinary conflict).
 */
function conflictReason(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.result)) return undefined;
  return typeof value.result.reason === 'string' ? value.result.reason : undefined;
}

/**
 * The plain-string `result` from a `charge()` 422 body (`{state, data: {result}, result}` -
 * `ApiWeb.CardController`'s `unprocessable/3`), if `value` (an `InkressApiError.result`) looks
 * like one. `undefined` for anything else, so a 422 with an unrecognised shape is left as a plain
 * `InkressApiError` instead of wrapped with a fabricated reason.
 */
function refusalMessage(value: unknown): string | undefined {
  return isRecord(value) && typeof value.result === 'string' ? value.result : undefined;
}

/**
 * Maps a `charge()` 422's message text to a `SavedCardChargeRefusalReason` - exact match for the
 * two reasons the server sends verbatim, prefix match for the two merchant-gate messages (each
 * continues with a human-readable detail after a colon - `Service.Order.Processor.validate_merchant_status/1`
 * and `validate_processing_allowed/1`). Round 2 (final-review re-review): everything else -
 * a `ChargeRequest` field-validation message included - is `'unknown'`, never silently mislabelled
 * `invalid_request`; `detail` on `SavedCardChargeRefusedError` keeps the exact text regardless, so
 * a caller who wants to recognise a validation message for themselves still can.
 */
function chargeRefusalReason(message: string): SavedCardChargeRefusalReason {
  if (message === 'fee_consent_missing') return 'fee_consent_missing';
  if (message.startsWith('merchant_not_verified')) return 'merchant_not_verified';
  if (message.startsWith('merchant_incomplete_profile')) return 'merchant_incomplete_profile';
  if (message === 'Merchant not found') return 'merchant_not_found';
  return 'unknown';
}

/**
 * A response the client never actually SAW from the server: a network/timeout failure (the
 * HttpClient wraps both as `InkressApiError` status `0`, including an unparseable/unexpected
 * body - `chargeStatus` also throws status `0` for that) or a `5xx`. Used to decide when it's
 * safe to assume "the earlier request may have landed anyway and just be slow to answer" - never
 * for a 4xx, which the server definitely and deliberately answered.
 */
function isTransientError(error: unknown): boolean {
  return error instanceof InkressApiError && (error.status === 0 || error.status >= 500);
}

const IDEMPOTENCY_KEY_MIN_BYTES = 8;
const IDEMPOTENCY_KEY_MAX_BYTES = 200;
// 0x21-0x7E: printable ASCII, no space, no control characters - matches
// Api.Services.Cards.ChargeRequest's own ascii_printable?/1 exactly.
const IDEMPOTENCY_KEY_PATTERN = /^[\x21-\x7e]+$/;

/**
 * Validates an idempotency key CLIENT-SIDE, before any network call — mirrors the server's own
 * rule (`Api.Services.Cards.ChargeRequest.idempotency_key/2`) exactly: 8-200 bytes after trimming,
 * printable ASCII only (no spaces, no control characters). Throws a plain `Error` (never
 * `InkressApiError` - nothing was sent) for a key the server would 422 on, and otherwise returns
 * the TRIMMED key, since the server treats the trimmed value as canonical (it's what ends up in
 * the stored reference and in every replay comparison) - `charge()` and `chargeStatus()` both use
 * the trimmed result so a caller who passes an untrimmed key still gets consistent behaviour.
 */
function validateIdempotencyKey(key: string): string {
  const trimmed = key.trim();
  const validLength = trimmed.length >= IDEMPOTENCY_KEY_MIN_BYTES && trimmed.length <= IDEMPOTENCY_KEY_MAX_BYTES;
  if (!validLength || !IDEMPOTENCY_KEY_PATTERN.test(trimmed)) {
    throw new Error(
      `idempotency_key must be a string of ${IDEMPOTENCY_KEY_MIN_BYTES} to ${IDEMPOTENCY_KEY_MAX_BYTES} printable-ASCII bytes after trimming (no spaces or control characters) — got ${trimmed.length} byte(s)`,
    );
  }
  return trimmed;
}

/** M-A7: `attempts <= 0` would otherwise report "still unknown after 0 polls" without ever polling. */
function validateWaitOptions(options: SavedCardWaitOptions): void {
  if (options.attempts !== undefined && options.attempts < 1) {
    throw new Error(`waitForCharge: attempts must be >= 1 (got ${options.attempts})`);
  }
  if (options.initialDelayMs !== undefined && options.initialDelayMs <= 0) {
    throw new Error(`waitForCharge: initialDelayMs must be > 0 (got ${options.initialDelayMs})`);
  }
  if (options.maxDelayMs !== undefined && options.maxDelayMs <= 0) {
    throw new Error(`waitForCharge: maxDelayMs must be > 0 (got ${options.maxDelayMs})`);
  }
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Saved cards connected to your merchant (Ink Pay, INK-438). Requires a merchant access token and
 * `username` (Client-Id); the caller must be a member of that merchant - D-18: for an `sk_` API
 * key this means the key's OWNER must hold a card-management role at the merchant, the same rule
 * P3 already applies to charging ("staff-minted keys can't charge").
 *
 * Roles (server `priv/rbac.yaml` `cards:`):
 *  - `list` / `get` (view): merchant_admin, merchant_moderator, organisation_admin,
 *    organisation_moderator, super_admin, super_moderator.
 *  - `remove` (delete) and `charge` / `chargeStatus`: merchant_admin, organisation_admin,
 *    super_admin only — **moderators are read-only here**: they can list/get, never remove or
 *    charge.
 *  - An OAuth app needs the `cards:charge` scope for `charge` / `chargeStatus`, and has NO
 *    list/get/remove scope at all — it gets 403 on those regardless of the role table above.
 *
 * `remove()` DISCONNECTS the card from your merchant only (it stays usable by other merchants the
 * customer connected it to) and, in the same transaction, REVOKES your merchant's on-demand fee
 * consent for it (Ruling R-P5-14) — a later re-connection cannot resume on-demand charging until
 * the shopper accepts the fee disclosure again.
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

  /**
   * Disconnect the card from your merchant. It stays usable by other merchants the customer
   * connected it to, and this also revokes your merchant's on-demand fee consent for it (see the
   * class doc) — a re-linked card can't be charged again until the shopper re-accepts the
   * disclosure.
   *
   * A retried DELETE (this SDK's OWN retry, attempted only after the first attempt's response was
   * lost to a network/timeout error or a `5xx`) that then comes back `404` throws
   * `SavedCardAlreadyRemovedError` instead of a plain not-found — DISCONNECT already dropped the
   * card out of every scoped query, so a `404` on a retry of the SAME delete means the first
   * attempt succeeded. A single, first-attempt `404` (no prior transient failure) is unaffected —
   * it still throws the plain `InkressApiError` `404` "Not Found" it always did.
   */
  async remove(id: number): Promise<ApiResponse<SavedCardRemovalResult>> {
    try {
      return await this.client.delete<SavedCardRemovalResult>(`/cards/${id}`);
    } catch (error) {
      if (!isTransientError(error)) throw error;
      try {
        return await this.client.delete<SavedCardRemovalResult>(`/cards/${id}`);
      } catch (retryError) {
        if (retryError instanceof InkressApiError && retryError.status === 404) {
          throw new SavedCardAlreadyRemovedError(id, retryError.result);
        }
        throw retryError;
      }
    }
  }

  /**
   * Queue an on-demand merchant-initiated charge (INK-436). The endpoint answers 202 with a FLAT
   * body `{status, job_id, status_url}` (not the usual envelope), validated here before it is
   * returned. Retrying with the same `idempotency_key` and the same charge details never charges
   * twice: it reports the existing charge's current status instead of enqueuing a new one - and,
   * when the server includes them (a same-key-same-payload replay), `reference`/`order`/
   * `failure_reason` are passed through too (see `SavedCardChargeAccepted`), so a caller doesn't
   * need a second `chargeStatus` round-trip just to see them. That replay can already report
   * `under_review` on THIS response, not just from later polling — the same "never retry with a
   * new key" rule applies to it here too.
   *
   * `idempotency_key` is validated client-side first (8-200 printable-ASCII bytes after trimming —
   * see `SavedCardChargeData.idempotency_key`); an invalid key throws immediately, before any
   * network call.
   *
   * Rejections propagate as `InkressApiError` (never swallowed) — notably:
   *  - `422` `SavedCardChargeRefusedError`, one of `fee_consent_missing` (the card is live but
   *    your merchant has no recorded fee consent for it — the shopper must re-connect and accept
   *    the disclosure), `merchant_not_verified` (finish KYC), `merchant_incomplete_profile`
   *    (complete the merchant profile), `merchant_not_found`, or `unknown` (a validation error —
   *    bad `amount`/`description`/currency, a refused `customer`/`subscription_id` field, or a
   *    refusal this SDK doesn't have a specific reason for yet; `error.detail` always has the
   *    server's exact message either way). The reason is read from the server
   *    body (`error.result.result`), never from `error.message`, which the HTTP layer always sets
   *    to the generic `"HTTP 422"`;
   *  - `409` `idempotency_key_reuse_with_different_payload` when the same key was already used for a
   *    charge with a different account, amount, currency or description - a real conflict; only
   *    retry with a NEW idempotency key after confirming the original charge's actual outcome;
   *  - `409` `request_in_progress` - a genuine race: an earlier request with the SAME key is still
   *    being processed. Thrown as `SavedCardChargeInProgressError` (a subclass of `InkressApiError`)
   *    so callers can tell the two 409s apart without string-matching `error.result.result.reason`
   *    themselves. Wait and poll with `chargeStatus` / `waitForCharge` using the SAME key; never
   *    retry with a new one - the in-flight request may still complete the charge.
   */
  async charge(id: number, data: SavedCardChargeData): Promise<ApiResponse<SavedCardChargeAccepted>> {
    const idempotency_key = validateIdempotencyKey(data.idempotency_key);
    let raw: unknown;
    try {
      raw = await this.client.post<unknown>(`/cards/${id}/charge`, { ...data, idempotency_key });
    } catch (error) {
      if (error instanceof InkressApiError && error.status === 409 && conflictReason(error.result) === 'request_in_progress') {
        throw new SavedCardChargeInProgressError(error.result);
      }
      if (error instanceof InkressApiError && error.status === 422) {
        const message = refusalMessage(error.result);
        if (message !== undefined) {
          throw new SavedCardChargeRefusedError(chargeRefusalReason(message), message, error.result);
        }
      }
      throw error;
    }
    if (!isChargeAccepted(raw)) {
      throw new InkressApiError('Unexpected response from the saved-card charge endpoint', 0, raw);
    }
    const result: SavedCardChargeAccepted = {
      status: raw.status,
      job_id: raw.job_id,
      status_url: raw.status_url,
      ...(raw.reference !== undefined ? { reference: raw.reference } : {}),
      ...(raw.order !== undefined ? { order: raw.order } : {}),
      ...(raw.failure_reason !== undefined ? { failure_reason: raw.failure_reason } : {}),
    };
    return { state: 'ok', result };
  }

  /**
   * The current outcome of the charge made with `idempotencyKey` on this card. `404` ->
   * `InkressApiError` (nothing recorded for this key/account, or it belongs to another merchant -
   * the server never distinguishes those on the wire, so this SDK doesn't either). Validates
   * `idempotencyKey` client-side first, exactly like `charge()` does.
   */
  async chargeStatus(id: number, idempotencyKey: string): Promise<ApiResponse<SavedCardChargeOutcome>> {
    const key = validateIdempotencyKey(idempotencyKey);
    const response = await this.client.get<unknown>(`/cards/${id}/charges/${encodeURIComponent(key)}`);
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
   * A poll that fails TRANSIENTLY — a network/timeout error, a `5xx`, or a response body this SDK
   * can't parse (all three surface from `chargeStatus` as `InkressApiError` with `status 0` for
   * the network/timeout/unparseable cases, or the server's own `5xx`) — is never treated as the
   * wait's outcome: it's counted as a missed poll and retried within the budget, exactly like a
   * still-`queued`/`processing` result. A caller cannot otherwise tell "still pending" apart from
   * "network blip" by `status`/`instanceof` alone, and the correct action is the SAME either way:
   * keep polling with the SAME idempotency key. Any OTHER error (404 not found, 422 bad key, 403)
   * is a real, non-transient refusal and is thrown immediately, not retried.
   *
   * Default budget is >= 60s (12 polls, 500ms initial delay doubling up to an 8s cap - 63.5s total:
   * 500+1000+2000+4000+7×8000ms): a fresh decline is Oban-retryable server-side and can take ~40s+
   * to become `declined`. Throws `SavedCardChargePendingError` (carrying the last outcome actually
   * seen, if any, and the `idempotencyKey`) when the budget runs out while the charge is still
   * unresolved — the message says to poll again with the SAME idempotency key, never a new one.
   */
  async waitForCharge(id: number, idempotencyKey: string, options: SavedCardWaitOptions = {}): Promise<SavedCardChargeOutcome> {
    validateWaitOptions(options);
    const key = validateIdempotencyKey(idempotencyKey);
    const attempts = options.attempts ?? 12;
    const maxDelay = options.maxDelayMs ?? 8000;
    const sleep = options.sleep ?? defaultSleep;
    let delay = options.initialDelayMs ?? 500;
    let last: SavedCardChargeOutcome | undefined;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const { result } = await this.chargeStatus(id, key);
        last = result;
        if (result && (RESOLVED_STATUSES as readonly string[]).includes(result.status)) return result;
      } catch (error) {
        if (!isTransientError(error)) throw error;
        // Missed poll (network/timeout, 5xx, or an unparseable body) - never abort the wait for
        // it; keep the last known outcome and try again within the budget (see the method doc).
      }
      if (attempt < attempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }

    throw new SavedCardChargePendingError(key, last, attempts);
  }
}
