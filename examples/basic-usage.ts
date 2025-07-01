/**
 * Inkress Admin SDK - Basic Usage Examples
 * 
 * This file demonstrates common usage patterns for the Inkress Admin SDK.
 * These examples assume you have valid API credentials and permissions.
 */

import { InkressSDK } from '../src';

// Initialize the SDK
const inkress = new InkressSDK({
  bearerToken: process.env.INKRESS_BEARER_TOKEN!,
  clientId: process.env.INKRESS_CLIENT_ID,
  endpoint: process.env.INKRESS_ENDPOINT || 'https://api.inkress.com',
});

async function basicExamples() {
  try {
    // Test connection
    console.log('Testing API connection...');
    const ping = await inkress.ping();
    console.log('✅ API is available:', ping.status);

    // List merchants
    console.log('\n📊 Listing merchants...');
    const merchants = await inkress.merchants.list({ page: 1, per_page: 5 });
    console.log(`Found ${merchants.meta.total} merchants (showing ${merchants.data.length})`);
    
    if (merchants.data.length > 0) {
      const merchant = merchants.data[0];
      console.log(`First merchant: ${merchant.name} (${merchant.email})`);

      // Get merchant products
      console.log(`\n🛍️ Getting products for merchant ${merchant.id}...`);
      const products = await inkress.products.getByMerchant(merchant.id, { page: 1, per_page: 3 });
      console.log(`Found ${products.meta.total} products`);

      // Get merchant orders
      console.log(`\n📦 Getting orders for merchant ${merchant.id}...`);
      const orders = await inkress.orders.getByMerchant(merchant.id, { page: 1, per_page: 3 });
      console.log(`Found ${orders.meta.total} orders`);

      // Get merchant customers
      console.log(`\n👥 Getting customers for merchant ${merchant.id}...`);
      const customers = await inkress.customers.getByMerchant(merchant.id, { page: 1, per_page: 3 });
      console.log(`Found ${customers.meta.total} customers`);
    }

    // Get analytics
    console.log('\n📈 Getting analytics...');
    const analyticsParams = {
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      granularity: 'month' as const
    };
    
    const analytics = await inkress.analytics.getAnalytics(analyticsParams);
    console.log(`Revenue: $${analytics.metrics.revenue}`);
    console.log(`Orders: ${analytics.metrics.orders}`);
    console.log(`Customers: ${analytics.metrics.customers}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function merchantOperations() {
  try {
    console.log('\n🏪 Merchant Operations Example...');

    // Create a new merchant (requires admin permissions)
    const newMerchant = await inkress.merchants.create({
      name: 'Test Store',
      email: 'test@example.com',
      business_type: 'company',
      country: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
    });
    console.log(`✅ Created merchant: ${newMerchant.name} (ID: ${newMerchant.id})`);

    // Update merchant
    const updatedMerchant = await inkress.merchants.update(newMerchant.id, {
      name: 'Updated Test Store',
    });
    console.log(`✅ Updated merchant name to: ${updatedMerchant.name}`);

    // Get merchant settings
    const settings = await inkress.merchants.getSettings(newMerchant.id);
    console.log(`Merchant settings:`, settings);

  } catch (error) {
    console.error('❌ Merchant operations error:', error);
  }
}

async function productOperations() {
  try {
    console.log('\n🛍️ Product Operations Example...');

    // Assuming we have a merchant ID
    const merchants = await inkress.merchants.list({ page: 1, per_page: 1 });
    if (merchants.data.length === 0) {
      console.log('No merchants found');
      return;
    }
    
    const merchantId = merchants.data[0].id;

    // Create a new product
    const newProduct = await inkress.products.create(merchantId, {
      name: 'Example Widget',
      description: 'A high-quality example widget',
      price: 29.99,
      currency: 'USD',
      type: 'physical',
      category: 'widgets',
      sku: 'WIDGET-001',
      inventory_count: 100,
    });
    console.log(`✅ Created product: ${newProduct.name} (ID: ${newProduct.id})`);

    // Update product inventory
    const updatedProduct = await inkress.products.updateInventory(newProduct.id, 150);
    console.log(`✅ Updated inventory to: ${updatedProduct.inventory_count}`);

    // Archive product
    await inkress.products.archive(newProduct.id);
    console.log(`✅ Archived product: ${newProduct.name}`);

  } catch (error) {
    console.error('❌ Product operations error:', error);
  }
}

async function orderOperations() {
  try {
    console.log('\n📦 Order Operations Example...');

    // Get a merchant and customer
    const merchants = await inkress.merchants.list({ page: 1, per_page: 1 });
    if (merchants.data.length === 0) return;
    
    const merchantId = merchants.data[0].id;
    const customers = await inkress.customers.getByMerchant(merchantId, { page: 1, per_page: 1 });
    const products = await inkress.products.getByMerchant(merchantId, { page: 1, per_page: 1 });

    if (customers.data.length === 0 || products.data.length === 0) {
      console.log('Need customers and products to create orders');
      return;
    }

    // Create a new order
    const newOrder = await inkress.orders.create(merchantId, {
      customer_id: customers.data[0].id,
      items: [
        {
          product_id: products.data[0].id,
          quantity: 2,
        }
      ],
      notes: 'Example order created via SDK',
    });
    console.log(`✅ Created order: ${newOrder.id} ($${newOrder.amount})`);

    // Update order status
    await inkress.orders.confirm(newOrder.id);
    console.log(`✅ Confirmed order: ${newOrder.id}`);

    await inkress.orders.markProcessing(newOrder.id);
    console.log(`✅ Marked order as processing: ${newOrder.id}`);

  } catch (error) {
    console.error('❌ Order operations error:', error);
  }
}

async function webhookOperations() {
  try {
    console.log('\n🔗 Webhook Operations Example...');

    const merchants = await inkress.merchants.list({ page: 1, per_page: 1 });
    if (merchants.data.length === 0) return;
    
    const merchantId = merchants.data[0].id;

    // Create a webhook
    const webhook = await inkress.webhooks.create(merchantId, {
      url: 'https://yoursite.com/webhooks/inkress',
      events: [
        'payment.succeeded',
        'payment.failed',
        'order.created',
        'order.updated',
        'subscription.cancelled'
      ]
    });
    console.log(`✅ Created webhook: ${webhook.id} -> ${webhook.url}`);

    // Test webhook
    const testResult = await inkress.webhooks.test(webhook.id, 'payment.succeeded');
    console.log(`✅ Webhook test result:`, testResult);

    // Get webhook deliveries
    const deliveries = await inkress.webhooks.getDeliveries(webhook.id);
    console.log(`Found ${deliveries.meta.total} webhook deliveries`);

  } catch (error) {
    console.error('❌ Webhook operations error:', error);
  }
}

// Run examples
async function runExamples() {
  console.log('🚀 Inkress Admin SDK Examples\n');
  
  await basicExamples();
  await merchantOperations();
  await productOperations();
  await orderOperations();
  await webhookOperations();
  
  console.log('\n✅ Examples completed!');
}

// Export for use in other files or run directly
export {
  basicExamples,
  merchantOperations,
  productOperations,
  orderOperations,
  webhookOperations,
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
