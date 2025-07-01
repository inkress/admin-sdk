import { HttpClient } from '../client';
import {
  Product,
  PublicMerchantFees,
  ApiResponse,
  PaginationParams,
  PublicMerchant,
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

export interface PublicMerchantParams {
  username?: string;
  'domain.cname'?: string;
}

export class PublicResource {
  constructor(private client: HttpClient) {}

  /**
   * Get public information about a merchant by username or cname
   */
  async getMerchant(params: PublicMerchantParams): Promise<ApiResponse<PublicMerchant>> {
    return this.client.get<PublicMerchant>(`/public/m`, params);
  }
  
  /**
   * Get merchant fees (public endpoint - no auth required)
   */
  async getMerchantFees(merchantUsername: string, params: { currency: string, total: number }): Promise<ApiResponse<PublicMerchantFees>> {
    return this.client.get<PublicMerchantFees>(`/public/m/${merchantUsername}/fees`, params);
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
