import { WebhookUtils } from '../utils/webhooks';

describe('WebhookUtils', () => {
  const mockSecret = 'test-webhook-secret';
  const mockPayload = '{"id":"evt_123","timestamp":1672531200,"event":{"type":"payment.succeeded","data":{"payment_id":"pay_123"}}}';

  test('should generate and verify webhook signature', () => {
    const signature = WebhookUtils.generateSignature(mockPayload, mockSecret);
    expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);

    const isValid = WebhookUtils.verifySignature(mockPayload, signature, mockSecret);
    expect(isValid).toBe(true);
  });

  test('should parse webhook payload', () => {
    const parsed = WebhookUtils.parsePayload(mockPayload);
    expect(parsed.id).toBe('evt_123');
    expect(parsed.timestamp).toBe(1672531200);
    expect(parsed.event.type).toBe('payment.succeeded');
  });

  test('should validate event types', () => {
    expect(WebhookUtils.isValidEventType('payment.succeeded')).toBe(true);
    expect(WebhookUtils.isValidEventType('order.created')).toBe(true);
    expect(WebhookUtils.isValidEventType('invalid.event')).toBe(false);
  });

  test('should create test payload', () => {
    const event = {
      id: 'evt_test',
      type: 'payment.succeeded',
      data: { payment_id: 'pay_123' },
      created_at: '2023-01-01T12:00:00Z'
    };

    const payload = WebhookUtils.createTestPayload(event);
    expect(payload.id).toBeDefined();
    expect(payload.timestamp).toBeDefined();
    expect(payload.event).toEqual(event);
  });
});
