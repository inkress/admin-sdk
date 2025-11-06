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

const mappings = {
    "Access": {
        "view": 1,
        "list": 2,
        "create": 3,
        "update": 4,
        "delete": 5
    },
    "FeeStructure": {
        "merchant_absorb": 1,
        "customer_pay": 2
    },
    "Kind": {
        "order_online": 1,
        "order_payment_link": 1,
        "order_cart": 2,
        "order_subscription": 3,
        "order_invoice": 4,
        "order_offline": 5,
        "template_email": 1,
        "template_sms": 2,
        "template_receipt": 3,
        "password_account": 4,
        "password_otp": 5,
        "legal_request_account_removal": 6,
        "legal_request_account_report": 7,
        "notification_sale": 8,
        "notification_invite": 9,
        "notification_registration": 10,
        "notification_account": 11,
        "notification_report": 12,
        "notification_auth": 13,
        "notification_cart_reminder": 14,
        "notification_product_reminder": 15,
        "notification_purchase_confirmation": 16,
        "notification_shipping_confirmation": 17,
        "notification_delivery_confirmation": 18,
        "notification_feedback_request": 19,
        "notification_review_request": 20,
        "notification_platform_announcement": 21,
        "notification_organisation_announcement": 22,
        "notification_store_announcement": 23,
        "notification_organisation_suggestion": 24,
        "notification_store_suggestion": 25,
        "notification_organisation_referral": 26,
        "notification_store_referral": 27,
        "notification_organisation_upsell": 28,
        "notification_store_upsell": 29,
        "transaction_order": 30,
        "transaction_payout": 31,
        "transaction_manual": 32,
        "transaction_fee": 33,
        "token_login": 24,
        "token_api": 25,
        "token_sso": 32,
        "token_preset": 33,
        "user_address": 35,
        "merchant_address": 36,
        "organisation_address": 37,
        "role_preset": 26,
        "role_organisation": 27,
        "role_store": 28,
        "product_draft": 29,
        "product_published": 30,
        "product_archived": 31,
        "file_business_logo": 51,
        "file_business_document": 50,
        "file_payout_document": 71,
        "identity_email": 52,
        "identity_phone": 53,
        "billing_plan_subscription": 1,
        "billing_plan_payout": 2,
        "billing_subscription_manual_charge": 1,
        "billing_subscription_auto_charge": 2,
        "ledger_entry_credit": 1,
        "ledger_entry_debit": 2,
        "ledger_payout_standard": 1,
        "ledger_payout_early": 2,
        "ledger_payout_manual": 10,
        "fee_transaction_platform": 1,
        "fee_transaction_provider": 2,
        "fee_transaction_tax": 3,
        "fee_transaction_discount": 4,
        "fee_transaction_shipping": 5,
        "fee_transaction_processing": 6,
        "fee_transaction_subscription": 7,
        "fee_transaction_payout": 8,
        "fee_transaction_refund": 9,
        "fee_transaction_adjustment": 10,
        "fee_merchant_daily_limit": 11,
        "fee_merchant_weekly_limit": 12,
        "fee_merchant_monthly_limit": 13,
        "fee_merchant_single_limit": 14,
        "fee_merchant_withdrawal_limit": 15,
        "legal_request_document_submission": 1,
        "legal_request_bank_info_update": 2,
        "legal_request_limit_increase": 3
    },
    "Status": {
        "order_pending": 1,
        "order_error": 2,
        "order_paid": 3,
        "order_partial": 32,
        "order_confirmed": 4,
        "order_cancelled": 5,
        "order_prepared": 6,
        "order_shipped": 7,
        "order_delivered": 8,
        "order_completed": 9,
        "order_returned": 10,
        "order_refunded": 11,
        "order_verifying": 12,
        "order_stale": 13,
        "order_archived": 14,
        "transaction_pending": 1,
        "transaction_authorized": 2,
        "transaction_hold": 3,
        "transaction_captured": 4,
        "transaction_voided": 5,
        "transaction_refunded": 6,
        "transaction_processed": 7,
        "transaction_processing": 8,
        "transaction_cancelled": 9,
        "transaction_failed": 10,
        "transaction_credit": 11,
        "transaction_debit": 12,
        "account_unverified": 20,
        "account_verified": 21,
        "account_in_review": 22,
        "account_approved": 23,
        "account_active": 24,
        "account_paused": 25,
        "account_restricted": 26,
        "account_suspended": 27,
        "account_banned": 28,
        "account_resigned": 29,
        "account_archived": 30,
        "email_outdated": 31,
        "identity_unverified": 32,
        "identity_verified": 33,
        "identity_in_review": 34,
        "identity_archived": 35,
        "identity_rejected": 36,
        "billing_subscription_pending": 1,
        "billing_subscription_active": 2,
        "billing_subscription_cancelled": 3,
        "billing_subscription_adhoc_charged": 4,
        "ledger_payout_pending": 1,
        "ledger_payout_processing": 2,
        "ledger_payout_processed": 3,
        "ledger_payout_rejected": 4,
        "ledger_entry_pending": 1,
        "ledger_entry_processing": 2,
        "ledger_entry_processed": 3,
        "billing_plan_active": 1,
        "billing_plan_draft": 2,
        "billing_plan_archived": 3,
        "post_draft": 1,
        "post_published": 2,
        "post_archived": 3,
        "product_draft": 1,
        "product_published": 2,
        "product_archived": 3
    }
};

