import { InkressSDK } from '../index';

describe('KycResource.createVerifyLink', () => {
  const config = {
    accessToken: 'test-token',
    mode: 'sandbox' as const,
    username: 'test-merchant',
  };

  test('POSTs to /merchants/:id/kyc/verify-link and returns the minted link', async () => {
    const sdk = new InkressSDK(config);
    const mockResponse = {
      state: 'ok',
      result: {
        verify_url: 'https://auditor.inkress.com/verify?token=abc123',
        expires_at: '2026-07-29T08:00:00.000Z',
        single_use: true,
      },
    };
    const postMock = jest.fn().mockResolvedValue(mockResponse);
    // Access the private client the same way the existing KYC tests do.
    (sdk.kyc as unknown as { client: { post: jest.Mock } }).client.post = postMock;

    const res = await sdk.kyc.createVerifyLink(123);

    expect(postMock).toHaveBeenCalledWith('/merchants/123/kyc/verify-link', {});
    expect(res.state).toBe('ok');
    expect(res.result?.verify_url).toContain('/verify?token=');
    expect(res.result?.single_use).toBe(true);
    expect(res.result?.expires_at).toBe('2026-07-29T08:00:00.000Z');
  });
});
