import { HttpClient } from '../client';
import { ApiResponse } from '../types';

/**
 * INK-1118: the webhook delivery log, test sends and replays. Every POST Inkress makes to one of
 * your endpoints (live, test or replay) is recorded for 30 days. Authorised like `webhook_urls`
 * (the `webhooks:manage` OAuth scope); an endpoint you can't see, or a delivery of one, is a 404.
 */

/** `delivered`: 2xx; `retrying`: failed, another attempt is scheduled; `failed`: no attempts left; `refused`: the URL isn't public. */
export type WebhookDeliveryState = 'delivered' | 'retrying' | 'failed' | 'refused';

/** Which notification family produced the delivery. */
export type WebhookDeliveryKind = 'order_event' | 'subscription_event' | 'merchant_event' | 'registration';

export type WebhookDeliverySubjectType = 'order' | 'subscription' | 'merchant';

export interface WebhookDelivery {
  id: number;
  /** Null for deliveries enqueued before the log existed. */
  webhook_url_id: number | null;
  merchant_id: number | null;
  event: string;
  /** The `X-Inkress-Webhook-ID` sent; a replay keeps the original's. */
  event_id: string | null;
  kind: WebhookDeliveryKind;
  subject_type: WebhookDeliverySubjectType | null;
  subject_id: number | null;
  url: string;
  attempt: number;
  max_attempts: number;
  state: WebhookDeliveryState;
  is_test: boolean;
  /** Set on a replay: the delivery it re-sent. */
  replay_of_id: number | null;
  request_headers: Record<string, string> | null;
  /** The body exactly as sent (registration bodies have their keys redacted). */
  request_body: string | null;
  response_status: number | null;
  /** At most the first 2 KB of the response. */
  response_body: string | null;
  latency_ms: number | null;
  error: string | null;
  oban_job_id: number | null;
  inserted_at: string;
}

export interface WebhookDeliveryFilterParams {
  webhook_url_id?: number;
  merchant_id?: number;
  event?: string;
  state?: WebhookDeliveryState;
  is_test?: boolean;
  page?: number;
  /** Default 25, at most 100. */
  page_size?: number;
}

export interface WebhookDeliveryPagination {
  page: number;
  page_size: number;
  total_entries: number;
  total_pages: number;
}

export interface WebhookDeliveryListResponse {
  entries: WebhookDelivery[];
  pagination: WebhookDeliveryPagination;
}

/** Where a test event's data comes from. `order` and `subscription` need `subject_id`. */
export type WebhookTestSource = 'sample' | 'order' | 'subscription';

export interface WebhookTestData {
  /** An event from `webhookUrls.testEvents()`, e.g. `orders.paid`. */
  event: string;
  /** Defaults to `sample`. */
  source?: WebhookTestSource;
  /** One of the endpoint merchant's own orders or subscriptions, for `source` `order` / `subscription`. */
  subject_id?: number;
  /** Overrides a sample's status: a name from `order_statuses` / `subscription_statuses`. */
  status?: string;
}

export interface WebhookTestEvent {
  event: string;
  family: string;
  sources: WebhookTestSource[];
}

export interface WebhookTestEventsResponse {
  events: WebhookTestEvent[];
  order_statuses: string[];
  subscription_statuses: string[];
}

/** The request a test would make, without sending it. */
export interface WebhookTestPreview {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
}

/** `code` values of a refused test send, replay or list. */
export type WebhookDeliveryErrorCode =
  | 'webhook_not_found'
  | 'delivery_not_found'
  | 'subject_not_found'
  | 'unsupported_event'
  | 'invalid_source'
  | 'source_not_allowed'
  | 'subject_required'
  | 'subject_has_no_booking'
  | 'invalid_status'
  | 'endpoint_has_no_merchant'
  | 'merchant_has_no_credentials'
  | 'no_signing_secret'
  | 'unsupported_endpoint'
  | 'not_replayable'
  | 'rate_limited'
  | 'worker_unavailable'
  | 'rate_limiter_unavailable';

export class WebhookDeliveriesResource {
  constructor(private client: HttpClient) {}

  /** Deliveries to the endpoints you can see, newest first. */
  async list(params?: WebhookDeliveryFilterParams): Promise<ApiResponse<WebhookDeliveryListResponse>> {
    return this.client.get<WebhookDeliveryListResponse>('/webhook_deliveries', params);
  }

  async get(id: number): Promise<ApiResponse<WebhookDelivery>> {
    return this.client.get<WebhookDelivery>(`/webhook_deliveries/${id}`);
  }

  /**
   * Send a delivery again: the stored body, to the endpoint's current URL, signed with its current
   * secret, with `X-Inkress-Webhook-Replay` naming the original. The event id is unchanged, so your
   * deduplication treats it as the same event. Waits up to 10 s and returns the new delivery
   * (`replay_of_id` = the original). Tests and replays share 10 per endpoint per minute.
   */
  async replay(id: number): Promise<ApiResponse<WebhookDelivery>> {
    return this.client.post<WebhookDelivery>(`/webhook_deliveries/${id}/replay`);
  }
}