// Translation utilities for converting between string representations and integer values
// Create reverse mappings for integer to string conversion
const createReverseMapping = (mapping) => {
    const reversed = {};
    for (const [key, value] of Object.entries(mapping)) {
        reversed[value] = key;
    }
    return reversed;
};
const reverseFeeStructure = createReverseMapping(mappings.FeeStructure);
const reverseKind = createReverseMapping(mappings.Kind);
const reverseStatus = createReverseMapping(mappings.Status);
createReverseMapping(mappings.Access);
/**
 * Translation functions for Fee Structures
 */
const FeeStructureTranslator = {
    /**
     * Convert string to integer for API calls
     */
    toInteger(key) {
        return mappings.FeeStructure[key];
    },
    /**
     * Convert integer to string for user display
     */
    toString(value) {
        const key = reverseFeeStructure[value];
        if (!key) {
            return '';
        }
        return key;
    },
    /**
     * Get all available options as string keys
     */
    getOptions() {
        return Object.keys(mappings.FeeStructure);
    }
};
/**
 * Translation functions for Kinds with context-aware prefixing
 */
const KindTranslator = {
    /**
     * Convert string to integer for API calls
     */
    toInteger(key) {
        return mappings.Kind[key];
    },
    /**
     * Convert string to integer with context prefix
     */
    toIntegerWithContext(key, context) {
        // If key already has a context prefix, use as-is
        const fullKey = key.includes('_') ? key : `${context}_${key}`;
        if (mappings.Kind[fullKey] !== undefined) {
            return mappings.Kind[fullKey];
        }
        // Fallback: try the key as-is if it's a valid kind
        if (mappings.Kind[key] !== undefined) {
            return mappings.Kind[key];
        }
        return 0;
    },
    /**
     * Convert integer to string for user display
     */
    toString(value) {
        const key = reverseKind[value];
        if (!key) {
            return '';
        }
        return key;
    },
    /**
     * Convert integer to string and remove context prefix
     */
    toStringWithoutContext(value, context) {
        const fullKey = this.toString(value);
        const prefix = `${context}_`;
        if (fullKey.startsWith(prefix)) {
            return fullKey.substring(prefix.length);
        }
        return fullKey;
    },
    /**
     * Get all available options as string keys
     */
    getOptions() {
        return Object.keys(mappings.Kind);
    },
    /**
     * Get options filtered by prefix (e.g., 'order_', 'product_')
     */
    getOptionsByPrefix(prefix) {
        return this.getOptions().filter(key => key.startsWith(prefix));
    },
    /**
     * Get options without context prefix for a specific context
     */
    getContextualOptions(context) {
        const prefix = `${context}_`;
        return this.getOptions()
            .filter(key => key.startsWith(prefix))
            .map(key => key.substring(prefix.length));
    }
};
/**
 * Translation functions for Statuses with context-aware prefixing
 */
