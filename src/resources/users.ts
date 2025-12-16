import { HttpClient } from '../client';
import {
  User,
  CreateUserData,
  UpdateUserData,
  ApiResponse,
  InternalUser,
  AccountStatus,
  UserKind,
} from '../types';
import {
  StatusTranslator,
  KindTranslator,
  StatusKey,
  KindKey,
} from '../utils/translators';
import { processQuery } from '../utils/query-transformer';
import { UserQueryBuilder } from '../utils/query-builders';
import {
  UserFilterParams,
  UserQueryParams,
  UserListResponse,
  USER_FIELD_TYPES,
} from '../types/resources';

/**
 * @deprecated Use UserFilterParams from types/resources instead
 */
export interface LegacyUserFilterParams {
  // Legacy interface - kept for backward compatibility
}

export interface CreateUserRequestData {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  username?: string;
  password: string;
  status?: number;
  level?: number;
  dob?: number | null;
  sex?: number | null; // 1=male, 2=female, 3=other
  image?: string | null;
  kind?: number;
  organisation_id?: number | null;
  role_id?: number;
}

export class UsersResource {
  constructor(private client: HttpClient) {}

  /**
   * Convert internal user data (integers) to user-facing data (strings)
   */
  private translateUserToUserFacing(internal: InternalUser): User {
    return {
      ...internal,
      status: StatusTranslator.toStringWithoutContext(internal.status, 'account') as AccountStatus,
      kind: KindTranslator.toStringWithoutContext(internal.kind, 'user') as UserKind,
    };
  }

  /**
   * Convert user-facing user data (strings) to internal data (integers)
   */
  private translateUserToInternal(userFacing: CreateUserData | UpdateUserData): any {
    const internal: any = { ...userFacing };
    
    if ('status' in userFacing && userFacing.status) {
      if (typeof userFacing.status === 'string') {
        internal.status = StatusTranslator.toIntegerWithContext(userFacing.status as AccountStatus | StatusKey, 'account');
      } else {
        internal.status = userFacing.status;
      }
    }
    
    if ('kind' in userFacing && userFacing.kind) {
      if (typeof userFacing.kind === 'string') {
        internal.kind = KindTranslator.toIntegerWithContext(userFacing.kind as UserKind | KindKey, 'user');
      } else {
        internal.kind = userFacing.kind;
      }
    }
    
    return internal;
  }

  /**
   * Convert filter parameters (strings to integers where needed)
   */
  private translateFilters(params?: UserFilterParams): any {
    if (!params) return params;
    
    const translated: any = { ...params };
    
    if (params.status && typeof params.status === 'string') {
      translated.status = StatusTranslator.toIntegerWithContext(params.status as AccountStatus | StatusKey, 'account');
    }
    
    if (params.kind && typeof params.kind === 'string') {
      translated.kind = KindTranslator.toIntegerWithContext(params.kind as UserKind | KindKey, 'user');
    }
    
    return translated;
  }

  /**
   * List users with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: UserFilterParams): Promise<ApiResponse<UserListResponse>> {
    const translatedParams = this.translateFilters(params);
    return this.client.get<UserListResponse>('/users', translatedParams);
  }

  /**
   * Get a specific user by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<User>> {
    return this.client.get<User>(`/users/${id}`);
  }

  /**
   * Create a new user
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateUserData): Promise<ApiResponse<User>> {
    const internalData = this.translateUserToInternal(data);
    return this.client.post<User>('/users', internalData);
  }

  /**
   * Update an existing user
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateUserData): Promise<ApiResponse<User>> {
    const translatedData = this.translateUserToInternal(data);
    return this.client.put<User>(`/users/${id}`, translatedData);
  }

  /**
   * Delete a user
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/users/${id}`);
  }

  /**
   * Query users with enhanced query support
   * @example
   * await users.query({ status: 'approved', level: { min: 5 } })
   */
  async query(params?: UserQueryParams): Promise<ApiResponse<UserListResponse>> {
    const processedQuery = processQuery(params || {}, USER_FIELD_TYPES, { validate: true });
    const translatedQuery = this.translateFilters(processedQuery);
    const response = await this.client.get<{ entries: InternalUser[]; page_info: any }>('/users', translatedQuery);
    
    if (response.result?.entries) {
      const translatedEntries = response.result.entries.map(user => this.translateUserToUserFacing(user));
      return {
        state: response.state,
        result: { entries: translatedEntries, page_info: response.result.page_info }
      };
    }
    
    return { state: response.state, result: response.result as any };
  }

  /**
   * Create a query builder for users
   * @example
   * await sdk.users.createQueryBuilder().whereStatus('approved').execute()
   */
  createQueryBuilder(initialQuery?: UserQueryParams): UserQueryBuilder {
    return new UserQueryBuilder(this, initialQuery);
  }
}
