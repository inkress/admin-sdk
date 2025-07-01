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

  it('should allow config updates', () => {
    const sdk = new InkressSDK({
      bearerToken: 'test-token',
    });

    sdk.updateConfig({
      clientId: 'm-new-merchant',
      endpoint: 'https://new.api.inkress.com',
    });

    const config = sdk.getConfig();
    expect(config.clientId).toBe('m-new-merchant');
    expect(config.endpoint).toBe('https://new.api.inkress.com');
    // bearerToken should not be included in getConfig response
    expect('bearerToken' in config).toBe(false);
  });
});
