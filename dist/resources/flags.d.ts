import { HttpClient } from '../client';
/** OpenFeature evaluation context. `targetingKey` is your stable id for the end user. */
export interface FlagContext {
    targetingKey?: string;
    /** Customer uid: lets Inkress resolve `inkress.access`, `inkress.plan`, `inkress.subscription_status`. */
    inkress_customer?: string;
    email?: string;
    [attribute: string]: unknown;
}
export type FlagReason = 'STATIC' | 'TARGETING_MATCH' | 'SPLIT' | 'DISABLED' | 'ERROR';
export type FlagErrorCode = 'FLAG_NOT_FOUND' | 'TARGETING_KEY_MISSING' | 'INVALID_CONTEXT' | 'PARSE_ERROR' | 'GENERAL';
/** One OFREP evaluation: either a value or an error code (the caller's default then applies). */
export interface FlagEvaluation<V = unknown> {
    key: string;
    value?: V;
    variant?: string;
    reason?: FlagReason;
    metadata?: Record<string, unknown>;
    errorCode?: FlagErrorCode;
    errorDetails?: string;
}
export interface EvaluateAllOptions {
    /** The ETag from a previous call; an unchanged configuration answers `notModified: true`. */
    etag?: string;
}
export interface EvaluateAllResult {
    notModified: boolean;
    /** Empty when `notModified`. */
    flags: FlagEvaluation[];
    etag: string | null;
}
/**
 * Feature flag evaluation over OFREP v1 (INK-805). Needs the merchant's secret key as `accessToken`.
 * Any OpenFeature OFREP provider can be used instead, pointed at the same origin.
 */
export declare class FlagsResource {
    private client;
    constructor(client: HttpClient);
    /**
     * Evaluate one flag. Evaluation failures (unknown flag, bad context) come back as `errorCode`, not
     * as exceptions; auth (401) and rate limits (429) throw `InkressApiError`.
     */
    evaluate<V = unknown>(key: string, context?: FlagContext): Promise<FlagEvaluation<V>>;
    /** Evaluate every flag for a context. */
    evaluateAll(context?: FlagContext, options?: EvaluateAllOptions): Promise<EvaluateAllResult>;
    /** Convenience: a flag's boolean value, or `defaultValue` when it cannot be evaluated. */
    isEnabled(key: string, context?: FlagContext, defaultValue?: boolean): Promise<boolean>;
}
//# sourceMappingURL=flags.d.ts.map