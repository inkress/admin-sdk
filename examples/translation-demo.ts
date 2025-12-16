// Translation System Demo
// This example demonstrates the new string-to-integer translation system

import { InkressSDK } from '../src/index';

const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token',
  clientId: 'm-your-merchant-username',
});

async function translationDemo() {
  console.log('=== Inkress SDK Translation System Demo ===\n');

  // ======================
  // STRING-BASED API (User-Facing)
  // ======================
  
  console.log('1. Creating merchant with contextual string values...');
  try {
    const newMerchant = await inkress.merchants.create({
      name: 'Demo Store',
      email: 'demo@example.com',
      status: 'pending',                       // Contextual string instead of 'account_pending'!
      platform_fee_structure: 'customer_pay', // String instead of integer!
      provider_fee_structure: 'merchant_absorb' // String instead of integer!
    });
    console.log('✅ Merchant created with status:', newMerchant.data?.status);
    console.log('✅ Platform fee structure:', newMerchant.data?.platform_fee_structure);
  } catch (error) {
    console.log('ℹ️ Merchant creation demo (may fail in example environment)');
  }

  console.log('\n2. Filtering with contextual string values...');
  
  // Filter merchants using contextual, human-readable strings
  const filteredMerchants = await inkress.merchants.list({
    status: 'approved',                      // Contextual: 'approved' instead of 'account_approved'
    platform_fee_structure: 'customer_pay', // Customer pays platform fees
    q: 'coffee'                              // General search for "coffee"
  });
  console.log('✅ Found merchants with contextual filters:', filteredMerchants.data?.entries.length || 0);

  // Filter products by contextual status
  const publishedProducts = await inkress.products.list({
    status: 'published',          // Contextual: 'published' instead of 'product_published'
    q: 'laptop'                   // Search for "laptop"
  });
  console.log('✅ Found published products:', publishedProducts.data?.entries.length || 0);

  // Filter orders by contextual kind and status
  const onlineOrders = await inkress.orders.list({
    kind: 'online',      // Contextual: 'online' instead of 'order_online'
    status: 'confirmed', // Contextual: 'confirmed' instead of 'order_confirmed'
    q: 'electronics'     // Search for "electronics"
  });
  console.log('✅ Found online confirmed orders:', onlineOrders.data?.entries.length || 0);

  // Filter users by contextual status and kind
  const users = await inkress.users.list({
    status: 'approved',   // Contextual: 'approved' instead of 'account_approved'
    kind: 'organisation', // Contextual: 'organisation' instead of 'user_organisation'
    q: 'admin'
  });
  console.log('✅ Found organization users:', users.data?.entries.length || 0);

  // Filter billing plans by contextual kind
  const subscriptionPlans = await inkress.billingPlans.list({
    kind: 'subscription', // Contextual: 'subscription' instead of 'billing_plan_subscription'
    q: 'premium'
  });
  console.log('✅ Found subscription plans:', subscriptionPlans.data?.entries.length || 0);

  // Filter subscriptions by contextual status
  const activeSubscriptions = await inkress.subscriptions.list({
    status: 'active',     // Contextual: 'active' instead of 'billing_subscription_active'
    q: 'monthly'
  });
  console.log('✅ Found active subscriptions:', activeSubscriptions.data?.entries.length || 0);

  // ======================
  // BACKWARD COMPATIBILITY
  // ======================
  
  console.log('\n3. Backward compatibility with integers and full strings...');
  
  // Integer values still work for backward compatibility
  const merchantsWithIntegers = await inkress.merchants.list({
    status: 2,                    // Integer still works
    platform_fee_structure: 1,   // Integer still works
    q: 'retail'
  });
  console.log('✅ Integer filters still work:', merchantsWithIntegers.data?.entries.length || 0);

  // Full string values also still work
  const ordersWithFullStrings = await inkress.orders.list({
    status: 'order_confirmed',    // Full string still works
    kind: 'order_online',         // Full string still works
    q: 'books'
  });
  console.log('✅ Full string filters still work:', ordersWithFullStrings.data?.entries.length || 0);

  // ======================
  // CONTEXTUAL BENEFITS
  // ======================
  
  console.log('\n4. Contextual string benefits...');
  console.log('✅ Intuitive: Use "confirmed" instead of "order_confirmed" for orders');
  console.log('✅ Context-aware: Same value "published" works for products, "approved" for accounts');
  console.log('✅ Clean: Shorter, more readable values in your code');
  console.log('✅ Type-safe: TypeScript provides autocompletion for valid contextual strings');
  console.log('✅ API-compatible: Contextual strings are automatically converted to integers');
  console.log('✅ Response-friendly: API integer responses are converted back to contextual strings');

  // ======================
  // AVAILABLE CONTEXTUAL VALUES
  // ======================
  
  console.log('\n5. Available contextual values:');
  console.log('Order Status: pending, confirmed, shipped, delivered, cancelled, etc.');
  console.log('Order Kind: online, offline, subscription, invoice, etc.');
  console.log('Product Status: draft, published, archived');
  console.log('Account Status: pending, approved, suspended, rejected');
  console.log('User Kind: address, preset, organisation, store');
  console.log('Billing Plan Kind: subscription, payout');
  console.log('Subscription Status: pending, active, cancelled, adhoc_charged');
  console.log('Fee structures: customer_pay, merchant_absorb (full strings still used)');

  // ======================
  // CONTEXTUAL EXAMPLES
  // ======================
  
  console.log('\n6. Context-aware examples:');
  console.log('// Orders context:');
  console.log('orders.list({ status: "confirmed", kind: "online" })');
  console.log('');
  console.log('// Products context:');
  console.log('products.list({ status: "published" })');
  console.log('');
  console.log('// Merchants/Accounts context:');
  console.log('merchants.list({ status: "approved" })');
  console.log('');
  console.log('// Users context:');
  console.log('users.list({ status: "approved", kind: "organisation" })');
  console.log('');
  console.log('// Billing Plans context:');
  console.log('billingPlans.list({ kind: "subscription" })');
  console.log('');
  console.log('// Subscriptions context:');
  console.log('subscriptions.list({ status: "active" })');

  // ======================
  // SEARCH ENHANCEMENT
  // ======================
  
  console.log('\n6. Enhanced search capabilities...');
  
  // General search across multiple fields
  const generalSearch = await inkress.merchants.list({
    q: 'john electronics store'  // Searches name, email, about, sector, etc.
  });
  console.log('✅ General search results:', generalSearch.data?.entries.length || 0);

  // Combine general search with specific filters
  const combinedSearch = await inkress.products.list({
    q: 'wireless',                // General search
    status: 'product_published',  // Specific filter
    public: true,                 // Boolean filter
    unlimited: false              // Another boolean filter
  });
  console.log('✅ Combined search results:', combinedSearch.data?.entries.length || 0);

  console.log('\n=== Demo Complete ===');
}

// Available for import and direct execution
export { translationDemo };

// Run if called directly
if (require.main === module) {
  translationDemo().catch(console.error);
}
