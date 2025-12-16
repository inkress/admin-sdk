import { HttpClient } from '../client';
import {
  WebhookUrl,
  CreateWebhookUrlData,
  UpdateWebhookUrlData,
  ApiResponse,
} from '../types';
import { processQuery } from '../utils/query-transformer';
import { WebhookUrlQueryBuilder } from '../utils/query-builders';
import {
  WebhookUrlFilterParams,
  WebhookUrlQueryParams,
  WebhookUrlListResponse,
  WEBHOOK_URL_FIELD_TYPES,
} from '../types/resources';

export class WebhookUrlsResource {
  constructor(private client: HttpClient) {}

  /**
   * List webhook URLs with filtering
   */
  async list(params?: WebhookUrlFilterParams): Promise<ApiResponse<WebhookUrlListResponse>> {
    return this.client.get<WebhookUrlListResponse>('/webhook_urls', params);
  }

  /**
   * Get webhook URL by ID
   */
  async get(id: number): Promise<ApiResponse<WebhookUrl>> {
    return this.client.get<WebhookUrl>(`/webhook_urls/${id}`);
  }

  /**
   * Create a new webhook URL
   */
  async create(data: CreateWebhookUrlData): Promise<ApiResponse<WebhookUrl>> {
    return this.client.post<WebhookUrl>('/webhook_urls', data);
  }

  /**
   * Update a webhook URL
   */
  async update(id: number, data: UpdateWebhookUrlData): Promise<ApiResponse<WebhookUrl>> {
    return this.client.put<WebhookUrl>(`/webhook_urls/${id}`, data);
  }

  /**
   * Delete a webhook URL
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/webhook_urls/${id}`);
  }

  /**
   * Advanced query interface with full type safety
   * 
   * @example
   * const webhooks = await sdk.webhookUrls.query({
   *   event: 'order.created',
   *   merchant_id: 123
   * });
   */
  async query(params: WebhookUrlQueryParams): Promise<ApiResponse<WebhookUrlListResponse>> {
    const processedQuery = processQuery(params, WEBHOOK_URL_FIELD_TYPES);
    return this.list(processedQuery as any);
  }

  /**
   * Create a fluent query builder for webhook URLs
   * 
   * @example
   * const webhooks = await sdk.webhookUrls.createQueryBuilder()
   *   .whereEventEquals('order.created')
   *   .whereMerchantIdEquals(123)
   *   .execute();
   */
  createQueryBuilder(): WebhookUrlQueryBuilder {
    return new WebhookUrlQueryBuilder(this);
  }
}
