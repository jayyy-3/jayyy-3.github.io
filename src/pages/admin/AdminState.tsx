import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';

interface AdminStateProps {
    eyebrow: string;
    title: string;
    copy: string;
    variant?: 'default' | 'warning';
    action?: ReactNode;
}

export function AdminState({ eyebrow, title, copy, variant = 'default', action }: AdminStateProps) {
    const Icon = variant === 'warning' ? ShieldAlert : AlertCircle;

    return (
        <main className="flex min-h-screen items-center bg-[#f5f6f2] px-5 py-10 text-[var(--urblo-text)]">
            <section className="mx-auto w-full max-w-[760px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)] md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded bg-black text-[var(--urblo-lime)]">
                    <Icon className="h-5 w-5" />
                </div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {eyebrow}
                </p>
                <h1 className="mt-3 text-[34px] font-light leading-tight text-black md:text-[52px]">
                    {title}
                </h1>
                <p className="mt-5 max-w-[38rem] text-lg font-medium leading-8 text-[#33363f]">{copy}</p>
                {action ? <div className="mt-8 flex flex-wrap gap-3">{action}</div> : null}
            </section>
        </main>
    );
}

export function AdminLoadingState() {
    return (
        <AdminState
            eyebrow="Checking session"
            title="Preparing admin access"
            copy="Your login and CMS access are being checked before any private content is shown."
        />
    );
}

export function AdminConfigMissingState() {
    return (
        <AdminState
            eyebrow="Configuration required"
            title="CMS access is not connected yet"
            copy="The private editor is protected. A CMS manager needs to finish the login connection before editors can sign in."
            variant="warning"
            action={
                <Link to="/" className="urblo-button-inverse">
                    Return to site
                </Link>
            }
        />
    );
}

export function AdminErrorState() {
    const { error, refresh } = useAdminAuth();

    return (
        <AdminState
            eyebrow="Access check failed"
            title="Admin access could not be verified"
            copy={error ?? 'The CMS returned an unexpected error while checking this account.'}
            variant="warning"
            action={
                <button
                    type="button"
                    onClick={() => void refresh()}
                    className="urblo-button-inverse"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </button>
            }
        />
    );
}
