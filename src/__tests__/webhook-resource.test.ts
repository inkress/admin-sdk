import { InkressSDK } from '../index';
import { WebhookPayload } from '../resources/webhook-urls';

describe('WebhookUrlsResource - Verification Methods', () => {
  let sdk: InkressSDK;
  const mockSecret = 'test-webhook-secret';
  const mockPayload: WebhookPayload = {
    id: 'evt_123',
    timestamp: Math.floor(Date.now() / 1000),
    event: {
      action: 'payment.succeeded',
      jwt: 'test-jwt-token',
      data: {
        payment_id: 'pay_123',
        amount: 2999,
        currency: 'USD',
      }
    }
  };

  beforeEach(() => {
    sdk = new InkressSDK({
      accessToken: 'test-token',
      mode: 'sandbox',
    });
  });

  describe('generateSignature', () => {
    test('should generate valid base64 signature', () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('should generate consistent signatures for same input', () => {
      const body = JSON.stringify(mockPayload);
      const signature1 = sdk.webhookUrls.generateSignature(body, mockSecret);
      const signature2 = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      expect(signature1).toBe(signature2);
    });
  });

  describe('verify', () => {
    test('should verify valid signature', async () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const result = await sdk.webhookUrls.verify(body, signature, mockSecret);
      expect(result).toBe(true);
    });

    test('should reject invalid signature', async () => {
      const body = JSON.stringify(mockPayload);
      const invalidSignature = 'invalid-signature';
      
      await expect(
        sdk.webhookUrls.verify(body, invalidSignature, mockSecret)
      ).rejects.toThrow('Webhook signature verification failed');
    });

    test('should reject tampered payload', async () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const tamperedBody = JSON.stringify({ ...mockPayload, id: 'tampered' });
      
      await expect(
        sdk.webhookUrls.verify(tamperedBody, signature, mockSecret)
      ).rejects.toThrow('Webhook signature verification failed');
    });
  });

  describe('verifyRequest', () => {
    test('should verify and parse valid request with string body', async () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body,
      };
      
      const result = await sdk.webhookUrls.verifyRequest(request, mockSecret);
      
      expect(result.id).toBe(mockPayload.id);
      expect(result.timestamp).toBe(mockPayload.timestamp);
      expect(result.event.action).toBe('payment.succeeded');
    });

    test('should verify and parse valid request with object body', async () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body: mockPayload, // Object instead of string
      };
      
      const result = await sdk.webhookUrls.verifyRequest(request, mockSecret);
      
      expect(result.id).toBe(mockPayload.id);
      expect(result.event.action).toBe('payment.succeeded');
    });

    test('should accept case-insensitive signature header', async () => {
      const body = JSON.stringify(mockPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'X-Inkress-Webhook-Signature': signature, // Capital letters
        },
        body,
      };
      
      const result = await sdk.webhookUrls.verifyRequest(request, mockSecret);
      expect(result.id).toBe(mockPayload.id);
    });

    test('should reject request without signature header', async () => {
      const request = {
        headers: {},
        body: JSON.stringify(mockPayload),
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret)
      ).rejects.toThrow('Missing X-Inkress-Webhook-Signature header');
    });

    test('should reject request with invalid signature', async () => {
      const request = {
        headers: {
          'x-inkress-webhook-signature': 'invalid-signature',
        },
        body: JSON.stringify(mockPayload),
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret)
      ).rejects.toThrow('Webhook signature verification failed');
    });

    test('should reject request with invalid body format', async () => {
      const signature = sdk.webhookUrls.generateSignature('test', mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body: null,
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret)
      ).rejects.toThrow('Invalid request body format');
    });

    test('should reject request with invalid JSON payload', async () => {
      const invalidBody = '{"invalid": json}';
      const signature = sdk.webhookUrls.generateSignature(invalidBody, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body: invalidBody,
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret)
      ).rejects.toThrow('Failed to parse webhook payload');
    });

    test('should reject payload with missing required fields', async () => {
      const invalidPayload = { id: 'evt_123' }; // Missing timestamp and event
      const body = JSON.stringify(invalidPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body,
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret)
      ).rejects.toThrow('Invalid webhook payload structure');
    });

    test('should enforce timestamp tolerance when specified', async () => {
      const oldPayload = {
        ...mockPayload,
        timestamp: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
      };
      
      const body = JSON.stringify(oldPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body,
      };
      
      await expect(
        sdk.webhookUrls.verifyRequest(request, mockSecret, { tolerance: 300 }) // 5 min tolerance
      ).rejects.toThrow('Webhook timestamp outside tolerance window');
    });

    test('should accept timestamp within tolerance', async () => {
      const recentPayload = {
        ...mockPayload,
        timestamp: Math.floor(Date.now() / 1000) - 100, // 100 seconds ago
      };
      
      const body = JSON.stringify(recentPayload);
      const signature = sdk.webhookUrls.generateSignature(body, mockSecret);
      
      const request = {
        headers: {
          'x-inkress-webhook-signature': signature,
        },
        body,
      };
      
      const result = await sdk.webhookUrls.verifyRequest(request, mockSecret, { tolerance: 300 });
      expect(result.id).toBe(mockPayload.id);
    });
  });

  describe('extractEventData', () => {
    test('should extract event data with correct type', () => {
      interface PaymentData {
        payment_id: string;
        amount: number;
        currency: string;
      }
      
      const data = sdk.webhookUrls.extractEventData<PaymentData>(mockPayload);
      
      expect(data.payment_id).toBe('pay_123');
      expect(data.amount).toBe(2999);
      expect(data.currency).toBe('USD');
    });
  });
});
