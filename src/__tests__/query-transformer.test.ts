
import {
  transformQuery,
  processQuery,
  flattenTransformedQuery,
  QueryBuilder,
  type QueryParams,
  type RangeQuery,
  type StringQuery,
  type DateQuery,
  type JsonQueryParams
} from '../utils/query-transformer';

// Mock entity type for testing
interface TestEntity {
  id: number;
  name: string;
  email: string;
  age: number;
  total: number;
  created_at: string;
  status: string;
  data?: Record<string, any>;
}

describe('Query Transformer', () => {
  describe('transformQuery', () => {
    it('should pass through special fields unchanged', () => {
      const query: QueryParams<TestEntity> = {
        exclude: 5,
        distinct: 'name',
        order_by: 'created_at desc',
        page: 1,
        page_size: 20,
        limit: 10,
        override_page: true,
        q: 'search term',
        search: 'legacy search',
        sort: 'name',
        order: 'asc'
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        exclude: 5,
        distinct: 'name',
        order_by: 'created_at desc',
        page: 1,
        page_size: 20,
        limit: 10,
        override_page: true,
        q: 'search term',
        search: 'legacy search',
        sort: 'name',
        order: 'asc'
      });
    });

    it('should transform array values to _in suffix', () => {
      const query: QueryParams<TestEntity> = {
        id: [1, 2, 3, 4],
        status: ['active', 'pending']
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        id: { id_in: [1, 2, 3, 4] },
        status: { status_in: ['active', 'pending'] }
      });
    });

    it('should transform range queries to _min/_max suffixes', () => {
      const query: QueryParams<TestEntity> = {
        age: { min: 18, max: 65 },
        total: { min: 100 }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        age: { age_min: 18, age_max: 65 },
        total: { total_min: 100 }
      });
    });

    it('should transform string queries to contains. prefix', () => {
      const query: QueryParams<TestEntity> = {
        name: { contains: 'john' },
        email: { contains: '@gmail.com' }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        name: { 'contains.name': 'john' },
        email: { 'contains.email': '@gmail.com' }
      });
    });

    it('should transform date queries to date prefixes', () => {
      const query: QueryParams<TestEntity> = {
        created_at: {
          after: '2024-01-01',
          before: '2024-12-31',
          on: '2024-06-15'
        }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        created_at: {
          'after.created_at': '2024-01-01',
          'before.created_at': '2024-12-31',
          'on.created_at': '2024-06-15'
        }
      });
    });

    it('should transform date queries with min/max to _min/_max suffixes', () => {
      const query: QueryParams<TestEntity> = {
        created_at: {
          min: '2024-01-01T00:00:00Z',
          max: '2024-12-31T23:59:59Z'
        }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        created_at: {
          created_at_min: '2024-01-01T00:00:00Z',
          created_at_max: '2024-12-31T23:59:59Z'
        }
      });
    });

    it('should handle combined date query operators', () => {
      const query: QueryParams<TestEntity> = {
        created_at: {
          min: '2024-01-01T00:00:00Z',
          max: '2024-12-31T23:59:59Z',
          after: '2024-06-01'
        }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        created_at: {
          created_at_min: '2024-01-01T00:00:00Z',
          created_at_max: '2024-12-31T23:59:59Z',
          'after.created_at': '2024-06-01'
        }
      });
    });

    it('should transform direct values as equality', () => {
      const query: QueryParams<TestEntity> = {
        id: 5,
        name: 'john',
        age: 25
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        id: { id: 5 },
        name: { name: 'john' },
        age: { age: 25 }
      });
    });

    it('should handle complex combined queries', () => {
      const query: QueryParams<TestEntity> = {
        id: [1, 2, 3],
        age: { min: 18, max: 65 },
        name: { contains: 'john' },
        created_at: { after: '2024-01-01' },
        status: 'active',
        page: 1,
        page_size: 20,
        q: 'search'
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        id: { id_in: [1, 2, 3] },
        age: { age_min: 18, age_max: 65 },
        name: { 'contains.name': 'john' },
        created_at: { 'after.created_at': '2024-01-01' },
        status: { status: 'active' },
        page: 1,
        page_size: 20,
        q: 'search'
      });
    });

    it('should skip undefined and null values', () => {
      const query: QueryParams<TestEntity> = {
        id: undefined,
        name: null,
        age: 25
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        age: { age: 25 }
      });
    });
  });

  describe('JSON Query Transformation', () => {
    it('should transform JSON field queries', () => {
      const jsonQuery: JsonQueryParams = {
        role: 'admin',
        status: { in: 'active' },
        deleted: { not: true },
        archived: { null: true },
        active: { not_null: true },
        priority: { min: 1, max: 5 },
        'settings->theme': 'dark'
      };

      const query: QueryParams<TestEntity> = {
        data: jsonQuery
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        data: {
          role: 'admin',
          in_status: 'active',
          not_deleted: true,
          null_archived: true,
          not_null_active: true,
          priority_min: 1,
          priority_max: 5,
          'settings->theme': 'dark'
        }
      });
    });

    it('should handle nested JSON paths correctly', () => {
      const query: QueryParams<TestEntity> = {
        data: {
          'user->profile->name': 'john',
          'settings->display->theme': 'dark',
          direct_field: 'value'
        }
      };

      const result = transformQuery(query);

      expect(result).toEqual({
        data: {
          'user->profile->name': 'john',
          'settings->display->theme': 'dark',
          direct_field: 'value'
        }
      });
    });
  });

  describe('flattenTransformedQuery', () => {
    it('should flatten transformation objects', () => {
      const transformed = {
        id: { id_in: [1, 2, 3] },
        age: { age_min: 18, age_max: 65 },
        name: { 'contains.name': 'john' },
        status: { status: 'active' },
        page: 1,
        data: { role: 'admin', in_status: 'active' }
      };

      const result = flattenTransformedQuery(transformed);

      expect(result).toEqual({
        id_in: [1, 2, 3],
        age_min: 18,
        age_max: 65,
        'contains.name': 'john',
        status: 'active',
        page: 1,
        data: { role: 'admin', in_status: 'active' }
      });
    });

    it('should not flatten non-transformation objects', () => {
      const transformed = {
        regularObject: { key: 'value', nested: { data: 'test' } },
        transformationObject: { field_min: 10, field_max: 20 },
        array: [1, 2, 3],
        string: 'value'
      };

      const result = flattenTransformedQuery(transformed);

      expect(result).toEqual({
        regularObject: { key: 'value', nested: { data: 'test' } },
        field_min: 10,
        field_max: 20,
        array: [1, 2, 3],
        string: 'value'
      });
    });
  });

  describe('processQuery', () => {
    it('should transform and flatten in one step', () => {
      const query: QueryParams<TestEntity> = {
        id: [1, 2, 3],
        age: { min: 18, max: 65 },
        name: { contains: 'john' },
        status: 'active',
        page: 1
      };

      const result = processQuery(query);

      expect(result).toEqual({
        id_in: [1, 2, 3],
        age_min: 18,
        age_max: 65,
        'contains.name': 'john',
        status: 'active',
        page: 1
      });
    });

    it('should handle empty queries', () => {
      const result = processQuery({});
      expect(result).toEqual({});
    });

    it('should handle undefined queries', () => {
      const result = processQuery(undefined as any);
      expect(result).toEqual({});
    });
  });

  describe('QueryBuilder', () => {
    let builder: QueryBuilder<TestEntity>;

    beforeEach(() => {
      builder = new QueryBuilder<TestEntity>();
    });

    it('should build simple where conditions', () => {
      const result = builder
        .where('id', 5)
        .where('name', 'john')
        .build();

      expect(result).toEqual({
        id: 5,
        name: 'john'
      });
    });

    it('should build whereIn conditions', () => {
      const result = builder
        .whereIn('id', [1, 2, 3])
        .whereIn('status', ['active', 'pending'])
        .build();

      expect(result).toEqual({
        id_in: [1, 2, 3],
        status_in: ['active', 'pending']
      });
    });

    it('should build range conditions', () => {
      const result = builder
        .whereRange('age', 18, 65)
        .whereRange('total', 100, undefined)
        .build();

      expect(result).toEqual({
        age_min: 18,
        age_max: 65,
        total_min: 100
      });
    });

    it('should build string contains conditions', () => {
      const result = builder
        .whereContains('name', 'john')
        .whereContains('email', '@gmail.com')
        .build();

      expect(result).toEqual({
        'contains.name': 'john',
        'contains.email': '@gmail.com'
      });
    });

    it('should build date range conditions', () => {
      const result = builder
        .whereDateRange('created_at', '2024-01-01', '2024-12-31')
        .whereDateRange('updated_at', undefined, undefined, '2024-06-15')
        .build();

      expect(result).toEqual({
        'after.created_at': '2024-01-01',
        'before.created_at': '2024-12-31',
        'on.updated_at': '2024-06-15'
      });
    });

    it('should build pagination', () => {
      const result = builder
        .paginate(2, 25)
        .build();

      expect(result).toEqual({
        page: 2,
        page_size: 25
      });
    });

    it('should build ordering', () => {
      const result = builder
        .orderBy('created_at', 'desc')
        .build();

      expect(result).toEqual({
        order_by: 'created_at desc'
      });
    });

    it('should build search', () => {
      const result = builder
        .search('search term')
        .build();

      expect(result).toEqual({
        q: 'search term'
      });
    });

    it('should build complex fluent queries', () => {
      const result = builder
        .where('status', 'active')
        .whereIn('id', [1, 2, 3])
        .whereRange('age', 18, 65)
        .whereContains('name', 'john')
        .whereDateRange('created_at', '2024-01-01', '2024-12-31')
        .paginate(1, 20)
        .orderBy('created_at', 'desc')
        .search('electronics')
        .build();

      expect(result).toEqual({
        status: 'active',
        id_in: [1, 2, 3],
        age_min: 18,
        age_max: 65,
        'contains.name': 'john',
        'after.created_at': '2024-01-01',
        'before.created_at': '2024-12-31',
        page: 1,
        page_size: 20,
        order_by: 'created_at desc',
        q: 'electronics'
      });
    });

    it('should get raw query before transformation', () => {
      builder
        .where('id', 5)
        .whereIn('status', ['active', 'pending']);

      const raw = builder.getRawQuery();

      expect(raw).toEqual({
        id: 5,
        status: ['active', 'pending']
      });
    });

    it('should accept initial query in constructor', () => {
      const initialQuery: QueryParams<TestEntity> = {
        name: 'initial',
        age: 25
      };

      const builderWithInitial = new QueryBuilder(initialQuery);
      const result = builderWithInitial
        .where('status', 'active')
        .build();

      expect(result).toEqual({
        name: 'initial',
        age: 25,
        status: 'active'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty range objects', () => {
      const query: QueryParams<TestEntity> = {
        age: {} as RangeQuery<number>
      };

      const result = processQuery(query);
      expect(result).toEqual({});
    });

    it('should handle empty string objects', () => {
      const query: QueryParams<TestEntity> = {
        name: {} as StringQuery
      };

      const result = processQuery(query);
      expect(result).toEqual({});
    });

    it('should handle empty date objects', () => {
      const query: QueryParams<TestEntity> = {
        created_at: {} as DateQuery
      };

      const result = processQuery(query);
      expect(result).toEqual({});
    });

    it('should handle mixed range conditions', () => {
      const query: QueryParams<TestEntity> = {
        age: { min: 18 },
        total: { max: 1000 }
      };

      const result = processQuery(query);

      expect(result).toEqual({
        age_min: 18,
        total_max: 1000
      });
    });

    it('should handle complex objects that are not query operations', () => {
      const query: QueryParams<TestEntity> = {
        data: {
          complexObject: {
            nested: {
              value: 'test'
            },
            array: [1, 2, 3]
          }
        }
      };

      const result = processQuery(query);

      expect(result).toEqual({
        data: {
          complexObject: {
            nested: {
              value: 'test'
            },
            array: [1, 2, 3]
          }
        }
      });
    });
  });
});
