import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, LogIn, Mail } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState } from './AdminState';

export default function AdminLoginPage() {
    const auth = useAdminAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in');
    const [formError, setFormError] = useState<string | null>(null);
    const [formNotice, setFormNotice] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextPath = useMemo(() => {
        return resolveAdminNextPath(searchParams.get('next'), location.pathname);
    }, [location.pathname, searchParams]);

    if (auth.status === 'loading') {
        return <AdminLoadingState />;
    }

    if (auth.status === 'config-missing') {
        return <AdminConfigMissingState />;
    }

    if (auth.status === 'error') {
        return <AdminErrorState />;
    }

    if (auth.status === 'authenticated') {
        return <Navigate to={nextPath} replace />;
    }

    if (auth.status === 'unauthorized') {
        return <Navigate to="/admin/unauthorized" replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setFormNotice(null);
        setIsSubmitting(true);

        if (mode === 'reset') {
            const result = await auth.requestPasswordReset(email.trim());
            setIsSubmitting(false);

            if (result.error) {
                setFormError(result.error);
                return;
            }

            setFormNotice(
                'If this email has a login, a secure password link is on its way. You can close this page after checking your inbox.',
            );
            return;
        }

        const result = await auth.signIn(email.trim(), password);
        setIsSubmitting(false);

        if (result.error) {
            setFormError(result.error);
        }
    }

    return (
        <main className="min-h-screen bg-[#f1f1ed] px-5 py-8 text-black">
            <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
                <div className="w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-[0.18em]">Urblo</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Admin</p>
                    </div>

                    <form
                        onSubmit={(event) => void handleSubmit(event)}
                        className="border border-black/12 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.1)] md:p-8"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded bg-black text-[var(--urblo-lime)]">
                            {mode === 'sign-in' ? <LogIn className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                        </div>
                        <h1 className="mt-7 text-3xl font-semibold tracking-[-0.03em]">
                            {mode === 'sign-in' ? 'Sign in to Urblo' : 'Reset your password'}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-black/58">
                            {mode === 'sign-in'
                                ? 'Sign in with an approved Urblo CMS login. Access also depends on the CMS role assigned in Settings.'
                                : 'Enter your login email and we will send a secure link to choose a new password.'}
                        </p>

                        <label className="mt-7 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoComplete="email"
                                autoFocus
                                className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2"
                            />
                        </label>

                        {mode === 'sign-in' ? (
                            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2"
                                />
                            </label>
                        ) : null}

                        {formError ? (
                            <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {formError}
                            </p>
                        ) : null}

                        {formNotice ? (
                            <p role="status" aria-live="polite" className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold leading-6 text-emerald-800">
                                {formNotice}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--urblo-lime)] disabled:cursor-not-allowed disabled:bg-black/35"
                        >
                            {mode === 'sign-in' ? <LogIn className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                            {isSubmitting
                                ? mode === 'sign-in'
                                    ? 'Checking access'
                                    : 'Sending link'
                                : mode === 'sign-in'
                                  ? 'Sign in'
                                  : 'Send reset link'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'sign-in' ? 'reset' : 'sign-in');
                                setFormError(null);
                                setFormNotice(null);
                            }}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded text-sm font-semibold text-black/62 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--urblo-lime)]"
                        >
                            {mode === 'sign-in' ? <KeyRound className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                            {mode === 'sign-in' ? 'Forgot password?' : 'Back to sign in'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs leading-5 text-black/48">
                        Need access? Ask a Website owner or CMS manager to invite you.
                    </p>
                </div>
            </section>
        </main>
    );
}

function resolveAdminNextPath(next: string | null, currentPath: string) {
    if (!next) {
        return '/admin';
    }

    const isAdminPath =
        next === '/admin' || next.startsWith('/admin/') || next.startsWith('/admin?');
    const isBlockedAdminPath =
        next === currentPath ||
        next.startsWith('/admin/login') ||
        next.startsWith('/admin/unauthorized');

    return isAdminPath && !isBlockedAdminPath ? next : '/admin';
}
