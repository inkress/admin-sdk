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
   */
  static verifySignature(
    payload: string | any,
    signature: string,
    secret: string,
    options: WebhookVerificationOptions = {}
  ): boolean {
    try {
      const { tolerance = 300 } = options;
      
      // Parse signature header (format: "t=timestamp,v1=signature")
      const elements = signature.split(',');
      const timestamp = elements.find(el => el.startsWith('t='))?.slice(2);
      const sig = elements.find(el => el.startsWith('v1='))?.slice(3);
      
      if (!timestamp || !sig) {
        throw new Error('Invalid signature format');
      }
      
      // Check timestamp tolerance
      const timestampInt = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (Math.abs(currentTime - timestampInt) > tolerance) {
        throw new Error('Timestamp outside tolerance');
      }
      
      // Construct signed payload
      const signedPayload = `${timestamp}.${payload}`;
      
      // Calculate expected signature
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');
      
      // Compare signatures using constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(sig, 'hex'),
        Buffer.from(expectedSig, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
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
    payload: string,
    signature: string,
    secret: string,
    options?: WebhookVerificationOptions
  ): WebhookPayload {
    if (!this.verifySignature(payload, signature, secret, options)) {
      throw new Error('Webhook signature verification failed');
    }
    
    return this.parsePayload(payload);
  }

  /**
   * Generate webhook signature for testing
   */
  static generateSignature(payload: string, secret: string, timestamp?: number): string {
    const ts = timestamp || Math.floor(Date.now() / 1000);
    const signedPayload = `${ts}.${payload}`;
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');
    
    return `t=${ts},v1=${signature}`;
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
export function createWebhookMiddleware(secret: string, options?: WebhookVerificationOptions) {
  return (req: any, res: any, next: any) => {
    try {
      const signature = req.headers['inkress-signature'] || req.headers['x-inkress-signature'];
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature header' });
      }
      
      let payload = req.body;
      if (typeof payload === 'object') {
        payload = JSON.stringify(payload);
      }
      
      const webhookPayload = WebhookUtils.verifyAndParse(payload, signature, secret, options);
      
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
