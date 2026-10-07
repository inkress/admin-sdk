import { InkressSDK, InkressApiError, SavedCardChargeRefusedError } from '../index';

const config = { accessToken: 'test-token', mode: 'sandbox' as const, username: 'fleeksite' };
type HttpMock = { post: jest.Mock; get: jest.Mock; put: jest.Mock };

function mockClient(resource: unknown, mocks: Partial<HttpMock>): void {
  Object.assign((resource as { client: HttpMock }).client, mocks);
}

const booking = {
  id: 42,
  reference_id: 'bookerva:bk_1',
  state: 'pending',
  start_time: '2026-11-14T09:00:00Z',
  end_time: '2026-11-14T11:00:00Z',
  total: 10000,
  currency_code: 'JMD',
  amount_paid: 3000,
  amount_due: 7000,
  orders: [],
};

describe('BookingsResource (INK-792)', () => {
  test('create POSTs the booking to /bookings', async () => {
    const sdk = new InkressSDK(config);
    const post = jest.fn().mockResolvedValue({ state: 'ok', result: booking });
    mockClient(sdk.bookings, { post });

    const input = {
      reference_id: 'bookerva:bk_1',
      start_time: '2026-11-14T09:00:00Z',
      end_time: '2026-11-14T11:00:00Z',
      total: 10000,
      currency_code: 'JMD',
      details: { service: 'Colour' },
    };
    const res = await sdk.bookings.create(input);

    expect(post).toHaveBeenCalledWith('/bookings', input);
    expect(res.result?.amount_due).toBe(7000);
  });

  test('get, list and update hit the generic bookings routes', async () => {
    const sdk = new InkressSDK(config);
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: booking });
    const put = jest.fn().mockResolvedValue({ state: 'ok', result: { ...booking, state: 'confirmed' } });
    mockClient(sdk.bookings, { get, put });

    await sdk.bookings.get(42);
    expect(get).toHaveBeenLastCalledWith('/bookings/42');

    await sdk.bookings.list({ state: 'pending', limit: 10 });
    expect(get).toHaveBeenLastCalledWith('/bookings', { state: 'pending', limit: 10 });

    await sdk.bookings.update(42, { state: 'confirmed' });
    expect(put).toHaveBeenCalledWith('/bookings/42', { state: 'confirmed' });
  });

  test('findByReference returns the booking with that reference, or null', async () => {
    const sdk = new InkressSDK(config);
    const get = jest
      .fn()
      .mockResolvedValueOnce({ state: 'ok', result: { entries: [booking], pagination: {} } })
      .mockResolvedValueOnce({ state: 'ok', result: { entries: [], pagination: {} } });
    mockClient(sdk.bookings, { get });

    expect((await sdk.bookings.findByReference('bookerva:bk_1'))?.id).toBe(42);
    expect(get).toHaveBeenLastCalledWith('/bookings', { reference_id: 'bookerva:bk_1', limit: 1 });
    expect(await sdk.bookings.findByReference('bookerva:missing')).toBeNull();
  });

  test('orders.list filters by booking_id', async () => {
    const sdk = new InkressSDK(config);
    const get = jest.fn().mockResolvedValue({ state: 'ok', result: { entries: [], pagination: {} } });
    mockClient(sdk.orders, { get });

    await sdk.orders.list({ booking_id: 42 });
    expect(get).toHaveBeenCalledWith('/orders', { booking_id: 42 });
  });

  test('savedCards.charge forwards booking_id; a foreign booking is refused as booking_not_found', async () => {
    const sdk = new InkressSDK(config);
    const post = jest
      .fn()
      .mockResolvedValueOnce({ status: 'queued', job_id: 1, status_url: '/v1/cards/7/charges/balance-00001' })
      .mockRejectedValueOnce(new InkressApiError('refused', 422, { state: 'error', result: 'Booking not found.' }));
    mockClient(sdk.savedCards, { post });

    const data = { amount: 7000, currency: 'JMD', idempotency_key: 'balance-00001', booking_id: 42 };
    await sdk.savedCards.charge(7, data);
    expect(post).toHaveBeenCalledWith('/cards/7/charge', data);

    const error = await sdk.savedCards.charge(7, data).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SavedCardChargeRefusedError);
    expect((error as SavedCardChargeRefusedError).reason).toBe('booking_not_found');
  });
});
