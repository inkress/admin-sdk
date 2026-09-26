import { InkressSDK } from '../index';
import { InkressApiError } from '../client';
import {
  SavedCardChargeInProgressError,
  SavedCardChargeRefusedError,
  SavedCardChargePendingError,
  SavedCardAlreadyRemovedError,
} from '../resources/saved-cards';
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

  // M-A5 / shared decision: a 404 on a FIRST attempt (no prior transient failure) is a genuine
  // not-found - never wrapped, never silently swallowed.
  test('remove leaves a first-attempt 404 as the plain InkressApiError', async () => {
    const sdk = new InkressSDK(config);
    const notFound = new InkressApiError('HTTP 404', 404, { state: 'error', data: { result: 'Not Found' }, result: 'Not Found' });
    client(sdk).delete = jest.fn().mockRejectedValue(notFound);

    const promise = sdk.savedCards.remove(7);

    await expect(promise).rejects.toBe(notFound);
    await expect(promise).rejects.not.toBeInstanceOf(SavedCardAlreadyRemovedError);
  });

  // M-A5: the SDK's OWN retry of remove(), after the first attempt's response was lost to a
  // transient failure (status 0 here - a network/timeout error), later sees 404 - the card was
  // already disconnected by the first attempt (DISCONNECT drops it out of every scoped query), so
  // this must be reported as already-removed rather than a generic not-found.
  test('remove retries once after a transient failure, and reports a retry 404 as already-removed', async () => {
    const sdk = new InkressSDK(config);
    const transient = new InkressApiError('fetch failed', 0, { error: new Error('fetch failed') });
    const notFound = new InkressApiError('HTTP 404', 404, { state: 'error', data: { result: 'Not Found' }, result: 'Not Found' });
    const del = jest.fn().mockRejectedValueOnce(transient).mockRejectedValueOnce(notFound);
    client(sdk).delete = del;

    const promise = sdk.savedCards.remove(7);

    await expect(promise).rejects.toBeInstanceOf(SavedCardAlreadyRemovedError);
    await expect(promise).rejects.toBeInstanceOf(InkressApiError);
    await expect(promise).rejects.toMatchObject({ id: 7, status: 404 });
    expect(del).toHaveBeenCalledTimes(2);
  });

  // A transient failure followed by an actual success is just... a success. The retry isn't only
  // for the already-removed case.
  test('remove retries once after a transient failure and returns the result when the retry succeeds', async () => {
    const sdk = new InkressSDK(config);
    const transient = new InkressApiError('fetch failed', 0, { error: new Error('fetch failed') });
    const del = jest
      .fn()
      .mockRejectedValueOnce(transient)
      .mockResolvedValueOnce({ state: 'ok', result: { id: 7, action: 'disconnected', active_subscriptions: 0 } });
    client(sdk).delete = del;

    const res = await sdk.savedCards.remove(7);

    expect(res.result).toEqual({ id: 7, action: 'disconnected', active_subscriptions: 0 });
    expect(del).toHaveBeenCalledTimes(2);
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

    await expect(sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: 'k-valid-key' })).rejects.toBeInstanceOf(
      InkressApiError,
    );
  });

  // Fix round 1, item 3 (INFO -> do it): a same-key-same-payload replay's 202 body is the superset
  // ChargeOutcome.to_json/1 shape (reference/order/failure_reason alongside status/job_id/status_url)
  // - charge() must pass those through instead of narrowing them away.
  //
  // M-A4 (final-review fix): the server's classify/2 NEVER pairs status `declined` with a
  // failure_reason (every :declined clause returns {:declined, nil} - only :failed / :under_review
  // carry one). This fixture now uses a pairing the server can actually produce: :failed +
  // :not_authorized (map_cancel_tag(:not_owner) -> :not_authorized, paired with {:failed, ...}).
  test('charge passes through reference/order/failure_reason when the server includes them on a replay', async () => {
    const sdk = new InkressSDK(config);
    const failedOrder = { id: 901, total: 100, customer_total: 105.51, fee_total: 5.51, currency: 'USD', status: 2 };
    client(sdk).post = jest.fn().mockResolvedValue({
      status: 'failed',
      job_id: 55,
      status_url: statusUrl,
      reference: 'cardchg-1-7-order-981',
      order: failedOrder,
      failure_reason: 'not_authorized',
    });

    const res = await sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    expect(res.result).toEqual({
      status: 'failed',
      job_id: 55,
      status_url: statusUrl,
      reference: 'cardchg-1-7-order-981',
      order: failedOrder,
      failure_reason: 'not_authorized',
    });
  });

  test('charge omits reference/order/failure_reason on a fresh enqueue (never present on that wire body)', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).post = jest.fn().mockResolvedValue({ status: 'queued', job_id: 55, status_url: statusUrl });

    const res = await sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    expect(res.result).toEqual({ status: 'queued', job_id: 55, status_url: statusUrl });
    expect(res.result).not.toHaveProperty('reference');
    expect(res.result).not.toHaveProperty('order');
    expect(res.result).not.toHaveProperty('failure_reason');
  });

  // Fix round 1, item 1 (MEDIUM): the server's two 409s are NOT the same situation -
  // idempotency_key_reuse_with_different_payload is a real payload conflict (stays a plain
  // InkressApiError); request_in_progress is a genuine in-flight race the caller must poll through,
  // never retry with a new key. They must be distinguishable without string-matching by hand.
  test('charge maps 409 request_in_progress to SavedCardChargeInProgressError', async () => {
    const sdk = new InkressSDK(config);
    const conflictBody = {
      state: 'error',
      result: { reason: 'request_in_progress', description: 'An earlier request with this idempotency key is still in flight.', status: 409 },
    };
    client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 409', 409, conflictBody));

    const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargeInProgressError);
    await expect(promise).rejects.toBeInstanceOf(InkressApiError);
    await expect(promise).rejects.toMatchObject({ status: 409, result: conflictBody });
  });

  test('charge leaves 409 idempotency_key_reuse_with_different_payload as the original InkressApiError', async () => {
    const sdk = new InkressSDK(config);
    const conflictBody = {
      state: 'error',
      result: {
        reason: 'idempotency_key_reuse_with_different_payload',
        description: 'This idempotency key was already used for a different charge (account, amount, currency or description).',
        status: 409,
      },
    };
    const rejection = new InkressApiError('HTTP 409', 409, conflictBody);
    client(sdk).post = jest.fn().mockRejectedValue(rejection);

    const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    await expect(promise).rejects.toBe(rejection);
    await expect(promise).rejects.not.toBeInstanceOf(SavedCardChargeInProgressError);
  });

  // I-A1 (Important, final-review fix): the four 422 refusals charge_or_reuse/3 can answer, each
  // typed with its own `reason` instead of forcing a caller to string-match `error.result.result`
  // (which is where the message actually lives - `error.message` is always the generic "HTTP 422").
  describe('charge 422 refusals (I-A1)', () => {
    const body422 = (message: string) => ({ state: 'error', data: { result: message }, result: message });

    test('fee_consent_missing', async () => {
      const sdk = new InkressSDK(config);
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422('fee_consent_missing')));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'fee_consent_missing', detail: 'fee_consent_missing', status: 422 });
    });

    test('merchant_not_verified (prefix match, detail keeps the full text)', async () => {
      const sdk = new InkressSDK(config);
      const message = 'merchant_not_verified: account must be identity-verified to process payments';
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422(message)));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'merchant_not_verified', detail: message });
    });

    test('merchant_incomplete_profile (prefix match)', async () => {
      const sdk = new InkressSDK(config);
      const message = 'merchant_incomplete_profile: phone and logo';
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422(message)));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'merchant_incomplete_profile', detail: message });
    });

    test('Merchant not found (exact match, capitalised - MerchantGate.check/1\'s own text)', async () => {
      const sdk = new InkressSDK(config);
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422('Merchant not found')));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'merchant_not_found' });
    });

    test('a plain validation message falls back to unknown (never invalid_request)', async () => {
      const sdk = new InkressSDK(config);
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422('amount must be greater than 0')));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'unknown', detail: 'amount must be greater than 0' });
    });

    // Round 2 (final-review re-review, Minor #1): an unrecognised 422 - e.g. a FUTURE merchant
    // gate this SDK doesn't know about yet, not just a validation message - must map to the
    // explicit 'unknown' reason, never be mislabelled 'invalid_request' (which would wrongly tell
    // the caller "fix your request" for something that might not be their fault at all). The
    // server's exact text still survives on `detail` either way.
    test('an unrecognised future merchant-gate message maps to unknown, keeping the server text on detail', async () => {
      const sdk = new InkressSDK(config);
      const message = 'merchant_suspended: a brand-new gate this SDK does not recognise yet';
      client(sdk).post = jest.fn().mockRejectedValue(new InkressApiError('HTTP 422', 422, body422(message)));

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
      await expect(promise).rejects.toMatchObject({ reason: 'unknown', detail: message });
    });

    test('an unrecognised 422 body shape is left as a plain InkressApiError, never fabricated', async () => {
      const sdk = new InkressSDK(config);
      const rejection = new InkressApiError('HTTP 422', 422, { weird: true });
      client(sdk).post = jest.fn().mockRejectedValue(rejection);

      const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

      await expect(promise).rejects.toBe(rejection);
      await expect(promise).rejects.not.toBeInstanceOf(SavedCardChargeRefusedError);
    });
  });

  // M-A3 (final-review fix): the key is now validated client-side before any network call - a key
  // outside 8-200 bytes, or containing a space/control character, must never reach `post`/`get`.
  describe('idempotency_key client-side validation (M-A3)', () => {
    test('charge throws before POSTing when the key is too short', async () => {
      const sdk = new InkressSDK(config);
      const post = jest.fn();
      client(sdk).post = post;

      await expect(sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: 'short' })).rejects.toThrow(/8 to 200/);
      expect(post).not.toHaveBeenCalled();
    });

    test('charge throws before POSTing when the key is too long', async () => {
      const sdk = new InkressSDK(config);
      const post = jest.fn();
      client(sdk).post = post;

      await expect(
        sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: 'x'.repeat(201) }),
      ).rejects.toThrow(/8 to 200/);
      expect(post).not.toHaveBeenCalled();
    });

    test('charge throws before POSTing when the key contains a space', async () => {
      const sdk = new InkressSDK(config);
      const post = jest.fn();
      client(sdk).post = post;

      await expect(
        sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: 'order 981 a' }),
      ).rejects.toThrow(/printable-ASCII/);
      expect(post).not.toHaveBeenCalled();
    });

    test('chargeStatus throws before GETting for the same invalid key', async () => {
      const sdk = new InkressSDK(config);
      const get = jest.fn();
      client(sdk).get = get;

      await expect(sdk.savedCards.chargeStatus(7, 'short')).rejects.toThrow(/8 to 200/);
      expect(get).not.toHaveBeenCalled();
    });

    test('charge trims the key before sending it', async () => {
      const sdk = new InkressSDK(config);
      const post = jest.fn().mockResolvedValue({ status: 'queued', job_id: 55, status_url: statusUrl });
      client(sdk).post = post;

      await sdk.savedCards.charge(7, { amount: 1, currency: 'USD', idempotency_key: '  order-981  ' });

      expect(post).toHaveBeenCalledWith('/cards/7/charge', { amount: 1, currency: 'USD', idempotency_key: 'order-981' });
    });
  });

  // AMENDED per M-A3: 'order 981/a' contains a space, which the real server (ascii_printable?/1,
  // 0x21-0x7E excludes 0x20) would 422 on - this fixture now uses a key the server actually
  // accepts while still exercising URL-encoding of a non-alphanumeric character (the slash).
  test('chargeStatus GETs /cards/:id/charges/:key (key URL-encoded) and returns the outcome', async () => {
    const sdk = new InkressSDK(config);
    const declined = outcome('declined', {
      order: { id: 901, total: 100, customer_total: 105.51, fee_total: 5.51, currency: 'USD', status: 2 },
    });
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: declined });
    client(sdk).get = get;

    const res = await sdk.savedCards.chargeStatus(7, 'order-981/a');

    expect(get).toHaveBeenCalledWith('/cards/7/charges/order-981%2Fa');
    expect(res.result).toEqual(declined);
  });

  // M-A1 (final-review fix): the server's own currency_code/1 can resolve to nil (see
  // charge_outcome.ex's moduledoc "Currency" section) even though @type order_summary claims
  // `currency: String.t()` - a charge that may have SUCCEEDED must never be thrown away over a
  // missing display field.
  test('chargeStatus accepts a null order.currency instead of throwing on a possibly-succeeded charge', async () => {
    const sdk = new InkressSDK(config);
    const succeeded = outcome('succeeded', {
      order: { id: 901, total: 100, customer_total: 100, fee_total: 0, currency: null, status: 5 },
    });
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: succeeded });

    const res = await sdk.savedCards.chargeStatus(7, 'order-981');

    expect(res.result?.order?.currency).toBeNull();
  });

  test('chargeStatus rejects an outcome with an unknown status', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: { ...outcome('queued'), status: 'weird' } });

    await expect(sdk.savedCards.chargeStatus(7, 'order-981')).rejects.toBeInstanceOf(InkressApiError);
  });

  // M-A2 / shared decision (forward compatibility): failure_reason is DESCRIPTIVE, not the
  // money-safety field - an unrecognised member must resolve, never throw.
  test('chargeStatus accepts an unrecognised failure_reason instead of throwing (forward compatibility)', async () => {
    const sdk = new InkressSDK(config);
    const held = outcome('failed', { failure_reason: 'a_brand_new_reason_from_next_weeks_deploy' });
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: held });

    const res = await sdk.savedCards.chargeStatus(7, 'order-981');

    expect(res.result).toEqual(held);
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

  // Round 2 (final-review re-review, Minor #2): only 'succeeded' and 'under_review' were pinned
  // resolving waitForCharge end-to-end; 'declined' and 'failed' share the exact same
  // RESOLVED_STATUSES-inclusion check, but were never actually exercised through the wait loop.
  test.each(['declined', 'failed'] as const)('waitForCharge resolves directly on %s', async (status) => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome(status) });

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async () => undefined });

    expect(final.status).toBe(status);
  });

  // I-A2 (Important, final-review fix): budget exhaustion now throws the TYPED pending error, not
  // a bare InkressApiError - carrying the idempotency key so the SAME-key guidance is actionable,
  // not just textual.
  test('waitForCharge gives up after the attempt budget with a typed pending error carrying the last outcome', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome('processing') });

    const promise = sdk.savedCards.waitForCharge(7, 'order-981', { attempts: 3, sleep: async () => undefined });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargePendingError);
    await expect(promise).rejects.toBeInstanceOf(InkressApiError);
    await expect(promise).rejects.toMatchObject({ idempotencyKey: 'order-981', outcome: outcome('processing') });
  });

  // I-A2: a still-pending charge must be distinguishable from a transport failure - and a single
  // transient blip (status 0, exactly what a network/timeout error surfaces as) must never abort
  // the wait. This is the literal review probe P5 scenario, now fixed.
  test('waitForCharge treats a transient poll failure as a missed poll, not a fatal error', async () => {
    const sdk = new InkressSDK(config);
    const transient = new InkressApiError('fetch failed', 0, { error: new Error('fetch failed') });
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: outcome('processing') })
      .mockRejectedValueOnce(transient)
      .mockResolvedValueOnce({ state: 'ok', result: outcome('succeeded') });
    client(sdk).get = get;

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async () => undefined });

    expect(final.status).toBe('succeeded');
    expect(get).toHaveBeenCalledTimes(3);
  });

  // A 5xx from the status endpoint is transient for the same reason a status-0 transport error
  // is: the client can't tell whether the server actually decided anything.
  test('waitForCharge treats a 5xx poll failure as a missed poll too', async () => {
    const sdk = new InkressSDK(config);
    const serverError = new InkressApiError('HTTP 503', 503, { result: 'Service Unavailable' });
    const get = jest
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({ state: 'ok', result: outcome('succeeded') });
    client(sdk).get = get;

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async () => undefined });

    expect(final.status).toBe('succeeded');
    expect(get).toHaveBeenCalledTimes(2);
  });

  // A non-transient error (404 - wrong id/key entirely) is a real refusal, not a missed poll - it
  // must abort the wait immediately rather than being retried to exhaustion.
  test('waitForCharge does not retry a non-transient error (404) - it aborts immediately', async () => {
    const sdk = new InkressSDK(config);
    const notFound = new InkressApiError('HTTP 404', 404, { result: 'Not Found' });
    const get = jest.fn().mockRejectedValue(notFound);
    client(sdk).get = get;

    const promise = sdk.savedCards.waitForCharge(7, 'order-981', { attempts: 5, sleep: async () => undefined });

    await expect(promise).rejects.toBe(notFound);
    expect(get).toHaveBeenCalledTimes(1);
  });

  // Pins the ruling (R32/D-4): the DEFAULT budget must sum to >= 60s. 500+1000+2000+4000+7*8000.
  test('waitForCharge default budget sums to 63500ms (>= the 60s ruling) with an 8000ms cap', async () => {
    const sdk = new InkressSDK(config);
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: outcome('processing') });
    const sleeps: number[] = [];

    await expect(
      sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async (ms) => { sleeps.push(ms); } }),
    ).rejects.toBeInstanceOf(SavedCardChargePendingError);

    expect(sleeps).toEqual([500, 1000, 2000, 4000, 8000, 8000, 8000, 8000, 8000, 8000, 8000]);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBe(63500);
    expect(Math.max(...sleeps)).toBe(8000);
  });

  // M-A7 (final-review fix): attempts <= 0 used to report "still unknown after 0 polls" without
  // ever polling. Validated up front now.
  describe('waitForCharge option validation (M-A7)', () => {
    test('attempts <= 0 throws before polling', async () => {
      const sdk = new InkressSDK(config);
      const get = jest.fn();
      client(sdk).get = get;

      await expect(sdk.savedCards.waitForCharge(7, 'order-981', { attempts: 0 })).rejects.toThrow(/attempts/);
      expect(get).not.toHaveBeenCalled();
    });

    test('a non-positive initialDelayMs throws before polling', async () => {
      const sdk = new InkressSDK(config);
      const get = jest.fn();
      client(sdk).get = get;

      await expect(sdk.savedCards.waitForCharge(7, 'order-981', { initialDelayMs: 0 })).rejects.toThrow(/initialDelayMs/);
      expect(get).not.toHaveBeenCalled();
    });

    test('a non-positive maxDelayMs throws before polling', async () => {
      const sdk = new InkressSDK(config);
      const get = jest.fn();
      client(sdk).get = get;

      await expect(sdk.savedCards.waitForCharge(7, 'order-981', { maxDelayMs: -1 })).rejects.toThrow(/maxDelayMs/);
      expect(get).not.toHaveBeenCalled();
    });
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

  // M-A4 (final-review fix): the original fixture paired status `failed` with
  // `reconciliation_required`, a combination `classify/2` never produces (that reason only ever
  // accompanies `:under_review` - see charge_outcome.ex's classify/2, the `"cancelled"` clause).
  // Exercises chargeStatus directly (not via the waitForCharge loop above) with the pairing the
  // server actually sends.
  test('AMENDED R32/D-3: chargeStatus accepts under_review + reconciliation_required directly', async () => {
    const sdk = new InkressSDK(config);
    const held = outcome('under_review', { failure_reason: 'reconciliation_required' });
    client(sdk).get = jest.fn().mockResolvedValue({ state: 'ok', result: held });

    const res = await sdk.savedCards.chargeStatus(7, 'order-981');

    expect(res.result).toEqual(held);
  });
});
