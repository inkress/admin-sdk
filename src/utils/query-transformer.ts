/**
 * Type-Based Query System
 */

// Range queries for numeric/date fields
export type RangeQuery<T> = {
  min?: T;
  max?: T;
};

// String-specific queries
export type StringQuery = {
  contains?: string;
};

// Date-specific queries
export type DateQuery = {
  before?: string;
  after?: string;
  on?: string;
};

// JSON field queries
export type JsonQueryParams = {
  [key: string]: any | {
    in?: any;
    not?: any;
    null?: boolean;
    not_null?: boolean;
    min?: any;
    max?: any;
  };
};

// Simplified query parameters for better compatibility
export type QueryParams<T> = {
  [K in keyof T]?: any;
} & {
  exclude?: string | number;
  distinct?: string;
  order_by?: string;
  data?: JsonQueryParams;
  page?: number;
  page_size?: number;
  per_page?: number;
  limit?: number;
  override_page?: string | boolean;
  q?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
};

/**
 * Transform a clean user query into Elixir-compatible format
 */
export function transformQuery<T>(query: any): Record<string, any> {
  if (!query || typeof query !== 'object') {
    return {};
  }

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (isSpecialField(key)) {
      result[key] = value;
      continue;
    }
    
    if (key === 'data' && typeof value === 'object') {
      result.data = transformJsonQuery(value as JsonQueryParams);
      continue;
    }
    
    result[key] = transformFieldValue(key, value);
  }
  
  return result;
}

/**
 * Check if a field is a special field that should pass through unchanged
 */
function isSpecialField(key: string): boolean {
  const specialFields = [
    'exclude', 'distinct', 'order_by', 'page', 'page_size', 'per_page',
    'limit', 'override_page', 'q', 'search', 'sort', 'order'
  ];
  return specialFields.includes(key);
}

/**
 * Transform a field value based on its type
 */
function transformFieldValue(key: string, value: any): any {
  if (Array.isArray(value)) {
    return { [`${key}_in`]: value };
  } 
  
  if (typeof value === 'object' && value !== null) {
    const transformedObject: Record<string, any> = {};
    
    if ('min' in value && value.min !== undefined) {
      transformedObject[`${key}_min`] = value.min;
    }
    if ('max' in value && value.max !== undefined) {
      transformedObject[`${key}_max`] = value.max;
    }
    
    if ('contains' in value && value.contains !== undefined) {
      transformedObject[`contains.${key}`] = value.contains;
    }
    
    if ('before' in value && value.before !== undefined) {
      transformedObject[`before.${key}`] = value.before;
    }
    if ('after' in value && value.after !== undefined) {
      transformedObject[`after.${key}`] = value.after;
    }
    if ('on' in value && value.on !== undefined) {
      transformedObject[`on.${key}`] = value.on;
    }
    
    if (Object.keys(transformedObject).length > 0) {
      return transformedObject;
    }
  }
  
  return { [key]: value };
}

/**
 * Transform JSON field queries with special operators
 */
function transformJsonQuery(data: JsonQueryParams): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (key.includes('->')) {
      result[key] = value;
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      if ('in' in value && value.in !== undefined) {
        result[`in_${key}`] = value.in;
      }
      if ('not' in value && value.not !== undefined) {
        result[`not_${key}`] = value.not;
      }
      if ('null' in value && value.null !== undefined) {
        result[`null_${key}`] = value.null;
      }
      if ('not_null' in value && value.not_null !== undefined) {
        result[`not_null_${key}`] = value.not_null;
      }
      if ('min' in value && value.min !== undefined) {
        result[`${key}_min`] = value.min;
      }
      if ('max' in value && value.max !== undefined) {
        result[`${key}_max`] = value.max;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Flatten the transformed query object for API consumption
 */
export function flattenTransformedQuery(transformed: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(transformed)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (hasTransformationKeys(value)) {
        Object.assign(result, value);
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Check if an object contains transformation keys
 */
function hasTransformationKeys(obj: Record<string, any>): boolean {
  const keys = Object.keys(obj);
  return keys.some(key => 
    key.includes('_min') || 
    key.includes('_max') || 
    key.includes('_in') ||
    key.includes('contains.') ||
    key.includes('before.') ||
    key.includes('after.') ||
    key.includes('on.')
  );
}

/**
 * Main function to transform and flatten a query in one step
 */
export function processQuery<T>(
  query: any, 
  fieldTypes?: Partial<Record<keyof T, 'string' | 'number' | 'boolean' | 'date' | 'array'>>,
  options: { validate?: boolean } = { validate: false }
): Record<string, any> {
  const transformed = transformQuery(query);
  return flattenTransformedQuery(transformed);
}

/**
 * Type-safe query builder for specific entity types
 */
export class QueryBuilder<T> {
  private query: any = {};

  constructor(initialQuery?: any) {
    if (initialQuery) {
      this.query = { ...initialQuery };
    }
  }

  where<K extends keyof T>(field: K, value: any): this {
    this.query[field] = value;
    return this;
  }

  whereIn<K extends keyof T>(field: K, values: any[]): this {
    this.query[field] = values;
    return this;
  }

  whereRange<K extends keyof T>(field: K, min?: any, max?: any): this {
    const range: any = {};
    if (min !== undefined) range.min = min;
    if (max !== undefined) range.max = max;
    this.query[field] = range;
    return this;
  }

  whereContains<K extends keyof T>(field: K, value: string): this {
    this.query[field] = { contains: value };
    return this;
  }

  whereDateRange<K extends keyof T>(field: K, after?: string, before?: string, on?: string): this {
    const dateQuery: any = {};
    if (after !== undefined) dateQuery.after = after;
    if (before !== undefined) dateQuery.before = before;
    if (on !== undefined) dateQuery.on = on;
    this.query[field] = dateQuery;
    return this;
  }

  paginate(page: number, pageSize: number): this {
    this.query.page = page;
    this.query.page_size = pageSize;
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.order_by = `${field} ${direction}`;
    return this;
  }

  search(term: string): this {
    this.query.q = term;
    return this;
  }

  build(): Record<string, any> {
    return processQuery(this.query);
  }

  getRawQuery(): any {
    return { ...this.query };
  }
}
