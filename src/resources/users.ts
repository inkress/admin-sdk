import { HttpClient } from '../client';
import {
  User,
  CreateUserData,
  UpdateUserData,
  ApiResponse,
  PaginationParams,
} from '../types';

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
  sex?: number | null; // 1=male, 2=female, 3=other
  image?: string | null;
  organisation_id?: number | null;
  merchant_id?: number | null;
}

export class UsersResource {
  constructor(private client: HttpClient) {}

  /**
   * List users with pagination and filtering
   * Requires Client-Id header to be set in the configuration
   */
  async list(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    return this.client.get<UserListResponse>('/users', params);
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
  async create(data: CreateUserRequestData): Promise<ApiResponse<User>> {
    return this.client.post<User>('/users', data);
  }

  /**
   * Update an existing user
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/users/${id}`, data);
  }

  /**
   * Delete a user
   * Requires Client-Id header to be set in the configuration
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/users/${id}`);
  }
}
