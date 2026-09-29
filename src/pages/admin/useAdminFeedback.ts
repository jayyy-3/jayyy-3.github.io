import { useCallback, useEffect, useRef, useState } from 'react';
import { splitAuditNotice, translateAdminError, type AdminErrorContext } from '../../lib/adminErrors';
import { useAdminSessionRecovery } from './adminSessionRecovery';

// State for AdminFeedback: one save/load result per screen. Success clears itself after a few
// seconds; errors stay until the next action or until dismissed. Raw Supabase/network errors go
// through reportError(), which translates them and keeps the original text for "Details".

export type AdminFeedbackTone = 'success' | 'error' | 'info';

export interface AdminFeedbackState {
    id: number;
    tone: AdminFeedbackTone;
    message: string;
    detail: string | null;
    /** Which action bar shows the message, e.g. "product", "model", "page". */
    scope: string;
}

export interface AdminFeedbackOptions {
    scope?: string;
    detail?: string | null;
}

const successFeedbackMs = 6000;

export function useAdminFeedback(defaultScope = 'page') {
    const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null);
    const nextId = useRef(0);

    const show = useCallback(
        (tone: AdminFeedbackTone, message: string, options: AdminFeedbackOptions = {}) => {
            nextId.current += 1;
            setFeedback({
                id: nextId.current,
                tone,
                message,
                detail: options.detail ?? null,
                scope: options.scope ?? defaultScope,
            });
        },
        [defaultScope],
    );

    /** Plain-English error written by the screen itself (validation, guidance). Null clears an error. */
    const setError = useCallback(
        (message: string | null, options?: AdminFeedbackOptions) => {
            if (message === null) setFeedback((current) => (current?.tone === 'error' ? null : current));
            else show('error', message, options);
        },
        [show],
    );

    /**
     * Success message; null clears a success or info message. A save whose change-history entry
     * failed (withAuditNotice) becomes a lasting plain-English note with the raw error in Details.
     */
    const setNotice = useCallback(
        (message: string | null, options?: AdminFeedbackOptions) => {
            if (message === null) {
                setFeedback((current) => (current && current.tone !== 'error' ? null : current));
                return;
            }
            const audit = splitAuditNotice(message);
            if (audit.detail) show('info', audit.message, { ...options, detail: audit.detail });
            else show('success', message, options);
        },
        [show],
    );

    const setInfo = useCallback(
        (message: string, options?: AdminFeedbackOptions) => show('info', message, options),
        [show],
    );

    // Read through a ref so reportError keeps its identity: screens list it in their data-loading
    // callbacks, and a new identity when the session ends would reload them under the open form.
    const recovery = useAdminSessionRecovery();
    const recoveryRef = useRef(recovery);
    useEffect(() => {
        recoveryRef.current = recovery;
    }, [recovery]);

    /**
     * Error returned by Supabase, Storage, Auth or the network. Always translated; the raw text
     * only reaches the Details disclosure. Pass the whole response when available so the HTTP
     * status is kept. An expired sign-in (or any failure while the browser is signed out) opens
     * the in-place re-login panel; `retry` runs once after the same account signs in again.
     */
    const reportError = useCallback(
        (
            error: unknown,
            options: AdminErrorContext & { scope?: string; message?: string; detail?: string | null; retry?: () => unknown } = {},
        ) => {
            const translated = translateAdminError(error, options);
            const currentRecovery = recoveryRef.current;
            const sessionEnded = translated.kind === 'session' || Boolean(currentRecovery?.sessionLost);
            const detail = [options.detail, translated.detail].filter(Boolean).join('\n');
            const message = sessionEnded
                ? translateAdminError({ code: 'PGRST301' }, options).message
                : options.message ?? translated.message;
            show('error', message, { scope: options.scope, detail: detail || null });
            if (sessionEnded) currentRecovery?.requestReLogin(options.retry ?? null);
        },
        [show],
    );

    const clearFeedback = useCallback(() => setFeedback(null), []);

    useEffect(() => {
        if (feedback?.tone !== 'success') return;
        const id = feedback.id;
        const timer = window.setTimeout(
            () => setFeedback((current) => (current?.id === id ? null : current)),
            successFeedbackMs,
        );
        return () => window.clearTimeout(timer);
    }, [feedback]);

    return { feedback, setError, setNotice, setInfo, reportError, clearFeedback };
}
