import { InkressSDK } from '../index';
import { InkressApiError } from '../client';
import {
  SavedCardChargeInProgressError,
  SavedCardChargeRefusedError,
  SavedCardChargePendingError,
  SavedCardAlreadyRemovedError,
} from '../resources/saved-cards';

/**
 * Fetch-level tests (M-A4, final-review fix): every test in saved-cards.test.ts stubs
 * `client.get`/`post`/`delete` directly, which never proves the HttpClient's own error-body
 * placement (`error.result` vs `error.message`) is what the resource code actually reads - the
 * final review's probes P1/P2/P5 found exactly that gap. These drive the REAL HttpClient with a
 * mocked `global.fetch` (the repo's own `list-pagination.test.ts` pattern); response bodies are
 * copied byte-for-byte from `card_controller.ex`'s own branches.
 */

function jsonResponse(status: number, body: unknown): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

describe('SavedCardsResource over the real HTTP layer', () => {
  const sdk = new InkressSDK({ accessToken: 't', mode: 'sandbox', username: 'inkress' });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('charge() unwraps a real 202 flat body', async () => {
    global.fetch = jest.fn(() =>
      jsonResponse(202, { status: 'queued', job_id: 91, status_url: '/api/v1/cards/7/charges/order-981' }),
    ) as unknown as typeof fetch;

    const res = await sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    expect(res.result).toEqual({ status: 'queued', job_id: 91, status_url: '/api/v1/cards/7/charges/order-981' });
  });

  it('charge() maps a real 409 request_in_progress body to SavedCardChargeInProgressError', async () => {
    global.fetch = jest.fn(() =>
      jsonResponse(409, {
        state: 'error',
        result: {
          reason: 'request_in_progress',
          description: 'An earlier request with this idempotency key is still in flight.',
          status: 409,
        },
      }),
    ) as unknown as typeof fetch;

    const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargeInProgressError);
  });

  it('charge() maps a real 422 fee_consent_missing body to SavedCardChargeRefusedError', async () => {
    global.fetch = jest.fn(() =>
      jsonResponse(422, { state: 'error', data: { result: 'fee_consent_missing' }, result: 'fee_consent_missing' }),
    ) as unknown as typeof fetch;

    const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
    await expect(promise).rejects.toMatchObject({ reason: 'fee_consent_missing', status: 422 });
  });

  it('charge() maps a real 422 merchant_not_verified body to SavedCardChargeRefusedError', async () => {
    const message = 'merchant_not_verified: account must be identity-verified to process payments';
    global.fetch = jest.fn(() =>
      jsonResponse(422, { state: 'error', data: { result: message }, result: message }),
    ) as unknown as typeof fetch;

    const promise = sdk.savedCards.charge(7, { amount: 100, currency: 'USD', idempotency_key: 'order-981' });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargeRefusedError);
    await expect(promise).rejects.toMatchObject({ reason: 'merchant_not_verified', detail: message });
  });

  it('chargeStatus() propagates a real 404 as a plain InkressApiError', async () => {
    global.fetch = jest.fn(() =>
      jsonResponse(404, { state: 'error', data: { result: 'Not Found' }, result: 'Not Found' }),
    ) as unknown as typeof fetch;

    const promise = sdk.savedCards.chargeStatus(7, 'order-981');

    await expect(promise).rejects.toBeInstanceOf(InkressApiError);
    await expect(promise).rejects.not.toBeInstanceOf(SavedCardChargeRefusedError);
    await expect(promise).rejects.toMatchObject({ status: 404 });
  });

  it('waitForCharge() survives one real transport failure mid-poll and then resolves', async () => {
    let call = 0;
    global.fetch = jest.fn(() => {
      call += 1;
      if (call === 2) return Promise.reject(new Error('fetch failed'));
      return jsonResponse(200, {
        state: 'ok',
        result: {
          status: call === 1 ? 'processing' : 'succeeded',
          job_id: 91,
          reference: 'cardchg-1-7-order-981',
          order: null,
          failure_reason: null,
        },
      });
    }) as unknown as typeof fetch;

    const final = await sdk.savedCards.waitForCharge(7, 'order-981', { sleep: async () => undefined });

    expect(final.status).toBe('succeeded');
    expect(call).toBe(3);
  });

  it('waitForCharge() default budget survives real 5xx blips and still sums to 63500ms', async () => {
    let call = 0;
    global.fetch = jest.fn(() => {
      call += 1;
      if (call % 4 === 0) {
        return Promise.resolve(new Response('Service Unavailable', { status: 503 }));
      }
      return jsonResponse(200, {
        state: 'ok',
        result: { status: 'processing', job_id: 91, reference: 'cardchg-1-7-order-981', order: null, failure_reason: null },
      });
    }) as unknown as typeof fetch;
    const sleeps: number[] = [];

    const promise = sdk.savedCards.waitForCharge(7, 'order-981', {
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });

    await expect(promise).rejects.toBeInstanceOf(SavedCardChargePendingError);
    expect(call).toBe(12);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBe(63500);
  });

  it('remove() reports a retried 404 (after a real transport failure) as already-removed', async () => {
    let call = 0;
    global.fetch = jest.fn(() => {
      call += 1;
      if (call === 1) return Promise.reject(new Error('fetch failed'));
      return jsonResponse(404, { state: 'error', data: { result: 'Not Found' }, result: 'Not Found' });
    }) as unknown as typeof fetch;

    const promise = sdk.savedCards.remove(7);

    await expect(promise).rejects.toBeInstanceOf(SavedCardAlreadyRemovedError);
    await expect(promise).rejects.toMatchObject({ id: 7, status: 404 });
    expect(call).toBe(2);
  });
});
