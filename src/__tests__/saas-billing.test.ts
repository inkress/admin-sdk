import { InkressSDK, InkressApiError } from '../index';

const config = { accessToken: 'sk_test_example', mode: 'sandbox' as const, username: 'fleeksite' };

type Mocked = { client: { post: jest.Mock } };

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}

describe('subscriptions: SaaS billing (INK-801..804)', () => {
  test('setGrace POSTs grace_days, including null', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: { subscription_uid: 's', grace_days: null, effective_grace_days: 3 } });
    (sdk.subscriptions as unknown as Mocked).client.post = post;

    const { result } = await sdk.subscriptions.setGrace('s', null);

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/s/grace', { grace_days: null });
    expect(result?.effective_grace_days).toBe(3);
  });

  test('pause sends resume_at; resume posts without a body', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: { subscription_uid: 's', status: 'paused' } });
    (sdk.subscriptions as unknown as Mocked).client.post = post;

    await sdk.subscriptions.pause('s', { resume_at: '2026-12-01T00:00:00Z' });
    await sdk.subscriptions.resume('s');

    expect(post).toHaveBeenNthCalledWith(1, '/billing_subscriptions/s/pause', { resume_at: '2026-12-01T00:00:00Z' });
    expect(post).toHaveBeenNthCalledWith(2, '/billing_subscriptions/s/resume');
  });

  test('usage passes mode through', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: { total: 8 } });
    (sdk.subscriptions as unknown as Mocked).client.post = post;

    await sdk.subscriptions.usage('s', { metric: 'seats', metric_count: 8, mode: 'max' });

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/usage/s', { metric: 'seats', metric_count: 8, mode: 'max' });
  });

  test('upgradeNow sends effective: now and returns the charge reference', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({
      state: 'ok',
      result: { subscription_uid: 's', outcome: 'charging', amount: '26.67', currency: 'USD', reference: 'cardchg-1-2-sub3-upgrade-x', pending_upgrade: {} },
    });
    (sdk.subscriptions as unknown as Mocked).client.post = post;

    const { result } = await sdk.subscriptions.upgradeNow('s', 'plan_pro');

    expect(post).toHaveBeenCalledWith('/billing_subscriptions/s/plan-change', { plan_uid: 'plan_pro', effective: 'now' });
    expect(result?.reference).toBe('cardchg-1-2-sub3-upgrade-x');
  });
});

describe('access and flags (INK-805)', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test('access.get calls /api/v1/access/:customer on the origin and returns the bare body', async () => {
    const body = { allowed: true, access: 'grace', subscription: null, features: { reports: true } };
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(200, body));
    global.fetch = fetchMock as unknown as typeof fetch;
    const sdk = new InkressSDK(config);

    const result = await sdk.access.get('cust uid', { targetingKey: 'u-1' });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api-dev.inkress.com/api/v1/access/cust%20uid?targeting_key=u-1');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer sk_test_example');
    expect(result.access).toBe('grace');
  });

  test('access.getByEmail sends the email query and throws on 401', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(401, { state: 'error', result: { reason: 'A secret key (sk_) is required.' } }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const sdk = new InkressSDK(config);

    await expect(sdk.access.getByEmail('a@example.com')).rejects.toMatchObject({ status: 401, message: 'A secret key (sk_) is required.' });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api-dev.inkress.com/api/v1/access?email=a%40example.com');
  });

  test('flags.evaluate returns FLAG_NOT_FOUND instead of throwing', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(404, { key: 'x', errorCode: 'FLAG_NOT_FOUND', errorDetails: 'unknown' })) as unknown as typeof fetch;
    const sdk = new InkressSDK(config);

    const result = await sdk.flags.evaluate('x', { targetingKey: 'u-1' });

    expect(result.errorCode).toBe('FLAG_NOT_FOUND');
    expect(await sdk.flags.isEnabled('x', {}, true)).toBe(true);
  });

  test('flags.evaluate posts the context to the OFREP path', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(200, { key: 'new-dashboard', value: true, reason: 'TARGETING_MATCH' }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const sdk = new InkressSDK(config);

    const result = await sdk.flags.evaluate<boolean>('new-dashboard', { targetingKey: 'u-1', country: 'JM' });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api-dev.inkress.com/api/ofrep/v1/evaluate/flags/new-dashboard');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ context: { targetingKey: 'u-1', country: 'JM' } });
    expect(result.value).toBe(true);
  });

  test('flags.evaluateAll handles the ETag round trip', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { flags: [{ key: 'a', value: 1 }] }, { etag: 'W/"v1"' }))
      .mockResolvedValueOnce(jsonResponse(304, undefined, { etag: 'W/"v1"' }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const sdk = new InkressSDK(config);

    const first = await sdk.flags.evaluateAll({ targetingKey: 'u-1' });
    const second = await sdk.flags.evaluateAll({ targetingKey: 'u-1' }, { etag: first.etag! });

    expect(first.flags).toHaveLength(1);
    expect(fetchMock.mock.calls[1][1].headers['If-None-Match']).toBe('W/"v1"');
    expect(second).toEqual({ notModified: true, flags: [], etag: 'W/"v1"' });
  });

  test('flags.evaluate throws InkressApiError on 429', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(429, undefined)) as unknown as typeof fetch;
    const sdk = new InkressSDK(config);
    await expect(sdk.flags.evaluate('x')).rejects.toBeInstanceOf(InkressApiError);
  });
});
