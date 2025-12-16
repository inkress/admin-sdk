import { HttpClient } from '../client';
import { User, CreateUserData, UpdateUserData, ApiResponse } from '../types';
import { UserQueryBuilder } from '../utils/query-builders';
import { UserFilterParams, UserQueryParams, UserListResponse } from '../types/resources';
/**
 * @deprecated Use UserFilterParams from types/resources instead
 */
export interface LegacyUserFilterParams {
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
    sex?: number | null;
    image?: string | null;
    kind?: number;
    organisation_id?: number | null;
    role_id?: number;
}
export declare class UsersResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Convert internal user data (integers) to user-facing data (strings)
     */
    private translateUserToUserFacing;
    /**
     * Convert user-facing user data (strings) to internal data (integers)
     */
    private translateUserToInternal;
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    private translateFilters;
    /**
     * List users with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: UserFilterParams): Promise<ApiResponse<UserListResponse>>;
    /**
     * Get a specific user by ID
     * Requires Client-Id header to be set in the configuration
     */
    get(id: number): Promise<ApiResponse<User>>;
    /**
     * Create a new user
     * Requires Client-Id header to be set in the configuration
     */
    create(data: CreateUserData): Promise<ApiResponse<User>>;
    /**
     * Update an existing user
     * Requires Client-Id header to be set in the configuration
     */
    update(id: number, data: UpdateUserData): Promise<ApiResponse<User>>;
    /**
     * Delete a user
     * Requires Client-Id header to be set in the configuration
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Query users with enhanced query support
     * @example
     * await users.query({ status: 'approved', level: { min: 5 } })
     */
    query(params?: UserQueryParams): Promise<ApiResponse<UserListResponse>>;
    /**
     * Create a query builder for users
     * @example
     * await sdk.users.createQueryBuilder().whereStatus('approved').execute()
     */
    createQueryBuilder(initialQuery?: UserQueryParams): UserQueryBuilder;
}
//# sourceMappingURL=users.d.ts.map