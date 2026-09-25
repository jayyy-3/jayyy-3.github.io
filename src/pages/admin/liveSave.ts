// Shared wording for the older admin modules' live-save confirmation (see LiveSaveConfirm.tsx)
// and URL-key helpers. Kept outside the component file so it stays a plain module.
type CmsSaveStatus = 'draft' | 'published' | 'archived';

export interface LiveSaveConfirmRequest {
    title: string;
    detail: string;
    confirmLabel: string;
}

export const updateLivePageLabel = 'Update live page';

export function liveSaveRequest({
    kind,
    name,
    publicPath,
    liveTarget,
    nextStatus,
}: {
    kind: string;
    name: string;
    publicPath?: string | null;
    liveTarget?: string;
    nextStatus: CmsSaveStatus;
}): LiveSaveConfirmRequest {
    const label = name.trim() ? `“${name.trim()}”` : `This ${kind}`;
    const target = liveTarget ?? (publicPath ? `the public page at ${publicPath}` : 'the public website');
    if (nextStatus === 'published') {
        return {
            title: `Update the live ${kind}?`,
            detail: `${label} is live on the website. Saving changes ${target} straight away. Visitors will see these edits as soon as the save finishes.`,
            confirmLabel: updateLivePageLabel,
        };
    }
    return {
        title: `Take this ${kind} off the website?`,
        detail: `${label} is live on the website. Saving it as ${
            nextStatus === 'archived' ? 'Archived' : 'Draft'
        } removes it from ${target} straight away.`,
        confirmLabel: 'Save and take offline',
    };
}

// URL keys follow the name until the editor types their own, and stay editable until the record
// has been published once. After that the public address is permanent (links, search results).
export function urlKeyFromName(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function followNameUrlKey(currentKey: string, previousName: string, nextName: string) {
    return !currentKey.trim() || currentKey === urlKeyFromName(previousName) ? urlKeyFromName(nextName) : currentKey;
}

export function isUrlKeyLocked(row: { status: string; published_at: string | null } | null | undefined) {
    return Boolean(row && (row.status === 'published' || row.published_at));
}

export const urlKeyLockedHelp = 'Locked because this page has been published. Changing it would break existing links.';
export const urlKeyEditableHelp = 'Filled in from the name. You can change it until the first publish.';
