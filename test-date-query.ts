import { transformQuery, type DateQuery } from './src/utils/query-transformer';

// Test 1: Min/Max date filtering
console.log('Test 1: Min/Max date filtering');
const query1 = transformQuery({
  inserted_at: {
    min: '2024-01-01T00:00:00Z',
    max: '2024-12-31T23:59:59Z'
  } as DateQuery
});
console.log(JSON.stringify(query1, null, 2));
console.log('Expected: inserted_at_min and inserted_at_max');
console.log('');

// Test 2: Combined date operators
console.log('Test 2: Combined date operators (min, max, after)');
const query2 = transformQuery({
  created_at: {
    min: '2024-01-01',
    max: '2024-12-31',
    after: '2024-06-01'
  } as DateQuery
});
console.log(JSON.stringify(query2, null, 2));
console.log('Expected: created_at_min, created_at_max, and after.created_at');
console.log('');

// Test 3: Traditional before/after/on operators (backward compatibility)
console.log('Test 3: Traditional before/after/on operators');
const query3 = transformQuery({
  updated_at: {
    before: '2024-12-31',
    after: '2024-01-01',
    on: '2024-06-15'
  } as DateQuery
});
console.log(JSON.stringify(query3, null, 2));
console.log('Expected: before.updated_at, after.updated_at, and on.updated_at');
console.log('');

// Test 4: Only min
console.log('Test 4: Only min (from date)');
const query4 = transformQuery({
  start_date: {
    min: '2024-01-01'
  } as DateQuery
});
console.log(JSON.stringify(query4, null, 2));
console.log('Expected: start_date_min');
console.log('');

// Test 5: Only max
console.log('Test 5: Only max (to date)');
const query5 = transformQuery({
  end_date: {
    max: '2024-12-31'
  } as DateQuery
});
console.log(JSON.stringify(query5, null, 2));
console.log('Expected: end_date_max');
