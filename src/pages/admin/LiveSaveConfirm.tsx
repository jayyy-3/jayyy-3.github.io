import { useCallback, useEffect, useRef, useState } from 'react';
import StoneDialog from '../../features/stone-library/StoneDialog';
import type { LiveSaveConfirmRequest } from './liveSave';

interface PendingLiveSave extends LiveSaveConfirmRequest {
    resolve: (confirmed: boolean) => void;
}

// Older admin modules (Products, Articles, Media) write straight to live rows. Until they move
// to the draft model, Save on a record that is already live must say what changes on the public
// website and wait for an explicit confirmation. Brand-new drafts never reach this dialog.
export function useLiveSaveConfirm() {
    const [pending, setPending] = useState<PendingLiveSave | null>(null);
    const pendingRef = useRef<PendingLiveSave | null>(null);

    const confirmLiveSave = useCallback(
        (request: LiveSaveConfirmRequest) =>
            new Promise<boolean>((resolve) => {
                pendingRef.current?.resolve(false);
                const next = { ...request, resolve };
                pendingRef.current = next;
                setPending(next);
            }),
        [],
    );

    const settle = useCallback((confirmed: boolean) => {
        const current = pendingRef.current;
        pendingRef.current = null;
        setPending(null);
        current?.resolve(confirmed);
    }, []);

    useEffect(() => () => pendingRef.current?.resolve(false), []);

    const liveSaveDialog = pending ? (
        <StoneDialog
            label={pending.title}
            onClose={() => settle(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-5"
        >
            <section className="w-full max-w-lg border border-black/10 bg-white p-6" data-testid="live-save-confirm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Live on website</p>
                <h2 className="mt-2 text-2xl font-semibold text-black">{pending.title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/66">{pending.detail}</p>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => settle(false)}
                        className="inline-flex min-h-11 items-center justify-center rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black"
                    >
                        Keep editing
                    </button>
                    <button
                        type="button"
                        onClick={() => settle(true)}
                        className="inline-flex min-h-11 items-center justify-center rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f]"
                    >
                        {pending.confirmLabel}
                    </button>
                </div>
            </section>
        </StoneDialog>
    ) : null;

    return { confirmLiveSave, liveSaveDialog };
}
