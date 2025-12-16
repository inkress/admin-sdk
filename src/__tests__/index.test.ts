import { InkressSDK } from '../index';

describe('InkressSDK', () => {
  it('should initialize with config', () => {
    const sdk = new InkressSDK({
      bearerToken: 'test-token',
      clientId: 'm-test-merchant',
      endpoint: 'https://test.api.inkress.com',
      apiVersion: 'v1',
    });

    expect(sdk).toBeInstanceOf(InkressSDK);
    expect(sdk.merchants).toBeDefined();
    expect(sdk.orders).toBeDefined();
    expect(sdk.products).toBeDefined();
    expect(sdk.billingPlans).toBeDefined();
    expect(sdk.subscriptions).toBeDefined();
    expect(sdk.users).toBeDefined();
    expect(sdk.public).toBeDefined();
  });

  it('should allow updating configuration', () => {
    const sdk = new InkressSDK({
      accessToken: 'test-token',
    });

    sdk.updateConfig({
      username: 'new-merchant',
      mode: 'live',
    });

    const config = sdk.getConfig();
    expect(config.username).toBe('new-merchant');
    expect(config.mode).toBe('live');
    // accessToken should not be included in getConfig response
    expect('accessToken' in config).toBe(false);
  });
});