const StatusTranslator = {
    /**
     * Convert string to integer for API calls
     */
    toInteger(key) {
        return mappings.Status[key];
    },
    /**
     * Convert string to integer with context prefix
     */
    toIntegerWithContext(key, context) {
        // If key already has the context prefix, use as-is
        const fullKey = key.includes('_') ? key : `${context}_${key}`;
        if (mappings.Status[fullKey] !== undefined) {
            return mappings.Status[fullKey];
        }
        // Fallback: try the key as-is if it's a valid status
        if (mappings.Status[key] !== undefined) {
            return mappings.Status[key];
        }
        return 0;
    },
    /**
     * Convert integer to string for user display
     */
    toString(value) {
        const key = reverseStatus[value];
        if (!key) {
            return '';
        }
        return key;
    },
    /**
     * Convert integer to string and remove context prefix
     */
    toStringWithoutContext(value, context) {
        const fullKey = this.toString(value);
        const prefix = `${context}_`;
        if (fullKey.startsWith(prefix)) {
            return fullKey.substring(prefix.length);
        }
        return fullKey;
    },
    /**
     * Get all available options as string keys
     */
    getOptions() {
        return Object.keys(mappings.Status);
    },
    /**
     * Get options filtered by prefix (e.g., 'order_', 'product_', 'account_')
     */
    getOptionsByPrefix(prefix) {
        return this.getOptions().filter(key => key.startsWith(prefix));
    },
    /**
     * Get options without context prefix for a specific context
     */
    getContextualOptions(context) {
        const prefix = `${context}_`;
        return this.getOptions()
            .filter(key => key.startsWith(prefix))
            .map(key => key.substring(prefix.length));
    }
};

class MerchantsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal merchant data (integers) to user-facing data (strings)
     */
    translateMerchantToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'account'),
            platform_fee_structure: FeeStructureTranslator.toString(internal.platform_fee_structure),
            provider_fee_structure: FeeStructureTranslator.toString(internal.provider_fee_structure),
        };
    }
    /**
     * Convert user-facing merchant data (strings) to internal data (integers)
     */
    translateMerchantToInternal(userFacing) {
        const internal = { ...userFacing };
        if ('status' in userFacing && userFacing.status) {
            internal.status = typeof userFacing.status === 'string'
                ? StatusTranslator.toIntegerWithContext(userFacing.status, 'account')
                : userFacing.status;
        }
        if ('platform_fee_structure' in userFacing && userFacing.platform_fee_structure) {
            internal.platform_fee_structure = typeof userFacing.platform_fee_structure === 'string'
                ? FeeStructureTranslator.toInteger(userFacing.platform_fee_structure)
                : userFacing.platform_fee_structure;
        }
        if ('provider_fee_structure' in userFacing && userFacing.provider_fee_structure) {
            internal.provider_fee_structure = typeof userFacing.provider_fee_structure === 'string'
                ? FeeStructureTranslator.toInteger(userFacing.provider_fee_structure)
                : userFacing.provider_fee_structure;
        }
        return internal;
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'account');
        }
        if (params.platform_fee_structure && typeof params.platform_fee_structure === 'string') {
            translated.platform_fee_structure = FeeStructureTranslator.toInteger(params.platform_fee_structure);
        }
        if (params.provider_fee_structure && typeof params.provider_fee_structure === 'string') {
            translated.provider_fee_structure = FeeStructureTranslator.toInteger(params.provider_fee_structure);
        }
        return translated;
    }
    /**
     * List merchants with pagination and filtering
     */
    async list(params) {
        var _a, _b;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/merchants', translatedParams);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.data.entries.map(merchant => this.translateMerchantToUserFacing(merchant));
            return {
                state: response.state,
                data: {
                    entries: translatedEntries,
                    page_info: response.data.page_info
                }
            };
        }
        if ((_b = response.result) === null || _b === void 0 ? void 0 : _b.entries) {
            const translatedEntries = response.result.entries.map(merchant => this.translateMerchantToUserFacing(merchant));
            return {
                state: response.state,
                result: {
                    entries: translatedEntries,
                    page_info: response.result.page_info
                }
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get a specific merchant by ID
     */
    async get(id) {
        const response = await this.client.get(`/merchants/${id}`);
        if (response.data) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedMerchant
            };
        }
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Create a new merchant
     */
    async create(data) {
        const internalData = this.translateMerchantToInternal(data);
        const response = await this.client.post('/merchants', internalData);
        if (response.data) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedMerchant
            };
        }
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Update an existing merchant
     */
    async update(id, data) {
        const internalData = this.translateMerchantToInternal(data);
        const response = await this.client.put(`/merchants/${id}`, internalData);
        if (response.data) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedMerchant
            };
        }
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get merchant account balances
     */
    async balances() {
        return this.client.post(`/merchants/account/balances`, {});
    }
    /**
     * Get merchant account limits
     */
    async limits() {
        return this.client.post(`/merchants/account/limits`, {});
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
     * Convert internal category data (integers) to user-facing data (strings)
     */
    translateCategoryToUserFacing(internal) {
        return {
            ...internal,
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'product'),
        };
    }
    /**
     * Convert user-facing category data (strings) to internal data (integers)
     */
    translateCategoryToInternal(userFacing) {
        const internal = { ...userFacing };
        if ('kind' in userFacing && userFacing.kind) {
            if (typeof userFacing.kind === 'string') {
                internal.kind = KindTranslator.toIntegerWithContext(userFacing.kind, 'product');
            }
            else {
                internal.kind = userFacing.kind;
            }
        }
        return internal;
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'product');
        }
        return translated;
    }
    /**
     * List categories with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a, _b;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/categories', translatedParams);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.data.entries.map(category => this.translateCategoryToUserFacing(category));
            return {
                state: response.state,
                data: {
                    entries: translatedEntries,
                    page_info: response.data.page_info
                }
            };
        }
        if ((_b = response.result) === null || _b === void 0 ? void 0 : _b.entries) {
            const translatedEntries = response.result.entries.map(category => this.translateCategoryToUserFacing(category));
            return {
                state: response.state,
                result: {
                    entries: translatedEntries,
                    page_info: response.result.page_info
                }
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get a specific category by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/categories/${id}`);
        if (response.data) {
            const translatedCategory = this.translateCategoryToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedCategory
            };
        }
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Create a new category
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        const internalData = this.translateCategoryToInternal(data);
        const response = await this.client.post('/categories', internalData);
        if (response.data) {
            const translatedCategory = this.translateCategoryToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedCategory
            };
        }
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Update an existing category
     * Requires Client-Id header to be set in the configuration
     * Note: parent_id is immutable and cannot be changed after creation
     */
    async update(id, data) {
        const internalData = this.translateCategoryToInternal(data);
        const response = await this.client.put(`/categories/${id}`, internalData);
        if (response.data) {
            const translatedCategory = this.translateCategoryToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedCategory
            };
        }
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
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

/**
 * Type-Based Query System
 */
/**
 * Transform a clean user query into Elixir-compatible format
 */
function transformQuery(query) {
    if (!query || typeof query !== 'object') {
        return {};
    }
    const result = {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (isSpecialField(key)) {
            result[key] = value;
            continue;
        }
        if (key === 'data' && typeof value === 'object') {
            result.data = transformJsonQuery(value);
            continue;
        }
        result[key] = transformFieldValue(key, value);
    }
    return result;
}
/**
 * Check if a field is a special field that should pass through unchanged
 */
function isSpecialField(key) {
    const specialFields = [
        'exclude', 'distinct', 'order_by', 'page', 'page_size', 'per_page',
        'limit', 'override_page', 'q', 'search', 'sort', 'order'
    ];
    return specialFields.includes(key);
}
/**
 * Transform a field value based on its type
 */
