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

  test('createLink passes an optional first period through (INK-781)', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: { id: 1, payment_urls: { short_link: 'https://inkr.es/x' } } });
    (sdk.subscriptions as unknown as { client: { post: jest.Mock } }).client.post = post;

    await sdk.subscriptions.createLink({
      title: 'Courier Portal subscription',
      plan_uid: 'plan_cp',
      reference_id: 'cp-sub-12',
      customer: { first_name: 'Spanish', last_name: 'Town', email: 'billing@example.com' },
      start_date: '2026-10-14',
      end_date: '2026-10-31',
      prorate: true,
    });

    expect(post).toHaveBeenCalledWith(
      '/billing_subscriptions/link',
      expect.objectContaining({ plan_id: 'plan_cp', start_date: '2026-10-14', end_date: '2026-10-31', prorate: true }),
    );
  });
});
