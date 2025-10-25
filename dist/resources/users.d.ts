import { HttpClient } from '../client';
import { User, CreateUserData, UpdateUserData, ApiResponse, PaginationParams } from '../types';
export interface UserListParams extends PaginationParams {
    search?: string;
    status?: number;
    level?: number;
    role_id?: number;
    organisation_id?: number;
    limit?: number;
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
export interface CreateUserRequestData extends CreateUserData {
    level?: number;
    dob?: number | null;
    sex?: number | null;
    image?: string | null;
    organisation_id?: number | null;
    merchant_id?: number | null;
}
export declare class UsersResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List users with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    list(params?: UserListParams): Promise<ApiResponse<UserListResponse>>;
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