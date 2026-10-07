import { InkressSDK, InkressApiError, SavedCardChargePendingError, isSubscriptionChargeQueued } from '../index';
import type { ChargeSubscriptionResponse, SubscriptionChargeOutcome } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };

type ClientMock = { client: { post: jest.Mock; get: jest.Mock } };

function sdkWith(post: jest.Mock, get: jest.Mock): InkressSDK {
  const sdk = new InkressSDK(config);
  const client = (sdk.subscriptions as unknown as ClientMock).client;
  client.post = post;
  client.get = get;
  return sdk;
}

const outcome = (status: string, extra: Partial<SubscriptionChargeOutcome> = {}): SubscriptionChargeOutcome => ({
  status: status as SubscriptionChargeOutcome['status'],
  job_id: 41,
  reference: 'cardchg-35-4310-sub526-fsb-dom-0001',
  order: null,
  failure_reason: null,
  subscription_uid: 'sub_uid',
  ...extra,
});

describe('SubscriptionsResource.charge (INK-690/691)', () => {
  test('sends reference_id and the legacy reference field', async () => {
    const post = jest.fn().mockResolvedValue({
      state: 'ok',
      result: { status: 'queued', job_id: 41, reference: 'cardchg-35-4310-sub526-fsb-dom-0001', subscription_uid: 'sub_uid' },
    });
    const sdk = sdkWith(post, jest.fn());

    const { result } = await sdk.subscriptions.charge('sub_uid', { total: 12, title: 'Domain', reference_id: 'fsb-dom-0001' });

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/sub_uid/charge', {
      total: 12,
      title: 'Domain',
      reference_id: 'fsb-dom-0001',
      reference: 'fsb-dom-0001',
    });
    expect(result && isSubscriptionChargeQueued(result)).toBe(true);
  });

  test('isSubscriptionChargeQueued is false for the legacy synchronous answer', () => {
    const settled: ChargeSubscriptionResponse = {
      total: 12,
      currency: 'USD',
      status: 'pending',
      reference: 'fsb-dom-0001',
      subscription_uid: 'sub_uid',
      subscription_status: 'active',
    };
    expect(isSubscriptionChargeQueued(settled)).toBe(false);
  });
});

describe('SubscriptionsResource.chargeStatus', () => {
  test('GETs by the caller reference (URL-encoded) and returns the outcome', async () => {
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome('succeeded') });
    const sdk = sdkWith(jest.fn(), get);

    const { result } = await sdk.subscriptions.chargeStatus('sub_uid', ' fsb dom/1 ');

    expect(get).toHaveBeenCalledWith('/billing_subscriptions/sub_uid/charges/fsb%20dom%2F1');
    expect(result?.status).toBe('succeeded');
    expect(result?.subscription_uid).toBe('sub_uid');
  });

  test('an unexpected body is a status-0 InkressApiError (never a fabricated outcome)', async () => {
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: { status: 'paid' } });
    const sdk = sdkWith(jest.fn(), get);

    await expect(sdk.subscriptions.chargeStatus('sub_uid', 'fsb-dom-0001')).rejects.toMatchObject({ status: 0 });
  });

  test('an empty reference is rejected before any request', async () => {
    const get = jest.fn();
    const sdk = sdkWith(jest.fn(), get);

    await expect(sdk.subscriptions.chargeStatus('sub_uid', '  ')).rejects.toThrow('reference is required');
    expect(get).not.toHaveBeenCalled();
  });
});

describe('SubscriptionsResource.waitForCharge', () => {
  const sleep = jest.fn().mockResolvedValue(undefined);

  test('polls through queued/processing and transient misses until resolved', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: outcome('queued') })
      .mockRejectedValueOnce(new InkressApiError('timeout', 0))
      .mockResolvedValueOnce({ state: 'ok', result: outcome('processing') })
      .mockResolvedValueOnce({ state: 'ok', result: outcome('failed', { failure_reason: 'monthly_limit_exceeded' }) });
    const sdk = sdkWith(jest.fn(), get);

    const result = await sdk.subscriptions.waitForCharge('sub_uid', 'fsb-dom-0001', { sleep });

    expect(result.status).toBe('failed');
    expect(result.failure_reason).toBe('monthly_limit_exceeded');
    expect(get).toHaveBeenCalledTimes(4);
  });

  test('a 404 is thrown at once (no such charge on this subscription)', async () => {
    const get = jest.fn().mockRejectedValue(new InkressApiError('Charge Not Found', 404));
    const sdk = sdkWith(jest.fn(), get);

    await expect(sdk.subscriptions.waitForCharge('sub_uid', 'fsb-dom-0001', { sleep })).rejects.toMatchObject({ status: 404 });
    expect(get).toHaveBeenCalledTimes(1);
  });

  test('budget exhausted: SavedCardChargePendingError carrying the last outcome', async () => {
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome('processing') });
    const sdk = sdkWith(jest.fn(), get);

    const error = await sdk.subscriptions
      .waitForCharge('sub_uid', 'fsb-dom-0001', { sleep, attempts: 3 })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SavedCardChargePendingError);
    expect((error as SavedCardChargePendingError).outcome?.status).toBe('processing');
    expect(get).toHaveBeenCalledTimes(3);
  });
});
