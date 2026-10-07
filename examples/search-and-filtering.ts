// Search and Filtering Examples
// This example demonstrates the comprehensive search and filtering capabilities
// with the new string-based API

import { InkressSDK } from '../src/index';

const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token',
  clientId: 'm-your-merchant-username',
});

async function searchAndFilterExamples() {
  // ======================
  // General Search Examples
  // ======================
  
  console.log('=== General Search Examples ===');
  
  // Search merchants using the 'q' field
  // Searches across name, email, username, about, sector, etc.
  const merchantSearch = await inkress.merchants.list({
    q: 'john coffee shop'
  });
  console.log('Merchant search results:', merchantSearch.data?.entries.length);

  // Search products using the 'q' field
  // Searches across title, teaser, description, etc.
  const productSearch = await inkress.products.list({
    q: 'wireless bluetooth headphones'
  });
  console.log('Product search results:', productSearch.data?.entries.length);

  // Search orders using the 'q' field
  // Searches across reference_id, customer details, etc.
  const orderSearch = await inkress.orders.list({
    q: 'ORDER-2024-001'
  });
  console.log('Order search results:', orderSearch.data?.entries.length);

  // ======================
  // Contextual String Filtering (NEW!)
  // ======================
  
  console.log('\n=== Contextual String Filtering ===');
  
  // Filter products using contextual strings - cleaner and more intuitive
  const activeProducts = await inkress.products.list({
    status: 'published',    // Contextual: 'published' instead of 'product_published'!
    q: 'electronics'
  });
  console.log('Active products:', activeProducts.data?.entries.length);

  // Filter merchants by contextual status and fee structure
  const activeMerchants = await inkress.merchants.list({
    status: 'approved',                      // Contextual: 'approved' instead of 'account_approved'
    platform_fee_structure: 'merchant_absorb',  // Full string still used for fee structures
    q: 'retail'
  });
  console.log('Active merchants:', activeMerchants.data?.entries.length);

  // Filter orders by contextual kind and status
  const onlineOrders = await inkress.orders.list({
    kind: 'online',           // Contextual: 'online' instead of 'order_online'
    status: 'confirmed',      // Contextual: 'confirmed' instead of 'order_confirmed'
    q: 'laptop'
  });
  console.log('Online confirmed orders:', onlineOrders.data?.entries.length);

  // Filter categories by contextual kind
  const productCategories = await inkress.categories.list({
    kind: 'published',        // Contextual: 'published' instead of 'product_published'
    q: 'electronics'
  });
  console.log('Product categories:', productCategories.data?.entries.length);

  // Filter users by contextual status and kind
  const orgUsers = await inkress.users.list({
    status: 'approved',       // Contextual: 'approved' instead of 'account_approved'
    kind: 'organisation',     // Contextual: 'organisation' instead of 'user_organisation'
    q: 'admin'
  });
  console.log('Organization users:', orgUsers.data?.entries.length);

  // Filter billing plans by contextual kind
  const subscriptionPlans = await inkress.billingPlans.list({
    kind: 'subscription',     // Contextual: 'subscription' instead of 'billing_plan_subscription'
    q: 'premium'
  });
  console.log('Subscription plans:', subscriptionPlans.data?.entries.length);

  // Filter subscriptions by contextual status
  const activeSubscriptions = await inkress.subscriptions.list({
    status: 'active',         // Contextual: 'active' instead of 'billing_subscription_active'
    q: 'monthly'
  });
  console.log('Active subscriptions:', activeSubscriptions.data?.entries.length);

  // ======================
  // Database Field Filtering (Backward Compatible)
  // ======================
  
  console.log('\n=== Database Field Filtering ===');
  
  // Filter products by specific database fields (supports both strings and integers)
  const filteredProducts = await inkress.products.list({
    status: 'product_published',    // String format (NEW!)
    // status: 2,                   // Integer format (still works)
    public: true,                   // Boolean fields unchanged
    unlimited: false,               // Limited quantity products
    category_id: 5,                 // ID fields unchanged
    currency_id: 1,                 // Specific currency
    units_remaining: 0,     // Out of stock products
  });
  console.log('Filtered products:', filteredProducts.data?.entries.length);

  // Filter merchants by organization and status
  const orgMerchants = await inkress.merchants.list({
    organisation_id: 123,
    status: 1,                      // Active merchants
    platform_fee_structure: 2,     // Customer pays platform fees
    provider_fee_structure: 1,      // Merchant absorbs provider fees
  });
  console.log('Organization merchants:', orgMerchants.data?.entries.length);

  // Filter orders by date range and status
  const recentOrders = await inkress.orders.list({
    status: 3,              // Paid orders
    kind: 1,                // Online orders
    inserted_at: '2024-01-01',  // Orders from 2024
  });
  console.log('Recent paid orders:', recentOrders.data?.entries.length);

  // ======================
  // Combining Search and Filters
  // ======================
  
  console.log('\n=== Combining Search and Filters ===');
  
  // Search for phone products in electronics category, published only
  const phoneProducts = await inkress.products.list({
    q: 'smartphone iphone android',  // General search
    status: 2,                       // Published only
    category_id: 10,                 // Electronics category
    public: true,                    // Public products
    unlimited: false,                // Limited quantity
    page: 1,                         // First page
    per_page: 20,                    // 20 results per page
    sort: 'price',                   // Sort by price
    order: 'desc'                    // Highest price first
  });
  console.log('Phone products found:', phoneProducts.data?.entries.length);

  // Search for users in specific organization with role
  const teamMembers = await inkress.users.list({
    q: 'manager admin',              // General search
    organisation_id: 123,            // Specific organization
    role_id: 5,                      // Manager role
    status: 1,                       // Active users
    level: 2,                        // Admin level
  });
  console.log('Team members found:', teamMembers.data?.entries.length);

  // ======================
  // Legacy vs New Search
  // ======================
  
  console.log('\n=== Legacy vs New Search ===');
  
  // Legacy search approach (still works)
  const legacySearch = await inkress.products.list({
    search: 'laptop'
  });
  console.log('Legacy search results:', legacySearch.data?.entries.length);

  // New recommended approach
  const newSearch = await inkress.products.list({
    q: 'laptop gaming ultrabook'
  });
  console.log('New search results:', newSearch.data?.entries.length);

  // ======================
  // Public Endpoint Search
  // ======================
  
  console.log('\n=== Public Endpoint Search ===');
  
  // Search public merchant products (no auth required)
  const publicProducts = await inkress.public.getMerchantProducts('demo-store', {
    q: 'coffee beans',       // General search
    category: 'beverages',   // Category filter
    limit: 10                // Limit results
  });
  console.log('Public products found:', publicProducts.data?.entries.length);

  // ======================
  // Advanced Filtering
  // ======================
  
  console.log('\n=== Advanced Filtering Examples ===');
  
  // Find high-value orders with specific criteria
  const highValueOrders = await inkress.orders.list({
    q: 'premium enterprise',         // Search terms
    status: 4,                       // Confirmed orders
    // total: 5000,                  // Orders above $5000 (if range filtering supported)
    kind: 2,                         // Cart orders
    billing_plan_id: 3,              // Premium billing plan
  });
  console.log('High-value orders:', highValueOrders.data?.entries.length);

  // Find subscription customers with specific billing plans
  const premiumSubscriptions = await inkress.subscriptions.list({
    status: 2,              // Active subscriptions
    billing_plan_id: 5,     // Premium plan
    kind: 2,                // Subscription type
  });
  console.log('Premium subscriptions:', premiumSubscriptions.data?.entries.length);

  // Search categories with hierarchy
  const productCategories = await inkress.categories.list({
    q: 'electronics gadgets',       // General search
    kind: 1,                        // Product categories
    parent_id: null,                // Top-level categories only
  });
  console.log('Top-level categories:', productCategories.data?.entries.length);
}

// Run the examples
searchAndFilterExamples().catch(console.error);
