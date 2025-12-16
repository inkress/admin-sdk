import { HttpClient } from '../client';
import {
  PaymentMethod,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { PaymentMethodQueryBuilder } from '../utils/query-builders';
import {
  PaymentMethodFilterParams,
  PaymentMethodQueryParams,
  PaymentMethodListResponse,
  PAYMENT_METHOD_FIELD_TYPES,
} from '../types/resources';

export class PaymentMethodsResource {
  constructor(private client: HttpClient) {}

  /**
   * List payment methods with filtering
   */
  async list(params?: PaymentMethodFilterParams): Promise<ApiResponse<PaymentMethodListResponse>> {
    return this.client.get<PaymentMethodListResponse>('/payment_methods', params);
  }

  /**
   * Get payment method by ID
   */
  async get(id: number): Promise<ApiResponse<PaymentMethod>> {
    return this.client.get<PaymentMethod>(`/payment_methods/${id}`);
  }

  /**
   * Create a new payment method
   */
  async create(data: CreatePaymentMethodData): Promise<ApiResponse<PaymentMethod>> {
    return this.client.post<PaymentMethod>('/payment_methods', data);
  }

  /**
   * Update a payment method
   */
  async update(id: number, data: UpdatePaymentMethodData): Promise<ApiResponse<PaymentMethod>> {
    return this.client.put<PaymentMethod>(`/payment_methods/${id}`, data);
  }

  /**
   * Delete a payment method
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/payment_methods/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const methods = await sdk.paymentMethods.query({
   *   active: true,
   *   provider: { contains: 'stripe' }
   * });
   */
  async query(params: PaymentMethodQueryParams): Promise<ApiResponse<PaymentMethodListResponse>> {
    const processedQuery = processQuery(params, PAYMENT_METHOD_FIELD_TYPES, { validate: true });
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for payment methods
   * 
   * @example
   * const methods = await sdk.paymentMethods.createQueryBuilder()
   *   .whereActiveEquals(true)
   *   .execute();
   */
  createQueryBuilder(): PaymentMethodQueryBuilder {
    return new PaymentMethodQueryBuilder(this);
  }
}
