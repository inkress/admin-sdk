import { InkressConfig, ApiResponse } from './types';
export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
}
export declare class HttpClient {
    private config;
    constructor(config: InkressConfig);
    private getBaseUrl;
    private getHeaders;
    private makeRequest;
    private retryRequest;
    private shouldRetry;
    private delay;
    get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    post<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    put<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    delete<T>(path: string): Promise<ApiResponse<T>>;
    patch<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    updateConfig(newConfig: Partial<InkressConfig>): void;
    getConfig(): Omit<InkressConfig, 'bearerToken'>;
}
export declare class InkressApiError extends Error {
    readonly status: number;
    readonly data: any;
    constructor(message: string, status: number, data?: any);
}
//# sourceMappingURL=client.d.ts.map