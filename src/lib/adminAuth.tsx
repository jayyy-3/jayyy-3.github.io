import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { AdminAuthContext } from './adminAuthState';
import type { AdminAuthContextValue, AdminAuthStatus, AdminProfile } from './adminAuthState';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AdminAuthStatus>(
        supabase ? 'loading' : 'config-missing',
    );
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadSession = useCallback(async () => {
        if (!supabase) {
            setStatus('config-missing');
            setUser(null);
            setProfile(null);
            setError(null);
            return;
        }

        setStatus('loading');
        setError(null);

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
            setStatus('error');
            setError(sessionError.message);
            setUser(null);
            setProfile(null);
            return;
        }

        if (!session) {
            setStatus('unauthenticated');
            setUser(null);
            setProfile(null);
            return;
        }

        const {
            data: { user: verifiedUser },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !verifiedUser) {
            setStatus('unauthenticated');
            setUser(null);
            setProfile(null);
            setError(userError?.message ?? null);
            return;
        }

        const { data: adminProfile, error: profileError } = await supabase
            .from('admin_profiles')
            .select('user_id,email,display_name,role,is_active')
            .eq('user_id', verifiedUser.id)
            .eq('is_active', true)
            .maybeSingle<AdminProfile>();

        setUser(verifiedUser);

        if (profileError) {
            setStatus('error');
            setProfile(null);
            setError(profileError.message);
            return;
        }

        if (!adminProfile) {
            setStatus('unauthorized');
            setProfile(null);
            return;
        }

        setProfile(adminProfile);
        setStatus('authenticated');
    }, []);

    useEffect(() => {
        void loadSession();

        if (!supabase) {
            return undefined;
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            void loadSession();
        });

        return () => subscription.unsubscribe();
    }, [loadSession]);

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

        await loadSession();
        return { error: null };
    }, [loadSession]);

    const signOut = useCallback(async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }

        setUser(null);
        setProfile(null);
        setStatus(supabase ? 'unauthenticated' : 'config-missing');
    }, []);

    const value = useMemo<AdminAuthContextValue>(
        () => ({
            status,
            user,
            profile,
            error,
            refresh: loadSession,
            signIn,
            signOut,
        }),
        [error, loadSession, profile, signIn, signOut, status, user],
    );

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
