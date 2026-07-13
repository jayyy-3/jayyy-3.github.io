import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, KeyRound, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import {
    supabaseAuthRedirectContext,
    updatePasswordFromSupabaseAuthRedirect,
    verifySupabaseAuthRedirectSession,
} from '../../lib/supabaseClient';
import type { SupabaseAuthRedirectVerification } from '../../lib/supabaseClient';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState } from './AdminState';

const minimumPasswordLength = 12;
type RedirectVerificationState = SupabaseAuthRedirectVerification | { status: 'checking' };

export default function AdminAccountSetupPage() {
    const auth = useAdminAuth();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [redirectVerification, setRedirectVerification] = useState<RedirectVerificationState>({
        status: 'checking',
    });

    useEffect(() => {
        if (auth.status === 'loading' || auth.status === 'config-missing' || isComplete) {
            return undefined;
        }

        let isCurrent = true;
        setRedirectVerification({ status: 'checking' });
        void verifySupabaseAuthRedirectSession().then((verification) => {
            if (isCurrent) {
                setRedirectVerification(verification);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [auth.status, auth.user?.id, isComplete]);

    if (auth.status === 'loading') {
        return <AdminLoadingState />;
    }

    if (auth.status === 'config-missing') {
        return <AdminConfigMissingState />;
    }

    if (auth.status === 'error' && !auth.user) {
        return <AdminErrorState />;
    }

    if (isComplete) {
        return (
            <AdminAccountCard icon={<Check className="h-5 w-5" />} title="Your password is ready">
                <p className="text-sm leading-6 text-black/62">
                    Your password was saved for the account from the secure email. Sign in with that email and your new password to continue.
                </p>
                <Link
                    to="/admin/login"
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--urblo-lime)]"
                >
                    Sign in to Urblo Admin
                </Link>
            </AdminAccountCard>
        );
    }

    if (redirectVerification.status === 'checking') {
        return <AdminLoadingState />;
    }

    if (redirectVerification.status === 'invalid') {
        return (
            <AdminAccountCard icon={<KeyRound className="h-5 w-5" />} title="This secure link cannot be used">
                <p className="text-sm leading-6 text-black/62">
                    {supabaseAuthRedirectContext.errorDescription
                        ? 'Supabase rejected this invite or password link. It may have expired or already been used.'
                        : 'Open the latest invite or password email on this device. For safety, this page cannot change the password for an unrelated signed-in account.'}
                </p>
                {supabaseAuthRedirectContext.errorDescription ? (
                    <p className="mt-3 rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs leading-5 text-black/55">
                        {supabaseAuthRedirectContext.errorDescription}
                    </p>
                ) : null}
                <Link
                    to="/admin/login"
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--urblo-lime)]"
                >
                    <LogIn className="h-4 w-4" />
                    Return to sign in
                </Link>
            </AdminAccountCard>
        );
    }

    const isRecovery = redirectVerification.type === 'recovery';

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (password.length < minimumPasswordLength) {
            setFormError(`Use at least ${minimumPasswordLength} characters.`);
            return;
        }

        if (password !== passwordConfirmation) {
            setFormError('The passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        const { error } = await updatePasswordFromSupabaseAuthRedirect(password);
        setIsSubmitting(false);

        if (error) {
            setFormError(error);
            return;
        }

        setIsComplete(true);
    }

    return (
        <AdminAccountCard
            icon={<KeyRound className="h-5 w-5" />}
            title={isRecovery ? 'Choose a new password' : 'Finish setting up your login'}
        >
            <p className="text-sm leading-6 text-black/62">
                {isRecovery
                    ? 'Set a new password for your Urblo admin login.'
                    : 'Create the password you will use when you return to Urblo Admin.'}
            </p>

            <form onSubmit={(event) => void handleSubmit(event)} className="mt-7">
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                    New password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={minimumPasswordLength}
                        autoComplete="new-password"
                        autoFocus
                        className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2"
                    />
                </label>
                <p className="mt-2 text-xs leading-5 text-black/50">
                    Use at least {minimumPasswordLength} characters. A longer passphrase is easiest to remember.
                </p>

                <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                    Confirm password
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                        required
                        minLength={minimumPasswordLength}
                        autoComplete="new-password"
                        className="mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2"
                    />
                </label>

                {formError ? (
                    <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        {formError}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--urblo-lime)] disabled:cursor-not-allowed disabled:bg-black/35"
                >
                    <KeyRound className="h-4 w-4" />
                    {isSubmitting ? 'Saving password' : 'Save password'}
                </button>
            </form>
        </AdminAccountCard>
    );
}

function AdminAccountCard({
    children,
    icon,
    title,
}: {
    children: React.ReactNode;
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <main className="min-h-screen bg-[#f1f1ed] px-5 py-8 text-black">
            <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
                <div className="w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-[0.18em]">Urblo</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Admin</p>
                    </div>
                    <div className="border border-black/12 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.1)] md:p-8">
                        <div className="flex h-11 w-11 items-center justify-center rounded bg-black text-[var(--urblo-lime)]">
                            {icon}
                        </div>
                        <h1 className="mt-7 text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
                        <div className="mt-3">{children}</div>
                    </div>
                </div>
            </section>
        </main>
    );
}
