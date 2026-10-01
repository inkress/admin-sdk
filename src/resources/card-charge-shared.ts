/**
 * Internal (not re-exported from index): wire validators and polling helpers shared by every
 * card-on-file charge status endpoint — saved-card charges (`SavedCardsResource`) and linked
 * subscription charges (`SubscriptionsResource`, INK-690). Both endpoints answer with the same
 * commerce-api `ChargeOutcome` read model.
 */
import { InkressApiError } from '../client';
import type {
  SavedCardChargeFailureReason,
  SavedCardChargeOrder,
  SavedCardChargeOutcome,
  SavedCardChargeStatus,
  SavedCardWaitOptions,
} from './saved-cards';

// CHARGE_STATUSES is every status the wire can send (used to validate a charge/outcome body).
// RESOLVED_STATUSES is the narrower set waitForCharge stops on: 'under_review' is a STOP status
// (it resolves, never throws) alongside the three that always meant "done" - so it belongs here,
// not in a separate "terminal-only" set that nothing then reads. Both stay STRICT allow-lists:
// `status` is the money-safety field (shared decision with the storefront SDK) - an unrecognised
// status must never be treated as final; see isFailureReason below for the DESCRIPTIVE field,
// which takes the opposite (forward-compatible) stance on purpose.
export const CHARGE_STATUSES: readonly SavedCardChargeStatus[] = ['queued', 'processing', 'succeeded', 'declined', 'under_review', 'failed'];
export const RESOLVED_STATUSES: readonly SavedCardChargeStatus[] = ['succeeded', 'declined', 'failed', 'under_review'];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isChargeStatus(value: unknown): value is SavedCardChargeStatus {
  return typeof value === 'string' && (CHARGE_STATUSES as readonly string[]).includes(value);
}

export function isJobId(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

// Forward-compatible (M-A2 / shared decision): failure_reason is DESCRIPTIVE, not the
// money-safety field, so any non-empty string is accepted here - typed as
// SavedCardChargeFailureReason's KnownUnion | (string & {}) above - so a server-side addition to
// the enum never makes chargeStatus/waitForCharge throw on an otherwise-valid, resolved outcome.
export function isFailureReason(value: unknown): value is SavedCardChargeFailureReason {
  return typeof value === 'string' && value.length > 0;
}

export function isChargeOrder(value: unknown): value is SavedCardChargeOrder {
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

export function isChargeOutcome(value: unknown): value is SavedCardChargeOutcome {
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
 * A response the client never actually SAW from the server: a network/timeout failure (the
 * HttpClient wraps both as `InkressApiError` status `0`, including an unparseable/unexpected
 * body - `chargeStatus` also throws status `0` for that) or a `5xx`. Used to decide when it's
 * safe to assume "the earlier request may have landed anyway and just be slow to answer" - never
 * for a 4xx, which the server definitely and deliberately answered.
 */
export function isTransientError(error: unknown): boolean {
  return error instanceof InkressApiError && (error.status === 0 || error.status >= 500);
}

export const IDEMPOTENCY_KEY_MIN_BYTES = 8;
export const IDEMPOTENCY_KEY_MAX_BYTES = 200;
// 0x21-0x7E: printable ASCII, no space, no control characters - matches
// Api.Services.Cards.ChargeRequest's own ascii_printable?/1 exactly.
export const IDEMPOTENCY_KEY_PATTERN = /^[\x21-\x7e]+$/;

/**
 * Validates an idempotency key CLIENT-SIDE, before any network call — mirrors the server's own
 * rule (`Api.Services.Cards.ChargeRequest.idempotency_key/2`) exactly: 8-200 bytes after trimming,
 * printable ASCII only (no spaces, no control characters). Throws a plain `Error` (never
 * `InkressApiError` - nothing was sent) for a key the server would 422 on, and otherwise returns
 * the TRIMMED key, since the server treats the trimmed value as canonical (it's what ends up in
 * the stored reference and in every replay comparison) - `charge()` and `chargeStatus()` both use
 * the trimmed result so a caller who passes an untrimmed key still gets consistent behaviour.
 */
export function validateIdempotencyKey(key: string): string {
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
export function validateWaitOptions(options: SavedCardWaitOptions): void {
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

export const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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
