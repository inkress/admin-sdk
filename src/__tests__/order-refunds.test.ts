import { InkressSDK, InkressApiError, OrderRefundPendingError } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };
type ClientMock = { client: { post: jest.Mock; get: jest.Mock } };

function sdkWith(post: jest.Mock, get: jest.Mock): InkressSDK {
  const sdk = new InkressSDK(config);
  const client = (sdk.orders as unknown as ClientMock).client;
  client.post = post;
  client.get = get;
  return sdk;
}

const refund = (status: string) => ({
  id: 'rf_1', status, order_id: 9, order_reference: 'cardchg-35-1-k', amount: 5, currency: 'USD', reason: 'duplicate',
  idempotency_key: 'dom-refund-0001', provider_refund_id: null, failure_code: null, refunded_total: 5, refundable_remaining: 7,
  created_at: '2026-10-01T00:00:00Z', completed_at: null,
});

describe('OrdersResource refunds (INK-692)', () => {
  test('refund POSTs to /orders/:ref/refunds with the idempotency key in the body', async () => {
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: refund('pending') });
    const sdk = sdkWith(post, jest.fn());

    await sdk.orders.refund('cardchg-35-1-k', { amount: 5, reason: 'duplicate' }, 'dom-refund-0001');

    expect(post).toHaveBeenCalledWith('/orders/cardchg-35-1-k/refunds', {
      amount: 5,
      reason: 'duplicate',
      idempotency_key: 'dom-refund-0001',
    });
  });

  test('waitForRefund polls through pending/unknown and transient errors to a resolved status', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: refund('pending') })
      .mockRejectedValueOnce(new InkressApiError('timeout', 0))
      .mockResolvedValueOnce({ state: 'ok', result: refund('unknown') })
      .mockResolvedValueOnce({ state: 'ok', result: refund('succeeded') });
    const sdk = sdkWith(jest.fn(), get);

    const result = await sdk.orders.waitForRefund(9, 'dom-refund-0001', { sleep: async () => undefined });

    expect(result.status).toBe('succeeded');
    expect(get).toHaveBeenCalledWith('/orders/9/refunds/dom-refund-0001');
  });

  test('waitForRefund: 4xx thrown at once; budget exhausted -> OrderRefundPendingError', async () => {
    const notFound = sdkWith(jest.fn(), jest.fn().mockRejectedValue(new InkressApiError('nf', 404)));
    await expect(notFound.orders.waitForRefund(9, 'k-00000001', { sleep: async () => undefined })).rejects.toMatchObject({ status: 404 });

    const stuck = sdkWith(jest.fn(), jest.fn().mockResolvedValue({ state: 'ok', result: refund('unknown') }));
    const error = await stuck.orders.waitForRefund(9, 'k-00000001', { attempts: 2, sleep: async () => undefined }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(OrderRefundPendingError);
    expect((error as OrderRefundPendingError).refund?.status).toBe('unknown');
  });
});
