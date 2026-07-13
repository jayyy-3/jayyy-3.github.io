import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface SupabaseAuthRedirectContext {
    errorDescription: string | null;
    hasAuthCredentials: boolean;
    type: string | null;
}

export type SupabaseAuthRedirectType = 'invite' | 'recovery';

export type SupabaseAuthRedirectVerification =
    | {
          status: 'verified';
          type: SupabaseAuthRedirectType;
          userId: string;
      }
    | {
          status: 'invalid';
          reason:
              | 'already-used'
              | 'auth-error'
              | 'config-missing'
              | 'credentials-missing'
              | 'session-invalid'
              | 'session-mismatch'
              | 'unsupported-type';
      };

type CapturedSupabaseAuthRedirect = SupabaseAuthRedirectContext & {
    accessToken: string | null;
    hasPkceCode: boolean;
    refreshToken: string | null;
};

type IsolatedAuthRedirectSession = {
    client: SupabaseClient;
    type: SupabaseAuthRedirectType;
    userId: string;
};

// Capture the callback before supabase-js consumes and clears its hash tokens.
// Account setup uses this to avoid changing an unrelated, already-signed-in
// user's password when an invite or recovery link is invalid or opened twice.
const capturedSupabaseAuthRedirect = readSupabaseAuthRedirectContext();
clearCapturedSupabaseAuthRedirectFromAddressBar(capturedSupabaseAuthRedirect);
let isolatedAuthRedirectSession: IsolatedAuthRedirectSession | null = null;
let authRedirectVerificationPromise: Promise<SupabaseAuthRedirectVerification> | null = null;
let authRedirectUseState: 'unused' | 'verified' | 'updating' | 'used' = 'unused';

export const supabaseAuthRedirectContext: SupabaseAuthRedirectContext = {
    errorDescription: capturedSupabaseAuthRedirect.errorDescription,
    hasAuthCredentials: capturedSupabaseAuthRedirect.hasAuthCredentials,
    type: capturedSupabaseAuthRedirect.type,
};

export const supabaseConfig = {
    url: supabaseUrl,
    hasBrowserKey: Boolean(supabaseAnonKey),
};

export const supabase = supabaseConfig.hasBrowserKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
              persistSession: true,
              autoRefreshToken: true,
              // Invite and recovery callbacks are verified and consumed only by
              // the isolated client below. Letting the shared client consume the
              // same fragment would replace an unrelated admin session merely
              // because that person opened a password email in this browser.
              detectSessionInUrl: false,
          },
      })
    : null;

function readSupabaseAuthRedirectContext(): CapturedSupabaseAuthRedirect {
    if (typeof window === 'undefined') {
        return {
            accessToken: null,
            errorDescription: null,
            hasAuthCredentials: false,
            hasPkceCode: false,
            refreshToken: null,
            type: null,
        };
    }

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const errorDescription =
        hash.get('error_description') ||
        url.searchParams.get('error_description') ||
        hash.get('error') ||
        url.searchParams.get('error');
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const hasImplicitCredentials = Boolean(accessToken && refreshToken);

    return {
        accessToken,
        errorDescription,
        hasAuthCredentials: !errorDescription && hasImplicitCredentials,
        hasPkceCode: Boolean(url.searchParams.get('code')),
        refreshToken,
        // A supported implicit callback carries its type in the fragment beside
        // the token pair. Query-string `mode`/`type` values are display hints,
        // not proof that Supabase issued an invite or recovery session.
        type: hash.get('type'),
    };
}

function clearCapturedSupabaseAuthRedirectFromAddressBar(
    redirect: CapturedSupabaseAuthRedirect,
) {
    if (
        typeof window === 'undefined' ||
        (!redirect.hasAuthCredentials && !redirect.hasPkceCode && !redirect.errorDescription)
    ) {
        return;
    }

    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.delete('error');
    url.searchParams.delete('error_code');
    url.searchParams.delete('error_description');
    url.searchParams.delete('code');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
}

function isSupportedAuthRedirectType(value: string | null): value is SupabaseAuthRedirectType {
    return value === 'invite' || value === 'recovery';
}

