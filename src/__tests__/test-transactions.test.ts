import { InkressSDK, TEST_TRANSACTION_HEADER, isTestTransactionWebhook } from '../index';
import type {
  CheckoutSession,
  CreateCheckoutSessionResponseData,
  CreateOrderData,
  CreateOrderResponseData,
  CreatePaymentLinkData,
  InternalOrder,
  InternalPaymentLink,
  MerchantEventWebhook,
  Order,
  OrderFilterParams,
  PaymentLink,
  PaymentLinkFilterParams,
  UpdateOrderData,
  UpdatePaymentLinkData,
  WebhookEvent,
  WebhookPayload,
} from '../index';
import type { WebhookPayload as UtilsWebhookPayload } from '../utils/webhooks';

type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

describe('test transactions (INK-1591)', () => {
  test('read types, create inputs and webhook bodies carry test as a boolean', () => {
    const present: [
      HasKey<Order, 'test'>,
      HasKey<InternalOrder, 'test'>,
      HasKey<CreateOrderResponseData, 'test'>,
      HasKey<PaymentLink, 'test'>,
      HasKey<InternalPaymentLink, 'test'>,
      HasKey<CheckoutSession, 'test'>,
      HasKey<CreateCheckoutSessionResponseData, 'test'>,
      HasKey<WebhookEvent, 'test'>,
      HasKey<WebhookPayload, 'test'>,
      HasKey<UtilsWebhookPayload, 'test'>,
      HasKey<MerchantEventWebhook, 'test'>,
      HasKey<CreateOrderData, 'test'>,
      HasKey<CreatePaymentLinkData, 'test'>,
    ] = [true, true, true, true, true, true, true, true, true, true, true, true, true];
    // @ts-expect-error test is a boolean
    const notBoolean: Pick<Order, 'test'> = { test: 'yes' };
    expect(present.every(Boolean)).toBe(true);
    expect(notBoolean).toBeDefined();
  });

  test('updates can never carry test', () => {
    const absent: [HasKey<UpdateOrderData, 'test'>, HasKey<UpdatePaymentLinkData, 'test'>] = [false, false];
    expect(absent).toEqual([false, false]);
  });

  test('list filters type include_test and test as booleans', () => {
    const orders: OrderFilterParams = { include_test: true, test: false };
    const links: PaymentLinkFilterParams = { include_test: true };
    // @ts-expect-error include_test is a boolean, not a string
    const bad: OrderFilterParams = { include_test: 'yes' };
    expect([orders, links, bad]).toHaveLength(3);
  });

  test('orders.list sends include_test=true and create sends test: true', async () => {
    const sdk = new InkressSDK({ accessToken: 'test-token', mode: 'sandbox', username: 'fleeksite' });
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: { entries: [], pagination: {} } });
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: {} });
    Object.assign((sdk.orders as unknown as { client: object }).client, { get, post });
    await sdk.orders.list({ include_test: true });
    expect(get).toHaveBeenLastCalledWith('/orders', { include_test: true });
    const data: CreateOrderData = {
      reference_id: 'r1',
      total: 10,
      kind: 'online',
      customer: { email: 'a@b.co' } as CreateOrderData['customer'],
      test: true,
    };
    await sdk.orders.create(data);
    expect(post).toHaveBeenLastCalledWith('/orders', expect.objectContaining({ test: true }));
  });
});

describe('test-transaction webhook header (INK-1591)', () => {
  test('the test-transaction header is read exactly', () => {
    expect(TEST_TRANSACTION_HEADER).toBe('X-Inkress-Test-Transaction');
    expect(isTestTransactionWebhook({ headers: { 'x-inkress-test-transaction': 'true' } })).toBe(true);
    expect(isTestTransactionWebhook({ headers: { 'X-Inkress-Test-Transaction': 'true' } })).toBe(true);
    for (const value of ['TRUE', '1', 'false', '', undefined, ['true']]) {
      expect(isTestTransactionWebhook({ headers: { 'x-inkress-test-transaction': value } })).toBe(false);
    }
    expect(isTestTransactionWebhook({ headers: {} })).toBe(false);
  });
});
