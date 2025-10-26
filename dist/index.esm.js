import fetch from 'cross-fetch';

class HttpClient {
    constructor(config) {
        this.config = {
            endpoint: 'https://api.inkress.com',
            apiVersion: 'v1',
            clientId: '',
            timeout: 30000,
            retries: 0,
            headers: {},
            ...config,
        };
    }
    getBaseUrl() {
        const { endpoint, apiVersion } = this.config;
        return `${endpoint}/api/${apiVersion}`;
    }
    getHeaders(additionalHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.bearerToken}`,
            ...this.config.headers,
            ...additionalHeaders,
        };
        // Add Client-Id header if provided
        if (this.config.clientId) {
            headers['Client-Id'] = this.config.clientId;
        }
        return headers;
    }
    async makeRequest(path, options = {}) {
        const url = `${this.getBaseUrl()}${path}`;
        const { method = 'GET', body, headers: requestHeaders, timeout } = options;
        const headers = this.getHeaders(requestHeaders);
        const requestTimeout = timeout || this.config.timeout;
        const requestInit = {
            method,
            headers,
        };
        if (body && method !== 'GET') {
            requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
        }
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), requestTimeout);
        });
        try {
            const response = await Promise.race([
                fetch(url, requestInit),
                timeoutPromise,
            ]);
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                }
                catch (_a) {
                    errorData = { message: errorText || `HTTP ${response.status}` };
                }
                throw new InkressApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData);
            }
            const responseText = await response.text();
            if (!responseText) {
                return { state: 'ok', data: undefined };
            }
            const data = JSON.parse(responseText);
            return data;
        }
        catch (error) {
            if (error instanceof InkressApiError) {
                throw error;
            }
            throw new InkressApiError(error instanceof Error ? error.message : 'Unknown error', 0, { error });
        }
    }
    async retryRequest(path, options = {}, retries = this.config.retries) {
        try {
            return await this.makeRequest(path, options);
        }
        catch (error) {
            if (retries > 0 && this.shouldRetry(error)) {
                await this.delay(1000 * (this.config.retries - retries + 1));
                return this.retryRequest(path, options, retries - 1);
            }
            throw error;
        }
    }
    shouldRetry(error) {
        if (error instanceof InkressApiError) {
            // Retry on 5xx errors and timeouts
            return error.status >= 500 || error.status === 0;
        }
        return false;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async get(path, params) {
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
        return this.retryRequest(url, { method: 'GET' });
    }
    async post(path, body) {
        return this.retryRequest(path, { method: 'POST', body });
    }
    async put(path, body) {
        return this.retryRequest(path, { method: 'PUT', body });
    }
    async delete(path) {
        return this.retryRequest(path, { method: 'DELETE' });
    }
    async patch(path, body) {
        return this.retryRequest(path, { method: 'PATCH', body });
    }
    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    // Get current configuration (without sensitive data)
    getConfig() {
        const { bearerToken, ...config } = this.config;
        return config;
    }
}
class InkressApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'InkressApiError';
        this.status = status;
        this.data = data;
    }
}

class MerchantsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List merchants with pagination and filtering
     */
    async list(params) {
        return this.client.get('/merchants', params);
    }
    /**
     * Get a specific merchant by ID
     */
    async get(id) {
        return this.client.get(`/merchants/${id}`);
    }
    /**
     * Create a new merchant
     */
    async create(data) {
        return this.client.post('/merchants', data);
    }
    /**
     * Update an existing merchant
     */
    async update(id, data) {
        return this.client.put(`/merchants/${id}`, data);
    }
    /**
     * Get merchant account balances
     */
    async balances() {
        return this.client.post(`/merchants/account/balances`, {});
    }
    /**
     * Get merchant subscription plan details
     */
    async subscription() {
        return this.client.post(`/merchants/account/plan`, {});
    }
    /**
     * Get list of merchant account invoices
     */
    async invoices() {
        return this.client.post(`/merchants/account/invoices`, {});
    }
    /**
     * Get a specific merchant invoice by ID
     */
    async invoice(invoiceId) {
        return this.client.post(`/merchants/account/invoice/${invoiceId}`, {});
    }
}

class CategoriesResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List categories with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/categories', params);
    }
    /**
     * Get a specific category by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/categories/${id}`);
    }
    /**
     * Create a new category
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        return this.client.post('/categories', data);
    }
    /**
     * Update an existing category
     * Requires Client-Id header to be set in the configuration
     * Note: parent_id is immutable and cannot be changed after creation
     */
    async update(id, data) {
        return this.client.put(`/categories/${id}`, data);
    }
    /**
     * Delete a category
     * Requires Client-Id header to be set in the configuration
     * Note: Categories with assigned products or child categories cannot be deleted
     */
    async delete(id) {
        return this.client.delete(`/categories/${id}`);
    }
}

class OrdersResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new order
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        return this.client.post('/orders', data);
    }
    /**
     * Get order details by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/orders/${id}`);
    }
    /**
     * Update order status
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        return this.client.put(`/orders/${id}`, data);
    }
    /**
     * Get order status (public endpoint - no auth required)
     */
    async getStatus(id) {
        return this.client.get(`/orders/status/${id}`);
    }
    /**
     * Get order list with pagination and filtering
     * Supports filtering by status, kind, customer email, and date range
     * Requires Client-Id header to be set in the configuration
     */
    async list() {
        return this.client.get('/orders');
    }
}

class ProductsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List products with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/products', params);
    }
    /**
     * Get a specific product by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/products/${id}`);
    }
    /**
     * Create a new product
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        return this.client.post('/products', data);
    }
    /**
     * Update an existing product
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        return this.client.put(`/products/${id}`, data);
    }
    /**
     * Delete a product
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/products/${id}`);
    }
}

class BillingPlansResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List billing plans with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/billing_plans', params);
    }
    /**
     * Get a specific billing plan by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/billing_plans/${id}`);
    }
    /**
     * Create a new billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        return this.client.post('/billing_plans', data);
    }
    /**
     * Update an existing billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        return this.client.put(`/billing_plans/${id}`, data);
    }
    /**
     * Delete a billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/billing_plans/${id}`);
    }
}

class SubscriptionsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/billing_subscriptions', params);
    }
    /**
     * Gets a billing subscription by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/billing_subscriptions/${id}`);
    }
    /**
     * Create a subscription payment link
     * Requires Client-Id header to be set in the configuration
     */
    async createLink(data) {
        return this.client.post('/billing_subscriptions/link', data);
    }
    /**
     * Charge an existing subscription
     * Requires Client-Id header to be set in the configuration
     */
    async charge(uid, data) {
        return this.client.post(`/billing_subscriptions/${uid}/charge`, data);
    }
    /**
     * Get subscription billing periods
     * Requires Client-Id header to be set in the configuration
     */
    async getPeriods(uid, params) {
        return this.client.get(`/billing_subscriptions/${uid}/periods`, params);
    }
    /**
     * Cancel a subscription
     * Requires Client-Id header to be set in the configuration
     */
    async cancel(uid, code) {
        return this.client.post(`/billing_subscriptions/${uid}/cancel/${code}`);
    }
}

class UsersResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List users with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/users', params);
    }
    /**
     * Get a specific user by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/users/${id}`);
    }
    /**
     * Create a new user
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        return this.client.post('/users', data);
    }
    /**
     * Update an existing user
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        return this.client.put(`/users/${id}`, data);
    }
    /**
     * Delete a user
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/users/${id}`);
    }
}

class PublicResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get public information about a merchant by username or cname
     */
    async getMerchant(params) {
        return this.client.get(`/public/m`, params);
    }
    /**
     * Get merchant fees (public endpoint - no auth required)
     */
    async getMerchantFees(merchantUsername, params) {
        return this.client.get(`/public/m/${merchantUsername}/fees`, params);
    }
    /**
     * Get merchant products (public endpoint - no auth required)
     */
    async getMerchantProducts(merchantUsername, params) {
        return this.client.get(`/public/m/${merchantUsername}/products`, params);
    }
}

class KycResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List KYC records with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async listRequests(params) {
        return this.client.get('/legal_requests', params);
    }
    /**
     * Get a specific KYC request by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/legal_requests/${id}`);
    }
    /**
     * Request a limit increase
     * Requires Client-Id header to be set in the configuration
     */
    async requestLimitIncrease(data) {
        return this.client.post('/legal_requests', data);
    }
    /**
     * Request a bank information update
     * Requires Client-Id header to be set in the configuration
     */
    async requestBankInfoUpdate(data) {
        return this.client.post('/legal_requests', data);
    }
    /**
     * Upload a document for KYC verification
     * Requires Client-Id header to be set in the configuration
     */
    async uploadDocument(data) {
        return this.client.post('/legal_requests', data);
    }
}

class PayoutResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List payout requests with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        return this.client.get('/ledger_payouts', params);
    }
    /**
     * Get a specific payout request by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        return this.client.get(`/ledger_payouts/${id}`);
    }
    /**
     * Create a new payout request
     * Requires Client-Id header to be set in the configuration
     */
    async request(data) {
        return this.client.post('/ledger_payouts', data);
    }
}

/**
 * Main Inkress Commerce API SDK class
 *
 * @example
 * ```typescript
 * import { InkressSDK } from '@inkress/admin-sdk';
 *
 * const inkress = new InkressSDK({
 *   bearerToken: 'your-jwt-token',
 *   clientId: 'm-merchant-username', // Required for merchant-specific endpoints
 *   endpoint: 'https://api.inkress.com', // Optional, defaults to production
 *   apiVersion: 'v1', // Optional, defaults to v1
 * });
 *
 * // List merchants
 * const merchants = await inkress.merchants.list();
 *
 * // Get public merchant information (no auth required)
 * const publicMerchant = await inkress.public.getMerchant({ username: 'merchant-username' });
 *
 * // List categories
 * const categories = await inkress.categories.list();
 *
 * // Create a category
 * const category = await inkress.categories.create({
 *   name: 'Electronics',
 *   description: 'Electronic devices and accessories',
 *   kind: 1
 * });
 *
 * // Create an order
 * const order = await inkress.orders.create({
 *   currency_code: 'USD',
 *   customer: {
 *     email: 'customer@example.com',
 *     first_name: 'John',
 *     last_name: 'Doe'
 *   },
 *   total: 29.99,
 *   reference_id: 'order-123'
 * });
 * ```
 */
class InkressSDK {
    constructor(config) {
        this.client = new HttpClient(config);
        // Initialize resources
        this.merchants = new MerchantsResource(this.client);
        this.categories = new CategoriesResource(this.client);
        this.orders = new OrdersResource(this.client);
        this.products = new ProductsResource(this.client);
        this.billingPlans = new BillingPlansResource(this.client);
        this.subscriptions = new SubscriptionsResource(this.client);
        this.users = new UsersResource(this.client);
        this.public = new PublicResource(this.client);
        this.kyc = new KycResource(this.client);
        this.payout = new PayoutResource(this.client);
    }
    /**
     * Update the SDK configuration
     */
    updateConfig(newConfig) {
        this.client.updateConfig(newConfig);
    }
    /**
     * Get current configuration (without sensitive data)
     */
    getConfig() {
        return this.client.getConfig();
    }
}

export { HttpClient, InkressApiError, InkressSDK, InkressSDK as default };
//# sourceMappingURL=index.esm.js.map
