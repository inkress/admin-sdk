import { HttpClient } from '../client';
import {
  ApiResponse,
  CreateOrderData,
} from '../types';

// ============================================================================
// CHECKOUT SESSION TYPES
// ============================================================================

/**
 * Fee mapping details for checkout session
 */
export interface CheckoutSessionFeeMapping {
  charged_party: number;
  computed_value: number;
  currency: string;
  fee_id: number;
  group: number;
  is_compounded: boolean;
  recipient_merchant_id: number;
  sequence: number;
  unit: number;
  value: number;
}

/**
 * Fee breakdown for checkout session
 */
export interface CheckoutSessionFees {
  after_tax_fee_total: number;
  before_tax_fee_total: number;
  customer_total: number;
  discount_total: number;
  fee_ids: number[];
  fee_mappings: CheckoutSessionFeeMapping[];
  merchant_total: number;
  platform_total: number;
  provider_total: number;
  shipping_total: number;
  sub_total: number;
  tax_total: number;
}

/**
 * Totals breakdown for checkout session
 */
export interface CheckoutSessionTotals {
  sub_total: number;
  customer_total: number;
  merchant_total: number;
  platform_total: number;
  provider_total: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  before_tax_fee_total: number;
  after_tax_fee_total: number;
}

/**
 * Response data from creating a checkout session
 */
export interface CreateCheckoutSessionResponseData {
  session_id: string;
  reference_id: string;
  status: string;
  order_id: string;
  
  currency: string;
  currency_code: string;
  
  created_at: string;
  payment_initiated_at: string;
  completed_at: string | null;
  expires: number;
  
  totals: CheckoutSessionTotals;
  
  customer: CheckoutSessionCustomer;
  title: string;
  products: any[];
  
  frame_url: string;
  redirect_data: string;
  spi_token: string;
  transaction_id: string;
  amount: number;
  
  transaction_type: string | null;
  three_d_secure: any | null;
  is_subscription: boolean;
}

/**
 * Currency info for checkout session
 */
export interface CheckoutSessionCurrency {
  code: string;
  id: number;
}

/**
 * Customer info for checkout session
 */
export interface CheckoutSessionCustomer {
  id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

/**
 * Checkout session status
 */
export type CheckoutSessionStatus = 'pending' | 'awaiting_payment' | 'completed' | 'cancelled' | 'expired';

/**
 * Response data from getting a checkout session
 */
export interface CheckoutSession {
  status: CheckoutSessionStatus;
  title: string;
  currency: CheckoutSessionCurrency;
  customer: CheckoutSessionCustomer;
  session_id: string;
  order_id: number | null;
  reference_id: string;
  fees: CheckoutSessionFees;
  products: any[];
  created_at: string;
  completed_at: string | null;
  payment_initiated_at: string | null;
}

/**
 * Response data from deleting a checkout session
 */
export interface DeleteCheckoutSessionResponseData {
  status: 'cancelled';
  session_id: string;
}

/**
 * Checkout Sessions Resource
 * 
 * Handles creation and management of checkout sessions for payments.
 * Checkout sessions provide a way to create temporary payment sessions
 * with pre-calculated fees and payment URLs.
 */
export class CheckoutSessionsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new checkout session
   * 
   * Creates a checkout session with pre-calculated fees and returns
   * payment URLs for processing the payment.
   * 
   * Requires Client-Id header to be set in the configuration.
   * 
   * @param data - Order data for the checkout session (same as order creation)
   * @returns The created checkout session with payment URLs and fee breakdown
   * 
   * @example
   * ```typescript
   * const session = await sdk.checkoutSessions.create({
   *   reference_id: 'order-123',
   *   total: 100.00,
   *   kind: 'online',
   *   currency_code: 'JMD',
   *   customer: {
   *     email: 'customer@example.com',
   *     first_name: 'John',
   *     last_name: 'Doe',
   *     phone: '+1234567890'
   *   },
   *   title: 'My Order'
   * });
   * 
   * // Redirect customer to payment URL
   * console.log(session.result.payment_url);
   * ```
   */
  async create(data: CreateOrderData): Promise<ApiResponse<CreateCheckoutSessionResponseData>> {
    return this.client.post<CreateCheckoutSessionResponseData>('/checkout/sessions', data);
  }

  /**
   * Get checkout session details by session ID
   * 
   * Retrieves the current state of a checkout session including
   * payment status, customer info, and fee breakdown.
   * 
   * Requires Client-Id header to be set in the configuration.
   * 
   * @param sessionId - The session ID (e.g., 'S.75a29ad32e52')
   * @returns The checkout session details
   * 
   * @example
   * ```typescript
   * const session = await sdk.checkoutSessions.get('S.75a29ad32e52');
   * console.log(session.result.status); // 'awaiting_payment'
   * ```
   */
  async get(sessionId: string): Promise<ApiResponse<CheckoutSession>> {
    return this.client.get<CheckoutSession>(`/checkout/sessions/${sessionId}`);
  }

  /**
   * Delete (cancel) a checkout session
   * 
   * Cancels an active checkout session. Once cancelled, the session
   * can no longer be used for payment.
   * 
   * Requires Client-Id header to be set in the configuration.
   * 
   * @param sessionId - The session ID to cancel (e.g., 'S.75a29ad32e52')
   * @returns Confirmation of the cancellation
   * 
   * @example
   * ```typescript
   * const result = await sdk.checkoutSessions.delete('S.75a29ad32e52');
   * console.log(result.result); // 'Session cancelled'
   * ```
   */
  async delete(sessionId: string): Promise<ApiResponse<string>> {
    return this.client.delete<string>(`/checkout/sessions/${sessionId}`);
  }
}
