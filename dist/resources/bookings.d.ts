import { HttpClient } from '../client';
import { ApiResponse, Order } from '../types';
/**
 * A booking (INK-792). Every order tagged with `booking_id` is one payment towards it —
 * a deposit, the balance, or anything else — and each stays a normal order. Reads carry
 * those orders plus `amount_paid` (settled orders only) and `amount_due` (`total` minus
 * what is paid, never below 0; null when the booking has no `total`).
 */
/** A product line on a booking, priced by Inkress from the catalogue (INK-1483). A snapshot. */
export interface BookingItem {
    product_id: number;
    title: string;
    image?: string | null;
    quantity: number;
    /** The choices made, each with its price. */
    options: {
        name: string;
        value: string;
        price: number;
    }[];
    unit_price: number;
    total: number;
    currency_code: string;
}
/** A product to book: Inkress prices it from the business's catalogue; prices you send are ignored. */
export interface BookingItemInput {
    product_id: number;
    /** Defaults to 1. */
    quantity?: number;
    /** Customer input name → chosen label, e.g. `{ "Length": "Long" }`. Required inputs must be answered. */
    options?: Record<string, string>;
}
export interface Booking {
    id: number;
    /** Your own booking id (e.g. `bookerva:bk_123`), unique per merchant. */
    reference_id?: string | null;
    state: string;
    start_time: string;
    end_time: string;
    /** Expected price of the booking, in major units. */
    total?: number | null;
    currency_code?: string | null;
    location?: string | null;
    service_bay?: string | null;
    variant_id?: number | null;
    details?: Record<string, unknown> | null;
    amount_paid?: number;
    amount_due?: number | null;
    orders?: Order[];
    /** The products booked; their prices set `total` and `currency_code`. */
    items?: BookingItem[] | null;
    inserted_at: string;
    updated_at: string;
}
export interface CreateBookingData {
    /** Your own booking id. A second booking with the same reference is refused (422). */
    reference_id?: string;
    start_time: string;
    end_time: string;
    /** Defaults to `pending`. */
    state?: string;
    total?: number;
    /** ISO 4217, upper case (e.g. `JMD`). */
    currency_code?: string;
    location?: string;
    service_bay?: string;
    variant_id?: number;
    details?: Record<string, unknown>;
    /**
     * Products to book (INK-1483). The lines set `total` and `currency_code`; any you send alongside
     * must agree. On update, `[]` removes the products and keeps the price as it stands.
     */
    items?: BookingItemInput[];
}
/** `reference_id` is fixed at creation. */
export type UpdateBookingData = Partial<Omit<CreateBookingData, 'reference_id'>>;
export interface BookingFilterParams {
    reference_id?: string;
    state?: string;
    variant_id?: number;
    page?: number;
    limit?: number;
    [key: string]: string | number | undefined;
}
export interface BookingListResponse {
    entries: Booking[];
    pagination?: Record<string, unknown>;
}
export declare class BookingsResource {
    private client;
    constructor(client: HttpClient);
    list(params?: BookingFilterParams): Promise<ApiResponse<BookingListResponse>>;
    get(id: number): Promise<ApiResponse<Booking>>;
    create(data: CreateBookingData): Promise<ApiResponse<Booking>>;
    update(id: number, data: UpdateBookingData): Promise<ApiResponse<Booking>>;
    /** The booking carrying your `reference_id`, or null — use it to recover after a retried create. */
    findByReference(referenceId: string): Promise<Booking | null>;
}
//# sourceMappingURL=bookings.d.ts.map