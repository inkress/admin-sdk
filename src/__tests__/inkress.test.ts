import { InkressSDK } from '../index';

describe('InkressSDK', () => {
  const mockConfig = {
    accessToken: 'test-token',
    mode: 'sandbox' as const,
    username: 'test-merchant'
  };

  let inkress: InkressSDK;

  beforeEach(() => {
    inkress = new InkressSDK(mockConfig);
  });

  test('should initialize with config', () => {
    expect(inkress).toBeInstanceOf(InkressSDK);
    
    // Core resources
    expect(inkress.merchants).toBeDefined();
    expect(inkress.products).toBeDefined();
    expect(inkress.orders).toBeDefined();
    expect(inkress.users).toBeDefined();
    expect(inkress.categories).toBeDefined();
    
    // Billing resources
    expect(inkress.billingPlans).toBeDefined();
    expect(inkress.subscriptions).toBeDefined();
    expect(inkress.paymentLinks).toBeDefined();
    expect(inkress.paymentMethods).toBeDefined();
    
    // Financial resources
    expect(inkress.financialAccounts).toBeDefined();
    expect(inkress.financialRequests).toBeDefined();
    expect(inkress.transactionEntries).toBeDefined();
    expect(inkress.fees).toBeDefined();
    expect(inkress.currencies).toBeDefined();
    expect(inkress.exchangeRates).toBeDefined();
    
    // Identity resources
    expect(inkress.addresses).toBeDefined();
    expect(inkress.tokens).toBeDefined();
    expect(inkress.webhookUrls).toBeDefined();
    
    // Other resources
    expect(inkress.public).toBeDefined();
    expect(inkress.kyc).toBeDefined();
    expect(inkress.generics).toBeDefined();
  });
});
