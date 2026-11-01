import { createHmac } from 'crypto';
import { InkressSDK, BUSINESS_CLOSED_CODE } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };
type HttpMock = { post: jest.Mock; get: jest.Mock; put: jest.Mock; delete: jest.Mock };

function mockClient(resource: unknown, mocks: Partial<HttpMock>): void {
  Object.assign((resource as { client: HttpMock }).client, mocks);
}

const ok = (result: unknown) => jest.fn().mockResolvedValue({ state: 'ok', result });

describe('webhook delivery log, test events and replays (INK-1118)', () => {
  const delivery = { id: 9, webhook_url_id: 4, event: 'orders.paid', state: 'delivered', is_test: true, replay_of_id: null };

  test('test events, preview and send hit the webhook_urls routes', async () => {
    const sdk = new InkressSDK(config);
    const get = ok({ events: [{ event: 'orders.paid', family: 'orders', sources: ['sample', 'order'] }], order_statuses: ['paid'], subscription_statuses: [] });
    const post = ok(delivery);
    mockClient(sdk.webhookUrls, { get, post });

    const events = await sdk.webhookUrls.testEvents();
    expect(get).toHaveBeenCalledWith('/webhook_urls/test-events');
    expect(events.result?.events[0]?.sources).toContain('order');

    const body = { event: 'orders.paid', source: 'order' as const, subject_id: 77 };
    await sdk.webhookUrls.previewTest(4, body);
    expect(post).toHaveBeenLastCalledWith('/webhook_urls/4/test/preview', body);

    const sent = await sdk.webhookUrls.sendTest(4, { event: 'orders.paid' });
    expect(post).toHaveBeenLastCalledWith('/webhook_urls/4/test', { event: 'orders.paid' });
    expect(sent.result?.is_test).toBe(true);
  });

  test('deliveries list, get and replay', async () => {
    const sdk = new InkressSDK(config);
    const get = ok({ entries: [delivery], pagination: { page: 1, page_size: 25, total_entries: 1, total_pages: 1, more: false } });
    const post = ok({ ...delivery, id: 10, replay_of_id: 9 });
    mockClient(sdk.webhookDeliveries, { get, post });

    const page = await sdk.webhookDeliveries.list({ webhook_url_id: 4, state: 'failed', page_size: 50 });
    expect(get).toHaveBeenLastCalledWith('/webhook_deliveries', { webhook_url_id: 4, state: 'failed', page_size: 50 });
    expect(page.result?.pagination.total_entries).toBe(1);

    await sdk.webhookDeliveries.get(9);
    expect(get).toHaveBeenLastCalledWith('/webhook_deliveries/9');

    const replay = await sdk.webhookDeliveries.replay(9);
    expect(post).toHaveBeenCalledWith('/webhook_deliveries/9/replay');
    expect(replay.result?.replay_of_id).toBe(9);
  });
});

describe('app.disconnected (INK-1522)', () => {
  const secret = 'whsec_test';
  const body = JSON.stringify({
    id: 'evt_abc',
    type: 'app.disconnected',
    created_at: '2026-10-24T20:00:00Z',
    data: { merchant: { id: 320, username: 'old-shop' }, app: { client_id: 'inkid_x' }, reason: 'business_merged', merged_into: { id: 321, username: 'kept-shop' } },
    jwt: 'header.payload.sig',
  });
  const sign = (b: string, s: string) => createHmac('sha256', s).update(b).digest('base64');

  test('verifies the signature and returns the typed body', async () => {
    const sdk = new InkressSDK(config);
    const event = await sdk.webhookUrls.verifyAppDisconnected(
      { headers: { 'x-inkress-webhook-signature': sign(body, secret) }, body },
      secret,
    );
    expect(event.data.reason).toBe('business_merged');
    expect(event.data.merged_into?.username).toBe('kept-shop');
  });

  test('refuses a wrong signature, a parsed body and another event', async () => {
    const sdk = new InkressSDK(config);
    await expect(
      sdk.webhookUrls.verifyAppDisconnected({ headers: { 'x-inkress-webhook-signature': sign(body, 'whsec_other') }, body }, secret),
    ).rejects.toThrow('signature does not match');
    await expect(
      sdk.webhookUrls.verifyAppDisconnected({ headers: { 'x-inkress-webhook-signature': sign(body, secret) }, body: JSON.parse(body) }, secret),
    ).rejects.toThrow('raw request body');
    const other = JSON.stringify({ id: 'evt_1', type: 'orders.paid', data: {} });
    await expect(
      sdk.webhookUrls.verifyAppDisconnected({ headers: { 'x-inkress-webhook-signature': sign(other, secret) }, body: other }, secret),
    ).rejects.toThrow('Not an app.disconnected webhook');
  });
});

