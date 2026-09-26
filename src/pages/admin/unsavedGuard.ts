// Plain helpers for useUnsavedGuard: dirty comparison, dialog wording and which clicks leave
// the editor. Kept outside the hook so vitest can cover them without a browser.

export interface UnsavedSection {
    /** Stable key, e.g. "product", "model". */
    key: string;
    /** Name shown to the editor, e.g. "Product details". */
    label: string;
    /** Saves this section; resolves true only when the save finished successfully. */
    save?: () => Promise<boolean>;
}

function stable(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value as Record<string, unknown>)
                .sort()
                .map((key) => [key, stable((value as Record<string, unknown>)[key])]),
        );
    }
    return value;
}

/** True when the edited form differs from the form built from the last loaded or saved record. */
export function isFormDirty<T>(current: T, baseline: T) {
    return JSON.stringify(stable(current)) !== JSON.stringify(stable(baseline));
}

export function listLabels(labels: string[]) {
    if (labels.length <= 1) return labels[0] ?? '';
    return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export interface UnsavedPrompt {
    title: string;
    detail: string;
    /** Save is offered only when one section is unsaved and it can save itself. */
    canSave: boolean;
}

export function describeUnsavedPrompt(sections: UnsavedSection[], actionLabel: string): UnsavedPrompt {
    const labels = sections.map((section) => section.label);
    const canSave = sections.length === 1 && typeof sections[0].save === 'function';
    const where = listLabels(labels) || 'this screen';
    return {
        title: 'Save your changes first?',
        detail: canSave
            ? `You have unsaved changes in ${where}. Save them before you ${actionLabel}, discard them, or keep editing.`
            : `You have unsaved changes in ${where}. Save each part with its own Save button and try again, discard the changes, or keep editing.`,
        canSave,
    };
}

export interface GuardClickTarget {
    href: string | null;
    target: string | null;
    download: boolean;
    modified: boolean;
    buttonText: string | null;
}

/** Header buttons that reload or end the admin session and would drop edits on this page. */
const sessionButtonLabels = ['Sign out', 'Refresh'] as const;

/**
 * Decides whether a click leaves the current editor. Returns the in-app path or external URL
 * to continue to, "session" for Sign out / Refresh, or null when the click is harmless.
 */
export function classifyGuardedClick(click: GuardClickTarget, currentUrl: string): { kind: 'path'; to: string } | { kind: 'external'; to: string } | { kind: 'session'; label: string } | null {
    if (click.buttonText && (sessionButtonLabels as readonly string[]).includes(click.buttonText)) {
        return { kind: 'session', label: click.buttonText };
    }
    if (!click.href || click.download || click.modified) return null;
    if (click.target && click.target !== '_self') return null;
    const current = new URL(currentUrl);
    let destination: URL;
    try {
        destination = new URL(click.href, current);
    } catch {
        return null;
    }
    if (!['http:', 'https:'].includes(destination.protocol)) return null;
    if (destination.origin !== current.origin) return { kind: 'external', to: destination.href };
    if (destination.pathname === current.pathname && destination.search === current.search) return null;
    return { kind: 'path', to: `${destination.pathname}${destination.search}${destination.hash}` };
}
