import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import type { AdminFeedbackState, AdminFeedbackTone } from './useAdminFeedback';

// One save/load result per screen, shown next to the action that produced it. Success clears
// itself after a few seconds; errors stay until the next action or until dismissed, show a
// plain-English sentence, and keep the original technical text behind "Details".

const toneStyles: Record<AdminFeedbackTone, string> = {
    success: 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] text-black',
    info: 'border-black/15 bg-[#f8f9f5] text-black',
    error: 'border-red-200 bg-red-50 text-red-800',
};

export function AdminFeedback({
    feedback,
    scope,
    onDismiss,
    className = '',
    announce = true,
}: {
    feedback: AdminFeedbackState | null;
    scope: string | string[];
    onDismiss?: () => void;
    className?: string;
    /** False for a second copy of the same message (e.g. a repeated Save button) so it is announced once. */
    announce?: boolean;
}) {
    const scopes = Array.isArray(scope) ? scope : [scope];
    const visible = feedback && scopes.includes(feedback.scope) ? feedback : null;
    const Icon = visible?.tone === 'error' ? TriangleAlert : visible?.tone === 'info' ? Info : CheckCircle2;
    const body = visible ? (
        <div
            className={`flex items-start gap-3 border p-3 text-sm font-semibold leading-6 ${toneStyles[visible.tone]}`}
            data-feedback-tone={visible.tone}
        >
            <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p>{visible.message}</p>
                {visible.detail ? (
                    <details className="mt-2 text-xs font-medium text-black/60">
                        <summary className="cursor-pointer font-bold uppercase tracking-[0.12em]">Details</summary>
                        <p className="mt-2 whitespace-pre-wrap break-words font-mono">{visible.detail}</p>
                    </details>
                ) : null}
            </div>
            {onDismiss && visible.tone !== 'success' ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss message"
                    className="shrink-0 rounded p-1 text-black/50 transition hover:bg-black/5 hover:text-black"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            ) : null}
        </div>
    ) : null;

    if (!announce) {
        return (
            <div className={visible ? className : ''} data-admin-feedback={scopes.join(' ')}>
                {body}
            </div>
        );
    }

    // Both live regions stay mounted so screen readers announce a message as soon as it appears.
    return (
        <div className={visible ? className : ''} data-admin-feedback={scopes.join(' ')}>
            <div role="status" aria-live="polite" aria-atomic="true">
                {visible && visible.tone !== 'error' ? body : null}
            </div>
            <div role="alert" aria-atomic="true">
                {visible?.tone === 'error' ? body : null}
            </div>
        </div>
    );
}
