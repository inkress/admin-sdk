import { HttpClient } from '../client';
import {
  Product,
  PublicMerchantFees,
  ApiResponse,
  BaseFilterParams,
  PublicMerchant,
} from '../types';

export interface PublicProductFilterParams extends BaseFilterParams {
  // Common filters
  search?: string; // Legacy search field - consider using 'q' instead
  category?: string;
  limit?: number;
  
  // Database field filters - any field from the products table can be filtered
  id?: number;
  title?: string;
  teaser?: string;
  price?: number;
  permalink?: string;
  image?: string;
  public?: boolean;
  unlimited?: boolean;
  units_remaining?: number;
  units_sold?: number;
  rating_sum?: number;
  rating_count?: number;
  tag_ids?: number[];
  uid?: string;
  category_id?: number;
  currency_id?: number;
  user_id?: number;
  inserted_at?: string;
  updated_at?: string;
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
    params?: PublicProductFilterParams
  ): Promise<ApiResponse<PublicProductListResponse>> {
    return this.client.get<PublicProductListResponse>(`/public/m/${merchantUsername}/products`, params);
  }
}
