import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RouteState from '../components/RouteState';
import StoneCompareView from '../components/stone-library/StoneCompareView';
import {
    COMPARE_PAGE_PARAM,
    MAX_COMPARE_STONES,
    parseStoneIdList,
    writeStoredCompareSelection,
} from '../lib/stoneCompareSelection';
import type { StoneCompareSubject } from '../lib/stoneCompareRegistry';
import ProjectService, { findStoneProjectUsages } from '../service/ProjectService';
import StoneLibraryService, { type StoneComparisonResult } from '../service/StoneLibraryService';

type LoadState =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'ready'; key: string; stones: StoneCompareSubject[]; missingIds: string[]; finishOrder: StoneComparisonResult['finishOrder'] };

/** `/stone-library/compare?stones=a,b,c` — noindex, canonical /stone-library (src/data/seoRoutes.ts). */
export default function StoneComparePage() {
    const [params] = useSearchParams();
    const requested = useMemo(() => parseStoneIdList(params.get(COMPARE_PAGE_PARAM)), [params]);
    const ids = requested.slice(0, MAX_COMPARE_STONES);
    const overflowCount = requested.length - ids.length;
    const key = ids.join(',');
    const [state, setState] = useState<LoadState>({ status: 'loading' });
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        const stoneIds = key ? key.split(',') : [];
        setState((current) => (current.status === 'ready' ? current : { status: 'loading' }));
        Promise.all([
            StoneLibraryService.getPublishedStoneComparison(stoneIds),
            // Project usage is supporting evidence; a failed read shows no projects, never an error.
            stoneIds.length ? ProjectService.getAll().catch(() => []) : Promise.resolve([]),
        ])
            .then(([comparison, projects]) => {
                if (!active) return;
                const stones = comparison.stones.map((entry) => ({
                    ...entry,
                    usages: findStoneProjectUsages(projects, entry.detail.stoneGroupId),
                }));
                // Opening a comparison makes it the current tray selection.
                if (stones.length) writeStoredCompareSelection(stones.map((stone) => stone.detail.stoneGroupId));
                setState({ status: 'ready', key, stones, missingIds: comparison.missingIds, finishOrder: comparison.finishOrder });
            })
            .catch(() => {
                if (active) setState({ status: 'error' });
            });
        return () => {
            active = false;
        };
    }, [key, retry]);

    if (state.status === 'error') {
        return (
            <>
                <RouteState
                    eyebrow="Stone Library"
                    title="Comparison could not load"
                    copy="Please retry to load the latest stone information."
                    headerOffset
                />
                <div className="urblo-page-container pb-12">
                    <button className="urblo-button" onClick={() => setRetry((n) => n + 1)}>
                        Try again
                    </button>
                </div>
            </>
        );
    }

    if (state.status === 'loading') {
        return (
            <RouteState
                eyebrow="Loading"
                title="Preparing comparison"
                copy="Loading the latest stone information."
                headerOffset
            />
        );
    }

    return (
        <div aria-busy={state.key !== key}>
            <StoneCompareView
                stones={state.stones}
                finishOrder={state.finishOrder}
                missingIds={state.missingIds}
                overflowCount={overflowCount}
            />
        </div>
    );
}
