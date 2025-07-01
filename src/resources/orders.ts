import { HttpClient } from '../client';
import {
  Order,
  CreateOrderData,
  UpdateOrderData,
  ApiResponse,
  Customer,
} from '../types';

export interface CreateOrderRequestData {
  currency_code: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  total: number;
  reference_id?: string;
  kind?: 'online' | 'offline' | 'subscription';
}

export interface CreateOrderResponseData {
  id: number;
  payment_urls?: {
    short_link: string;
  };
  transaction?: {
    id: number;
  };
}

export interface UpdateOrderStatusData {
  status: number;
}

export class OrdersResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new order
   * Requires Client-Id header to be set in the configuration
   */
  async create(data: CreateOrderRequestData): Promise<ApiResponse<CreateOrderResponseData>> {
    return this.client.post<CreateOrderResponseData>('/orders', data);
  }

  /**
   * Get order details by ID
   * Requires Client-Id header to be set in the configuration
   */
  async get(id: number): Promise<ApiResponse<Order>> {
    return this.client.get<Order>(`/orders/${id}`);
  }

  /**
   * Update order status
   * Requires Client-Id header to be set in the configuration
   */
  async update(id: number, data: UpdateOrderStatusData): Promise<ApiResponse<Order>> {
    return this.client.put<Order>(`/orders/${id}`, data);
  }

  /**
   * Get order status (public endpoint - no auth required)
   */
  async getStatus(id: number): Promise<ApiResponse<Order>> {
    return this.client.get<Order>(`/orders/status/${id}`);
  }

  /**
   * Get order list with pagination and filtering
   * Supports filtering by status, kind, customer email, and date range
   * Requires Client-Id header to be set in the configuration
   */
  async list(): Promise<ApiResponse<any>> {
    return this.client.get<any>('/orders');
  }
}
