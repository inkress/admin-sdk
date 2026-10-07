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
     * Inkress webhooks use the format: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
     * The signature is sent in the X-Inkress-Webhook-Signature header
     */
    static verifySignature(body: string, signature: string, secret: string): boolean;
    /**
     * Verify webhook from an HTTP request object
     * Automatically extracts signature from headers and body from request
     * Returns both verification status and body (since body can only be read once)
     */
    static verifyRequest(request: {
        headers: Record<string, string | string[] | undefined>;
        body: string | any;
    }, secret: string): {
        isValid: boolean;
        body: string;
    };
    /**
     * Parse and validate webhook payload
     */
    static parsePayload(payload: string): WebhookPayload;
    /**
     * Verify and parse webhook payload in one step
     */
    static verifyAndParse(body: string, signature: string, secret: string): WebhookPayload;
    /**
     * Generate webhook signature for testing
     * Matches Inkress signature generation: crypto.mac(:hmac, :sha256, secret, body) |> Base.encode64()
     */
    static generateSignature(body: string, secret: string): string;
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
export declare function createWebhookMiddleware(secret: string): (req: any, res: any, next: any) => any;
export declare function isWebhookEvent(data: any): data is WebhookPayload;
//# sourceMappingURL=webhooks.d.ts.map