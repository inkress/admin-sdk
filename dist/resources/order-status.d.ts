/**
 * Types for the merchant's own order moves (INK-1079, INK-1307) and custom order lines (INK-1513).
 * Each move answers 200 with an `OrderMoveResult`; a refusal is an `InkressApiError` whose
 * `result.result.code` is an `OrderMoveErrorCode`.
 */
/** How an order was paid outside Inkress. */
export type OrderTenderType = 'cash' | 'bank_transfer' | 'other';
/** Where a paid order can move. Forward only; `returned` from shipped, delivered or completed. */
export type OrderFulfilmentStatus = 'confirmed' | 'prepared' | 'shipped' | 'delivered' | 'completed' | 'returned';
export interface RecordOrderPaymentData {
    tender_type: OrderTenderType;
    /** Your reference for the payment, e.g. the bank transfer reference. */
    reference?: string;
    note?: string;
}
export interface FulfilOrderData {
    status: OrderFulfilmentStatus;
}
export interface DeclineOrderPaymentData {
    note?: string;
}
export interface CancelOrderData {
    reason?: string;
}
/** The order after a move. */
export interface OrderMoveResult {
    id: number;
    uid: string;
    reference_id: string | null;
    status: number;
    status_name: string | null;
    status_on: number | null;
    tender_type: string | null;
    total: number;
    currency_code: string;
}
export type OrderMoveErrorCode = 'not_found' | 'already_paid' | 'not_payable' | 'subscription_order' | 'not_paid' | 'invalid_transition' | 'not_verifying' | 'already_cancelled' | 'not_cancellable';
/**
 * A line that isn't a catalogue product (INK-1513), e.g. freight or customs. Orders with `items`
 * must be sent with the business's secret key (`sk_`) from your server; anything else is a 422.
 */
export interface CustomOrderItem {
    title: string;
    /** Price of one, in major units. */
    unit_price: number;
    /** Defaults to 1. */
    quantity?: number;
}
/** `code` on a payment refused by a transaction limit (INK-1526). The body carries no amounts. */
export type TransactionLimitCode = 'transaction_limit_single' | 'transaction_limit_daily' | 'transaction_limit_monthly';
/** `code` on any write for a closed (archived, resigned or rejected) business: 403 (INK-1518). */
export declare const BUSINESS_CLOSED_CODE: "business_closed";
//# sourceMappingURL=order-status.d.ts.map