import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState } from './AdminState';

export default function AdminLoginPage() {
    const auth = useAdminAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
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
        setIsSubmitting(true);

        const result = await auth.signIn(email.trim(), password);
        setIsSubmitting(false);

        if (result.error) {
            setFormError(result.error);
        }
    }

    return (
        <main className="min-h-screen bg-black px-5 py-8 text-white">
            <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1120px] items-center">
                <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                            Urblo Admin
                        </p>
                        <h1 className="mt-5 max-w-[680px] text-[48px] font-light leading-[0.98] text-white md:text-[76px]">
                            Protected operating console
                        </h1>
                        <p className="mt-6 max-w-[520px] text-lg font-medium leading-8 text-white/68">
                            Sign in with a Supabase Auth account that has an active row in
                            `admin_profiles`. Private content is not loaded until that profile gate passes.
                        </p>
                    </div>

                    <form
                        onSubmit={(event) => void handleSubmit(event)}
                        className="border border-white/15 bg-white p-5 text-black shadow-[0_28px_80px_rgba(0,0,0,0.35)] md:p-8"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded bg-black text-[var(--urblo-lime)]">
                            <LogIn className="h-5 w-5" />
                        </div>
                        <h2 className="mt-7 text-2xl font-semibold">Admin login</h2>
                        <p className="mt-2 text-sm leading-6 text-black/58">
                            Email/password authentication is handled by Supabase Auth. Access still requires
                            an active admin profile.
                        </p>

                        <label className="mt-7 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoComplete="email"
                                className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black"
                            />
                        </label>

                        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Password
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                autoComplete="current-password"
                                className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black"
                            />
                        </label>

                        {formError ? (
                            <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {formError}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/35"
                        >
                            <LogIn className="h-4 w-4" />
                            {isSubmitting ? 'Checking access' : 'Sign in'}
                        </button>
                    </form>
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
