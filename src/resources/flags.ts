import { HttpClient, InkressApiError } from '../client';

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
export class FlagsResource {
  constructor(private client: HttpClient) {}

  /**
   * Evaluate one flag. Evaluation failures (unknown flag, bad context) come back as `errorCode`, not
   * as exceptions; auth (401) and rate limits (429) throw `InkressApiError`.
   */
  async evaluate<V = unknown>(key: string, context: FlagContext = {}): Promise<FlagEvaluation<V>> {
    const { status, body } = await this.client.raw<FlagEvaluation<V>>(
      'POST',
      `/api/ofrep/v1/evaluate/flags/${encodeURIComponent(key)}`,
      { body: { context } }
    );
    if ((status === 200 || status === 400 || status === 404) && body) return body;
    throw new InkressApiError(`Flag evaluation failed: HTTP ${status}`, status, body);
  }

  /** Evaluate every flag for a context. */
  async evaluateAll(context: FlagContext = {}, options: EvaluateAllOptions = {}): Promise<EvaluateAllResult> {
    const { status, headers, body } = await this.client.raw<{ flags?: FlagEvaluation[] }>(
      'POST',
      '/api/ofrep/v1/evaluate/flags',
      { body: { context }, headers: options.etag ? { 'If-None-Match': options.etag } : {} }
    );
    const etag = headers.get('etag');
    if (status === 304) return { notModified: true, flags: [], etag: etag || options.etag || null };
    if (status === 200 && body?.flags) return { notModified: false, flags: body.flags, etag };
    throw new InkressApiError(`Flag evaluation failed: HTTP ${status}`, status, body);
  }

  /** Convenience: a flag's boolean value, or `defaultValue` when it cannot be evaluated. */
  async isEnabled(key: string, context: FlagContext = {}, defaultValue = false): Promise<boolean> {
    const result = await this.evaluate<boolean>(key, context);
    return typeof result.value === 'boolean' ? result.value : defaultValue;
  }
}
