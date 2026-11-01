import type { SavedCardChargeFailureReason, SavedCardChargeOrder, SavedCardChargeOutcome, SavedCardChargeStatus, SavedCardWaitOptions } from './saved-cards';
export declare const CHARGE_STATUSES: readonly SavedCardChargeStatus[];
export declare const RESOLVED_STATUSES: readonly SavedCardChargeStatus[];
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isChargeStatus(value: unknown): value is SavedCardChargeStatus;
export declare function isJobId(value: unknown): value is number | null;
export declare function isFailureReason(value: unknown): value is SavedCardChargeFailureReason;
export declare function isChargeOrder(value: unknown): value is SavedCardChargeOrder;
export declare function isChargeOutcome(value: unknown): value is SavedCardChargeOutcome;
/**
 * A response the client never actually SAW from the server: a network/timeout failure (the
 * HttpClient wraps both as `InkressApiError` status `0`, including an unparseable/unexpected
 * body - `chargeStatus` also throws status `0` for that) or a `5xx`. Used to decide when it's
 * safe to assume "the earlier request may have landed anyway and just be slow to answer" - never
 * for a 4xx, which the server definitely and deliberately answered.
 */
export declare function isTransientError(error: unknown): boolean;
export declare const IDEMPOTENCY_KEY_MIN_BYTES = 8;
export declare const IDEMPOTENCY_KEY_MAX_BYTES = 200;
export declare const IDEMPOTENCY_KEY_PATTERN: RegExp;
/**
 * Validates an idempotency key CLIENT-SIDE, before any network call — mirrors the server's own
 * rule (`Api.Services.Cards.ChargeRequest.idempotency_key/2`) exactly: 8-200 bytes after trimming,
 * printable ASCII only (no spaces, no control characters). Throws a plain `Error` (never
 * `InkressApiError` - nothing was sent) for a key the server would 422 on, and otherwise returns
 * the TRIMMED key, since the server treats the trimmed value as canonical (it's what ends up in
 * the stored reference and in every replay comparison) - `charge()` and `chargeStatus()` both use
 * the trimmed result so a caller who passes an untrimmed key still gets consistent behaviour.
 */
export declare function validateIdempotencyKey(key: string): string;
/** M-A7: `attempts <= 0` would otherwise report "still unknown after 0 polls" without ever polling. */
export declare function validateWaitOptions(options: SavedCardWaitOptions): void;
export declare const defaultSleep: (ms: number) => Promise<void>;
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
//# sourceMappingURL=card-charge-shared.d.ts.map