import { HttpClient } from '../client';
import { ApiResponse, Order } from '../types';

/**
 * A booking (INK-792). Every order tagged with `booking_id` is one payment towards it —
 * a deposit, the balance, or anything else — and each stays a normal order. Reads carry
 * those orders plus `amount_paid` (settled orders only) and `amount_due` (`total` minus
 * what is paid, never below 0; null when the booking has no `total`).
 */
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

export class BookingsResource {
  constructor(private client: HttpClient) {}

  async list(params?: BookingFilterParams): Promise<ApiResponse<BookingListResponse>> {
    return this.client.get<BookingListResponse>('/bookings', params);
  }

  async get(id: number): Promise<ApiResponse<Booking>> {
    return this.client.get<Booking>(`/bookings/${id}`);
  }

  async create(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return this.client.post<Booking>('/bookings', data);
  }

  async update(id: number, data: UpdateBookingData): Promise<ApiResponse<Booking>> {
    return this.client.put<Booking>(`/bookings/${id}`, data);
  }

  /** The booking carrying your `reference_id`, or null — use it to recover after a retried create. */
  async findByReference(referenceId: string): Promise<Booking | null> {
    const response = await this.list({ reference_id: referenceId, limit: 1 });
    return response.result?.entries?.[0] ?? null;
  }
}
