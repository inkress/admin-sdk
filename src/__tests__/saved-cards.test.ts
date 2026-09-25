import { InkressSDK } from '../index';
import { InkressApiError } from '../client';
import type { SavedCard, SavedCardChargeOutcome } from '../resources/saved-cards';

type ClientStub = { client: { get: jest.Mock; post: jest.Mock; delete: jest.Mock } };

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'test-merchant' };

const card: SavedCard = {
  id: 7,
  brand: 'visa',
  last_4: '4242',
  exp_month: 12,
  exp_year: 2030,
  display: 'Visa ****4242',
  active: true,
  chargeable: true,
  owner_id: 99,
  inserted_at: '2026-09-23T00:00:00Z',
};

const client = (sdk: InkressSDK): ClientStub['client'] => (sdk.savedCards as unknown as ClientStub).client;

describe('SavedCardsResource', () => {
  test('list GETs /cards and surfaces pagination as page_info', async () => {
    const sdk = new InkressSDK(config);
    const pagination = { page: 1, page_size: 25, total_entries: 1, more: false };
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: { entries: [card], pagination } });
    client(sdk).get = get;

    const res = await sdk.savedCards.list();

    expect(get).toHaveBeenCalledWith('/cards', undefined);
    expect(res.result?.entries).toEqual([card]);
    expect(res.result?.page_info).toEqual(pagination);
  });

  test('list forwards page params', async () => {
    const sdk = new InkressSDK(config);
    const get = jest.fn().mockResolvedValue({
      state: 'ok',
      result: { entries: [], pagination: { page: 2, page_size: 10, total_entries: 0, more: false } },
    });
    client(sdk).get = get;

    await sdk.savedCards.list({ page: 2, page_size: 10 });

    expect(get).toHaveBeenCalledWith('/cards', { page: 2, page_size: 10 });
  });

  test('get GETs /cards/:id', async () => {
    const sdk = new InkressSDK(config);
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: card });
    client(sdk).get = get;

    const res = await sdk.savedCards.get(7);

    expect(get).toHaveBeenCalledWith('/cards/7');
    expect(res.result?.chargeable).toBe(true);
  });

  test('remove DELETEs /cards/:id and returns the disconnect result', async () => {
    const sdk = new InkressSDK(config);
    const del = jest.fn().mockResolvedValue({ state: 'ok', result: { id: 7, action: 'disconnected', active_subscriptions: 1 } });
    client(sdk).delete = del;

    const res = await sdk.savedCards.remove(7);

    expect(del).toHaveBeenCalledWith('/cards/7');
    expect(res.result).toEqual({ id: 7, action: 'disconnected', active_subscriptions: 1 });
  });

  const statusUrl = '/api/v1/cards/7/charges/order-981';

  const outcome = (status: SavedCardChargeOutcome['status'], extra: Partial<SavedCardChargeOutcome> = {}): SavedCardChargeOutcome => ({
    status,
    job_id: 55,
    reference: 'cardchg-1-7-order-981',
    order: null,
    failure_reason: null,
    ...extra,
  });

  test('charge POSTs the body and unwraps the flat 202 {status, job_id, status_url}', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ status: 'queued', job_id: 55, status_url: statusUrl });
    client(sdk).post = post;

    const res = await sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    expect(post).toHaveBeenCalledWith('/cards/7/charge', { amount: 100, currency: 'USD', idempotency_key: 'order-981' });
    expect(res).toEqual({ state: 'ok', result: { status: 'queued', job_id: 55, status_url: statusUrl } });
  });

  test('charge accepts a replayed key: the existing outcome, job_id possibly null', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).post = jest.fn().mockResolvedValue({ status: 'succeeded', job_id: null, status_url: statusUrl });

    const res = await sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    expect(res.result).toEqual({ status: 'succeeded', job_id: null, status_url: statusUrl });
  });

  test('charge rejects an unexpected body instead of pretending the charge was queued', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).post = jest.fn().mockResolvedValue({ state: 'ok', result: {} });

    await expect(sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: 'k' })).rejects.toBeInstanceOf(InkressApiError);
  });

  test('chargeStatus GETs /cards/:id/charges/:key (key URL-encoded) and returns the outcome', async () => {
    const sdk = new InkressSDK(config);
    const declined = outcome('declined', {
      order: { id: 901, total: 100, customer_total: 105.51, fee_total: 5.51, currency: 'USD', status: 2 },
    });
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: declined });
    client(sdk).get = get;

    const res = await sdk.savedCards.chargeStatus(7, 'order 981/a');

    expect(get).toHaveBeenCalledWith('/cards/7/charges/order%20981%2Fa');
    expect(res.result).toEqual(declined);
  });

  test('chargeStatus rejects an outcome with an unknown status', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: { ...outcome('queued'), status: 'weird' } });

    await expect(sdk.savedCards.chargeStatus(7, 'order-981')).rejects.toBeInstanceOf(InkressApiError);
  });

  test('waitForCharge polls with doubling backoff until a terminal status', async () => {
    const sdk = new InkressSDK(config);
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: outcome('queued') })
      .mockResolvedValueOnce({ state: 'ok', result: outcome('processing') })
      .mockResolvedValueOnce({ state: 'ok', result: outcome('succeeded') });
    client(sdk).get = get;
    const sleeps: number[] = [];

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async (ms) => { sleeps.push(ms); } });

    expect(final.status).toBe('succeeded');
    expect(get).toHaveBeenCalledTimes(3);
    expect(sleeps).toEqual([500, 1000]);
  });

  test('waitForCharge gives up after the attempt budget with an error carrying the last outcome', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome('processing') });

    await expect(
      sdk.savedCards.waitForCharge(7, 'order-981', { attempts: 3, sleep: async () => undefined }),
    ).rejects.toMatchObject({ name: 'InkressApiError', result: outcome('processing') });
  });

  // AMENDED R32 / D-3 (2026-09-25): these FAIL against the plan's original (unamended) code —
  // the original TERMINAL_STATUSES/CHARGE_STATUSES/FAILURE_REASONS lacked 'under_review' and
  // 'reconciliation_required' entirely, so chargeStatus would throw "Unexpected response" on a
  // legitimate under_review outcome (an exception the caller could misread as "safe to retry with
  // a new idempotency key" — exactly what must never happen for money that may be held) and
  // waitForCharge would never stop on it.
  test('AMENDED R32/D-3: waitForCharge RESOLVES (never throws) on under_review — money may be held', async () => {
    const sdk = new InkressSDK(config);
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: outcome('processing') })
      .mockResolvedValueOnce({ state: 'ok', result: outcome('under_review', { failure_reason: 'reconciliation_required' }) });
    client(sdk).get = get;

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async () => undefined });

    expect(final.status).toBe('under_review');
    expect(final.failure_reason).toBe('reconciliation_required');
    expect(get).toHaveBeenCalledTimes(2);
  });

  test('AMENDED R32/D-3: chargeStatus accepts reconciliation_required as a valid failure_reason', async () => {
    const sdk = new InkressSDK(config);
    const declined = outcome('failed', { failure_reason: 'reconciliation_required' });
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: declined });

    const res = await sdk.savedCards.chargeStatus(7, 'order-981');

    expect(res.result).toEqual(declined);
  });
});
