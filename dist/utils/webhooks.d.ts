import { WebhookEvent } from '../types';
export interface WebhookPayload {
    id: string;
    timestamp: number;
    event: WebhookEvent;
}
export interface WebhookVerificationOptions {
    tolerance?: number;
}
export declare class WebhookUtils {
    /**
     * Verify webhook signature using HMAC SHA256
     */
    static verifySignature(payload: string | any, signature: string, secret: string, options?: WebhookVerificationOptions): boolean;
    /**
     * Parse and validate webhook payload
     */
    static parsePayload(payload: string): WebhookPayload;
    /**
     * Verify and parse webhook payload in one step
     */
    static verifyAndParse(payload: string, signature: string, secret: string, options?: WebhookVerificationOptions): WebhookPayload;
    /**
     * Generate webhook signature for testing
     */
    static generateSignature(payload: string, secret: string, timestamp?: number): string;
    /**
     * Create a test webhook payload
     */
    static createTestPayload(event: WebhookEvent): WebhookPayload;
    /**
     * Validate webhook event type
     */
    static isValidEventType(eventType: string): boolean;
    /**
     * Extract event data with type safety
     */
    static extractEventData<T = any>(payload: WebhookPayload): T;
}
export declare function createWebhookMiddleware(secret: string, options?: WebhookVerificationOptions): (req: any, res: any, next: any) => any;
export declare function isWebhookEvent(data: any): data is WebhookPayload;
//# sourceMappingURL=webhooks.d.ts.map