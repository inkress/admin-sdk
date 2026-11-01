import { HttpClient } from '../client';
import { PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData, ApiResponse } from '../types';
import { PaymentMethodQueryBuilder } from '../utils/query-builders';
import { PaymentMethodFilterParams, PaymentMethodQueryParams, PaymentMethodListResponse } from '../types/resources';
export declare class PaymentMethodsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * List payment methods with filtering
     */
    list(params?: PaymentMethodFilterParams): Promise<ApiResponse<PaymentMethodListResponse>>;
    /**
     * Get payment method by ID
     */
    get(id: number): Promise<ApiResponse<PaymentMethod>>;
    /**
     * Create a new payment method
     */
    create(data: CreatePaymentMethodData): Promise<ApiResponse<PaymentMethod>>;
    /**
     * Update a payment method
     */
    update(id: number, data: UpdatePaymentMethodData): Promise<ApiResponse<PaymentMethod>>;
    /**
     * Delete a payment method
     */
    delete(id: number): Promise<ApiResponse<void>>;
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const methods = await sdk.paymentMethods.query({
     *   active: true,
     *   provider: { contains: 'stripe' }
     * });
     */
    query(params: PaymentMethodQueryParams): Promise<ApiResponse<PaymentMethodListResponse>>;
    /**
     * Create a fluent query builder for payment methods
     *
     * @example
     * const methods = await sdk.paymentMethods.createQueryBuilder()
     *   .whereActiveEquals(true)
     *   .execute();
     */
    createQueryBuilder(): PaymentMethodQueryBuilder;
}
//# sourceMappingURL=payment-methods.d.ts.map