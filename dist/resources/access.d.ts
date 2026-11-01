import { HttpClient } from '../client';
/** A customer's standing on the merchant's plans (FEATURE-FLAGS-SPEC §6). */
export type AccessState = 'active' | 'trialing' | 'grace' | 'paused' | 'blocked' | 'none';
export interface AccessSubscription {
    uid: string;
    plan_uid: string;
    status: string;
    current_period_end: string | null;
    trial_end: string | null;
    cancel_at_period_end: boolean;
    grace_until: string | null;
}
/** Answer of `GET /api/v1/access`. */
export interface AccessResult {
    /** true when `access` is `active`, `trialing` or `grace`. */
    allowed: boolean;
    access: AccessState;
    /** The most relevant subscription (active/trialing first, then newest), or null. */
    subscription: AccessSubscription | null;
    /** The merchant's flags evaluated for this customer; flags that fail to evaluate are left out. */
    features: Record<string, unknown>;
}
export interface AccessOptions {
    /** `targetingKey` for the feature evaluation. Defaults to the customer uid (or email). */
    targetingKey?: string;
}
/**
 * "May this customer use my product right now, and with which features?" (INK-805).
 * Needs the merchant's secret key (`sk_live_` / `sk_test_`) as `accessToken`.
 */
export declare class AccessResource {
    private client;
    constructor(client: HttpClient);
    /** Access for a customer by uid. An unknown customer reads as `access: 'none'`. */
    get(customerUid: string, options?: AccessOptions): Promise<AccessResult>;
    /** Access for a customer by email. */
    getByEmail(email: string, options?: AccessOptions): Promise<AccessResult>;
    private fetch;
}
//# sourceMappingURL=access.d.ts.map