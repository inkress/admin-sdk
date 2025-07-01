import { InkressSDK } from '../src';

async function basicExample() {
  // Initialize the SDK
  const inkress = new InkressSDK({
    bearerToken: 'your-jwt-token-here',
    clientId: 'm-your-merchant-username',
    endpoint: 'https://api.inkress.com',
    apiVersion: 'v1',
  });

  try {
    // List merchants
    console.log('Listing merchants...');
    const merchants = await inkress.merchants.list({ page: 1, limit: 10 });
    console.log('Merchants:', merchants.data);

    // Create an order
    console.log('Creating an order...');
    const order = await inkress.orders.create({
      currency_code: 'USD',
      customer: {
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe'
      },
      total: 29.99,
      reference_id: 'order-' + Date.now(),
      kind: 'online'
    });
    console.log('Order created:', order.data);

    // List products
    console.log('Listing products...');
    const products = await inkress.products.list({ page: 1, limit: 5 });
    console.log('Products:', products.data);

    // Get public merchant products (no auth required)
    console.log('Getting public merchant products...');
    const publicProducts = await inkress.public.getMerchantProducts('your-merchant-username');
    console.log('Public products:', publicProducts.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  basicExample();
}

export { basicExample };