describe('partner activation (INK-760, INK-1512, INK-1532)', () => {
  test('each call goes to its partner-activation route', async () => {
    const sdk = new InkressSDK(config);
    const post = ok({ state: 'active', keys: { public_key: 'pk_live_x', secret_key: 's', api_secret_key: 'sk_live_y' } });
    const get = ok({ merchant: { id: 1 }, contact: { email: true, phone: false } });
    mockClient(sdk.partnerActivation, { post, get });

    const activate = { reference: 'co-13', merchant: { name: 'Shop', email: 'a@b.test' }, owner: { email: 'a@b.test', first_name: 'A' } };
    const res = await sdk.partnerActivation.activate(activate);
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation', activate);
    expect(res.result?.keys?.api_secret_key).toBe('sk_live_y');

    await sdk.partnerActivation.status('co 13');
    expect(get).toHaveBeenLastCalledWith('/merchants/partner-activation/co%2013');

    await sdk.partnerActivation.verifyLink('co-13');
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation/verify-link', { reference: 'co-13' });

    await sdk.partnerActivation.dashboardLink('co-13');
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation/dashboard-link', { reference: 'co-13', to: 'payouts' });

    await sdk.partnerActivation.disconnect({ reference: 'co-13', webhook_url: 'https://cp.test/hook' });
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation/disconnect', { reference: 'co-13', webhook_url: 'https://cp.test/hook' });

    await sdk.partnerActivation.connect({ reference: 'co-13', access_token: 'inka_t' });
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation/connect', { reference: 'co-13', access_token: 'inka_t' });

    await sdk.partnerActivation.keys('co-13');
    expect(post).toHaveBeenLastCalledWith('/merchants/partner-activation/keys', { reference: 'co-13' });
  });
});

describe('orders: moves and custom lines (INK-1079, INK-1307, INK-1513)', () => {
  test('moves POST to the order-status routes with the ref encoded', async () => {
    const sdk = new InkressSDK(config);
    const post = ok({ id: 5, uid: 'u', status: 5, status_name: 'paid' });
    mockClient(sdk.orders, { post });

    await sdk.orders.recordPayment('cardchg-1/2', { tender_type: 'bank_transfer', reference: 'TT-9' });
    expect(post).toHaveBeenLastCalledWith('/orders/cardchg-1%2F2/payment', { tender_type: 'bank_transfer', reference: 'TT-9' });

    await sdk.orders.fulfil(5, { status: 'shipped' });
    expect(post).toHaveBeenLastCalledWith('/orders/5/fulfilment', { status: 'shipped' });

    await sdk.orders.declinePayment(5);
    expect(post).toHaveBeenLastCalledWith('/orders/5/payment/decline', {});

    await sdk.orders.cancel(5, { reason: 'Customer changed their mind' });
    expect(post).toHaveBeenLastCalledWith('/orders/5/cancel', { reason: 'Customer changed their mind' });
  });

  test('create sends custom items unchanged', async () => {
    const sdk = new InkressSDK(config);
    const post = ok({ id: 1 });
    mockClient(sdk.orders, { post });
    const items = [{ title: 'Freight', unit_price: 1200 }, { title: 'Customs', unit_price: 450.5, quantity: 1 }];

    await sdk.orders.create({ reference_id: 'pkg-1', total: 1650.5, kind: 'online', customer: { email: 'c@d.test' } as never, items });
    expect(post.mock.calls[0][1].items).toEqual(items);
  });

  test('the closed-business code is exported', () => {
    expect(BUSINESS_CLOSED_CODE).toBe('business_closed');
  });
});

describe('bookings with products (INK-1483)', () => {
  test('create and update pass items through', async () => {
    const sdk = new InkressSDK(config);
    const post = ok({ id: 42, items: [{ product_id: 7, title: 'Cut', quantity: 1, options: [], unit_price: 5000, total: 5000, currency_code: 'JMD' }] });
    const put = ok({ id: 42, items: [] });
    mockClient(sdk.bookings, { post, put });

    const items = [{ product_id: 7, quantity: 1, options: { Length: 'Long' } }];
    const res = await sdk.bookings.create({ start_time: 's', end_time: 'e', items });
    expect(post).toHaveBeenCalledWith('/bookings', { start_time: 's', end_time: 'e', items });
    expect(res.result?.items?.[0]?.total).toBe(5000);

    await sdk.bookings.update(42, { items: [] });
    expect(put).toHaveBeenCalledWith('/bookings/42', { items: [] });
  });
});

describe('subscriptions: plan owner cancel (INK-1306)', () => {
  test('cancelAsOwner POSTs the timing; the code-based cancel is unchanged', async () => {
    const sdk = new InkressSDK(config);
    const post = ok({ subscription_uid: 'sub_1', status: 'canceling', canceled_at: null, ends_at: '2026-12-01T00:00:00Z' });
    mockClient(sdk.subscriptions, { post });

    const res = await sdk.subscriptions.cancelAsOwner('sub_1', { at: 'period_end' });
    expect(post).toHaveBeenLastCalledWith('/billing_subscriptions/sub_1/cancel', { at: 'period_end' });
    expect(res.result?.status).toBe('canceling');

    await sdk.subscriptions.cancelAsOwner('sub_1');
    expect(post).toHaveBeenLastCalledWith('/billing_subscriptions/sub_1/cancel', {});

    await sdk.subscriptions.cancel(12, 'abc');
    expect(post).toHaveBeenLastCalledWith('/billing_subscriptions/12/cancel/abc');
  });
});

describe('merged businesses (INK-1521)', () => {
  test('GETs /merged-businesses', async () => {
    const sdk = new InkressSDK(config);
    const get = ok([{ id: 320, name: 'Old Shop' }]);
    mockClient(sdk.merchants, { get });

    const res = await sdk.merchants.mergedBusinesses();
    expect(get).toHaveBeenCalledWith('/merged-businesses');
    expect(res.result?.[0]?.name).toBe('Old Shop');
  });
});
