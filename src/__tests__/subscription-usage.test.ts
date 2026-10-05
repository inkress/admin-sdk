import { InkressSDK } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };

describe('SubscriptionsResource usage (INK-781)', () => {
  test('usage POSTs the metric and count to /billing_subscriptions/usage/:uid', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({
      state: 'ok',
      result: { subscription_uid: 'sub_uid', metric: 'packages', period_ending: '2026-11-01', total: 312 },
    });
    (sdk.subscriptions as unknown as { client: { post: jest.Mock } }).client.post = post;

    const { result } = await sdk.subscriptions.usage('sub_uid', { metric: 'packages', metric_count: 12 });

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/usage/sub_uid', { metric: 'packages', metric_count: 12 });
    expect(result?.total).toBe(312);
    expect(result?.period_ending).toBe('2026-11-01');
  });
});
