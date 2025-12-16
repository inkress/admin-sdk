import fetch from 'cross-fetch';

class HttpClient {
    constructor(config) {
        // Compute endpoint from mode
        const endpoint = config.mode === 'sandbox'
            ? 'https://api-dev.inkress.com'
            : 'https://api.inkress.com';
        this.config = {
            accessToken: config.accessToken,
            mode: config.mode || 'live',
            apiVersion: config.apiVersion || 'v1',
            username: config.username || '',
            timeout: config.timeout || 30000,
            retries: config.retries || 0,
            headers: config.headers || {},
            endpoint, // computed from mode
        };
    }
    getBaseUrl() {
        const { endpoint, apiVersion } = this.config;
        return `${endpoint}/api/${apiVersion}`;
    }
    getHeaders(additionalHeaders = {}) {
        const headers = {
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
                return { state: 'ok', result: undefined };
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
        // Recompute endpoint if mode changes
        if (newConfig.mode) {
            const endpoint = newConfig.mode === 'sandbox'
                ? 'https://api-dev.inkress.com'
                : 'https://api.inkress.com';
            this.config = { ...this.config, ...newConfig, endpoint };
        }
        else {
            this.config = { ...this.config, ...newConfig };
        }
    }
    // Get current configuration (without sensitive data)
    getConfig() {
        const { accessToken, ...config } = this.config;
        // Remove computed endpoint from config
        const { endpoint, ...publicConfig } = config;
        return publicConfig;
    }
}
class InkressApiError extends Error {
    constructor(message, status, result) {
        super(message);
        this.name = 'InkressApiError';
        this.status = status;
        this.result = result;
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
        "legal_request_limit_increase": 3,
        "payment_link_order": 1,
        "payment_link_invoice": 2
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
        "product_archived": 3,
        "legal_request_pending": 1,
        "legal_request_in_review": 2,
        "legal_request_approved": 3,
        "legal_request_rejected": 4,
        "financial_request_pending": 1,
        "financial_request_in_review": 2,
        "financial_request_approved": 3,
        "financial_request_rejected": 4
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
            throw new Error(`Unknown fee structure value: ${value}`);
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
        throw new Error(`Unknown kind value: ${key} (tried with context: ${fullKey})`);
    },
    /**
     * Convert integer to string for user display
     */
    toString(value) {
        const key = reverseKind[value];
        if (!key) {
            throw new Error(`Unknown kind value: ${value}`);
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
        throw new Error(`Unknown status value: ${key} (tried with context: ${fullKey})`);
    },
    /**
     * Convert integer to string for user display
     */
    toString(value) {
        const key = reverseStatus[value];
        if (!key) {
            throw new Error(`Unknown status value: ${value}`);
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

/**
 * Type-Based Query System
 *
 * This module provides a clean, type-safe query API where users write intuitive queries
 * and the SDK automatically transforms them into the Elixir-compatible format.
 *
 * Features:
 * - Array values → _in suffix (id: [1,2,3] → id_in: [1,2,3])
 * - Range objects → _min/_max suffixes (age: {min: 18, max: 65} → age_min: 18, age_max: 65)
 * - String operations → contains. prefix (name: {contains: "john"} → "contains.name": "john")
 * - Date operations → before./after./on. prefixes
 * - JSON field operations → in_, not_, null_, not_null_ prefixes
 * - Direct values → equality check (no transformation)
 */
/**
 * Runtime validation for query parameters
 */
function validateQueryParams(query, fieldTypes) {
    const errors = [];
    if (!query || typeof query !== 'object') {
        return errors;
    }
    for (const [key, value] of Object.entries(query)) {
        // Skip special fields and undefined/null values
        if (isSpecialField(key) || value === undefined || value === null) {
            continue;
        }
        // Skip data field (JSON queries have their own validation)
        if (key === 'data') {
            continue;
        }
        const fieldType = fieldTypes === null || fieldTypes === void 0 ? void 0 : fieldTypes[key];
        // Validate based on field type
        if (fieldType) {
            const validationError = validateFieldValue(key, value, fieldType);
            if (validationError) {
                errors.push(validationError);
            }
        }
    }
    return errors;
}
/**
 * Validate a single field value against its expected type
 */
function validateFieldValue(fieldName, value, expectedType) {
    // Handle array values (for _in operations)
    if (Array.isArray(value)) {
        for (const item of value) {
            if (!isValueOfType(item, expectedType)) {
                return `Field "${fieldName}" array contains invalid type. Expected all items to be ${expectedType}, but found ${typeof item}`;
            }
        }
        return null;
    }
    // Handle range objects
    if (typeof value === 'object' && value !== null && ('min' in value || 'max' in value)) {
        if (expectedType !== 'number' && expectedType !== 'date' && expectedType !== 'string') {
            return `Field "${fieldName}" cannot use range queries. Range queries are only supported for number, date, and string fields.`;
        }
        if ('min' in value && value.min !== undefined && !isValueOfType(value.min, expectedType)) {
            return `Field "${fieldName}" range min value has wrong type. Expected ${expectedType}, got ${typeof value.min}`;
        }
        if ('max' in value && value.max !== undefined && !isValueOfType(value.max, expectedType)) {
            return `Field "${fieldName}" range max value has wrong type. Expected ${expectedType}, got ${typeof value.max}`;
        }
        return null;
    }
    // Handle string contains queries
    if (typeof value === 'object' && value !== null && 'contains' in value) {
        if (expectedType !== 'string') {
            return `Field "${fieldName}" cannot use contains queries. Contains queries are only supported for string fields.`;
        }
        if (typeof value.contains !== 'string') {
            return `Field "${fieldName}" contains value must be a string. Got ${typeof value.contains}`;
        }
        return null;
    }
    // Handle date queries
    if (typeof value === 'object' && value !== null && ('before' in value || 'after' in value || 'on' in value || 'min' in value || 'max' in value)) {
        if ('before' in value && value.before !== undefined && typeof value.before !== 'string') {
            return `Field "${fieldName}" before value must be a string. Got ${typeof value.before}`;
        }
        if ('after' in value && value.after !== undefined && typeof value.after !== 'string') {
            return `Field "${fieldName}" after value must be a string. Got ${typeof value.after}`;
        }
        if ('on' in value && value.on !== undefined && typeof value.on !== 'string') {
            return `Field "${fieldName}" on value must be a string. Got ${typeof value.on}`;
        }
        if ('min' in value && value.min !== undefined && typeof value.min !== 'string') {
            return `Field "${fieldName}" min value must be a string. Got ${typeof value.min}`;
        }
        if ('max' in value && value.max !== undefined && typeof value.max !== 'string') {
            return `Field "${fieldName}" max value must be a string. Got ${typeof value.max}`;
        }
        return null;
    }
    // Handle direct values
    if (!isValueOfType(value, expectedType)) {
        return `Field "${fieldName}" has wrong type. Expected ${expectedType}, got ${typeof value}`;
    }
    return null;
}
/**
 * Check if a value matches the expected type
 */
function isValueOfType(value, expectedType) {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'date':
            return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
        case 'array':
            return Array.isArray(value);
        default:
            return true;
    }
}
/**
 * Transform a clean user query into Elixir-compatible format
 */
function transformQuery(query) {
    if (!query || typeof query !== 'object') {
        return {};
    }
    const result = {};
    for (const [key, value] of Object.entries(query)) {
        // Skip undefined/null values
        if (value === undefined || value === null) {
            continue;
        }
        // Pass through special fields unchanged
        if (isSpecialField(key)) {
            result[key] = value;
            continue;
        }
        // Handle data field specially for JSON queries
        if (key === 'data' && typeof value === 'object') {
            result.data = transformJsonQuery(value);
            continue;
        }
        // Transform based on value type
        const transformedValue = transformFieldValue(key, value);
        // Skip null values (e.g., from empty objects)
        if (transformedValue !== null) {
            result[key] = transformedValue;
        }
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
        // Array → add _in suffix
        return { [`${key}_in`]: value };
    }
    if (typeof value === 'object' && value !== null) {
        const transformedObject = {};
        // Handle range queries (min/max)
        if ('min' in value && value.min !== undefined) {
            transformedObject[`${key}_min`] = value.min;
        }
        if ('max' in value && value.max !== undefined) {
            transformedObject[`${key}_max`] = value.max;
        }
        // Handle range queries (gte/lte/gt/lt)
        if ('gte' in value && value.gte !== undefined) {
            transformedObject[`${key}_gte`] = value.gte;
        }
        if ('lte' in value && value.lte !== undefined) {
            transformedObject[`${key}_lte`] = value.lte;
        }
        if ('gt' in value && value.gt !== undefined) {
            transformedObject[`${key}_gt`] = value.gt;
        }
        if ('lt' in value && value.lt !== undefined) {
            transformedObject[`${key}_lt`] = value.lt;
        }
        // Handle string queries
        if ('contains' in value && value.contains !== undefined) {
            transformedObject[`contains.${key}`] = value.contains;
        }
        // Handle date queries
        if ('before' in value && value.before !== undefined) {
            transformedObject[`before.${key}`] = value.before;
        }
        if ('after' in value && value.after !== undefined) {
            transformedObject[`after.${key}`] = value.after;
        }
        if ('on' in value && value.on !== undefined) {
            transformedObject[`on.${key}`] = value.on;
        }
        // If we found any transformations, return them
        if (Object.keys(transformedObject).length > 0) {
            return transformedObject;
        }
        // Empty object with no transformation keys - return null to skip it
        if (Object.keys(value).length === 0) {
            return null;
        }
    }
    // Direct value → wrap for consistent structure that will be flattened later
    return { [key]: value };
}
/**
 * Transform JSON field queries with special operators
 */
function transformJsonQuery(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        // Skip undefined/null values
        if (value === undefined || value === null) {
            continue;
        }
        // Nested paths (e.g., "settings->theme") stay as-is
        if (key.includes('->')) {
            result[key] = value;
            continue;
        }
        if (typeof value === 'object' && value !== null) {
            // Check if this is a JSON query operation (has special keys)
            const hasJsonQueryOps = 'in' in value || 'not' in value || 'null' in value ||
                'not_null' in value || 'min' in value || 'max' in value;
            if (hasJsonQueryOps) {
                // Transform JSON-specific operations
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
                // Complex object without query operators - pass through as-is
                result[key] = value;
            }
        }
        else {
            // Direct value in JSON field
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
            // If it's a transformation object with special keys, merge its properties
            if (hasTransformationKeys(value)) {
                Object.assign(result, value);
            }
            else if (isWrappedDirectValue(key, value)) {
                // Unwrap direct values like { id: { id: 5 } } → { id: 5 }
                result[key] = value[key];
            }
            else {
                // Regular object (like data field)
                result[key] = value;
            }
        }
        else {
            // Direct value or array
            result[key] = value;
        }
    }
    return result;
}
/**
 * Check if a value is a wrapped direct value (e.g., { id: { id: 5 } })
 * This happens when transformFieldValue wraps a direct value for consistency
 */
function isWrappedDirectValue(key, obj) {
    const keys = Object.keys(obj);
    return keys.length === 1 && keys[0] === key;
}
/**
 * Check if an object contains transformation keys
 */
function hasTransformationKeys(obj) {
    const keys = Object.keys(obj);
    return keys.some(key => key.includes('_min') ||
        key.includes('_max') ||
        key.includes('_gte') ||
        key.includes('_lte') ||
        key.includes('_gt') ||
        key.includes('_lt') ||
        key.includes('_in') ||
        key.includes('contains.') ||
        key.includes('before.') ||
        key.includes('after.') ||
        key.includes('on.'));
}
/**
 * Main function to transform and flatten a query in one step
 * Handles translation of contextual strings to integers before transformation
 */
function processQuery(query, fieldTypes, options = { validate: false }) {
    // Translate contextual strings to integers BEFORE validation and transformation
    const translatedQuery = { ...query };
    if (fieldTypes && options.context) {
        for (const [key, value] of Object.entries(translatedQuery)) {
            const fieldType = fieldTypes[key];
            // Skip special fields
            if (isSpecialField(key))
                continue;
            // Translate status fields (contextual strings to integers)
            if (key === 'status' && fieldType === 'number') {
                translatedQuery[key] = translateValue(value, StatusTranslator, options.context);
            }
            // Translate kind fields (contextual strings to integers)
            if (key === 'kind' && fieldType === 'number') {
                translatedQuery[key] = translateValue(value, KindTranslator, options.context);
            }
        }
    }
    // Transform AFTER translation so that range objects are properly handled
    const transformed = transformQuery(translatedQuery);
    const flattened = flattenTransformedQuery(transformed);
    // Runtime validation AFTER transformation if enabled and field types provided
    if (options.validate && fieldTypes) {
        const validationErrors = validateQueryParams(flattened, fieldTypes);
        if (validationErrors.length > 0) {
            console.warn(`Query validation warnings: ${validationErrors.join(', ')}`);
        }
    }
    return flattened;
}
/**
 * Helper to translate a value (string, array of strings, or object with strings)
 */
function translateValue(value, translator, context) {
    if (value === undefined || value === null) {
        return value;
    }
    // Handle arrays (for _in operations)
    if (Array.isArray(value)) {
        return value.map(item => {
            // If it's already a number, pass it through
            if (typeof item === 'number') {
                return item;
            }
            // If it's a string, it MUST be translatable
            if (typeof item === 'string') {
                return context
                    ? translator.toIntegerWithContext(item, context)
                    : translator.toInteger(item);
            }
            return item;
        });
    }
    // Handle range objects (e.g., { gte: 'paid', lte: 'confirmed' })
    if (typeof value === 'object' && value !== null) {
        const translated = {};
        for (const [k, v] of Object.entries(value)) {
            // If it's already a number, pass it through
            if (typeof v === 'number') {
                translated[k] = v;
            }
            // If it's a string, it MUST be translatable
            else if (typeof v === 'string') {
                translated[k] = context
                    ? translator.toIntegerWithContext(v, context)
                    : translator.toInteger(v);
            }
            else {
                translated[k] = v;
            }
        }
        return translated;
    }
    // Handle direct string values
    if (typeof value === 'string') {
        return context
            ? translator.toIntegerWithContext(value, context)
            : translator.toInteger(value);
    }
    // Already a number, pass through
    return value;
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
    /**
     * Add a field equality condition
     */
    where(field, value) {
        this.query[field] = value;
        return this;
    }
    /**
     * Add a field IN condition (array of values)
     */
    whereIn(field, values) {
        this.query[field] = values;
        return this;
    }
    /**
     * Add a range condition (min/max)
     */
    whereRange(field, min, max) {
        const range = {};
        if (min !== undefined)
            range.min = min;
        if (max !== undefined)
            range.max = max;
        this.query[field] = range;
        return this;
    }
    /**
     * Add a string contains condition
     */
    whereContains(field, value) {
        this.query[field] = { contains: value };
        return this;
    }
    /**
     * Add a date range condition
     */
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
    /**
     * Add pagination
     */
    paginate(page, pageSize) {
        this.query.page = page;
        this.query.page_size = pageSize;
        return this;
    }
    /**
     * Add ordering
     */
    orderBy(field, direction = 'asc') {
        this.query.order_by = `${field} ${direction}`;
        return this;
    }
    /**
     * Add general search
     */
    search(term) {
        this.query.q = term;
        return this;
    }
    /**
     * Build and return the transformed query
     */
    build() {
        return processQuery(this.query);
    }
    /**
     * Get the raw query (before transformation)
     */
    getRawQuery() {
        return { ...this.query };
    }
}

/**
 * Resource-specific query builders
 *
 * This file provides fluent query builder interfaces for each resource type,
 * offering excellent IntelliSense and type safety for complex queries.
 */
/**
 * Order Query Builder
 * Provides a fluent interface for building complex order queries
 *
 * @example
 * const orders = await sdk.orders.createQueryBuilder()
 *   .whereStatus('confirmed')
 *   .whereTotalRange(100, 1000)
 *   .whereReferenceContains('ORDER-2024')
 *   .paginate(1, 20)
 *   .orderBy('inserted_at', 'desc')
 *   .execute();
 */
class OrderQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by order status (contextual values)
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by order kind/type (contextual values)
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Filter by total amount range
     */
    whereTotalRange(min, max) {
        return this.whereRange('total', min, max);
    }
    /**
     * Filter by reference ID containing a string
     */
    whereReferenceContains(value) {
        return this.whereContains('reference_id', value);
    }
    /**
     * Filter by creation date range
     */
    whereCreatedBetween(after, before) {
        return this.whereDateRange('inserted_at', after, before);
    }
    /**
     * Filter by customer ID
     */
    whereCustomer(customerId) {
        if (Array.isArray(customerId)) {
            return this.whereIn('customer_id', customerId);
        }
        return this.where('customer_id', customerId);
    }
    /**
     * Filter by billing plan ID
     */
    whereBillingPlan(planId) {
        if (Array.isArray(planId)) {
            return this.whereIn('billing_plan_id', planId);
        }
        return this.where('billing_plan_id', planId);
    }
}
/**
 * Product Query Builder
 * Provides a fluent interface for building complex product queries
 *
 * @example
 * const products = await sdk.products.createQueryBuilder()
 *   .whereStatus('published')
 *   .wherePriceRange(10, 100)
 *   .whereTitleContains('shirt')
 *   .wherePublic(true)
 *   .paginate(1, 20)
 *   .execute();
 */
class ProductQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by product status
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by price range
     */
    wherePriceRange(min, max) {
        return this.whereRange('price', min, max);
    }
    /**
     * Filter by title containing a string
     */
    whereTitleContains(value) {
        return this.whereContains('title', value);
    }
    /**
     * Filter by public visibility
     */
    wherePublic(isPublic) {
        return this.where('public', isPublic);
    }
    /**
     * Filter by category
     */
    whereCategory(categoryId) {
        if (Array.isArray(categoryId)) {
            return this.whereIn('category_id', categoryId);
        }
        return this.where('category_id', categoryId);
    }
    /**
     * Filter by availability (units remaining)
     */
    whereUnitsRemainingRange(min, max) {
        return this.whereRange('units_remaining', min, max);
    }
    /**
     * Filter by unlimited flag
     */
    whereUnlimited(isUnlimited) {
        return this.where('unlimited', isUnlimited);
    }
}
/**
 * User Query Builder
 * Provides a fluent interface for building complex user queries
 *
 * @example
 * const users = await sdk.users.createQueryBuilder()
 *   .whereStatus('approved')
 *   .whereKind('organisation')
 *   .whereEmailContains('@example.com')
 *   .whereLevelRange(5, 10)
 *   .paginate(1, 20)
 *   .execute();
 */
class UserQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by account status
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by user kind/type
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Filter by email containing a string
     */
    whereEmailContains(value) {
        return this.whereContains('email', value);
    }
    /**
     * Filter by username containing a string
     */
    whereUsernameContains(value) {
        return this.whereContains('username', value);
    }
    /**
     * Filter by user level range
     */
    whereLevelRange(min, max) {
        return this.whereRange('level', min, max);
    }
    /**
     * Filter by organization
     */
    whereOrganisation(orgId) {
        if (Array.isArray(orgId)) {
            return this.whereIn('organisation_id', orgId);
        }
        return this.where('organisation_id', orgId);
    }
    /**
     * Filter by role
     */
    whereRole(roleId) {
        if (Array.isArray(roleId)) {
            return this.whereIn('role_id', roleId);
        }
        return this.where('role_id', roleId);
    }
}
/**
 * Merchant Query Builder
 * Provides a fluent interface for building complex merchant queries
 *
 * @example
 * const merchants = await sdk.merchants.createQueryBuilder()
 *   .whereStatus('approved')
 *   .whereNameContains('Store')
 *   .whereSector('retail')
 *   .paginate(1, 20)
 *   .execute();
 */
class MerchantQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by merchant status
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by name containing a string
     */
    whereNameContains(value) {
        return this.whereContains('name', value);
    }
    /**
     * Filter by email containing a string
     */
    whereEmailContains(value) {
        return this.whereContains('email', value);
    }
    /**
     * Filter by sector
     */
    whereSector(sector) {
        if (Array.isArray(sector)) {
            return this.whereIn('sector', sector);
        }
        return this.where('sector', sector);
    }
    /**
     * Filter by business type
     */
    whereBusinessType(type) {
        if (Array.isArray(type)) {
            return this.whereIn('business_type', type);
        }
        return this.where('business_type', type);
    }
    /**
     * Filter by platform fee structure
     */
    wherePlatformFeeStructure(structure) {
        if (Array.isArray(structure)) {
            return this.whereIn('platform_fee_structure', structure);
        }
        return this.where('platform_fee_structure', structure);
    }
    /**
     * Filter by organisation
     */
    whereOrganisation(orgId) {
        if (Array.isArray(orgId)) {
            return this.whereIn('organisation_id', orgId);
        }
        return this.where('organisation_id', orgId);
    }
}
/**
 * Category Query Builder
 * Provides a fluent interface for building complex category queries
 *
 * @example
 * const categories = await sdk.categories.createQueryBuilder()
 *   .whereKind('published')
 *   .whereNameContains('Electronics')
 *   .whereParent(null)
 *   .paginate(1, 20)
 *   .execute();
 */
class CategoryQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by category kind
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Filter by name containing a string
     */
    whereNameContains(value) {
        return this.whereContains('name', value);
    }
    /**
     * Filter by parent category
     */
    whereParent(parentId) {
        if (parentId === null) {
            return this.where('parent_id', null);
        }
        if (Array.isArray(parentId)) {
            return this.whereIn('parent_id', parentId);
        }
        return this.where('parent_id', parentId);
    }
    /**
     * Filter by root categories only (no parent)
     */
    whereRootOnly() {
        return this.where('parent_id', null);
    }
}
/**
 * Billing Plan Query Builder
 * Provides a fluent interface for building complex billing plan queries
 *
 * @example
 * const plans = await sdk.billingPlans.createQueryBuilder()
 *   .whereKind('subscription')
 *   .wherePriceRange(10, 100)
 *   .wherePublic(true)
 *   .paginate(1, 20)
 *   .execute();
 */
class BillingPlanQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by plan kind/type
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Filter by flat rate range
     */
    whereFlatRateRange(min, max) {
        return this.whereRange('flat_rate', min, max);
    }
    /**
     * Filter by transaction fee range
     */
    whereTransactionFeeRange(min, max) {
        return this.whereRange('transaction_fee', min, max);
    }
    /**
     * Filter by public visibility
     */
    wherePublic(isPublic) {
        return this.where('public', isPublic);
    }
    /**
     * Filter by auto charge
     */
    whereAutoCharge(autoCharge) {
        return this.where('auto_charge', autoCharge);
    }
    /**
     * Filter by name containing a string
     */
    whereNameContains(value) {
        return this.whereContains('name', value);
    }
    /**
     * Filter by duration range (in days)
     */
    whereDurationRange(min, max) {
        return this.whereRange('duration', min, max);
    }
}
/**
 * Subscription Query Builder
 * Provides a fluent interface for building complex subscription queries
 *
 * @example
 * const subscriptions = await sdk.subscriptions.createQueryBuilder()
 *   .whereStatus('active')
 *   .whereBillingPlan(123)
 *   .whereStartDateAfter('2024-01-01')
 *   .paginate(1, 20)
 *   .execute();
 */
class SubscriptionQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by subscription status
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by billing plan
     */
    whereBillingPlan(planId) {
        if (Array.isArray(planId)) {
            return this.whereIn('billing_plan_id', planId);
        }
        return this.where('billing_plan_id', planId);
    }
    /**
     * Filter by customer
     */
    whereCustomer(customerId) {
        if (Array.isArray(customerId)) {
            return this.whereIn('customer_id', customerId);
        }
        return this.where('customer_id', customerId);
    }
    /**
     * Filter by start date after a specific date
     */
    whereStartDateAfter(date) {
        return this.whereDateRange('start_date', date, undefined);
    }
    /**
     * Filter by start date before a specific date
     */
    whereStartDateBefore(date) {
        return this.whereDateRange('start_date', undefined, date);
    }
    /**
     * Filter by active subscriptions (not canceled)
     */
    whereActive() {
        return this.where('canceled_at', null);
    }
    /**
     * Filter by canceled subscriptions
     */
    whereCanceled() {
        // This would need a "not null" check which might require additional logic
        // For now, we can use a date range that's been filled
        return this.whereDateRange('canceled_at', '1970-01-01', undefined);
    }
}
/**
 * Payment Link Query Builder
 */
class PaymentLinkQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereTotalGreaterThan(amount) {
        return this.whereRange('total', amount, undefined);
    }
    whereTotalLessThan(amount) {
        return this.whereRange('total', undefined, amount);
    }
    whereStatusIn(statuses) {
        return this.whereIn('status', statuses);
    }
    whereKindIn(kinds) {
        return this.whereIn('kind', kinds);
    }
}
/**
 * Financial Account Query Builder
 */
class FinancialAccountQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereTypeEquals(type) {
        return this.where('type', type);
    }
    whereProviderContains(provider) {
        return this.whereContains('provider', provider);
    }
    whereActiveEquals(active) {
        return this.where('active', active);
    }
    whereIsExternalEquals(isExternal) {
        return this.where('is_external', isExternal);
    }
}
/**
 * Financial Request Query Builder
 */
class FinancialRequestQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereStatusIn(statuses) {
        return this.whereIn('status', statuses);
    }
    whereTotalGreaterThan(amount) {
        return this.whereRange('total', amount, undefined);
    }
    whereTotalLessThan(amount) {
        return this.whereRange('total', undefined, amount);
    }
    whereMerchantIdEquals(merchantId) {
        return this.where('merchant_id', merchantId);
    }
}
/**
 * Webhook URL Query Builder
 */
class WebhookUrlQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereEventEquals(event) {
        return this.where('event', event);
    }
    whereMerchantIdEquals(merchantId) {
        return this.where('merchant_id', merchantId);
    }
    whereOrgIdEquals(orgId) {
        return this.where('org_id', orgId);
    }
    whereUrlContains(url) {
        return this.whereContains('url', url);
    }
}
/**
 * Token Query Builder
 */
class TokenQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereEnabledEquals(enabled) {
        return this.where('enabled', enabled);
    }
    whereKindIn(kinds) {
        return this.whereIn('kind', kinds);
    }
    whereUserIdEquals(userId) {
        return this.where('user_id', userId);
    }
    whereProviderEquals(provider) {
        return this.where('provider', provider);
    }
}
/**
 * Address Query Builder
 */
class AddressQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereCountryEquals(country) {
        return this.where('country', country);
    }
    whereStateEquals(state) {
        return this.where('state', state);
    }
    whereCityContains(city) {
        return this.whereContains('city', city);
    }
    whereKindIn(kinds) {
        return this.whereIn('kind', kinds);
    }
}
/**
 * Currency Query Builder
 */
class CurrencyQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereCodeIn(codes) {
        return this.whereIn('code', codes);
    }
    whereIsFloatEquals(isFloat) {
        return this.where('is_float', isFloat);
    }
}
/**
 * Exchange Rate Query Builder
 */
class ExchangeRateQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereSourceIdEquals(sourceId) {
        return this.where('source_id', sourceId);
    }
    whereDestinationIdEquals(destinationId) {
        return this.where('destination_id', destinationId);
    }
    whereRateGreaterThan(rate) {
        return this.whereRange('rate', rate, undefined);
    }
}
/**
 * Fee Query Builder
 */
class FeeQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereKindIn(kinds) {
        return this.whereIn('kind', kinds);
    }
    whereTotalGreaterThan(amount) {
        return this.whereRange('total', amount, undefined);
    }
    whereCurrencyCodeEquals(code) {
        return this.where('currency_code', code);
    }
    whereCompoundEquals(compound) {
        return this.where('compound', compound);
    }
}
/**
 * Payment Method Query Builder
 */
class PaymentMethodQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereActiveEquals(active) {
        return this.where('active', active);
    }
    whereProviderEquals(provider) {
        return this.where('provider', provider);
    }
    whereCodeEquals(code) {
        return this.where('code', code);
    }
}
/**
 * Transaction Entry Query Builder
 */
class TransactionEntryQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    whereAmountGreaterThan(amount) {
        return this.whereRange('amount', amount, undefined);
    }
    whereAmountLessThan(amount) {
        return this.whereRange('amount', undefined, amount);
    }
    whereTypeIn(types) {
        return this.whereIn('type', types);
    }
    whereTransactionIdEquals(transactionId) {
        return this.where('transaction_id', transactionId);
    }
    whereFinancialAccountIdEquals(accountId) {
        return this.where('financial_account_id', accountId);
    }
}
/**
 * KYC Query Builder
 * Provides a fluent interface for building complex KYC/legal request queries
 *
 * @example
 * const requests = await sdk.kyc.createQueryBuilder()
 *   .whereStatus('pending')
 *   .whereKind('document_submission')
 *   .paginate(1, 20)
 *   .execute();
 */
class KycQueryBuilder extends QueryBuilder {
    constructor(resource, initialQuery) {
        super(initialQuery);
        this.resource = resource;
    }
    /**
     * Execute the query and return the results
     */
    async execute() {
        return this.resource.query(this.getRawQuery());
    }
    /**
     * Filter by KYC request status
     */
    whereStatus(status) {
        if (Array.isArray(status)) {
            return this.whereIn('status', status);
        }
        return this.where('status', status);
    }
    /**
     * Filter by KYC request kind/type
     */
    whereKind(kind) {
        if (Array.isArray(kind)) {
            return this.whereIn('kind', kind);
        }
        return this.where('kind', kind);
    }
    /**
     * Filter by subject ID
     */
    whereSubject(subjectId) {
        if (Array.isArray(subjectId)) {
            return this.whereIn('subject_id', subjectId);
        }
        return this.where('subject_id', subjectId);
    }
    /**
     * Filter by user ID
     */
    whereUser(userId) {
        if (Array.isArray(userId)) {
            return this.whereIn('user_id', userId);
        }
        return this.where('user_id', userId);
    }
    /**
     * Filter by creation date range
     */
    whereCreatedBetween(after, before) {
        return this.whereDateRange('inserted_at', after, before);
    }
    /**
     * Filter by update date range
     */
    whereUpdatedBetween(after, before) {
        return this.whereDateRange('updated_at', after, before);
    }
}

/**
 * Resource-specific types and interfaces
 *
 * This file contains all filter parameters, list responses, and field type mappings
 * for each resource in the SDK. This provides clear IntelliSense and type safety.
 */
// ============================================================================
// FIELD TYPE MAPPINGS
// ============================================================================
// These define what operations are available on each field for type-safe querying
/**
 * Order field types - defines what operations are available on each field
 */
