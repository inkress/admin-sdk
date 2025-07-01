import { InkressSDK } from '../index';

describe('InkressSDK', () => {
  const mockConfig = {
    bearerToken: 'test-token',
    endpoint: 'https://api-test.inkress.com',
    clientId: 'test-client-id'
  };

  let inkress: InkressSDK;

  beforeEach(() => {
    inkress = new InkressSDK(mockConfig);
  });

  test('should initialize with config', () => {
    expect(inkress).toBeInstanceOf(InkressSDK);
    expect(inkress.merchants).toBeDefined();
    expect(inkress.products).toBeDefined();
    expect(inkress.orders).toBeDefined();
    expect(inkress.payments).toBeDefined();
    expect(inkress.customers).toBeDefined();
    expect(inkress.subscriptions).toBeDefined();
    expect(inkress.users).toBeDefined();
    expect(inkress.tokens).toBeDefined();
    expect(inkress.webhooks).toBeDefined();
    expect(inkress.analytics).toBeDefined();
    expect(inkress.settlements).toBeDefined();
    expect(inkress.rates).toBeDefined();
  });

  test('should provide access to HTTP client', () => {
    const client = inkress.getHttpClient();
    expect(client).toBeDefined();
  });

  test('should throw error without bearer token', () => {
    expect(() => {
      new InkressSDK({ bearerToken: '' });
    }).toThrow('Bearer token is required');
  });
});
