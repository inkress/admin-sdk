/**
 * INK-692: merchant refunds of captured card-on-file and subscription orders
 * (`POST/GET /orders/:order_ref/refunds`). Types + wire validation; the methods live on
 * `OrdersResource` (`refund`, `refundStatus`, `waitForRefund`).
 */
import { InkressApiError } from '../client';
export type OrderRefundStatus = 'pending' | 'processing' | 'provider_succeeded' | 'succeeded' | 'failed' | 'unknown';
export type OrderRefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'service_not_delivered' | 'other';
export type OrderRefundErrorCode = 'invalid_request' | 'not_found' | 'order_not_refundable' | 'ledger_pending' | 'dispute_open' | 'amount_exceeds_refundable' | 'currency_mismatch' | 'insufficient_balance' | 'idempotency_key_reused' | 'forbidden';
export interface CreateOrderRefundData {
    /** Refund amount in the units the card was charged; omit for the full refundable remainder. */
    amount?: number;
    /** Must equal the order's currency when given. */
    currency?: string;
    reason?: OrderRefundReason;
    note?: string;
}
export interface OrderRefund {
    id: string;
    status: OrderRefundStatus;
    order_id: number;
    order_reference: string;
    amount: number;
    currency: string;
    reason: OrderRefundReason;
    idempotency_key: string;
    provider_refund_id: string | null;
    failure_code: string | null;
    refunded_total: number;
    refundable_remaining: number;
    created_at: string;
    completed_at: string | null;
}
/** Statuses a wait stops on. `unknown` is NOT one: Inkress is still reconciling it. */
export declare const RESOLVED_REFUND_STATUSES: readonly OrderRefundStatus[];
export declare function isOrderRefund(value: unknown): value is OrderRefund;
export interface WaitForRefundOptions {
    /** Polls before giving up (default 15). */
    attempts?: number;
    /** First delay; doubles each poll (default 1000 ms). */
    initialDelayMs?: number;
    /** Delay cap (default 15000 ms). */
    maxDelayMs?: number;
    /** Injectable for tests. */
    sleep?: (ms: number) => Promise<void>;
}
/** The wait ran out before the refund resolved. Poll again with the SAME key — never re-request with a new one. */
export declare class OrderRefundPendingError extends InkressApiError {
    readonly refund: OrderRefund | undefined;
    constructor(idempotencyKey: string, refund: OrderRefund | undefined, attempts: number);
}
//# sourceMappingURL=order-refunds.d.ts.map