import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    COMPARE_SELECTION_PARAM,
    COMPARE_STORAGE_KEY,
    compareFullMessage,
    readStoredCompareSelection,
    serializeStoneIdList,
    toCompareSelection,
    toggleCompareId,
    writeStoredCompareSelection,
} from '../../lib/stoneCompareSelection';

export interface CompareMessage {
    kind: 'full' | 'info';
    text: string;
}

export interface StoneCompareSelection {
    ids: string[];
    /** Short status for the live region: cap reached (`full`, shown), added or removed (`info`, announced). */
    message: CompareMessage | null;
    isSelected: (id: string) => boolean;
    toggle: (id: string, name?: string) => void;
    remove: (id: string) => void;
    clear: () => void;
    /** Drops ids that no longer match a public stone (after the list has loaded). */
    retain: (knownIds: readonly string[]) => void;
}

/**
 * Compare selection state. The list page passes `syncUrl` so `?compare=a,b` is the
 * shareable source of truth there (a URL selection wins over storage on arrival);
 * localStorage keeps the selection between the list and a stone detail page.
 */
export function useStoneCompareSelection({ syncUrl = false }: { syncUrl?: boolean } = {}): StoneCompareSelection {
    const location = useLocation();
    const navigate = useNavigate();
    const urlValue = syncUrl ? new URLSearchParams(location.search).get(COMPARE_SELECTION_PARAM) : null;
    const [ids, setIds] = useState<string[]>(() =>
        urlValue !== null ? toCompareSelection(urlValue) : readStoredCompareSelection(),
    );
    const [message, setMessage] = useState<CompareMessage | null>(null);

    useEffect(() => {
        writeStoredCompareSelection(ids);
        if (!syncUrl) return;
        const serialized = serializeStoneIdList(ids);
        const current = new URLSearchParams(location.search);
        if ((current.get(COMPARE_SELECTION_PARAM) || '') === serialized) return;
        current.delete(COMPARE_SELECTION_PARAM);
        // Ids are validated slugs, so the list keeps readable commas (`?compare=a,b`).
        const search = [current.toString(), serialized ? `${COMPARE_SELECTION_PARAM}=${serialized}` : '']
            .filter(Boolean)
            .join('&');
        navigate({ pathname: location.pathname, search: search ? `?${search}` : '', hash: location.hash }, {
            replace: true,
            preventScrollReset: true,
        });
        // Only the selection drives this effect; the location is read at that moment.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ids, syncUrl]);

    useEffect(() => {
        // Another tab (or the detail page in this tab) changed the stored selection.
        function onStorage(event: StorageEvent) {
            if (event.key === COMPARE_STORAGE_KEY) setIds(toCompareSelection(event.newValue));
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const toggle = useCallback(
        (id: string, name?: string) => {
            const result = toggleCompareId(ids, id);
            if (result.outcome === 'full') {
                setMessage({ kind: 'full', text: compareFullMessage(name) });
                return;
            }
            setIds(result.ids);
            setMessage(
                name
                    ? { kind: 'info', text: `${name} ${result.outcome === 'added' ? 'added to' : 'removed from'} compare.` }
                    : null,
            );
        },
        [ids],
    );

    const remove = useCallback((id: string) => {
        setIds((current) => current.filter((entry) => entry !== id));
        setMessage(null);
    }, []);

    const clear = useCallback(() => {
        setIds([]);
        setMessage(null);
    }, []);

    const retain = useCallback((knownIds: readonly string[]) => {
        setIds((current) => {
            const next = current.filter((id) => knownIds.includes(id));
            return next.length === current.length ? current : next;
        });
    }, []);

    const isSelected = useCallback((id: string) => ids.includes(id), [ids]);

    return { ids, message, isSelected, toggle, remove, clear, retain };
}