const ORDER_FIELD_TYPES = {
    id: 'number',
    reference_id: 'string',
    total: 'number',
    status: 'number',
    kind: 'number',
    status_on: 'number',
    uid: 'string',
    cart_id: 'number',
    currency_id: 'number',
    customer_id: 'number',
    payment_link_id: 'number',
    billing_plan_id: 'number',
    session_id: 'string',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Product field types
 */
const PRODUCT_FIELD_TYPES = {
    id: 'number',
    title: 'string',
    teaser: 'string',
    price: 'number',
    permalink: 'string',
    image: 'string',
    status: 'number',
    public: 'boolean',
    unlimited: 'boolean',
    units_remaining: 'number',
    units_sold: 'number',
    rating_sum: 'number',
    rating_count: 'number',
    tag_ids: 'array',
    uid: 'string',
    category_id: 'number',
    currency_id: 'number',
    user_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * User field types
 */
const USER_FIELD_TYPES = {
    id: 'number',
    email: 'string',
    phone: 'string',
    first_name: 'string',
    last_name: 'string',
    username: 'string',
    status: 'number',
    kind: 'number',
    level: 'number',
    dob: 'number',
    sex: 'number',
    image: 'string',
    uid: 'string',
    organisation_id: 'number',
    role_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Merchant field types
 */
const MERCHANT_FIELD_TYPES = {
    id: 'number',
    name: 'string',
    email: 'string',
    username: 'string',
    about: 'string',
    logo: 'string',
    sector: 'string',
    status: 'number',
    phone: 'string',
    business_type: 'string',
    theme_colour: 'string',
    uid: 'string',
    address_id: 'number',
    owner_id: 'number',
    domain_id: 'number',
    organisation_id: 'number',
    platform_fee_structure: 'number',
    provider_fee_structure: 'number',
    parent_merchant_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Category field types
 */
const CATEGORY_FIELD_TYPES = {
    id: 'number',
    name: 'string',
    description: 'string',
    kind: 'number',
    kind_id: 'number',
    parent_id: 'number',
    uid: 'string',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Billing Plan field types
 */
const BILLING_PLAN_FIELD_TYPES = {
    id: 'number',
    name: 'string',
    description: 'string',
    flat_rate: 'number',
    transaction_fee: 'number',
    transaction_percentage: 'number',
    transaction_percentage_additional: 'number',
    transaction_minimum_fee: 'number',
    minimum_fee: 'number',
    duration: 'number',
    status: 'number',
    kind: 'number',
    billing_cycle: 'number',
    trial_period: 'number',
    charge_strategy: 'number',
    auto_charge: 'boolean',
    public: 'boolean',
    payout_period: 'number',
    payout_value_limit: 'number',
    payout_percentage_limit: 'number',
    uid: 'string',
    currency_id: 'number',
    payment_provider_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Subscription field types
 */
const SUBSCRIPTION_FIELD_TYPES = {
    id: 'number',
    status: 'number',
    kind: 'number',
    record_id: 'number',
    record: 'string',
    start_date: 'date',
    end_date: 'date',
    current_period_start: 'date',
    current_period_end: 'date',
    trial_end: 'date',
    canceled_at: 'date',
    uid: 'string',
    token: 'string',
    billing_plan_id: 'number',
    customer_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Payment Link field types
 */
const PAYMENT_LINK_FIELD_TYPES = {
    id: 'number',
    uid: 'string',
    title: 'string',
    description: 'string',
    total: 'number',
    usage_limit: 'number',
    expires_at: 'date',
    status: 'number',
    kind: 'number',
    customer_id: 'number',
    currency_id: 'number',
    order_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Financial Account field types
 */
const FINANCIAL_ACCOUNT_FIELD_TYPES = {
    id: 'number',
    name: 'string',
    type: 'string',
    provider: 'string',
    is_external: 'boolean',
    fingerprint: 'string',
    record: 'string',
    record_id: 'number',
    active: 'boolean',
    code: 'string',
    adapter: 'string',
    logo: 'string',
    website: 'string',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Financial Request field types
 */
const FINANCIAL_REQUEST_FIELD_TYPES = {
    id: 'number',
    total: 'number',
    status: 'number',
    type: 'number',
    sub_type: 'number',
    fee_total: 'number',
    reference_id: 'string',
    reviewed_at: 'date',
    due_at: 'date',
    balance_on_request: 'number',
    source_id: 'number',
    destination_id: 'number',
    merchant_id: 'number',
    requester_id: 'number',
    reviewer_id: 'number',
    currency_id: 'number',
    evidence_file_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Webhook URL field types
 */
const WEBHOOK_URL_FIELD_TYPES = {
    id: 'number',
    url: 'string',
    event: 'string',
    uid: 'string',
    merchant_id: 'number',
    org_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Token field types
 */
const TOKEN_FIELD_TYPES = {
    id: 'number',
    public_key: 'string',
    title: 'string',
    provider: 'string',
    kind: 'number',
    enabled: 'boolean',
    expires: 'number',
    user_id: 'number',
    role_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Address field types
 */
const ADDRESS_FIELD_TYPES = {
    id: 'number',
    hash: 'string',
    kind: 'number',
    kind_id: 'number',
    lang: 'number',
    lat: 'number',
    street: 'string',
    street_optional: 'string',
    city: 'string',
    state: 'string',
    country: 'string',
    region: 'string',
    town: 'string',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Currency field types
 */
const CURRENCY_FIELD_TYPES = {
    id: 'number',
    code: 'string',
    flag: 'string',
    is_float: 'boolean',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Exchange Rate field types
 */
const EXCHANGE_RATE_FIELD_TYPES = {
    id: 'number',
    source_id: 'number',
    destination_id: 'number',
    rate: 'number',
    expires: 'number',
    source: 'string',
    user_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Fee field types
 */
const FEE_FIELD_TYPES = {
    id: 'number',
    title: 'string',
    total: 'number',
    unit: 'number',
    kind: 'number',
    priority: 'number',
    compound: 'boolean',
    fee_payer: 'number',
    currency_code: 'string',
    hash: 'string',
    fee_set_id: 'number',
    currency_id: 'number',
    user_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Payment Method field types
 */
const PAYMENT_METHOD_FIELD_TYPES = {
    id: 'number',
    name: 'string',
    code: 'string',
    provider: 'string',
    active: 'boolean',
    payment_provider_id: 'number',
    financial_account_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
/**
 * Transaction Entry field types
 */
const TRANSACTION_ENTRY_FIELD_TYPES = {
    id: 'number',
    amount: 'number',
    type: 'number',
    transaction_id: 'number',
    financial_account_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
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
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/merchants', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
            result: response.result
        };
    }
    /**
     * Get a specific merchant by ID
     */
    async get(id) {
        const response = await this.client.get(`/merchants/${id}`);
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Create a new merchant
     */
    async create(data) {
        const internalData = this.translateMerchantToInternal(data);
        const response = await this.client.post('/merchants', internalData);
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Update an existing merchant
     */
    async update(id, data) {
        const internalData = this.translateMerchantToInternal(data);
        const response = await this.client.put(`/merchants/${id}`, internalData);
        if (response.result) {
            const translatedMerchant = this.translateMerchantToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedMerchant
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Get merchant account balances
     */
    async balances() {
        return this.client.post('/merchants/account/balances');
    }
    /**
     * Get merchant account limits
     */
    async limits() {
        return this.client.post('/merchants/account/limits');
    }
    /**
     * Get merchant subscription plan details
     */
    async subscription() {
        return this.client.post('/merchants/account/plan');
    }
    /**
     * Get list of merchant account invoices
     */
    async invoices() {
        return this.client.post('/merchants/account/invoices');
    }
    /**
     * Get a specific merchant invoice by ID
     */
    async invoice(invoiceId) {
        return this.client.post(`/merchants/account/invoice/${invoiceId}`);
    }
    /**
     * Query merchants with enhanced query support
     * @example
     * await merchants.query({ status: 'approved', sector: 'retail' })
     */
    async query(params) {
        var _a;
        const processedQuery = processQuery(params || {}, MERCHANT_FIELD_TYPES, { validate: true, context: 'account' });
        const response = await this.client.get('/merchants', processedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(m => this.translateMerchantToUserFacing(m));
            return {
                state: response.state,
                result: { entries: translatedEntries, page_info: response.result.page_info }
            };
        }
        return { state: response.state, result: response.result };
    }
    /**
     * Create a query builder for merchants
     * @example
     * await sdk.merchants.createQueryBuilder().whereStatus('approved').execute()
     */
    createQueryBuilder(initialQuery) {
        return new MerchantQueryBuilder(this, initialQuery);
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
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/categories', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
            result: response.result
        };
    }
    /**
     * Get a specific category by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/categories/${id}`);
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
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
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
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
        if (response.result) {
            const translatedCategory = this.translateCategoryToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedCategory
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Query categories with enhanced query support
     * @example
     * await categories.query({ kind: 'published', parent_id: null })
     */
    async query(params) {
        var _a;
        const processedQuery = processQuery(params || {}, CATEGORY_FIELD_TYPES, { validate: true });
        const translatedQuery = this.translateFilters(processedQuery);
        const response = await this.client.get('/categories', translatedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(c => this.translateCategoryToUserFacing(c));
            return {
                state: response.state,
                result: { entries: translatedEntries, page_info: response.result.page_info }
            };
        }
        return { state: response.state, result: response.result };
    }
    /**
     * Create a query builder for categories
     * @example
     * await sdk.categories.createQueryBuilder().whereKind('published').execute()
     */
    createQueryBuilder(initialQuery) {
        return new CategoryQueryBuilder(this, initialQuery);
    }
}

class OrdersResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal order data (integers) to user-facing data (strings)
     */
    translateOrderToUserFacing(internal) {
        const result = {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'order'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'order'),
        };
        // Translate nested merchant if present
        if (internal.merchant) {
            result.merchant = this.translateMerchantToUserFacing(internal.merchant);
        }
        return result;
    }
    /**
     * Convert internal merchant data to user-facing merchant
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
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
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
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Delete an order
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/orders/${id}`);
    }
    /**
     * Get order status (public endpoint - no auth required)
     */
    async getStatus(id) {
        const response = await this.client.post(`/orders/status/${id}`);
        if (response.result) {
            const translatedOrder = this.translateOrderToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedOrder
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Get order list with pagination and filtering
     * Supports filtering by any database field
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/orders', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
     * await orders.query({ status: 'confirmed', kind: 'online' })
     *
     * // Array queries (IN operations)
     * await orders.query({ id: [1, 2, 3], status: ['confirmed', 'shipped'] })
     *
     * // Range queries
     * await orders.query({ total: { min: 100, max: 1000 } })
     *
     * // String searches
     * await orders.query({ reference_id: { contains: 'ORDER-2024' } })
     *
     * // Date range queries
     * await orders.query({ inserted_at: { after: '2024-01-01', before: '2024-12-31' } })
     *
     * // Combined queries
     * await orders.query({
     *   status: 'confirmed',
     *   total: { min: 50 },
     *   inserted_at: { after: '2024-01-01' },
     *   page: 1,
     *   page_size: 20
     * })
     */
    async query(params) {
        var _a;
        // Process the query through the transformation system with validation and translation
        const processedQuery = processQuery(params || {}, ORDER_FIELD_TYPES, { validate: true, context: 'order' });
        const response = await this.client.get('/orders', processedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
            result: response.result
        };
    }
    /**
     * Create a query builder for orders
     * Provides a fluent interface for building complex queries
     *
     * @example
     * const orders = await sdk.orders.createQueryBuilder()
     *   .whereStatus('confirmed')
     *   .whereTotalRange(100, 1000)
     *   .whereReferenceContains('ORDER-2024')
     *   .paginate(1, 20)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder(initialQuery) {
        return new OrderQueryBuilder(this, initialQuery);
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
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/products', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
            result: response.result
        };
    }
    /**
     * Get a specific product by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/products/${id}`);
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
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
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
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
        if (response.result) {
            const translatedProduct = this.translateProductToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedProduct
            };
        }
        return {
            state: response.state,
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
    /**
     * List products with enhanced query support
     * Supports filtering by any database field using the new query system
     * Requires Client-Id header to be set in the configuration
     *
     * @example
     * // Simple queries
     * await products.query({ status: 'published', public: true })
     *
     * // Array queries (IN operations)
     * await products.query({ category_id: [1, 2, 3], status: ['published', 'draft'] })
     *
     * // Range queries
     * await products.query({ price: { min: 10, max: 100 } })
     *
     * // String searches
     * await products.query({ title: { contains: 'shirt' } })
     *
     * // Combined queries
     * await products.query({
     *   status: 'published',
     *   price: { min: 20 },
     *   public: true,
     *   page: 1,
     *   page_size: 20
     * })
     */
    async query(params) {
        var _a;
        // Process the query through the transformation system with validation and translation
        const processedQuery = processQuery(params || {}, PRODUCT_FIELD_TYPES, { validate: true, context: 'product' });
        const response = await this.client.get('/products', processedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
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
            result: response.result
        };
    }
    /**
     * Create a query builder for products
     * Provides a fluent interface for building complex queries
     *
     * @example
     * const products = await sdk.products.createQueryBuilder()
     *   .whereStatus('published')
     *   .wherePriceRange(10, 100)
     *   .whereTitleContains('shirt')
     *   .wherePublic(true)
     *   .paginate(1, 20)
     *   .execute();
     */
    createQueryBuilder(initialQuery) {
        return new ProductQueryBuilder(this, initialQuery);
    }
}

class BillingPlansResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal billing plan data (integers) to user-facing data (strings)
     */
    translateToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_plan'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_plan'),
        };
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
     * Translate billing plan data for API (contextual strings to integers)
     */
    translateToInternal(data) {
        const internal = { ...data };
        // Translate kind if present and is a string
        if ('kind' in data && data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'billing_plan');
        }
        // Translate status if present and is a string (for updates)
        if ('status' in data && data.status && typeof data.status === 'string') {
            internal.status = StatusTranslator.toInteger(data.status);
        }
        return internal;
    }
    /**
     * List billing plans with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/billing_plans', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(plan => this.translateToUserFacing(plan));
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
            result: response.result
        };
    }
    /**
     * Get a specific billing plan by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/billing_plans/${id}`);
        if (response.result) {
            const translatedPlan = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedPlan
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Create a new billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        const response = await this.client.post('/billing_plans', internalData);
        if (response.result) {
            const translatedPlan = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedPlan
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Update an existing billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async update(id, data) {
        const internalData = this.translateToInternal(data);
        const response = await this.client.put(`/billing_plans/${id}`, internalData);
        if (response.result) {
            const translatedPlan = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedPlan
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Delete a billing plan
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/billing_plans/${id}`);
    }
    /**
     * Query billing plans with enhanced query support
     * @example
     * await billingPlans.query({ kind: 'subscription', public: true })
     */
    async query(params) {
        var _a;
        const processedQuery = processQuery(params || {}, BILLING_PLAN_FIELD_TYPES, { validate: true, context: 'billing_plan' });
        const response = await this.client.get('/billing_plans', processedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(plan => this.translateToUserFacing(plan));
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
            result: response.result
        };
    }
    /**
     * Create a query builder for billing plans
     * @example
     * await sdk.billingPlans.createQueryBuilder().whereKind('subscription').execute()
     */
    createQueryBuilder(initialQuery) {
        return new BillingPlanQueryBuilder(this, initialQuery);
    }
}

class SubscriptionsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal subscription data (integers) to user-facing data (strings)
     */
    translateToUserFacing(internal) {
        const result = {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_subscription'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_subscription'),
        };
        // Translate nested billing plan if present
        if (internal.billing_plan) {
            result.billing_plan = this.translateBillingPlanToUserFacing(internal.billing_plan);
        }
        return result;
    }
    /**
     * Convert internal billing plan data to user-facing billing plan
     */
    translateBillingPlanToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'billing_plan'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'billing_plan'),
        };
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
     * Translate subscription data for API (contextual strings to integers)
     */
    translateToInternal(data) {
        const internal = { ...data };
        // Translate status if present and is a string
        if (data.status && typeof data.status === 'string') {
            internal.status = StatusTranslator.toIntegerWithContext(data.status, 'billing_subscription');
        }
        // Translate kind if present and is a string
        if (data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toInteger(data.kind);
        }
        return internal;
    }
    /**
     * List billing subscriptions with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     */
    async list(params) {
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/billing_subscriptions', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(sub => this.translateToUserFacing(sub));
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
            result: response.result
        };
    }
    /**
     * Gets a billing subscription by ID
     * Requires Client-Id header to be set in the configuration
     */
    async get(id) {
        const response = await this.client.get(`/billing_subscriptions/${id}`);
        if (response.result) {
            const translatedSub = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedSub
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Create a new subscription
     * Requires Client-Id header to be set in the configuration
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        const response = await this.client.post('/billing_subscriptions', internalData);
        if (response.result) {
            const translatedSub = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedSub
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Delete a subscription
     * Requires Client-Id header to be set in the configuration
     */
    async delete(id) {
        return this.client.delete(`/billing_subscriptions/${id}`);
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
     * Record usage for a subscription (for usage-based billing)
     * Requires Client-Id header to be set in the configuration
     */
    async usage(uid, data) {
        return this.client.post(`/billing_subscriptions/${uid}/usage`, data);
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
    /**
     * Query subscriptions with enhanced query support
     * @example
     * await subscriptions.query({ status: 'active', billing_plan_id: 123 })
     */
    async query(params) {
        const processedQuery = processQuery(params || {}, SUBSCRIPTION_FIELD_TYPES, { validate: true, context: 'billing_subscription' });
        return this.client.get('/billing_subscriptions', processedQuery);
    }
    /**
     * Create a query builder for subscriptions
     * @example
     * await sdk.subscriptions.createQueryBuilder().whereStatus('active').execute()
     */
    createQueryBuilder(initialQuery) {
        return new SubscriptionQueryBuilder(this, initialQuery);
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
        const internalData = this.translateUserToInternal(data);
        return this.client.post('/users', internalData);
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
    /**
     * Query users with enhanced query support
     * @example
     * await users.query({ status: 'approved', level: { min: 5 } })
     */
    async query(params) {
        var _a;
        const processedQuery = processQuery(params || {}, USER_FIELD_TYPES, { validate: true });
        const translatedQuery = this.translateFilters(processedQuery);
        const response = await this.client.get('/users', translatedQuery);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(user => this.translateUserToUserFacing(user));
            return {
                state: response.state,
                result: { entries: translatedEntries, page_info: response.result.page_info }
            };
        }
        return { state: response.state, result: response.result };
    }
    /**
     * Create a query builder for users
     * @example
     * await sdk.users.createQueryBuilder().whereStatus('approved').execute()
     */
    createQueryBuilder(initialQuery) {
        return new UserQueryBuilder(this, initialQuery);
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

// Field type definitions for query validation
const KYC_FIELD_TYPES = {
    id: 'number',
    status: 'number',
    kind: 'number',
    subject_id: 'number',
    user_id: 'number',
    inserted_at: 'date',
    updated_at: 'date',
};
class KycResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List KYC records with pagination and filtering
     * Requires Client-Id header to be set in the configuration
     *
     * @example
     * await kyc.list({ status: 'pending' })
     */
    async list(params) {
        return this.client.get('/legal_requests', params);
    }
    /**
     * Query KYC records with advanced filtering
     * Supports all query system features (ranges, arrays, date ranges, etc.)
     *
     * @example
     * await kyc.query({ status: ['pending', 'in_review'], inserted_at: { after: '2024-01-01' } })
     */
    async query(params) {
        const processedQuery = processQuery(params || {}, KYC_FIELD_TYPES, { validate: true, context: 'legal_request' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for KYC requests
     *
     * @example
     * await sdk.kyc.createQueryBuilder().whereStatus('pending').execute()
     */
    createQueryBuilder(initialQuery) {
        return new KycQueryBuilder(this, initialQuery);
    }
    /**
     * List KYC records with pagination and filtering (alias for list)
     * @deprecated Use list() or query() instead
     * Requires Client-Id header to be set in the configuration
     */
    async listRequests(params) {
        return this.list(params);
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
     * Upload a document for KYC verification
     * Requires Client-Id header to be set in the configuration
     */
    async uploadDocument(data) {
        return this.client.post('/legal_requests', data);
    }
    /**
     * Update bank information
     * Requires Client-Id header to be set in the configuration
     */
    async updateBankInfo(data) {
        return this.client.post('/legal_requests', data);
    }
}

class PaymentLinksResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * Convert internal payment link data (integers) to user-facing data (strings)
     */
    translateToUserFacing(internal) {
        return {
            ...internal,
            status: StatusTranslator.toStringWithoutContext(internal.status, 'payment_link'),
            kind: KindTranslator.toStringWithoutContext(internal.kind, 'order'),
        };
    }
    /**
     * Convert filter parameters (strings to integers where needed)
     */
    translateFilters(params) {
        if (!params)
            return params;
        const translated = { ...params };
        if (params.status && typeof params.status === 'string') {
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'payment_link');
        }
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'payment_link');
        }
        return translated;
    }
    /**
     * Convert user-facing data to internal format
     */
    translateToInternal(data) {
        const internal = { ...data };
        if ('status' in data && data.status && typeof data.status === 'string') {
            internal.status = StatusTranslator.toIntegerWithContext(data.status, 'payment_link');
        }
        if ('kind' in data && data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'payment_link');
        }
        return internal;
    }
    /**
     * List payment links with filtering
     */
    async list(params) {
        var _a;
        const translatedParams = this.translateFilters(params);
        const response = await this.client.get('/payment_links', translatedParams);
        if ((_a = response.result) === null || _a === void 0 ? void 0 : _a.entries) {
            const translatedEntries = response.result.entries.map(link => this.translateToUserFacing(link));
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
            result: response.result
        };
    }
    /**
     * Get payment link by ID
     */
    async get(id) {
        const response = await this.client.get(`/payment_links/${id}`);
        if (response.result) {
            const translatedLink = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedLink
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Create a new payment link
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        const response = await this.client.post('/payment_links', internalData);
        if (response.result) {
            const translatedLink = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedLink
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Update a payment link
     */
    async update(id, data) {
        const internalData = this.translateToInternal(data);
        const response = await this.client.put(`/payment_links/${id}`, internalData);
        if (response.result) {
            const translatedLink = this.translateToUserFacing(response.result);
            return {
                state: response.state,
                result: translatedLink
            };
        }
        return {
            state: response.state,
            result: response.result
        };
    }
    /**
     * Delete a payment link
     */
    async delete(id) {
        return this.client.delete(`/payment_links/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     * Returns a QueryBuilder that compiles to the appropriate filter format
     *
     * @example
     * const links = await sdk.paymentLinks.query({
     *   total: { gte: 1000 },
     *   status: [1, 2],
     *   inserted_at: { gte: '2024-01-01' }
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, PAYMENT_LINK_FIELD_TYPES, { validate: true, context: 'payment_link' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for payment links
     *
     * @example
     * const links = await sdk.paymentLinks.createQueryBuilder()
     *   .whereTotalGreaterThan(1000)
     *   .whereStatusIn([1, 2])
     *   .orderBy('inserted_at', 'desc')
     *   .limit(50)
     *   .execute();
     */
    createQueryBuilder() {
        return new PaymentLinkQueryBuilder(this);
    }
}

class FinancialAccountsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List financial accounts with filtering
     */
    async list(params) {
        return this.client.get('/financial_accounts', params);
    }
    /**
     * Get financial account by ID
     */
    async get(id) {
        return this.client.get(`/financial_accounts/${id}`);
    }
    /**
     * Create a new financial account
     */
    async create(data) {
        return this.client.post('/financial_accounts', data);
    }
    /**
     * Update a financial account
     */
    async update(id, data) {
        return this.client.put(`/financial_accounts/${id}`, data);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const accounts = await sdk.financialAccounts.query({
     *   type: 'bank',
     *   active: true,
     *   provider: { contains: 'stripe' }
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, FINANCIAL_ACCOUNT_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for financial accounts
     *
     * @example
     * const accounts = await sdk.financialAccounts.createQueryBuilder()
     *   .whereTypeEquals('bank')
     *   .whereActiveEquals(true)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder() {
        return new FinancialAccountQueryBuilder(this);
    }
}

class FinancialRequestsResource {
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
            translated.status = StatusTranslator.toIntegerWithContext(params.status, 'financial_request');
        }
        return translated;
    }
    /**
     * Convert user-facing data to internal format
     */
    translateToInternal(data) {
        const internal = { ...data };
        if ('status' in data && data.status && typeof data.status === 'string') {
            internal.status = StatusTranslator.toIntegerWithContext(data.status, 'financial_request');
        }
        return internal;
    }
    /**
     * List financial requests with filtering
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/financial_requests', translatedParams);
    }
    /**
     * Get financial request by ID
     */
    async get(id) {
        return this.client.get(`/financial_requests/${id}`);
    }
    /**
     * Create a new financial request
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        return this.client.post('/financial_requests', internalData);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const requests = await sdk.financialRequests.query({
     *   status: [1, 2],
     *   total: { gte: 5000 },
     *   merchant_id: 123
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, FINANCIAL_REQUEST_FIELD_TYPES, { validate: true, context: 'financial_request' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for financial requests
     *
     * @example
     * const requests = await sdk.financialRequests.createQueryBuilder()
     *   .whereStatusIn([1, 2])
     *   .whereTotalGreaterThan(5000)
     *   .orderBy('inserted_at', 'desc')
     *   .execute();
     */
    createQueryBuilder() {
        return new FinancialRequestQueryBuilder(this);
    }
}

class WebhookUrlsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List webhook URLs with filtering
     */
    async list(params) {
        return this.client.get('/webhook_urls', params);
    }
    /**
     * Get webhook URL by ID
     */
    async get(id) {
        return this.client.get(`/webhook_urls/${id}`);
    }
    /**
     * Create a new webhook URL
     */
    async create(data) {
        return this.client.post('/webhook_urls', data);
    }
    /**
     * Update a webhook URL
     */
    async update(id, data) {
        return this.client.put(`/webhook_urls/${id}`, data);
    }
    /**
     * Delete a webhook URL
     */
    async delete(id) {
        return this.client.delete(`/webhook_urls/${id}`);
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
    async query(params) {
        const processedQuery = processQuery(params, WEBHOOK_URL_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
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
    createQueryBuilder() {
        return new WebhookUrlQueryBuilder(this);
    }
}

/**
 * Tokens Resource
 *
 * ⚠️ LIMITED ACCESS WARNING:
 * This resource is primarily for super_admin and platform_affiliate roles.
 * organisation_admin has limited access (view/list/create/delete only, no update).
 * Use with caution and be aware of permission restrictions.
 */
class TokensResource {
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
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'token');
        }
        return translated;
    }
    /**
     * Convert user-facing data to internal format
     */
    translateToInternal(data) {
        const internal = { ...data };
        if ('kind' in data && data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'token');
        }
        return internal;
    }
    /**
     * List tokens with filtering
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/tokens', translatedParams);
    }
    /**
     * Get token by ID
     */
    async get(id) {
        return this.client.get(`/tokens/${id}`);
    }
    /**
     * Create a new token
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        return this.client.post('/tokens', internalData);
    }
    /**
     * Delete a token
     */
    async delete(id) {
        return this.client.delete(`/tokens/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const tokens = await sdk.tokens.query({
     *   enabled: true,
     *   kind: [1, 2],
     *   user_id: 123
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, TOKEN_FIELD_TYPES, { validate: true, context: 'token' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for tokens
     *
     * @example
     * const tokens = await sdk.tokens.createQueryBuilder()
     *   .whereEnabledEquals(true)
     *   .whereKindIn([1, 2])
     *   .execute();
     */
    createQueryBuilder() {
        return new TokenQueryBuilder(this);
    }
}

class AddressesResource {
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
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'address');
        }
        return translated;
    }
    /**
     * Convert user-facing data to internal format
     */
    translateToInternal(data) {
        const internal = { ...data };
        if ('kind' in data && data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'address');
        }
        return internal;
    }
    /**
     * List addresses with filtering
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/addresses', translatedParams);
    }
    /**
     * Get address by ID
     */
    async get(id) {
        return this.client.get(`/addresses/${id}`);
    }
    /**
     * Create a new address
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        return this.client.post('/addresses', internalData);
    }
    /**
     * Update an address
     */
    async update(id, data) {
        const internalData = this.translateToInternal(data);
        return this.client.put(`/addresses/${id}`, internalData);
    }
    /**
     * Delete an address
     */
    async delete(id) {
        return this.client.delete(`/addresses/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const addresses = await sdk.addresses.query({
     *   country: 'US',
     *   state: 'CA',
     *   kind: [1, 2]
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, ADDRESS_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for addresses
     *
     * @example
     * const addresses = await sdk.addresses.createQueryBuilder()
     *   .whereCountryEquals('US')
     *   .whereStateEquals('CA')
     *   .execute();
     */
    createQueryBuilder() {
        return new AddressQueryBuilder(this);
    }
}

class CurrenciesResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List currencies with filtering
     */
    async list(params) {
        return this.client.get('/currencies', params);
    }
    /**
     * Get currency by ID
     */
    async get(id) {
        return this.client.get(`/currencies/${id}`);
    }
    /**
     * Create a new currency
     */
    async create(data) {
        return this.client.post('/currencies', data);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const currencies = await sdk.currencies.query({
     *   code: ['USD', 'EUR'],
     *   is_float: true
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, CURRENCY_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for currencies
     *
     * @example
     * const currencies = await sdk.currencies.createQueryBuilder()
     *   .whereCodeIn(['USD', 'EUR'])
     *   .whereIsFloatEquals(true)
     *   .execute();
     */
    createQueryBuilder() {
        return new CurrencyQueryBuilder(this);
    }
}

class ExchangeRatesResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List exchange rates with filtering
     */
    async list(params) {
        return this.client.get('/exchange_rates', params);
    }
    /**
     * Get exchange rate by ID
     */
    async get(id) {
        return this.client.get(`/exchange_rates/${id}`);
    }
    /**
     * Create a new exchange rate
     */
    async create(data) {
        return this.client.post('/exchange_rates', data);
    }
    /**
     * Update an exchange rate
     */
    async update(id, data) {
        return this.client.put(`/exchange_rates/${id}`, data);
    }
    /**
     * Delete an exchange rate
     */
    async delete(id) {
        return this.client.delete(`/exchange_rates/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const rates = await sdk.exchangeRates.query({
     *   source_id: 1,
     *   destination_id: 2,
     *   rate: { gte: 1.0 }
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, EXCHANGE_RATE_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for exchange rates
     *
     * @example
     * const rates = await sdk.exchangeRates.createQueryBuilder()
     *   .whereSourceIdEquals(1)
     *   .whereDestinationIdEquals(2)
     *   .execute();
     */
    createQueryBuilder() {
        return new ExchangeRateQueryBuilder(this);
    }
}

class FeesResource {
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
        if (params.kind && typeof params.kind === 'string') {
            translated.kind = KindTranslator.toIntegerWithContext(params.kind, 'fee');
        }
        return translated;
    }
    /**
     * Convert user-facing data to internal format
     */
    translateToInternal(data) {
        const internal = { ...data };
        if ('kind' in data && data.kind && typeof data.kind === 'string') {
            internal.kind = KindTranslator.toIntegerWithContext(data.kind, 'fee');
        }
        return internal;
    }
    /**
     * List fees with filtering
     */
    async list(params) {
        const translatedParams = this.translateFilters(params);
        return this.client.get('/fees', translatedParams);
    }
    /**
     * Get fee by ID
     */
    async get(id) {
        return this.client.get(`/fees/${id}`);
    }
    /**
     * Create a new fee
     */
    async create(data) {
        const internalData = this.translateToInternal(data);
        return this.client.post('/fees', internalData);
    }
    /**
     * Update a fee
     */
    async update(id, data) {
        const internalData = this.translateToInternal(data);
        return this.client.put(`/fees/${id}`, internalData);
    }
    /**
     * Delete a fee
     */
    async delete(id) {
        return this.client.delete(`/fees/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const fees = await sdk.fees.query({
     *   kind: [1, 2],
     *   total: { gte: 100 },
     *   currency_code: 'USD'
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, FEE_FIELD_TYPES, { validate: true, context: 'fee' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for fees
     *
     * @example
     * const fees = await sdk.fees.createQueryBuilder()
     *   .whereKindIn([1, 2])
     *   .whereTotalGreaterThan(100)
     *   .execute();
     */
    createQueryBuilder() {
        return new FeeQueryBuilder(this);
    }
}

class PaymentMethodsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List payment methods with filtering
     */
    async list(params) {
        return this.client.get('/payment_methods', params);
    }
    /**
     * Get payment method by ID
     */
    async get(id) {
        return this.client.get(`/payment_methods/${id}`);
    }
    /**
     * Create a new payment method
     */
    async create(data) {
        return this.client.post('/payment_methods', data);
    }
    /**
     * Update a payment method
     */
    async update(id, data) {
        return this.client.put(`/payment_methods/${id}`, data);
    }
    /**
     * Delete a payment method
     */
    async delete(id) {
        return this.client.delete(`/payment_methods/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     *
     * @example
     * const methods = await sdk.paymentMethods.query({
     *   active: true,
     *   provider: { contains: 'stripe' }
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, PAYMENT_METHOD_FIELD_TYPES, { validate: true });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for payment methods
     *
     * @example
     * const methods = await sdk.paymentMethods.createQueryBuilder()
     *   .whereActiveEquals(true)
     *   .execute();
     */
    createQueryBuilder() {
        return new PaymentMethodQueryBuilder(this);
    }
}

/**
 * Transaction Entries Resource
 *
 * ⚠️ READ-ONLY RESOURCE:
 * This resource is READ-ONLY for organisation_admin and owner roles.
 * Only view and list operations are supported.
 * Create/update/delete operations require super_admin privileges.
 */
class TransactionEntriesResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List transaction entries with filtering
     */
    async list(params) {
        return this.client.get('/transaction_entries', params);
    }
    /**
     * Get transaction entry by ID
     */
    async get(id) {
        return this.client.get(`/transaction_entries/${id}`);
    }
    /**
     * Advanced query interface with full type safety
     * Note: Transaction entries are read-only for organisation_admin.
     * Create/update/delete operations require super_admin privileges.
     *
     * @example
     * const entries = await sdk.transactionEntries.query({
     *   amount: { gte: 100 },
     *   type: [1, 2],
     *   transaction_id: 123
     * });
     */
    async query(params) {
        const processedQuery = processQuery(params, TRANSACTION_ENTRY_FIELD_TYPES, { validate: true, context: 'ledger_entry' });
        return this.list(processedQuery);
    }
    /**
     * Create a fluent query builder for transaction entries
     *
     * @example
     * const entries = await sdk.transactionEntries.createQueryBuilder()
     *   .whereAmountGreaterThan(100)
     *   .whereTypeIn([1, 2])
     *   .execute();
     */
    createQueryBuilder() {
        return new TransactionEntryQueryBuilder(this);
    }
}

/**
 * Generic resource handler for any endpoint
 * Provides CRUD operations for resources not yet implemented with specific types
 */
class GenericsResource {
    constructor(client) {
        this.client = client;
    }
    /**
     * List resources from a generic endpoint
     *
     * @example
     * const data = await sdk.generics.list('/subscription_periods', { status: 1 });
     */
    async list(endpoint, params) {
        return this.client.get(endpoint, params);
    }
    /**
     * Query resources from a generic endpoint with advanced filtering
     * Supports all query system features (ranges, arrays, date ranges, etc.)
     *
     * @example
     * await sdk.generics.query('/subscription_periods', {
     *   status: [1, 2],
     *   inserted_at: { after: '2024-01-01' }
     * })
     */
    async query(endpoint, params) {
        const processedQuery = processQuery(params || {});
        return this.list(endpoint, processedQuery);
    }
    /**
     * Get a single resource by ID from a generic endpoint
     *
     * @example
     * const data = await sdk.generics.get('/subscription_periods', 123);
     */
    async get(endpoint, id) {
        return this.client.get(`${endpoint}/${id}`);
    }
    /**
     * Create a new resource on a generic endpoint
     *
     * @example
     * const data = await sdk.generics.create('/subscription_periods', { name: 'Monthly', days: 30 });
     */
    async create(endpoint, data) {
        return this.client.post(endpoint, data);
    }
    /**
     * Update a resource on a generic endpoint
     *
     * @example
     * const data = await sdk.generics.update('/subscription_periods', 123, { name: 'Monthly Premium' });
     */
    async update(endpoint, id, data) {
        return this.client.put(`${endpoint}/${id}`, data);
    }
    /**
     * Delete a resource from a generic endpoint
     *
     * @example
     * await sdk.generics.delete('/subscription_periods', 123);
     */
    async delete(endpoint, id) {
        return this.client.delete(`${endpoint}/${id}`);
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
 *   accessToken: 'your-jwt-token',
 *   username: 'merchant-username', // Optional - automatically prepended with 'm-'
 *   mode: 'live', // Optional - 'live' (default) or 'sandbox'
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
        this.paymentLinks = new PaymentLinksResource(this.client);
        this.financialAccounts = new FinancialAccountsResource(this.client);
        this.financialRequests = new FinancialRequestsResource(this.client);
        this.webhookUrls = new WebhookUrlsResource(this.client);
        this.tokens = new TokensResource(this.client);
        this.addresses = new AddressesResource(this.client);
        this.currencies = new CurrenciesResource(this.client);
        this.exchangeRates = new ExchangeRatesResource(this.client);
        this.fees = new FeesResource(this.client);
        this.paymentMethods = new PaymentMethodsResource(this.client);
        this.transactionEntries = new TransactionEntriesResource(this.client);
        this.generics = new GenericsResource(this.client);
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

export { ADDRESS_FIELD_TYPES, AddressQueryBuilder, BILLING_PLAN_FIELD_TYPES, BillingPlanQueryBuilder, CATEGORY_FIELD_TYPES, CURRENCY_FIELD_TYPES, CategoryQueryBuilder, CurrencyQueryBuilder, EXCHANGE_RATE_FIELD_TYPES, ExchangeRateQueryBuilder, FEE_FIELD_TYPES, FINANCIAL_ACCOUNT_FIELD_TYPES, FINANCIAL_REQUEST_FIELD_TYPES, FeeQueryBuilder, FinancialAccountQueryBuilder, FinancialRequestQueryBuilder, HttpClient, InkressApiError, InkressSDK, MERCHANT_FIELD_TYPES, MerchantQueryBuilder, ORDER_FIELD_TYPES, OrderQueryBuilder, PAYMENT_LINK_FIELD_TYPES, PAYMENT_METHOD_FIELD_TYPES, PRODUCT_FIELD_TYPES, PaymentLinkQueryBuilder, PaymentMethodQueryBuilder, ProductQueryBuilder, QueryBuilder, SUBSCRIPTION_FIELD_TYPES, SubscriptionQueryBuilder, TOKEN_FIELD_TYPES, TRANSACTION_ENTRY_FIELD_TYPES, TokenQueryBuilder, TransactionEntryQueryBuilder, USER_FIELD_TYPES, UserQueryBuilder, WEBHOOK_URL_FIELD_TYPES, WebhookUrlQueryBuilder, InkressSDK as default, processQuery };
//# sourceMappingURL=index.esm.js.map
