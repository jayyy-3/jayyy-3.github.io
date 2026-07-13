import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { AdminAuthContext } from './adminAuthState';
import type { AdminAuthContextValue, AdminAuthStatus, AdminProfile } from './adminAuthState';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const initialStatus: AdminAuthStatus = supabase ? 'loading' : 'config-missing';
    const [status, setStatus] = useState<AdminAuthStatus>(initialStatus);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const authLoadVersionRef = useRef(0);
    const currentStatusRef = useRef<AdminAuthStatus>(initialStatus);
    const currentUserIdRef = useRef<string | null>(null);

    const clearSession = useCallback(
        (nextStatus: Extract<AdminAuthStatus, 'config-missing' | 'unauthenticated'>, nextError: string | null = null) => {
            authLoadVersionRef.current += 1;
            currentStatusRef.current = nextStatus;
            currentUserIdRef.current = null;
            setStatus(nextStatus);
            setUser(null);
            setProfile(null);
            setError(nextError);
        },
        [],
    );

    const loadSession = useCallback(async ({ blocking }: { blocking: boolean }) => {
        if (!supabase) {
            clearSession('config-missing');
            return;
        }

        const loadVersion = authLoadVersionRef.current + 1;
        authLoadVersionRef.current = loadVersion;
        const previousStatus = currentStatusRef.current;
        const previousUserId = currentUserIdRef.current;
        const canPreserveNonBlockingState =
            !blocking && (previousStatus === 'authenticated' || previousStatus === 'unauthorized');

        if (blocking) {
            currentStatusRef.current = 'loading';
            setStatus('loading');
        }
        setError(null);

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (loadVersion !== authLoadVersionRef.current) {
            return;
        }

        if (sessionError) {
            if (canPreserveNonBlockingState) {
                setError(sessionError.message);
                return;
            }

            currentStatusRef.current = 'error';
            currentUserIdRef.current = null;
            setStatus('error');
            setError(sessionError.message);
            setUser(null);
            setProfile(null);
            return;
        }

        if (!session) {
            clearSession('unauthenticated');
            return;
        }

        const {
            data: { user: verifiedUser },
            error: userError,
        } = await supabase.auth.getUser();

        if (loadVersion !== authLoadVersionRef.current) {
            return;
        }

        if (userError || !verifiedUser) {
            const canPreserveCurrentEditor =
                canPreserveNonBlockingState &&
                previousUserId === session.user.id;
            if (canPreserveCurrentEditor) {
                setError(userError?.message ?? 'The current login could not be revalidated.');
                return;
            }

            clearSession('unauthenticated', userError?.message ?? null);
            return;
        }

        if (verifiedUser.id !== session.user.id) {
            clearSession('unauthenticated', 'The active login changed while the admin session was being verified.');
            return;
        }

        const { data: adminProfile, error: profileError } = await supabase
            .from('admin_profiles')
            .select('user_id,email,display_name,role,is_active')
            .eq('user_id', verifiedUser.id)
            .eq('is_active', true)
            .maybeSingle<AdminProfile>();

        if (loadVersion !== authLoadVersionRef.current) {
            return;
        }

        if (profileError) {
            const canPreserveCurrentEditor =
                canPreserveNonBlockingState &&
                previousUserId === verifiedUser.id;
            if (canPreserveCurrentEditor) {
                setError(profileError.message);
                return;
            }

            currentStatusRef.current = 'error';
            currentUserIdRef.current = verifiedUser.id;
            setStatus('error');
            setUser(verifiedUser);
            setProfile(null);
            setError(profileError.message);
            return;
        }

        currentUserIdRef.current = verifiedUser.id;
        setUser(verifiedUser);

        if (!adminProfile) {
            currentStatusRef.current = 'unauthorized';
            setStatus('unauthorized');
            setProfile(null);
            return;
        }

        currentStatusRef.current = 'authenticated';
        setProfile(adminProfile);
        setStatus('authenticated');
    }, [clearSession]);

    const refreshSession = useCallback(() => loadSession({ blocking: false }), [loadSession]);

    useEffect(() => {
        void loadSession({ blocking: true });

        if (!supabase) {
            return undefined;
        }

        let refreshTimer: number | undefined;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            window.clearTimeout(refreshTimer);

            if (!nextSession) {
                clearSession('unauthenticated');
                return;
            }

            const isSameUserSteadyStateEvent =
                currentUserIdRef.current === nextSession.user.id &&
                currentStatusRef.current !== 'loading' &&
                currentStatusRef.current !== 'config-missing';

            // Supabase warns against awaiting another Auth or database call inside
            // this callback because the client lock has not been released yet.
            // Schedule the profile refresh for the next task instead.
            refreshTimer = window.setTimeout(() => {
                void loadSession({ blocking: !isSameUserSteadyStateEvent });
            }, 0);
        });

        return () => {
            window.clearTimeout(refreshTimer);
            subscription.unsubscribe();
        };
    }, [clearSession, loadSession]);

    const signIn = useCallback(async (email: string, password: string) => {
        if (!supabase) {
            return {
                error:
                    'Supabase browser configuration is missing. Set VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.',
            };
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return { error: signInError.message };
        }

        await loadSession({ blocking: true });
        return { error: null };
    }, [loadSession]);

    const requestPasswordReset = useCallback(async (email: string) => {
        if (!supabase) {
            return {
                error:
                    'Supabase browser configuration is missing. Set VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.',
            };
        }

        const redirectTo = new URL('/admin/account-setup?mode=recovery', window.location.origin).toString();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        return { error: resetError?.message ?? null };
    }, []);

    const signOut = useCallback(async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut({ scope: 'local' });
            }
        } finally {
            clearSession(supabase ? 'unauthenticated' : 'config-missing');
        }
    }, [clearSession]);

    const value = useMemo<AdminAuthContextValue>(
        () => ({
            status,
            user,
            profile,
            error,
            refresh: refreshSession,
            signIn,
            requestPasswordReset,
            signOut,
        }),
        [error, profile, refreshSession, requestPasswordReset, signIn, signOut, status, user],
    );

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
