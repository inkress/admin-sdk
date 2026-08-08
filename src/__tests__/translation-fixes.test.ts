import { InkressSDK } from '../index';
import { FeeStructureTranslator, KindTranslator, StatusTranslator } from '../utils/translators';

/**
 * Regression tests for three translation defects:
 *   1. Translating an ABSENT (null/undefined) value threw instead of passing it through, so any
 *      resource that embeds a partial related record crashed - notably `orders.get`, whose order
 *      carries a merchant that has no platform/provider fee_structure column
 *      ("Unknown fee structure value: undefined").
 *   2a. Payment links translated `kind` in the ORDER context on read, disagreeing with their own
 *       write/filter paths (kind 1 -> "online" instead of "order").
 *   2b. Payment link STATUS had no mapping entries, so it fell through to the financial_request
 *       reverse (a draft link -> "financial_request_in_review").
 */

describe('translators tolerate an absent value instead of throwing (fix 1)', () => {
  it('FeeStructureTranslator.toString passes null/undefined through and still maps real values', () => {
    expect(FeeStructureTranslator.toString(undefined as never)).toBeUndefined();
    expect(FeeStructureTranslator.toString(null as never)).toBeNull();
    expect(FeeStructureTranslator.toString(1)).toBe('merchant_absorb');
    expect(FeeStructureTranslator.toString(2)).toBe('customer_pay');
  });

  it('Status/Kind toString + toStringWithoutContext pass an absent value through', () => {
    expect(StatusTranslator.toString(undefined as never)).toBeUndefined();
    expect(StatusTranslator.toStringWithoutContext(undefined as never, 'order')).toBeUndefined();
    expect(KindTranslator.toString(null as never)).toBeNull();
    expect(KindTranslator.toStringWithoutContext(null as never, 'order')).toBeNull();
  });
});

describe('payment link status/kind translate in their own context (fix 2)', () => {
  it('status maps to the payment-link vocabulary, not financial_request', () => {
    expect(StatusTranslator.toStringWithoutContext(1, 'payment_link')).toBe('active');
    expect(StatusTranslator.toStringWithoutContext(2, 'payment_link')).toBe('draft');
    expect(StatusTranslator.toStringWithoutContext(3, 'payment_link')).toBe('cancelled');
  });

  it('status round-trips string -> int -> string', () => {
    expect(StatusTranslator.toIntegerWithContext('active', 'payment_link')).toBe(1);
    expect(StatusTranslator.toIntegerWithContext('draft', 'payment_link')).toBe(2);
    expect(StatusTranslator.toIntegerWithContext('cancelled', 'payment_link')).toBe(3);
  });

  it('kind uses the payment_link context (was wrongly the order context)', () => {
    expect(KindTranslator.toStringWithoutContext(1, 'payment_link')).toBe('order');
    expect(KindTranslator.toStringWithoutContext(2, 'payment_link')).toBe('invoice');
  });
});

describe('the fixes do not disturb existing context translations', () => {
  it('order status/kind translate exactly as before', () => {
    expect(StatusTranslator.toStringWithoutContext(1, 'order')).toBe('pending');
    expect(StatusTranslator.toStringWithoutContext(3, 'order')).toBe('paid');
    expect(StatusTranslator.toStringWithoutContext(13, 'order')).toBe('stale');
    expect(KindTranslator.toStringWithoutContext(1, 'order')).toBe('online');
    expect(KindTranslator.toStringWithoutContext(5, 'order')).toBe('offline');
  });

  it('financial_request status still resolves in its own context', () => {
    expect(StatusTranslator.toStringWithoutContext(1, 'financial_request')).toBe('pending');
    expect(StatusTranslator.toStringWithoutContext(2, 'financial_request')).toBe('in_review');
  });
});

describe('orders.get no longer crashes on an embedded merchant without fee structures (fix 1, end to end)', () => {
  it('returns the order, translated, instead of throwing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            state: 'ok',
            result: { id: 2571, status: 3, kind: 1, total: 5000, merchant: { id: 1, status: 33, name: 'Inkress' } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof fetch;

    const sdk = new InkressSDK({ accessToken: 't', mode: 'sandbox', username: 'inkress' });
    const res = await sdk.orders.get(2571);
    expect(res.result?.id).toBe(2571);
    expect(res.result?.status).toBe('paid');
    expect(res.result?.kind).toBe('online');
    // The merchant survived translation with its absent fee structures left absent.
    expect((res.result as { merchant?: { id: number } }).merchant?.id).toBe(1);
  });
});
