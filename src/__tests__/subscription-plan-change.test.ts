import { InkressSDK } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };

describe('SubscriptionsResource plan change (INK-694)', () => {
  test('changePlan POSTs the target plan uid', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({
      state: 'ok',
      result: { subscription_uid: 'sub_uid', outcome: 'created', pending_plan_change: { id: 'spc_1', to_plan_uid: 'plan_pro' } },
    });
    (sdk.subscriptions as unknown as { client: { post: jest.Mock } }).client.post = post;

    const { result } = await sdk.subscriptions.changePlan('sub_uid', { plan_uid: 'plan_pro' });

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/sub_uid/plan-change', { plan_uid: 'plan_pro' });
    expect(result?.outcome).toBe('created');
    expect(result?.pending_plan_change.to_plan_uid).toBe('plan_pro');
  });

  test('cancelPlanChange DELETEs the pending change', async () => {
    const sdk = new InkressSDK(config);
    const del = jest.fn().mockResolvedValue({ state: 'ok', result: { subscription_uid: 'sub_uid', cancelled_plan_change: { id: 'spc_1' } } });
    (sdk.subscriptions as unknown as { client: { delete: jest.Mock } }).client.delete = del;

    const { result } = await sdk.subscriptions.cancelPlanChange('sub_uid');

    expect(del).toHaveBeenCalledWith('/billing_subscriptions/sub_uid/plan-change');
    expect(result?.cancelled_plan_change.id).toBe('spc_1');
  });
});
