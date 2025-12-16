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
  console.warn('Node.js crypto module not available. Webhook signature verification will not work.');
}
import { WebhookEvent } from '../types';

export interface WebhookPayload {
  id: string;
  timestamp: number;
  event: WebhookEvent;
}

export interface WebhookVerificationOptions {
  tolerance?: number; // Time tolerance in seconds (default: 300)
}

export class WebhookUtils {
  /**
   * Verify webhook signature using HMAC SHA256
   * Inkress webhooks use the format: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
   * The signature is sent in the X-Inkress-Webhook-Signature header
   */
  static verifySignature(
    body: string,
    signature: string,
    secret: string
  ): boolean {
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
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify webhook from an HTTP request object
   * Automatically extracts signature from headers and body from request
   * Returns both verification status and body (since body can only be read once)
   */
  static verifyRequest(
    request: {
      headers: Record<string, string | string[] | undefined>;
      body: string | any;
    },
    secret: string
  ): { isValid: boolean; body: string } {
    // Extract signature from headers (case-insensitive)
    const signature = 
      request.headers['x-inkress-webhook-signature'] || 
      request.headers['X-Inkress-Webhook-Signature'];
    
    if (!signature || typeof signature !== 'string') {
      throw new Error('Missing X-Inkress-Webhook-Signature header');
    }
    
    // Ensure body is a string
    let body: string;
    if (typeof request.body === 'string') {
      body = request.body;
    } else if (typeof request.body === 'object') {
      body = JSON.stringify(request.body);
    } else {
      throw new Error('Invalid request body format');
    }
    
    const isValid = this.verifySignature(body, signature, secret);
    return { isValid, body };
  }

  /**
   * Parse and validate webhook payload
   */
  static parsePayload(payload: string): WebhookPayload {
    try {
      const parsed = JSON.parse(payload);
      
      if (!parsed.id || !parsed.timestamp || !parsed.event) {
        throw new Error('Invalid webhook payload structure');
      }
      
      return parsed as WebhookPayload;
    } catch (error) {
      throw new Error(`Failed to parse webhook payload: ${error}`);
    }
  }

  /**
   * Verify and parse webhook payload in one step
   */
  static verifyAndParse(
    body: string,
    signature: string,
    secret: string
  ): WebhookPayload {
    if (!this.verifySignature(body, signature, secret)) {
      throw new Error('Webhook signature verification failed');
    }
    
    return this.parsePayload(body);
  }

  /**
   * Generate webhook signature for testing
   * Matches Inkress signature generation: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
   */
  static generateSignature(body: string, secret: string): string {
    if (!crypto) {
      throw new Error('Node.js crypto module not available. Cannot generate signature.');
    }

    return crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');
  }

  /**
   * Create a test webhook payload
   */
  static createTestPayload(event: WebhookEvent): WebhookPayload {
    return {
      id: crypto.randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
      event,
    };
  }

  /**
   * Validate webhook event type
   */
  static isValidEventType(eventType: string): boolean {
    const validEventTypes = [
      'payment.succeeded',
      'payment.failed',
      'payment.refunded',
      'order.created',
      'order.updated',
      'order.cancelled',
      'subscription.created',
      'subscription.updated',
      'subscription.cancelled',
      'customer.created',
      'customer.updated',
      'merchant.updated',
      'settlement.completed',
    ];
    
    return validEventTypes.includes(eventType);
  }

  /**
   * Extract event data with type safety
   */
  static extractEventData<T = any>(payload: WebhookPayload): T {
    return payload.event.data as T;
  }
}

// Express.js middleware for webhook verification
export function createWebhookMiddleware(secret: string) {
  return (req: any, res: any, next: any) => {
    try {
      const signature = req.headers['x-inkress-webhook-signature'];
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing X-Inkress-Webhook-Signature header' });
      }
      
      let body: string;
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (typeof req.body === 'object') {
        body = JSON.stringify(req.body);
      } else {
        return res.status(400).json({ error: 'Invalid request body format' });
      }
      
      const webhookPayload = WebhookUtils.verifyAndParse(body, signature, secret);
      
      // Attach parsed payload to request
      req.webhookPayload = webhookPayload;
      
      next();
    } catch (error) {
      res.status(400).json({ error: `Webhook verification failed: ${error}` });
    }
  };
}

// Type guard for webhook events
export function isWebhookEvent(data: any): data is WebhookPayload {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.timestamp === 'number' &&
    data.event &&
    typeof data.event.type === 'string'
  );
}
