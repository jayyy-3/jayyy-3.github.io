import { useState } from 'react';
import type { FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import StoneDialog from '../../features/stone-library/StoneDialog';
import { translateAdminSignInError } from '../../lib/adminErrors';
import { AdminFeedback } from './AdminFeedback';
import type { AdminFeedbackState } from './useAdminFeedback';

// Shown over a protected screen when the sign-in has ended. The screen and its unsaved form stay
// mounted underneath; signing in again here keeps them, and a save that was rejected because of
// the expired sign-in runs again automatically.

const inputClass =
    'mt-2 min-h-12 w-full rounded border border-black/15 px-3 text-base font-medium normal-case tracking-normal outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2';

export function AdminReLoginPanel({
    email,
    hasPendingSave,
    serverError,
    onSignIn,
    onClose,
}: {
    /** The account that was signed in; re-login is limited to it so the page keeps its owner. */
    email: string;
    /** A rejected save will run again after sign-in. */
    hasPendingSave: boolean;
    /** Raw access-check error from the auth provider after a sign-in attempt, if any. */
    serverError: string | null;
    onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
    onClose: () => void;
}) {
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
    const shownFeedback: AdminFeedbackState | null =
        feedback ??
        (serverError
            ? { id: 0, tone: 'error', scope: 'relogin', ...translateAdminSignInError(serverError) }
            : null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);
        const result = await onSignIn(email, password);
        setIsSubmitting(false);
        if (result.error) {
            const translated = translateAdminSignInError(result.error);
            setFeedback({ id: Date.now(), tone: 'error', scope: 'relogin', message: translated.message, detail: translated.detail });
            return;
        }
        setPassword('');
    }

    return (
        <StoneDialog
            label="Sign in again to keep working"
            onClose={onClose}
            locked={isSubmitting}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-5"
        >
            <form
                onSubmit={(event) => void handleSubmit(event)}
                className="w-full max-w-md border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)]"
                data-testid="admin-relogin-panel"
            >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Signed out</p>
                <h2 className="mt-2 text-2xl font-semibold text-black">Sign in again to keep working</h2>
                <p className="mt-3 text-sm leading-6 text-black/66">
                    Your sign-in has ended, so changes cannot be saved right now. Everything you typed is still on this
                    page.{' '}
                    {hasPendingSave
                        ? 'Sign in again and your save will finish automatically.'
                        : 'Sign in again, then save as usual.'}
                </p>
                <div className="mt-5 border border-black/10 bg-[#f8f9f5] px-3 py-2">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Signed in as</p>
                    <p className="mt-1 break-all text-sm font-semibold text-black" data-testid="admin-relogin-email">
                        {email}
                    </p>
                    {/* Lets password managers match the saved login; the account itself cannot change here. */}
                    <input type="email" name="username" value={email} readOnly hidden autoComplete="username" />
                </div>
                <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        autoComplete="current-password"
                        autoFocus
                        className={inputClass}
                    />
                </label>
                <AdminFeedback feedback={shownFeedback} scope="relogin" className="mt-4" />
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex min-h-11 items-center justify-center rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        Not now
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !password}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/35"
                    >
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                        {isSubmitting ? 'Checking access' : hasPendingSave ? 'Sign in and save' : 'Sign in'}
                    </button>
                </div>
                <p className="mt-4 text-xs leading-5 text-black/48">
                    Not now keeps this page open, but nothing can be saved until you sign in again.
                </p>
            </form>
        </StoneDialog>
    );
}

export function AdminSignedOutBanner({ onSignIn }: { onSignIn: () => void }) {
    return (
        <div
            role="status"
            className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-3 border-t border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800"
            data-testid="admin-signed-out-banner"
        >
            <span>You are signed out. Your changes are still on this page but cannot be saved yet.</span>
            <button
                type="button"
                onClick={onSignIn}
                className="inline-flex min-h-10 items-center rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#33363f]"
            >
                Sign in again
            </button>
        </div>
    );
}
