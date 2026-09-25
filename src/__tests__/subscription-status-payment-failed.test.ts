import { InkressSDK } from '../index';
import { StatusTranslator } from '../utils/translators';
import { WebhookUtils } from '../utils/webhooks';

describe('subscription status 5 = payment_failed (INK-437 status, INK-438 labels)', () => {
  test('translates both ways in the billing_subscription context', () => {
    expect(StatusTranslator.toStringWithoutContext(5, 'billing_subscription')).toBe('payment_failed');
    expect(StatusTranslator.toIntegerWithContext('payment_failed', 'billing_subscription')).toBe(5);
    expect(StatusTranslator.getContextualOptions('billing_subscription')).toContain('payment_failed');
  });

  test('short statuses containing an underscore resolve in their context (was throwing)', () => {
    expect(StatusTranslator.toIntegerWithContext('adhoc_charged', 'billing_subscription')).toBe(4);
  });

  test('full keys and plain short keys keep working', () => {
    expect(StatusTranslator.toIntegerWithContext('billing_subscription_active', 'billing_subscription')).toBe(2);
    expect(StatusTranslator.toIntegerWithContext('active', 'billing_subscription')).toBe(2);
    expect(() => StatusTranslator.toIntegerWithContext('nope', 'billing_subscription')).toThrow('Unknown status value');
  });

  test('other contexts that also use 5 are unaffected', () => {
    expect(StatusTranslator.toStringWithoutContext(5, 'transaction')).toBe('voided');
  });

  test('subscriptions.list renders status 5 as payment_failed', async () => {
    const sdk = new InkressSDK({ accessToken: 't', mode: 'sandbox', username: 'm' });
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: { entries: [{ id: 1, status: 5, kind: 2 }], pagination: {} } });
    (sdk.subscriptions as unknown as { client: { get: jest.Mock } }).client.get = get;

    const res = await sdk.subscriptions.list();

    expect(res.result?.entries[0]?.status).toBe('payment_failed');
  });

  // D-15: the brief's snippet imports `isValidEventType` as a bare named export, but the SDK only
  // ever exports it as the static WebhookUtils.isValidEventType (see webhooks.test.ts's existing
  // usage) — there is no standalone `isValidEventType` export from '../utils/webhooks' or the index
  // barrel. Using WebhookUtils.isValidEventType here to match the actual, unchanged export surface
  // rather than adding a new top-level export the task didn't ask for.
  test('D-15: the dunning webhook event names validate', () => {
    expect(WebhookUtils.isValidEventType('subscriptions.payment_attempt_failed')).toBe(true);
    expect(WebhookUtils.isValidEventType('subscriptions.payment_failed')).toBe(true);
  });
});
