import { InkressSDK } from '../index';

describe('SubscriptionsResource.createCardUpdateLink', () => {
  const config = {
    accessToken: 'test-token',
    mode: 'sandbox' as const,
    username: 'test-merchant',
  };

  test('POSTs to /billing_subscriptions/:uid/card-update-link and returns the minted link', async () => {
    const sdk = new InkressSDK(config);
    const mockResponse = {
      state: 'ok',
      result: {
        link: 'https://shop.example.com/subscriptions/update-card?token=abc123',
        token: 'abc123',
      },
    };
    const postMock = jest.fn().mockResolvedValue(mockResponse);
    (sdk.subscriptions as unknown as { client: { post: jest.Mock } }).client.post = postMock;

    const res = await sdk.subscriptions.createCardUpdateLink('sub_abc');

    expect(postMock).toHaveBeenCalledWith('/billing_subscriptions/sub_abc/card-update-link', {});
    expect(res.state).toBe('ok');
    expect(res.result?.link).toContain('/subscriptions/update-card?token=');
    expect(res.result?.token).toBe('abc123');
  });

  test('forwards an optional storefront_base override', async () => {
    const sdk = new InkressSDK(config);
    const postMock = jest.fn().mockResolvedValue({ state: 'ok', result: { link: 'x', token: 'y' } });
    (sdk.subscriptions as unknown as { client: { post: jest.Mock } }).client.post = postMock;

    await sdk.subscriptions.createCardUpdateLink('sub_abc', { storefront_base: 'https://shop.example.com' });

    expect(postMock).toHaveBeenCalledWith(
      '/billing_subscriptions/sub_abc/card-update-link',
      { storefront_base: 'https://shop.example.com' },
    );
  });
});
