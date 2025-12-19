import fetch from 'cross-fetch';
import { InkressConfig, ApiResponse, ErrorResponse } from './types';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export class HttpClient {
  private config: Required<InkressConfig> & { endpoint: string };

  constructor(config: InkressConfig) {
    // Compute endpoint from mode
    const endpoint = config.mode === 'sandbox' 
      ? 'https://api-dev.inkress.com' 
      : 'https://api.inkress.com';

    let mode: 'live' | 'sandbox' = 'live';
    if (config.accessToken.includes('_test_')) {
      mode = 'sandbox';
    }

    this.config = {
      accessToken: config.accessToken,
      mode: config.mode || mode,
      apiVersion: config.apiVersion || 'v1',
      username: config.username || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 0,
      headers: config.headers || {},
      endpoint, // computed from mode
    };
  }

  private getBaseUrl(): string {
    const { endpoint, apiVersion } = this.config;
    return `${endpoint}/api/${apiVersion}`;
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.accessToken}`,
      ...this.config.headers,
      ...additionalHeaders,
    };

    // Add Client-Id header if username is provided (prepend with 'm-')
    if (this.config.username) {
      headers['Client-Id'] = `m-${this.config.username}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.getBaseUrl()}${path}`;
    const { method = 'GET', body, headers: requestHeaders, timeout } = options;

    const headers = this.getHeaders(requestHeaders);
    const requestTimeout = timeout || this.config.timeout;

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), requestTimeout);
    });

    try {
      const response = await Promise.race([
        fetch(url, requestInit),
        timeoutPromise,
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        throw new InkressApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const responseText = await response.text();
      if (!responseText) {
        return { state: 'ok', result: undefined as T };
      }

      const data = JSON.parse(responseText);
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof InkressApiError) {
        throw error;
      }
      throw new InkressApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        { error }
      );
    }
  }

  private async retryRequest<T>(
    path: string,
    options: RequestOptions = {},
    retries: number = this.config.retries
  ): Promise<ApiResponse<T>> {
    try {
      return await this.makeRequest<T>(path, options);
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(1000 * (this.config.retries - retries + 1));
        return this.retryRequest<T>(path, options, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof InkressApiError) {
      // Retry on 5xx errors and timeouts
      return error.status >= 500 || error.status === 0;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.retryRequest<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(path, { method: 'POST', body });
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(path, { method: 'PUT', body });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(path, { method: 'DELETE' });
  }

  async patch<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(path, { method: 'PATCH', body });
  }

  // Update configuration
  updateConfig(newConfig: Partial<InkressConfig>): void {
    // Recompute endpoint if mode changes
    if (newConfig.mode) {
      const endpoint = newConfig.mode === 'sandbox' 
        ? 'https://api-dev.inkress.com' 
        : 'https://api.inkress.com';
      this.config = { ...this.config, ...newConfig, endpoint } as any;
    } else {
      this.config = { ...this.config, ...newConfig } as any;
    }
  }

  // Get current configuration (without sensitive data)
  getConfig(): Omit<InkressConfig, 'accessToken'> {
    const { accessToken, ...config } = this.config;
    // Remove computed endpoint from config
    const { endpoint, ...publicConfig } = config as any;
    return publicConfig;
  }
}

export class InkressApiError extends Error {
  public readonly status: number;
  public readonly result: any;

  constructor(message: string, status: number, result?: any) {
    super(message);
    this.name = 'InkressApiError';
    this.status = status;
    this.result = result;
  }
}
