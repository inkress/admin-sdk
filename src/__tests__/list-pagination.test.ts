import { InkressSDK } from '../index';

/**
 * Regression for the list-pagination defect: commerce-api serialises pagination under the
 * `pagination` key (lib/api/utils/paginate.ex), but every resource's `list`/`query` read
 * `response.result.page_info` — a key the API never sends — so `page_info` came back `undefined`
 * and `total_entries` / `more` (what infinite scroll needs) were dropped. The reshape now reads the
 * wire's `pagination` and surfaces it as `page_info`.
 */

function wireList(entries: unknown[], pagination: unknown): void {
  global.fetch = jest.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ state: 'ok', result: { entries, pagination } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  ) as unknown as typeof fetch;
}

const PAGINATION = { page: 1, page_size: 25, total_entries: 60, more: true, next_page: 2, total_pages: 3, next_pages: [2, 3], last_pages: [] };

describe('list responses carry pagination as page_info', () => {
  const sdk = new InkressSDK({ accessToken: 't', mode: 'sandbox', username: 'inkress' });

  it('orders.list surfaces total_entries and more', async () => {
    wireList([{ id: 1, status: 3, kind: 1 }], PAGINATION);
    const res = await sdk.orders.list();
    expect(res.result?.entries).toHaveLength(1);
    expect(res.result?.page_info?.total_entries).toBe(60);
    expect(res.result?.page_info?.more).toBe(true);
    expect(res.result?.page_info?.page).toBe(1);
  });

  it('orders.query surfaces pagination too', async () => {
    wireList([{ id: 1, status: 3, kind: 1 }], PAGINATION);
    const res = await sdk.orders.query({});
    expect(res.result?.page_info?.total_entries).toBe(60);
    expect(res.result?.page_info?.more).toBe(true);
  });

  it('paymentLinks.list surfaces pagination', async () => {
    wireList([{ id: 1, status: 1, kind: 1 }], { ...PAGINATION, more: false, total_entries: 1 });
    const res = await sdk.paymentLinks.list();
    expect(res.result?.page_info?.total_entries).toBe(1);
    expect(res.result?.page_info?.more).toBe(false);
  });
});
