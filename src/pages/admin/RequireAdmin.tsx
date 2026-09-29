import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { AdminAuthContext } from '../../lib/adminAuthState';
import type { AdminAuthContextValue, AdminProfile } from '../../lib/adminAuthState';
import type { User } from '@supabase/supabase-js';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState } from './AdminState';
import { AdminReLoginPanel, AdminSignedOutBanner } from './AdminReLoginPanel';
import { AdminSessionRecoveryContext, type AdminSessionRecovery } from './adminSessionRecovery';
import { resolveKeptSession, shouldKeepScreen, type KeptSession } from './sessionKeepAlive';

interface ReLoginState {
    open: boolean;
    /** Save rejected by the expired sign-in; runs once after the same account signs in again. */
    retry: (() => unknown) | null;
    /** The panel's own sign-in finished (needed when the status never left "authenticated"). */
    signedIn: boolean;
    /** Opened because the browser lost its session; a sign-in in another tab also resolves it. */
    lostSession: boolean;
}

export default function RequireAdmin({ children }: { children: ReactNode }) {
    const auth = useAdminAuth();
    const location = useLocation();
    const next = `${location.pathname}${location.search}`;
    const [kept, setKept] = useState<KeptSession<User, AdminProfile> | null>(null);
    const [reLogin, setReLogin] = useState<ReLoginState | null>(null);
    const intentionalSignOut = useRef(false);

    // Remember the last verified account so the screen can stay mounted if the sign-in ends.
    if (auth.status === 'authenticated' && auth.user && auth.profile) {
        const nextKept = resolveKeptSession(kept, auth.user, auth.profile);
        if (nextKept !== kept) setKept(nextKept);
    }

    const keepScreen = shouldKeepScreen(auth.status, Boolean(kept), intentionalSignOut.current);
    const sessionLost = keepScreen && auth.status !== 'loading' && auth.status !== 'authenticated';

    const signOut = auth.signOut;
    const provided = useMemo<AdminAuthContextValue | null>(
        () =>
            kept
                ? {
                      ...auth,
                      // While signed out the screen keeps the last verified account, so role-based
                      // controls and data effects do not reset under the unsaved form.
                      status: 'authenticated',
                      user: kept.user,
                      profile: kept.profile,
                      error: auth.status === 'authenticated' ? auth.error : null,
                      signOut: async () => {
                          intentionalSignOut.current = true;
                          await signOut();
                      },
                  }
                : null,
        [auth, kept, signOut],
    );

    const requestReLogin = useCallback<AdminSessionRecovery['requestReLogin']>((retry) => {
        setReLogin((current) => ({ open: true, retry: retry ?? null, signedIn: false, lostSession: current?.lostSession ?? false }));
    }, []);
    const recovery = useMemo<AdminSessionRecovery>(() => ({ requestReLogin, sessionLost }), [requestReLogin, sessionLost]);

    // The sign-in ended underneath the screen (expiry, revoked refresh token, signed out in another tab).
    useEffect(() => {
        if (sessionLost) {
            setReLogin((current) =>
                current?.lostSession ? current : { open: true, retry: current?.retry ?? null, signedIn: false, lostSession: true },
            );
        }
    }, [sessionLost]);

    // Signed in again as the same account: close the panel and finish the rejected save.
    const keptUserId = kept?.user.id ?? null;
    useEffect(() => {
        if (!reLogin || auth.status !== 'authenticated' || !auth.user) return;
        // Stay open only for a save the server rejected while this browser still holds a session.
        if (reLogin.open && !reLogin.signedIn && !reLogin.lostSession) return;
        // Only the panel's own sign-in finishes the pending save; a sign-in elsewhere just closes it.
        const retry = reLogin.signedIn && auth.user.id === keptUserId ? reLogin.retry : null;
        setReLogin(null);
        if (retry) void retry();
    }, [auth.status, auth.user, keptUserId, reLogin]);

    const signInAgain = useCallback(
        async (email: string, password: string) => {
            const result = await auth.signIn(email, password);
            if (!result.error) setReLogin((current) => (current ? { ...current, signedIn: true } : current));
            return result;
        },
        [auth],
    );

    if (keepScreen && kept && provided) {
        return (
            <AdminAuthContext.Provider value={provided}>
                <AdminSessionRecoveryContext.Provider value={recovery}>
                    {/* A different account remounts the screen so it never saves under the wrong login. */}
                    <Fragment key={kept.user.id}>{children}</Fragment>
                    {reLogin?.open ? (
                        <AdminReLoginPanel
                            email={kept.profile.email || kept.user.email || ''}
                            hasPendingSave={Boolean(reLogin.retry)}
                            serverError={auth.status === 'error' ? auth.error : null}
                            onSignIn={signInAgain}
                            onClose={() => setReLogin((current) => (current ? { ...current, open: false } : current))}
                        />
                    ) : sessionLost ? (
                        <AdminSignedOutBanner onSignIn={() => requestReLogin(reLogin?.retry ?? null)} />
                    ) : null}
                </AdminSessionRecoveryContext.Provider>
            </AdminAuthContext.Provider>
        );
    }

    if (auth.status === 'loading') {
        return <AdminLoadingState />;
    }

    if (auth.status === 'config-missing') {
        return <AdminConfigMissingState />;
    }

    if (auth.status === 'error') {
        return <AdminErrorState />;
    }

    if (auth.status === 'unauthenticated') {
        return <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />;
    }

    if (auth.status === 'unauthorized') {
        return <Navigate to="/admin/unauthorized" replace />;
    }

    return children;
}
