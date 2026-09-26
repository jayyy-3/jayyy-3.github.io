import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoneDialog from '../../features/stone-library/StoneDialog';
import { classifyGuardedClick, describeUnsavedPrompt, type UnsavedSection } from './unsavedGuard';

interface PendingLeave {
    sections: UnsavedSection[];
    action: () => void;
    actionLabel: string;
}

interface ConfirmLeaveOptions {
    /** Finishes the sentence "Save them before you …", e.g. "switch products". */
    actionLabel?: string;
    /** Only these section keys matter for this action (e.g. switching models ignores Specs). */
    keys?: string[];
}

// Shared unsaved-changes guard for the older admin editors (Products, Articles, Media, Leads,
// Settings). Record switches call confirmLeave(); in-app links, Sign out, Refresh, browser Back
// and page refresh/close are intercepted while any section is dirty. Same dialog pattern as the
// Stone Library workspace (StoneDialog), with Save / Discard / Keep editing.
export function useUnsavedGuard({
    sections,
    isBusy = false,
    onBlockedWhileBusy,
}: {
    /** Sections that currently have unsaved changes. */
    sections: UnsavedSection[];
    /** A save is running; leaving now could lose its result. */
    isBusy?: boolean;
    onBlockedWhileBusy?: () => void;
}) {
    const navigate = useNavigate();
    const [pending, setPending] = useState<PendingLeave | null>(null);
    const sectionsRef = useRef(sections);
    const busyRef = useRef(isBusy);
    const blockedRef = useRef(onBlockedWhileBusy);
    const navigateRef = useRef(navigate);
    const hasUnsavedChanges = sections.length > 0;

    useEffect(() => {
        sectionsRef.current = sections;
        busyRef.current = isBusy;
        blockedRef.current = onBlockedWhileBusy;
        navigateRef.current = navigate;
    });

    const confirmLeave = useCallback((action: () => void, options: ConfirmLeaveOptions = {}) => {
        if (busyRef.current) {
            blockedRef.current?.();
            return;
        }
        const relevant = options.keys
            ? sectionsRef.current.filter((section) => options.keys?.includes(section.key))
            : sectionsRef.current;
        if (!relevant.length) {
            action();
            return;
        }
        setPending({ sections: relevant, action, actionLabel: options.actionLabel ?? 'leave' });
    }, []);

    const confirmLeaveRef = useRef(confirmLeave);

    useEffect(() => {
        let bypass = false;
        let restoring = false;
        let afterRestore: (() => void) | null = null;
        const protectedUrl = window.location.href;
        const protectedIndex = (window.history.state as { idx?: unknown } | null)?.idx;
        const guarded = () => sectionsRef.current.length > 0 || busyRef.current;

        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (!guarded()) return;
            event.preventDefault();
            event.returnValue = '';
        };

        const click = (event: MouseEvent) => {
            if (bypass || event.defaultPrevented || event.button !== 0 || !guarded()) return;
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest('[role="dialog"]')) return;
            const anchor = target?.closest('a');
            const button = anchor ? null : target?.closest('button');
            const decision = classifyGuardedClick(
                {
                    href: anchor?.getAttribute('href') ?? null,
                    target: anchor?.getAttribute('target') ?? null,
                    download: Boolean(anchor?.hasAttribute('download')),
                    modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
                    buttonText: button?.textContent?.trim() || null,
                },
                window.location.href,
            );
            if (!decision) return;
            event.preventDefault();
            event.stopPropagation();
            if (decision.kind === 'session') {
                confirmLeaveRef.current(
                    () => {
                        bypass = true;
                        button?.click();
                        bypass = false;
                    },
                    { actionLabel: decision.label === 'Sign out' ? 'sign out' : 'refresh the session' },
                );
                return;
            }
            confirmLeaveRef.current(
                () => {
                    if (decision.kind === 'path') navigateRef.current(decision.to);
                    else window.location.assign(decision.to);
                },
                { actionLabel: 'leave this page' },
            );
        };

        const pop = (event: PopStateEvent) => {
            if (restoring) {
                event.stopImmediatePropagation();
                restoring = false;
                const next = afterRestore;
                afterRestore = null;
                next?.();
                return;
            }
            if (!guarded()) return;
            event.stopImmediatePropagation();
            const attempted = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            const attemptedIndex = (event.state as { idx?: unknown } | null)?.idx;
            const delta =
                typeof protectedIndex === 'number' && typeof attemptedIndex === 'number'
                    ? protectedIndex - attemptedIndex
                    : 0;
            const ask = () => confirmLeaveRef.current(() => navigateRef.current(attempted), { actionLabel: 'go back' });
            if (delta) {
                restoring = true;
                afterRestore = ask;
                window.history.go(delta);
            } else {
                window.history.pushState(window.history.state, '', protectedUrl);
                ask();
            }
        };

        window.addEventListener('beforeunload', beforeUnload);
        document.addEventListener('click', click, true);
        window.addEventListener('popstate', pop, true);
        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
            document.removeEventListener('click', click, true);
            window.removeEventListener('popstate', pop, true);
        };
    }, []);

    const prompt = pending ? describeUnsavedPrompt(pending.sections, pending.actionLabel) : null;

    async function saveAndContinue() {
        const current = pending;
        setPending(null);
        const save = current?.sections[0]?.save;
        if (!current || !save) return;
        if (await save()) current.action();
    }

    function discardAndContinue() {
        const current = pending;
        setPending(null);
        current?.action();
    }

    const unsavedDialog =
        pending && prompt ? (
            <StoneDialog
                label={prompt.title}
                onClose={() => setPending(null)}
                className="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 p-5"
            >
                <section className="w-full max-w-lg border border-black/10 bg-white p-6" data-testid="unsaved-guard">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Unsaved changes</p>
                    <h2 className="mt-2 text-2xl font-semibold text-black">{prompt.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-black/66">{prompt.detail}</p>
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setPending(null)}
                            className="inline-flex min-h-11 items-center justify-center rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black"
                        >
                            Keep editing
                        </button>
                        <button
                            type="button"
                            onClick={discardAndContinue}
                            className="inline-flex min-h-11 items-center justify-center rounded border border-red-200 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-red-800 transition hover:border-red-700"
                        >
                            Discard changes
                        </button>
                        {prompt.canSave ? (
                            <button
                                type="button"
                                onClick={() => void saveAndContinue()}
                                className="inline-flex min-h-11 items-center justify-center rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f]"
                            >
                                Save and continue
                            </button>
                        ) : null}
                    </div>
                </section>
            </StoneDialog>
        ) : null;

    return { hasUnsavedChanges, confirmLeave, unsavedDialog };
}
