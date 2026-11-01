import { HttpClient } from '../client';
import { ApiResponse } from '../types';
/**
 * Partner activation (INK-760, INK-1512, INK-1532): a partner platform turns on Inkress payments
 * for its own businesses, each named by the partner's own `reference`. Call with the partner
 * organisation's credential and no business selected; anything else is `403 not_a_partner`.
 */
/** `active`: done; `setting_up`: call again shortly; `confirmation_sent`: call again with the emailed code. */
export type PartnerActivationState = 'active' | 'setting_up' | 'confirmation_sent';
/** How the business was linked: already in your organisation, moved in from the marketplace, or created. */
export type PartnerActivationLink = 'linked' | 'moved' | 'created';
export interface PartnerMerchantSummary {
    id: number;
    uid: string;
    username: string;
    name: string;
    email: string;
    /** Merchant status code; 33 = verified. */
    status: number;
}
export interface PartnerKeys {
    /** The owner's purchase key (`pk_`), the Bearer token for orders. */
    public_key: string;
    /** The business's client secret; it signs the payment-result JWTs you receive. Server-side only. */
    secret_key: string;
    /**
     * An API key of the business (`sk_`) issued to you (INK-1532). Needed for orders with custom
     * `items`. Null when the business is closed or its owner removed you. Server-side only.
     */
    api_secret_key: string | null;
}
export type PartnerVouchLimitKind = 'single' | 'daily' | 'monthly' | 'withdrawal';
export interface PartnerVouch {
    merchant_id: number;
    /** Merchant status code after the vouch (33 = verified). */
    status: number;
    vouched_by: string;
    vouched_at: string;
    expires_at: string;
    currency: string;
    /** Starter limits, in `currency`. */
    limits: Partial<Record<PartnerVouchLimitKind, number>>;
}
export interface PartnerMerchantProfile {
    name: string;
    email: string;
    phone?: string;
    username?: string;
    logo?: string;
    about?: string;
    sector?: string;
    business_type?: string;
    theme_colour?: string;
    website?: string;
    socials?: Record<string, string>;
    support_email?: string;
    support_phone?: string;
    address?: Record<string, unknown>;
}
export interface PartnerOwner {
    email: string;
    first_name: string;
    last_name?: string;
    phone?: string;
}
export interface PartnerActivateData {
    /** Your id for the business, 1 to 100 characters. */
    reference: string;
    merchant: PartnerMerchantProfile;
    owner: PartnerOwner;
    /** `https` URL that receives the business's `orders.paid` notifications. */
    webhook_url?: string;
    /** The code Inkress emailed when the answer was `confirmation_sent`. */
    confirmation_code?: string;
}
export interface PartnerActivationResult {
    state: PartnerActivationState;
    link?: PartnerActivationLink;
    merchant?: PartnerMerchantSummary;
    vouch?: PartnerVouch;
    keys?: PartnerKeys;
    /** Masked address the confirmation code went to. */
    confirmation_sent_to?: string;
}
export interface PartnerStatusResult {
    merchant: PartnerMerchantSummary;
    /** Whether the email and phone are confirmed; null when that can't be checked right now. */
    contact: {
        email: boolean;
        phone: boolean;
    } | null;
}
export interface PartnerLinkResult {
    url: string;
    expires_at: string;
}
export interface PartnerVerifyLinkResult {
    verify_url: string;
    expires_at: string;
}
export interface PartnerDisconnectData {
    reference: string;
    /** The `orders.paid` URL you registered for this business, to remove it. */
    webhook_url?: string;
}
export interface PartnerDisconnectResult {
    state: 'disconnected';
    /** Null when nothing was linked under the reference. */
    merchant: PartnerMerchantSummary | null;
}
export interface PartnerConnectData {
    reference: string;
    /** The `inka_…` access token your app received for this Connect with Inkress request. */
    access_token: string;
    webhook_url?: string;
}
/** `code` values of a refused partner call. */
export type PartnerActivationErrorCode = 'not_a_partner' | 'invalid_request' | 'create_rejected' | 'reference_conflict' | 'reference_in_use' | 'ambiguous_email' | 'other_platform' | 'name_taken' | 'not_vouchable' | 'no_owner' | 'invalid_code' | 'unknown_destination' | 'not_found' | 'reference_required' | 'business_closed' | 'setting_up' | 'revoked_by_business' | 'issue_failed' | 'connect_not_found' | 'too_many_attempts' | 'too_many_codes' | 'rate_limited' | 'unavailable' | 'limits_misconfigured' | 'rate_limiter_unavailable' | 'risk_unavailable' | 'verify_base_missing' | 'dashboard_link_unavailable' | 'create_failed' | 'move_failed' | 'write_failed' | 'webhook_failed';
export declare class PartnerActivationResource {
    private client;
    constructor(client: HttpClient);
    /** Set up or link a business. Idempotent: repeat until `state` is `active`. */
    activate(data: PartnerActivateData): Promise<ApiResponse<PartnerActivationResult>>;
    /** The business linked under `reference`, and whether its contact details are confirmed. */
    status(reference: string): Promise<ApiResponse<PartnerStatusResult>>;
    /** A single-use, 60-second link that signs the business into Inkress's verification page. */
    verifyLink(reference: string): Promise<ApiResponse<PartnerVerifyLinkResult>>;
    /** A 60-second link that signs the owner into the dashboard's Payouts page. */
    dashboardLink(reference: string, to?: 'payouts'): Promise<ApiResponse<PartnerLinkResult>>;
    /**
     * Unlink the business under `reference` (INK-1512): your apps' access to it ends (each is sent
     * `app.disconnected`), your API key for it is turned off, and the `orders.paid` URL is removed.
     * The business keeps its own keys and verification. Nothing linked is still `disconnected`.
     */
    disconnect(data: PartnerDisconnectData): Promise<ApiResponse<PartnerDisconnectResult>>;
    /**
     * Link the business a person chose through Connect with Inkress (INK-1512). Finishes like
     * `activate`. `409 reference_in_use` while another business is linked: disconnect it first.
     */
    connect(data: PartnerConnectData): Promise<ApiResponse<PartnerActivationResult>>;
    /**
     * The keys of the business linked under `reference`, issuing `api_secret_key` for a business
     * activated before INK-1532. `409 revoked_by_business` once the owner removed you; they must
     * connect again.
     */
    keys(reference: string): Promise<ApiResponse<{
        keys: PartnerKeys;
    }>>;
}
//# sourceMappingURL=partner-activation.d.ts.map