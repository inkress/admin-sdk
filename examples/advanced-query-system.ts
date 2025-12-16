
/**
 * Advanced Query System Examples
 * 
 * This example demonstrates the new type-based query system that allows users
 * to write clean, intuitive queries that the SDK automatically transforms
 * into the Elixir-compatible format.
 * 
 * Features:
 * - Array values → _in suffix
 * - Range objects → _min/_max suffixes  
 * - String operations → contains. prefix
 * - Date operations → before./after./on. prefixes
 * - JSON field operations → in_, not_, null_, not_null_ prefixes
 * - Direct values → equality check
 */

import { InkressSDK } from '../src/index';

const inkress = new InkressSDK({
  bearerToken: 'your-jwt-token',
  clientId: 'm-your-merchant-username',
});

async function demonstrateQuerySystem() {
  console.log('=== Advanced Query System Demonstration ===\n');

  // ======================
  // 1. SIMPLE QUERIES
  // ======================
  
  console.log('1. Simple equality queries...');
  
  // Direct values → equality (no transformation)
  const confirmedOrders = await inkress.orders.query({
    status: 'confirmed',     // SDK: { status: <integer_for_confirmed> }
    kind: 'online'           // SDK: { kind: <integer_for_online> }
  });
  console.log('✅ Found confirmed online orders:', confirmedOrders.data?.entries.length || 0);

  // ======================
  // 2. ARRAY QUERIES (IN operations)
  // ======================
  
  console.log('\n2. Array queries (IN operations)...');
  
  // Arrays → _in suffix
  const multipleStatuses = await inkress.orders.query({
    status: ['confirmed', 'shipped', 'delivered'],  // SDK: { status_in: [4, 7, 8] }
    id: [1, 2, 3, 4, 5]                           // SDK: { id_in: [1,2,3,4,5] }
  });
  console.log('✅ Found orders with multiple statuses:', multipleStatuses.data?.entries.length || 0);

  // ======================
  // 3. RANGE QUERIES
  // ======================
  
  console.log('\n3. Range queries (min/max)...');
  
  // Range objects → _min/_max suffixes
  const expensiveOrders = await inkress.orders.query({
    total: { min: 100, max: 1000 },  // SDK: { total_min: 100, total_max: 1000 }
    page_size: 20
  });
  console.log('✅ Found orders between $100-$1000:', expensiveOrders.data?.entries.length || 0);

  // Single-sided ranges
  const highValueOrders = await inkress.orders.query({
    total: { min: 500 }  // SDK: { total_min: 500 }
  });
  console.log('✅ Found orders over $500:', highValueOrders.data?.entries.length || 0);

  // ======================
  // 4. STRING QUERIES
  // ======================
  
  console.log('\n4. String search queries...');
  
  // String contains → contains. prefix
  const ordersByReference = await inkress.orders.query({
    reference_id: { contains: 'ORDER-2024' }  // SDK: { "contains.reference_id": "ORDER-2024" }
  });
  console.log('✅ Found orders with reference containing "ORDER-2024":', ordersByReference.data?.entries.length || 0);

  // ======================
  // 5. DATE QUERIES
  // ======================
  
  console.log('\n5. Date range queries...');
  
  // Date operations → before./after./on. prefixes
  const recentOrders = await inkress.orders.query({
    inserted_at: { 
      after: '2024-01-01',   // SDK: { "after.inserted_at": "2024-01-01" }
      before: '2024-12-31'   // SDK: { "before.inserted_at": "2024-12-31" }
    }
  });
  console.log('✅ Found orders from 2024:', recentOrders.data?.entries.length || 0);

  // Single date operation
  const todaysOrders = await inkress.orders.query({
    inserted_at: { on: '2024-11-05' }  // SDK: { "on.inserted_at": "2024-11-05" }
  });
  console.log('✅ Found orders from today:', todaysOrders.data?.entries.length || 0);

  // ======================
  // 6. COMPLEX COMBINED QUERIES
  // ======================
  
  console.log('\n6. Complex combined queries...');
  
  const complexQuery = await inkress.orders.query({
    // Contextual status values
    status: ['confirmed', 'shipped'],
    
    // Range for total amount
    total: { min: 50, max: 500 },
    
    // String search in reference
    reference_id: { contains: 'MOBILE' },
    
    // Date range for recent orders
    inserted_at: { after: '2024-10-01' },
    
    // Specific customer
    customer_id: 123,
    
    // Array of order kinds
    kind: ['online', 'subscription'],
    
    // Pagination
    page: 1,
    page_size: 25,
    
    // General search
    q: 'electronics'
  });
  
  // SDK transforms this to:
  // {
  //   status_in: [4, 7],                    // contextual statuses converted
  //   total_min: 50,
  //   total_max: 500,
  //   "contains.reference_id": "MOBILE",
  //   "after.inserted_at": "2024-10-01",
  //   customer_id: 123,
  //   kind_in: [1, 3],                      // contextual kinds converted
  //   page: 1,
  //   page_size: 25,
  //   q: "electronics"
  // }
  
  console.log('✅ Complex query results:', complexQuery.data?.entries.length || 0);

  // ======================
  // 7. QUERY BUILDER PATTERN
  // ======================
  
  console.log('\n7. Query builder pattern...');
  
  const builderQuery = await inkress.orders
    .createQueryBuilder()
    .whereStatus('confirmed')                    // Contextual status
    .whereKind(['online', 'subscription'])       // Multiple kinds
    .whereTotalRange(100, 1000)                 // Amount range
    .whereReferenceContains('PREMIUM')          // String search
    .whereCreatedBetween('2024-01-01', '2024-12-31')  // Date range
    .paginate(1, 20)                            // Pagination
    .orderBy('inserted_at', 'desc')             // Ordering
    .search('laptop')                           // General search
    .execute();
  
  console.log('✅ Query builder results:', builderQuery.data?.entries.length || 0);

  // ======================
  // 8. JSON FIELD QUERIES (Advanced)
  // ======================
  
  console.log('\n8. JSON field queries...');
  
  try {
    // JSON field operations → in_, not_, null_, not_null_ prefixes
    const jsonQuery = await inkress.orders.query({
      data: {
        // Direct values in JSON fields
        customer_type: 'premium',              // SDK: { data: { customer_type: "premium" } }
        
        // JSON-specific operations
        payment_method: { in: 'credit_card' }, // SDK: { data: { in_payment_method: "credit_card" } }
        refunded: { not: true },               // SDK: { data: { not_refunded: true } }
        notes: { null: false },                // SDK: { data: { null_notes: false } }
        
        // Nested JSON paths (stay as-is)
        'metadata->source': 'mobile_app',      // SDK: { data: { "metadata->source": "mobile_app" } }
        'settings->theme': 'dark'              // SDK: { data: { "settings->theme": "dark" } }
      }
    });
    
    console.log('✅ JSON field query results:', jsonQuery.data?.entries.length || 0);
  } catch (error) {
    console.log('ℹ️ JSON field queries may not be available for all resources');
  }

  // ======================
  // 9. BACKWARD COMPATIBILITY
  // ======================
  
  console.log('\n9. Backward compatibility...');
  
  // The legacy list() method still works
  const legacyQuery = await inkress.orders.list({
    status: 'confirmed',  // Still works with contextual strings
    q: 'electronics',
    page: 1,
    per_page: 10
  });
  console.log('✅ Legacy list() method still works:', legacyQuery.data?.entries.length || 0);

  // Integers still work
  const integerQuery = await inkress.orders.query({
    status: 4,            // Integer status still works
    kind: 1,              // Integer kind still works
    customer_id: 123
  });
  console.log('✅ Integer values still work:', integerQuery.data?.entries.length || 0);

  // Full string values still work
  const fullStringQuery = await inkress.orders.query({
    status: 'order_confirmed',    // Full prefixed string still works
    kind: 'order_online'          // Full prefixed string still works
  });
  console.log('✅ Full string values still work:', fullStringQuery.data?.entries.length || 0);

  // ======================
  // 10. QUERY COMPARISON
  // ======================
  
  console.log('\n10. Query transformation examples...');
  
  console.log('User writes:');
  console.log('  { status: ["confirmed", "shipped"], total: { min: 100 } }');
  console.log('');
  console.log('SDK transforms to:');
  console.log('  { status_in: [4, 7], total_min: 100 }');
  console.log('');
  
  console.log('User writes:');
  console.log('  { reference_id: { contains: "ORDER" }, inserted_at: { after: "2024-01-01" } }');
  console.log('');
  console.log('SDK transforms to:');
  console.log('  { "contains.reference_id": "ORDER", "after.inserted_at": "2024-01-01" }');

  // ======================
  // BENEFITS SUMMARY
  // ======================
  
  console.log('\n=== Query System Benefits ===');
  console.log('✅ Intuitive: Write queries as you think about them');
  console.log('✅ Type-safe: Full TypeScript support with autocompletion');
  console.log('✅ Flexible: Mix and match different query types');
  console.log('✅ Powerful: Support for ranges, arrays, strings, dates, and JSON');
  console.log('✅ Clean: No need to remember complex suffix/prefix rules');
  console.log('✅ Compatible: Works alongside existing legacy methods');
  console.log('✅ Consistent: Same patterns work across all resources');
}

// Run the demonstration
async function runDemo() {
  try {
    await demonstrateQuerySystem();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Demo error (this is expected in example environment):', errorMessage);
    console.log('\nℹ️  This demo shows the API structure - actual calls require valid authentication');
  }
}

// Export for use in other examples
export { demonstrateQuerySystem };

// Run if called directly
if (require.main === module) {
  runDemo();
}
