import { HttpClient } from '../client';
import {
  WebhookUrl,
  CreateWebhookUrlData,
  UpdateWebhookUrlData,
  ApiResponse,
  WebhookEvent,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { WebhookUrlQueryBuilder } from '../utils/query-builders';
import {
  WebhookUrlFilterParams,
  WebhookUrlQueryParams,
  WebhookUrlListResponse,
  WEBHOOK_URL_FIELD_TYPES,
} from '../types/resources';

// Node.js crypto and Buffer with proper typing
declare const require: any;
declare const Buffer: any;

let crypto: any;
try {
  if (typeof require !== 'undefined') {
    crypto = require('crypto');
  }
} catch {
  // Fallback for environments without Node.js crypto
}

export interface WebhookPayload {
  id: string;
  timestamp: number;
  event: WebhookEvent;
}

export interface WebhookVerificationOptions {
  tolerance?: number; // Time tolerance in seconds (default: 300)
}

export interface IncomingWebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  body?: string | any;
}

export class WebhookUrlsResource {
  constructor(private client: HttpClient) {}

  /**
   * List webhook URLs with filtering
   */
  async list(params?: WebhookUrlFilterParams): Promise<ApiResponse<WebhookUrlListResponse>> {
    return this.client.get<WebhookUrlListResponse>('/webhook_urls', params);
  }

  /**
   * Get webhook URL by ID
   */
  async get(id: number): Promise<ApiResponse<WebhookUrl>> {
    return this.client.get<WebhookUrl>(`/webhook_urls/${id}`);
  }

  /**
   * Create a new webhook URL
   */
  async create(data: CreateWebhookUrlData): Promise<ApiResponse<WebhookUrl>> {
    return this.client.post<WebhookUrl>('/webhook_urls', data);
  }

  /**
   * Update a webhook URL
   */
  async update(id: number, data: UpdateWebhookUrlData): Promise<ApiResponse<WebhookUrl>> {
    return this.client.put<WebhookUrl>(`/webhook_urls/${id}`, data);
  }

  /**
   * Delete a webhook URL
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/webhook_urls/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const webhooks = await sdk.webhookUrls.query({
   *   event: 'order.created',
   *   merchant_id: 123
   * });
   */
  async query(params: WebhookUrlQueryParams): Promise<ApiResponse<WebhookUrlListResponse>> {
    const processedQuery = processQuery(params, WEBHOOK_URL_FIELD_TYPES, { validate: true });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for webhook URLs
   * 
   * @example
   * const webhooks = await sdk.webhookUrls.createQueryBuilder()
   *   .whereEventEquals('order.created')
   *   .whereMerchantIdEquals(123)
   *   .execute();
   */
  createQueryBuilder(): WebhookUrlQueryBuilder {
    return new WebhookUrlQueryBuilder(this);
  }

  // ============================================================================
  // WEBHOOK VERIFICATION METHODS
  // ============================================================================

  /**
   * Verify webhook signature using HMAC SHA256
   * Inkress webhooks use the format: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
   */
  private verifySignature(body: string, signature: string, secret: string): boolean {
    if (!crypto) {
      throw new Error('Node.js crypto module not available. Cannot verify webhook signature.');
    }

    try {
      // Generate expected signature using HMAC SHA256
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('base64');
      
      // Use constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse webhook payload from a string
   */
  private parsePayload(payload: string): WebhookPayload {
    try {
      const parsed = JSON.parse(payload);
      
      if (!parsed.id || !parsed.timestamp || !parsed.event) {
        throw new Error('Invalid webhook payload structure: missing required fields (id, timestamp, or event)');
      }
      
      return parsed as WebhookPayload;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse webhook payload: ${error.message}`);
      }
      throw new Error('Failed to parse webhook payload');
    }
  }

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
  async verifyRequest(
    request: IncomingWebhookRequest,
    secret: string,
    options?: WebhookVerificationOptions
  ): Promise<WebhookPayload> {
    // Extract signature from headers (case-insensitive)
    const signature = 
      request.headers['x-inkress-webhook-signature'] || 
      request.headers['X-Inkress-Webhook-Signature'];
    
    if (!signature || typeof signature !== 'string') {
      throw new Error('Missing X-Inkress-Webhook-Signature header');
    }
    
    // Clone and ensure body is a string
    let body: string;
    if (typeof request.body === 'string') {
      body = request.body;
    } else if (request.body && typeof request.body === 'object') {
      body = JSON.stringify(request.body);
    } else {
      throw new Error('Invalid request body format: body must be a string or object');
    }
    
    // Verify signature
    const isValid = this.verifySignature(body, signature, secret);
    
    if (!isValid) {
      throw new Error('Webhook signature verification failed: signature does not match');
    }
    
    // Parse the payload
    const payload = this.parsePayload(body);
    
    // Optional: Verify timestamp tolerance
    if (options?.tolerance) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeDifference = Math.abs(currentTimestamp - payload.timestamp);
      
      if (timeDifference > options.tolerance) {
        throw new Error(`Webhook timestamp outside tolerance window: ${timeDifference}s (max: ${options.tolerance}s)`);
      }
    }
    
    return payload;
  }

  /**
   * Verify webhook signature only (without parsing)
   * Useful for custom verification flows
   * 
   * @param body - The raw webhook request body as a string
   * @param signature - The signature from X-Inkress-Webhook-Signature header
   * @param secret - Your webhook secret
   * @returns Promise that resolves to true if valid, rejects with error if invalid
   */
  async verify(body: string, signature: string, secret: string): Promise<boolean> {
    if (!this.verifySignature(body, signature, secret)) {
      throw new Error('Webhook signature verification failed');
    }
    return true;
  }

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
  generateSignature(body: string, secret: string): string {
    if (!crypto) {
      throw new Error('Node.js crypto module not available. Cannot generate signature.');
    }

    return crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');
  }

  /**
   * Extract event data from webhook payload with type safety
   * 
   * @example
   * ```typescript
   * const payload = await sdk.webhookUrls.verifyRequest(request, secret);
   * const orderData = sdk.webhookUrls.extractEventData<Order>(payload);
   * ```
   */
  extractEventData<T = any>(payload: WebhookPayload): T {
    return payload.event.data as T;
  }
}
