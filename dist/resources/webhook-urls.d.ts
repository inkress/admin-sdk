import { HttpClient } from '../client';
import { WebhookUrl, CreateWebhookUrlData, UpdateWebhookUrlData, ApiResponse, WebhookEvent, AppDisconnectedWebhook } from '../types';
import { WebhookUrlQueryBuilder } from '../utils/query-builders';
import { WebhookUrlFilterParams, WebhookUrlQueryParams, WebhookUrlListResponse } from '../types/resources';
import { WebhookDelivery, WebhookTestData, WebhookTestEventsResponse, WebhookTestPreview } from './webhook-deliveries';
export interface WebhookPayload {
    id: string;
    timestamp: number;
    event: WebhookEvent;
}
export interface WebhookVerificationOptions {
    tolerance?: number;
}
export interface IncomingWebhookRequest {
    headers: Record<string, string | string[] | undefined>;
    body?: string | any;
}
export declare class WebhookUrlsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List webhook URLs with filtering
     */
    list(params?: WebhookUrlFilterParams): Promise<ApiResponse<WebhookUrlListResponse>>;
    /**
     * Get webhook URL by ID
     */
    get(id: number): Promise<ApiResponse<WebhookUrl>>;
    /**
     * Create a new webhook URL
     */
    create(data: CreateWebhookUrlData): Promise<ApiResponse<WebhookUrl>>;
    /**
     * Update a webhook URL
     */
    update(id: number, data: UpdateWebhookUrlData): Promise<ApiResponse<WebhookUrl>>;
    /**
     * Delete a webhook URL
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /** The events a test can send, with the sources each takes and the statuses a sample can have (INK-1118). */
    testEvents(): Promise<ApiResponse<WebhookTestEventsResponse>>;
    /** The exact request a test would make to this endpoint, without sending it (INK-1118). */
    previewTest(id: number, data: WebhookTestData): Promise<ApiResponse<WebhookTestPreview>>;
    /**
     * Send a test event to this endpoint now (INK-1118). It is built and signed like a live event,
     * carries `X-Inkress-Webhook-Test: true` and an event id no live event can have. Waits up to 10 s
     * and returns the delivery (`is_test: true`). Tests and replays share 10 per endpoint per minute.
     */
    sendTest(id: number, data: WebhookTestData): Promise<ApiResponse<WebhookDelivery>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const webhooks = await sdk.webhookUrls.query({
     *   event: 'order.created',
     *   merchant_id: 123
     * });
     */
    query(params: WebhookUrlQueryParams): Promise<ApiResponse<WebhookUrlListResponse>>;
    /**
     * Create a fluent query builder for webhook URLs
     *
     * @example
     * const webhooks = await sdk.webhookUrls.createQueryBuilder()
     *   .whereEventEquals('order.created')
     *   .whereMerchantIdEquals(123)
     *   .execute();
     */
    createQueryBuilder(): WebhookUrlQueryBuilder;
    /**
     * Verify webhook signature using HMAC SHA256
     * Inkress webhooks use the format: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
     */
    private verifySignature;
    /**
     * Parse webhook payload from a string
     */
    private parsePayload;
    /**
     * Verify and parse an incoming webhook request
     * This method clones the request body, validates the signature, and returns the parsed payload
     *
     * @param request - The incoming HTTP request object with headers and body
     * @param secret - Your webhook secret for signature verification
     * @param options - Optional verification options (e.g., timestamp tolerance)
     * @returns Promise that resolves to the parsed webhook payload
     * @throws Error if signature verification fails or payload is invalid
     *
     * @example
     * ```typescript
     * // Express.js example
     * app.post('/webhooks', async (req, res) => {
     *   try {
     *     const payload = await sdk.webhookUrls.verifyRequest(
     *       { headers: req.headers, body: req.body },
     *       'your-webhook-secret'
     *     );
     *
     *     // Process the webhook
     *     console.log('Received webhook:', payload.event.type);
     *
     *     res.status(200).json({ received: true });
     *   } catch (error) {
     *     console.error('Webhook verification failed:', error);
     *     res.status(400).json({ error: error.message });
     *   }
     * });
     * ```
     */
    verifyRequest(request: IncomingWebhookRequest, secret: string, options?: WebhookVerificationOptions): Promise<WebhookPayload>;
    /**
     * Verify and parse an `app.disconnected` delivery (INK-1522), sent to your app's URLs for a
     * business just before its access ends. `secret` is your app's `whsec_` signing secret.
     * `verifyRequest` doesn't fit this event: its body has no `timestamp` or `event`.
     */
    verifyAppDisconnected(request: IncomingWebhookRequest, secret: string): Promise<AppDisconnectedWebhook>;
    /**
     * Verify webhook signature only (without parsing)
     * Useful for custom verification flows
     *
     * @param body - The raw webhook request body as a string
     * @param signature - The signature from X-Inkress-Webhook-Signature header
     * @param secret - Your webhook secret
     * @returns Promise that resolves to true if valid, rejects with error if invalid
     */
    verify(body: string, signature: string, secret: string): Promise<boolean>;
    /**
     * Generate webhook signature for testing
     * Matches Inkress signature generation: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
     *
     * @example
     * ```typescript
     * const testBody = JSON.stringify({ id: '123', timestamp: Date.now(), event: {...} });
     * const signature = sdk.webhookUrls.generateSignature(testBody, 'your-secret');
     * ```
     */
    generateSignature(body: string, secret: string): string;
    /**
     * Extract event data from webhook payload with type safety
     *
     * @example
     * ```typescript
     * const payload = await sdk.webhookUrls.verifyRequest(request, secret);
     * const orderData = sdk.webhookUrls.extractEventData<Order>(payload);
     * ```
     */
    extractEventData<T = any>(payload: WebhookPayload): T;
}
//# sourceMappingURL=webhook-urls.d.ts.map