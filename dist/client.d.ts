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
    /**
     * A request relative to the API origin (not `/api/<version>`), returning the status, headers and
     * parsed body without the `{state, result}` envelope or throwing on 4xx. Used for endpoints that
     * speak another protocol (OFREP) or answer without the envelope (`/access`).
     */
    raw<T = unknown>(method: 'GET' | 'POST', originPath: string, options?: {
        body?: unknown;
        headers?: Record<string, string>;
    }): Promise<RawResponse<T>>;
    get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    post<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    put<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    delete<T>(path: string): Promise<ApiResponse<T>>;
    patch<T>(path: string, body?: any): Promise<ApiResponse<T>>;
    updateConfig(newConfig: Partial<InkressConfig>): void;
    getConfig(): Omit<InkressConfig, 'accessToken'>;
}
/** Result of `HttpClient.raw`. */
export interface RawResponse<T> {
    status: number;
    headers: Headers;
    body: T | null;
}
export declare class InkressApiError extends Error {
    readonly status: number;
    readonly result: any;
    constructor(message: string, status: number, result?: any);
}
//# sourceMappingURL=client.d.ts.map