export async function verifySupabaseAuthRedirectSession(): Promise<SupabaseAuthRedirectVerification> {
    if (authRedirectUseState === 'used' || authRedirectUseState === 'updating') {
        return { status: 'invalid', reason: 'already-used' };
    }

    if (isolatedAuthRedirectSession && authRedirectUseState === 'verified') {
        return {
            status: 'verified',
            type: isolatedAuthRedirectSession.type,
            userId: isolatedAuthRedirectSession.userId,
        };
    }

    if (authRedirectVerificationPromise) {
        return authRedirectVerificationPromise;
    }

    authRedirectVerificationPromise = verifyCapturedSupabaseAuthRedirectSession();

    try {
        return await authRedirectVerificationPromise;
    } finally {
        authRedirectVerificationPromise = null;
    }
}

async function verifyCapturedSupabaseAuthRedirectSession(): Promise<SupabaseAuthRedirectVerification> {

    if (capturedSupabaseAuthRedirect.errorDescription) {
        return { status: 'invalid', reason: 'auth-error' };
    }

    if (!isSupportedAuthRedirectType(capturedSupabaseAuthRedirect.type)) {
        return { status: 'invalid', reason: 'unsupported-type' };
    }

    const { accessToken, refreshToken } = capturedSupabaseAuthRedirect;
    if (!capturedSupabaseAuthRedirect.hasAuthCredentials || !accessToken || !refreshToken) {
        return { status: 'invalid', reason: 'credentials-missing' };
    }

    if (!supabaseAnonKey) {
        return { status: 'invalid', reason: 'config-missing' };
    }

    // Keep password-link credentials out of the shared browser client. A unique,
    // non-persistent client cannot be replaced by a sign-in or token refresh in
    // another tab between verification and the password update.
    const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            flowType: 'implicit',
            persistSession: false,
            storageKey: 'urblo-isolated-auth-redirect',
        },
    });

    const {
        data: { session },
        error: sessionError,
    } = await isolatedClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (sessionError || !session) {
        return { status: 'invalid', reason: 'session-invalid' };
    }

    // Validate the isolated callback session with the Auth server before it can
    // be used for a security-sensitive password update.
    const {
        data: { user: verifiedCallbackUser },
        error: callbackUserError,
    } = await isolatedClient.auth.getUser();

    if (callbackUserError || !verifiedCallbackUser) {
        return { status: 'invalid', reason: 'session-invalid' };
    }

    if (verifiedCallbackUser.id !== session.user.id) {
        return { status: 'invalid', reason: 'session-mismatch' };
    }

    isolatedAuthRedirectSession = {
        client: isolatedClient,
        type: capturedSupabaseAuthRedirect.type,
        userId: verifiedCallbackUser.id,
    };
    authRedirectUseState = 'verified';

    return {
        status: 'verified',
        type: capturedSupabaseAuthRedirect.type,
        userId: verifiedCallbackUser.id,
    };
}

export async function updatePasswordFromSupabaseAuthRedirect(
    password: string,
): Promise<{ error: string | null }> {
    const verification = await verifySupabaseAuthRedirectSession();
    if (
        verification.status !== 'verified' ||
        authRedirectUseState !== 'verified' ||
        !isolatedAuthRedirectSession ||
        isolatedAuthRedirectSession.userId !== verification.userId
    ) {
        return {
            error: 'This invite or password link is no longer connected to the current secure session. Open the latest email link and try again.',
        };
    }

    authRedirectUseState = 'updating';
    const redirectSession = isolatedAuthRedirectSession;

    try {
        const { data, error } = await redirectSession.client.auth.updateUser({ password });
        if (error) {
            authRedirectUseState = 'verified';
            return { error: error.message };
        }

        if (!data.user || data.user.id !== redirectSession.userId) {
            authRedirectUseState = 'used';
            isolatedAuthRedirectSession = null;
            return {
                error: 'The password response did not match the secure-link account. Request a new password link before trying again.',
            };
        }

        authRedirectUseState = 'used';
        isolatedAuthRedirectSession = null;
        return { error: null };
    } catch (error) {
        authRedirectUseState = 'verified';
        return {
            error: error instanceof Error ? error.message : 'The password could not be updated. Try the secure link again.',
        };
    }
}
