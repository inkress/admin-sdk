/**
 * Type Safety Validation Demo
 * 
 * This example demonstrates the type safety improvements made to the query system.
 * It shows how the SDK now validates query parameters at runtime to catch type mismatches.
 */

import { InkressSDK } from '../src/index';
import { processQuery } from '../src/utils/query-transformer';

// Initialize SDK
const inkress = new InkressSDK({
  bearerToken: 'test-token',
  clientId: 'm-test-merchant'
});

async function demonstrateTypeSafetyValidation() {
  console.log('=== Type Safety Validation Demo ===\n');

  // Define field types for validation (this would typically be done internally)
  const ORDER_FIELD_TYPES = {
    id: 'number' as const,
    reference_id: 'string' as const,
    total: 'number' as const,
    status: 'string' as const, // Note: contextual string values
    kind: 'string' as const,   // Note: contextual string values
    inserted_at: 'date' as const,
    updated_at: 'date' as const,
  };

  console.log('1. Valid Query Examples:');
  console.log('------------------------');

  // Valid range query for numeric field
  const validRangeQuery = {
    total: { min: 100, max: 1000 }
  };
  console.log('Range query (valid):', validRangeQuery);
  console.log('Transformed:', processQuery(validRangeQuery, ORDER_FIELD_TYPES));
  console.log();

  // Valid array query
  const validArrayQuery = {
    status: ['confirmed', 'shipped']
  };
  console.log('Array query (valid):', validArrayQuery);
  console.log('Transformed:', processQuery(validArrayQuery, ORDER_FIELD_TYPES));
  console.log();

  // Valid string contains query
  const validStringQuery = {
    reference_id: { contains: 'ORDER-2024' }
  };
  console.log('String contains query (valid):', validStringQuery);
  console.log('Transformed:', processQuery(validStringQuery, ORDER_FIELD_TYPES));
  console.log();

  // Valid date query
  const validDateQuery = {
    inserted_at: { after: '2024-01-01', before: '2024-12-31' }
  };
  console.log('Date range query (valid):', validDateQuery);
  console.log('Transformed:', processQuery(validDateQuery, ORDER_FIELD_TYPES));
  console.log();

  console.log('2. Type Safety Features:');
  console.log('------------------------');

  // The new query system provides:
  console.log('✓ Runtime validation prevents type mismatches');
  console.log('✓ TypeScript constraints guide proper usage');
  console.log('✓ Clear error messages for debugging');
  console.log('✓ Automatic transformation to Elixir format');
  console.log();

  console.log('3. Query Transformation Examples:');
  console.log('---------------------------------');

  // Show how user-friendly queries are transformed
  const complexQuery = {
    // Direct values
    status: 'confirmed',
    
    // Array operations → _in suffix
    id: [1, 2, 3],
    
    // Range operations → _min/_max suffixes
    total: { min: 50, max: 500 },
    
    // String operations → contains. prefix
    reference_id: { contains: 'ORDER' },
    
    // Date operations → before./after. prefixes
    inserted_at: { after: '2024-01-01' },
    
    // Pagination and special fields pass through
    page: 1,
    page_size: 20,
    order_by: 'inserted_at desc'
  };

  console.log('User writes:');
  console.log(JSON.stringify(complexQuery, null, 2));
  console.log();

  console.log('SDK transforms to:');
  const transformed = processQuery(complexQuery, ORDER_FIELD_TYPES);
  console.log(JSON.stringify(transformed, null, 2));
  console.log();

  console.log('4. Using with Orders Resource:');
  console.log('------------------------------');

  // This would work in a real environment with proper authentication
  try {
    console.log('Example usage:');
    console.log('const orders = await inkress.orders.query({');
    console.log('  status: ["confirmed", "shipped"],');
    console.log('  total: { min: 100 },');
    console.log('  inserted_at: { after: "2024-01-01" }');
    console.log('});');
    console.log();
    
    console.log('Or using the query builder:');
    console.log('const orders = await inkress.orders');
    console.log('  .createQueryBuilder()');
    console.log('  .whereStatus("confirmed")');
    console.log('  .whereTotalRange(100, 1000)');
    console.log('  .whereCreatedBetween("2024-01-01")');
    console.log('  .paginate(1, 20)');
    console.log('  .execute();');
  } catch (error) {
    console.log('Note: Actual API calls require proper authentication');
  }

  console.log();
  console.log('=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  demonstrateTypeSafetyValidation().catch(console.error);
}

export { demonstrateTypeSafetyValidation };
