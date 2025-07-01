import { HttpClient } from '../client';
import {
  Product,
  PublicMerchantFees,
  ApiResponse,
  PaginationParams,
} from '../types';

export interface PublicProductListParams extends PaginationParams {
  search?: string;
  category?: string;
  limit?: number;
}

export interface PublicProductListResponse {
  entries: Product[];
  page_info: {
    current_page: number;
    total_pages: number;
    total_entries: number;
    page_size: number;
  };
}

export class PublicResource {
  constructor(private client: HttpClient) {}

  /**
   * Get merchant fees (public endpoint - no auth required)
   */
  async getMerchantFees(merchantUsername: string): Promise<ApiResponse<PublicMerchantFees>> {
    return this.client.get<PublicMerchantFees>(`/public/m/${merchantUsername}/fees`);
  }

  /**
   * Get merchant products (public endpoint - no auth required)
   */
  async getMerchantProducts(
    merchantUsername: string, 
    params?: PublicProductListParams
  ): Promise<ApiResponse<PublicProductListResponse>> {
    return this.client.get<PublicProductListResponse>(`/public/m/${merchantUsername}/products`, params);
  }
}