function transformFieldValue(key, value) {
    if (Array.isArray(value)) {
        return { [`${key}_in`]: value };
    }
    if (typeof value === 'object' && value !== null) {
        const transformedObject = {};
        if ('min' in value && value.min !== undefined) {
            transformedObject[`${key}_min`] = value.min;
        }
        if ('max' in value && value.max !== undefined) {
            transformedObject[`${key}_max`] = value.max;
        }
        if ('contains' in value && value.contains !== undefined) {
            transformedObject[`contains.${key}`] = value.contains;
        }
        if ('before' in value && value.before !== undefined) {
            transformedObject[`before.${key}`] = value.before;
        }
        if ('after' in value && value.after !== undefined) {
            transformedObject[`after.${key}`] = value.after;
        }
        if ('on' in value && value.on !== undefined) {
            transformedObject[`on.${key}`] = value.on;
        }
        if (Object.keys(transformedObject).length > 0) {
            return transformedObject;
        }
    }
    return { [key]: value };
}
/**
 * Transform JSON field queries with special operators
 */
function transformJsonQuery(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key.includes('->')) {
            result[key] = value;
            continue;
        }
        if (typeof value === 'object' && value !== null) {
            if ('in' in value && value.in !== undefined) {
                result[`in_${key}`] = value.in;
            }
            if ('not' in value && value.not !== undefined) {
                result[`not_${key}`] = value.not;
            }
            if ('null' in value && value.null !== undefined) {
                result[`null_${key}`] = value.null;
            }
            if ('not_null' in value && value.not_null !== undefined) {
                result[`not_null_${key}`] = value.not_null;
            }
            if ('min' in value && value.min !== undefined) {
                result[`${key}_min`] = value.min;
            }
            if ('max' in value && value.max !== undefined) {
                result[`${key}_max`] = value.max;
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Flatten the transformed query object for API consumption
 */
function flattenTransformedQuery(transformed) {
    const result = {};
    for (const [key, value] of Object.entries(transformed)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (hasTransformationKeys(value)) {
                Object.assign(result, value);
            }
            else {
                result[key] = value;
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Check if an object contains transformation keys
 */
function hasTransformationKeys(obj) {
    const keys = Object.keys(obj);
    return keys.some(key => key.includes('_min') ||
        key.includes('_max') ||
        key.includes('_in') ||
        key.includes('contains.') ||
        key.includes('before.') ||
        key.includes('after.') ||
        key.includes('on.'));
}
/**
 * Main function to transform and flatten a query in one step
 */
function processQuery(query, fieldTypes, options = { validate: false }) {
    const transformed = transformQuery(query);
    return flattenTransformedQuery(transformed);
}
/**
 * Type-safe query builder for specific entity types
 */
class QueryBuilder {
    constructor(initialQuery) {
        this.query = {};
        if (initialQuery) {
            this.query = { ...initialQuery };
        }
    }
    where(field, value) {
        this.query[field] = value;
        return this;
    }
    whereIn(field, values) {
        this.query[field] = values;
        return this;
    }
    whereRange(field, min, max) {
        const range = {};
        if (min !== undefined)
            range.min = min;
        if (max !== undefined)
            range.max = max;
        this.query[field] = range;
        return this;
    }
    whereContains(field, value) {
        this.query[field] = { contains: value };
        return this;
    }
    whereDateRange(field, after, before, on) {
        const dateQuery = {};
        if (after !== undefined)
            dateQuery.after = after;
        if (before !== undefined)
            dateQuery.before = before;
        if (on !== undefined)
            dateQuery.on = on;
        this.query[field] = dateQuery;
        return this;
    }
    paginate(page, pageSize) {
        this.query.page = page;
        this.query.page_size = pageSize;
        return this;
    }
    orderBy(field, direction = 'asc') {
        this.query.order_by = `${field} ${direction}`;
        return this;
    }
    search(term) {
        this.query.q = term;
        return this;
    }
    build() {
        return processQuery(this.query);
    }
    getRawQuery() {
        return { ...this.query };
    }
}

// Define field types for Orders to enable type validation
const ORDER_FIELD_TYPES = {
    };
class OrdersResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal order data (integers) to user-facing data (strings)
     */
    translateOrderToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'order'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'order'),
        };
    }
    /**
     * Convert user-facing order data (strings) to internal data (integers)
     */
    translateOrderToInternal(userFacing) {
        const internal = { ...userFacing };
        if ('status' in userFacing && userFacing.status) {
            internal.status = typeof userFacing.status === 'string'
                ? StatusTranslator.toIntegerWithContext(userFacing.status, 'order')
                : userFacing.status;
        }
        if ('kind' in userFacing && userFacing.kind) {
            internal.kind = typeof userFacing.kind === 'string'
                ? KindTranslator.toIntegerWithContext(userFacing.kind, 'order')
                : userFacing.kind;
        }
        return internal;
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'order');
        }
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'order');
        }
        return translated;
    }
    /**
     * Convert status update data (strings to integers where needed)
     */
    translateStatusUpdate(data) {
        const internal = { ...data };
        if (data.status && typeof data.status === 'string') {
            internal.status = StatusTranslator.toIntegerWithContext(data.status, 'order');
        }
        return internal;
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
        const response = await this.client.get(`/orders/${id}`);
        if (response.data) {
            const translatedOrder = this.translateOrderToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedOrder
            };
        }
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Update order status
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        const internalData = this.translateStatusUpdate(data);
        const response = await this.client.put(`/orders/${id}`, internalData);
        if (response.data) {
            const translatedOrder = this.translateOrderToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedOrder
            };
        }
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get order status (public endpoint - no auth required)
     */
    async getStatus(id) {
        const response = await this.client.get(`/orders/status/${id}`);
        if (response.data) {
            const translatedOrder = this.translateOrderToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedOrder
            };
        }
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get order list with pagination and filtering
     * Supports filtering by any database field
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a, _b;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/orders', translatedParams);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.data.entries.map(order => this.translateOrderToUserFacing(order));
            return {
                state: response.state,
                data: {
                    entries: translatedEntries,
                    page_info: response.data.page_info
                }
            };
        }
        if ((_b = response.result) === null || _b === void 0 ? void 0 : _b.entries) {
            const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
            return {
                state: response.state,
                result: {
                    entries: translatedEntries,
                    page_info: response.result.page_info
                }
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * List orders with enhanced query support
     * Supports filtering by any database field using the new query system
     * Requires Client-Id header to be set in the configuration
     *
     * @example
     * // Simple queries
     * orders.query({ status: 'confirmed', kind: 'online' })
     *
     * // Array queries (IN operations)
     * orders.query({ id: [1, 2, 3], status: ['confirmed', 'shipped'] })
     *
     * // Range queries
     * orders.query({ total: { min: 100, max: 1000 } })
     *
     * // String searches
     * orders.query({ reference_id: { contains: 'ORDER-2024' } })
     *
     * // Date range queries
     * orders.query({ inserted_at: { after: '2024-01-01', before: '2024-12-31' } })
     *
     * // Combined queries
     * orders.query({
     *   status: 'confirmed',
     *   total: { min: 50 },
     *   inserted_at: { after: '2024-01-01' },
     *   page: 1,
     *   page_size: 20
     * })
     */
    async query(params) {
        var _a, _b;
        // Process the query through the transformation system with validation
        const processedQuery = processQuery(params || {}, ORDER_FIELD_TYPES, { });
        // Apply contextual translations for status and kind
        const translatedQuery = this.translateFilters(processedQuery);
        const response = await this.client.get('/orders', translatedQuery);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.data.entries.map(order => this.translateOrderToUserFacing(order));
            return {
                state: response.state,
                data: {
                    entries: translatedEntries,
                    page_info: response.data.page_info
                }
            };
        }
        if ((_b = response.result) === null || _b === void 0 ? void 0 : _b.entries) {
            const translatedEntries = response.result.entries.map(order => this.translateOrderToUserFacing(order));
            return {
                state: response.state,
                result: {
                    entries: translatedEntries,
                    page_info: response.result.page_info
                }
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Create a query builder for orders
     * Provides a fluent interface for building complex queries
     *
     * @example
     * const orders = await sdk.orders.createQueryBuilder()
     *   .where('status', 'confirmed')
     *   .whereRange('total', 100, 1000)
     *   .whereContains('reference_id', 'ORDER-2024')
     *   .paginate(1, 20)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder(initialQuery) {
        return new OrderQueryBuilder(this, initialQuery);
    }
}
/**
 * Query builder class for orders
 * Provides a fluent interface for building complex queries
 */
class OrderQueryBuilder extends QueryBuilder {
    constructor(ordersResource, initialQuery) {
        super(initialQuery);
        this.ordersResource = ordersResource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.ordersResource.query(this.getRawQuery());
    }
    /**
     * Add a status condition with contextual values
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Add a kind condition with contextual values
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Add a total amount range condition
     */
    whereTotalRange(min, max) {
        return this.whereRange('total', min, max);
    }
    /**
     * Add a reference ID search condition
     */
    whereReferenceContains(value) {
        return this.whereContains('reference_id', value);
    }
    /**
     * Add a date range condition for creation date
     */
    whereCreatedBetween(after, before) {
        return this.whereDateRange('inserted_at', after, before);
    }
}

class ProductsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal product data (integers) to user-facing data (strings)
     */
    translateProductToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'product'),
        };
    }
    /**
     * Convert user-facing product data (strings) to internal data (integers)
     */
    translateProductToInternal(userFacing) {
        const internal = { ...userFacing };
        if ('status' in userFacing && userFacing.status) {
            internal.status = typeof userFacing.status === 'string'
                ? StatusTranslator.toIntegerWithContext(userFacing.status, 'product')
                : userFacing.status;
        }
        return internal;
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'product');
        }
        return translated;
    }
    /**
     * List products with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a, _b;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/products', translatedParams);
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.data.entries.map(product => this.translateProductToUserFacing(product));
            return {
                state: response.state,
                data: {
                    entries: translatedEntries,
                    page_info: response.data.page_info
                }
            };
        }
        if ((_b = response.result) === null || _b === void 0 ? void 0 : _b.entries) {
            const translatedEntries = response.result.entries.map(product => this.translateProductToUserFacing(product));
            return {
                state: response.state,
                result: {
                    entries: translatedEntries,
                    page_info: response.result.page_info
                }
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Get a specific product by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/products/${id}`);
        if (response.data) {
            const translatedProduct = this.translateProductToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedProduct
            };
        }
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Create a new product
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        const internalData = this.translateProductToInternal(data);
        const response = await this.client.post('/products', internalData);
        if (response.data) {
            const translatedProduct = this.translateProductToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedProduct
            };
        }
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
    }
    /**
     * Update an existing product
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        const internalData = this.translateProductToInternal(data);
        const response = await this.client.put(`/products/${id}`, internalData);
        if (response.data) {
            const translatedProduct = this.translateProductToUserFacing(response.data);
            return {
                state: response.state,
                data: translatedProduct
            };
        }
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
            data: response.data,
            result: response.result
        };
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
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toInteger(params.status);
        }
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'billing_plan');
        }
        return translated;
    }
    /**
     * List billing plans with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/billing_plans', translatedParams);
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
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'billing_subscription');
        }
        return translated;
    }
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/billing_subscriptions', translatedParams);
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
     * Convert internal user data (integers) to user-facing data (strings)
     */
    translateUserToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'account'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'user'),
        };
    }
    /**
     * Convert user-facing user data (strings) to internal data (integers)
     */
    translateUserToInternal(userFacing) {
        const internal = { ...userFacing };
        if ('status' in userFacing && userFacing.status) {
            if (typeof userFacing.status === 'string') {
                internal.status = StatusTranslator.toIntegerWithContext(userFacing.status, 'account');
            }
            else {
                internal.status = userFacing.status;
            }
        }
        if ('kind' in userFacing && userFacing.kind) {
            if (typeof userFacing.kind === 'string') {
                internal.kind = KindTranslator.toIntegerWithContext(userFacing.kind, 'user');
            }
            else {
                internal.kind = userFacing.kind;
            }
        }
        return internal;
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'account');
        }
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'user');
        }
        return translated;
    }
    /**
     * List users with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/users', translatedParams);
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
        const translatedData = this.translateUserToInternal(data);
        return this.client.put(`/users/${id}`, translatedData);
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

export { HttpClient, InkressApiError, InkressSDK, OrderQueryBuilder, QueryBuilder, InkressSDK as default, processQuery };
//# sourceMappingURL=index.esm.js.map
