import { HttpClient } from '../client';
import { User, UpdateUserData, ApiResponse, BaseFilterParams, AccountStatus, UserKind } from '../types';
import { StatusKey, KindKey } from '../utils/translators';
export interface UserFilterParams extends BaseFilterParams {
    search?: string;
    status?: AccountStatus | StatusKey | number;
    kind?: UserKind | KindKey | number;
    level?: number;
    role_id?: number;
    organisation_id?: number;
    limit?: number;
    id?: number;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    dob?: number;
    sex?: number;
    image?: string;
    uid?: string;
    inserted_at?: string;
    updated_at?: string;
}
export interface UserListResponse {
    entries: User[];
    page_info: {
        current_page: number;
        total_pages: number;
        total_entries: number;
        page_size: number;
    };
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
    create(data: CreateUserRequestData): Promise<ApiResponse<User>>;
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
}
//# sourceMappingURL=users.d.ts.map