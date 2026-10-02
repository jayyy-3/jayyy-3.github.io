import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import Button from '../ui/Button';
import PageIntro from '../ui/PageIntro';
import SectionHeading from '../ui/SectionHeading';
import { cx } from '../ui/styles';
import { siteCtas } from '../../data/siteChrome';
import StoneResponsiveImage from './StoneResponsiveImage';
import {
    buildCompareRows,
    filterCompareRows,
    finishLabel,
    listCompareFinishOptions,
    pickDefaultCompareFinish,
    stoneCompareRegistry,
    type CompareCell,
    type CompareCellOf,
    type CompareRow,
    type StoneCompareAttribute,
    type StoneCompareContext,
    type StoneCompareSubject,
} from '../../lib/stoneCompareRegistry';
import {
    MAX_COMPARE_STONES,
    compareHref,
    libraryHrefWithSelection,
    sampleRequestHref,
} from '../../lib/stoneCompareSelection';
import type { FinishCapability } from '../../types/stone-library';

export interface StoneCompareViewProps {
    stones: StoneCompareSubject[];
    finishOrder: StoneCompareContext['finishOrder'];
    /** Requested ids that are not public stones. */
    missingIds?: string[];
    /** Valid ids beyond the four-stone cap. */
    overflowCount?: number;
    /** Injected in tests; the page always uses the shipped registry. */
    registry?: readonly StoneCompareAttribute[];
    initialFinishKey?: string | null;
    initialDifferencesOnly?: boolean;
}

// Column tracks: the sticky label column, then one fixed-minimum column per stone so a
// 375px screen scrolls horizontally instead of squeezing the stone columns.
const LABEL_COLUMN = 'w-[128px] md:w-[200px]';
const STONE_COLUMN_MIN_PX = 208;
const LABEL_COLUMN_MIN_PX = 128;

const stickyCell =
    'sticky left-0 z-10 bg-white shadow-[inset_-1px_0_0_rgba(0,0,0,0.12)]';

function Muted({ children }: { children: string }) {
    return <span className="text-small text-muted">{children}</span>;
}

function CapabilityMark({ value }: { value: FinishCapability }) {
    // StatusPill dot language: lime dot in a thin lime ring for offered, hollow dot for to be
    // confirmed, a quiet dash for not offered.
    if (value === 'yes') {
        return (
            <span className="inline-flex items-center gap-2" data-capability="yes">
                <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(0,255,25,0.55)] bg-[rgba(0,255,25,0.12)]"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                </span>
                <span className="sr-only">Available</span>
            </span>
        );
    }
    if (value === 'tbc') {
        return (
            <span className="inline-flex items-center gap-2" data-capability="tbc">
                <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/15 bg-white"
                >
                    <span className="h-1.5 w-1.5 rounded-full border border-black/40 bg-white" />
                </span>
                <span className="text-meta uppercase tracking-caps text-muted">TBC</span>
                <span className="sr-only">To be confirmed</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center" data-capability="no">
            <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center text-black/30">
                –
            </span>
            <span className="sr-only">Not offered</span>
        </span>
    );
}

function CapabilityLegend() {
    return (
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta font-normal normal-case tracking-normal text-muted">
            <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lime ring-1 ring-[rgba(0,255,25,0.55)] ring-offset-1" />
                Available
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full border border-black/40 bg-white" />
                To be confirmed
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="text-black/30">–</span>
                Not offered
            </span>
        </span>
    );
}

function OfferedMark({ offered }: { offered: boolean }) {
    // Same dot language as the finish capability rows: lime dot in a thin lime ring for
    // offered, a quiet dash for not offered. The visible label carries the state as text.
    return offered ? (
        <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-[rgba(0,255,25,0.55)] bg-[rgba(0,255,25,0.12)]"
        >
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
        </span>
    ) : (
        <span aria-hidden="true" className="inline-flex h-5 w-5 flex-none items-center justify-center text-black/30">
            –
        </span>
    );
}

function ChecklistCell({ cell }: { cell: CompareCellOf<'checklist'> }) {
    if (!cell.entries.length) return <Muted>Confirm for your project</Muted>;
    return (
        <ul className="space-y-1.5">
            {cell.entries.map((entry) => (
                <li
                    key={entry.label}
                    data-offered={entry.offered}
                    className="flex items-center gap-2 text-small"
                >
                    <OfferedMark offered={entry.offered} />
                    <span className={cx('min-w-0 break-words', entry.offered ? 'text-ink' : 'text-muted')}>
                        {entry.label}
                        <span className="sr-only">{entry.offered ? ': offered' : ': not offered'}</span>
                    </span>
                    {entry.offered ? null : (
                        <span aria-hidden="true" className="flex-none text-meta uppercase tracking-caps text-muted">
                            Not offered
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

function ImageCell({ cell, stoneName, finishName }: { cell: CompareCellOf<'image'>; stoneName: string; finishName: string }) {
    const frame = 'relative block aspect-[4/3] overflow-hidden rounded-sm';
    let media;
    if (cell.state === 'image' && cell.src) {
        media = (
            <>
                <StoneResponsiveImage
                    src={cell.src}
                    profile="card"
                    sizes="(min-width: 1280px) 280px, (min-width: 768px) 24vw, 208px"
                    alt={cell.alt || `${stoneName} ${finishName}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    loading="lazy"
                />
                {cell.role === 'reference' ? (
                    <span className="absolute bottom-2 left-2 rounded-sm bg-black/65 px-2 py-1 text-meta uppercase tracking-caps text-white backdrop-blur-sm">
                        Reference view
                    </span>
                ) : null}
            </>
        );
    } else if (cell.state === 'pending') {
        media = (
            <span className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f4f4f1,#deded8)] px-4 text-center text-meta uppercase tracking-caps text-black/55">
                Photo pending
            </span>
        );
    } else {
        media = (
            <span className="flex h-full items-center justify-center border border-dashed border-black/15 bg-surface px-4 text-center text-small text-muted">
                Not offered in {finishName}
            </span>
        );
    }

    return (
        <div>
            {cell.to ? (
                <Link to={cell.to} className={cx('group', frame)} aria-label={`View ${stoneName} in ${finishName}`}>
                    {media}
                </Link>
            ) : (
                <div className={frame}>{media}</div>
            )}
            {cell.caption ? (
                <p className="mt-2 text-meta uppercase tracking-caps text-muted">{cell.caption}</p>
            ) : null}
        </div>
    );
}

function LinkList({ items }: { items: { label: string; to?: string }[] }) {
    return (
        <ul className="space-y-1">
            {items.map((item) => (
                <li key={`${item.label}-${item.to ?? ''}`} className="text-copy text-ink">
                    {item.to ? (
                        <Link
                            to={item.to}
                            className="underline decoration-black/25 underline-offset-4 transition hover:decoration-[var(--urblo-lime)]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        item.label
                    )}
                </li>
            ))}
        </ul>
    );
}

function ValueCell({ cell, stoneName, finishName }: { cell: CompareCell; stoneName: string; finishName: string }) {
    switch (cell.kind) {
        case 'image':
            return <ImageCell cell={cell} stoneName={stoneName} finishName={finishName} />;
        case 'text':
            if (!cell.text) return <Muted>Not listed</Muted>;
            return (
                <div>
                    <p className="text-copy text-ink">{cell.text}</p>
                    {cell.meter ? (
                        <span
                            className="mt-2 flex gap-1"
                            role="img"
                            aria-label={`${cell.meter.value} of ${cell.meter.max}`}
                        >
                            {Array.from({ length: cell.meter.max }, (_, index) => (
                                <span
                                    key={index}
                                    className={cx('h-1 w-5 rounded-sm', index < cell.meter!.value ? 'bg-ink' : 'bg-black/10')}
                                />
                            ))}
                        </span>
                    ) : null}
                </div>
            );
        case 'number':
            if (cell.value === null) return <Muted>Not listed</Muted>;
            if (cell.value === 0 && cell.links) return <Muted>None recorded yet</Muted>;
            return (
                <div>
                    <p className="text-copy text-ink">{cell.display ?? String(cell.value)}</p>
                    {cell.links?.length ? (
                        <div className="mt-2">
                            <LinkList items={cell.links} />
                        </div>
                    ) : null}
                </div>
            );
        case 'boolean':
            if (cell.value === null) return <Muted>Not listed</Muted>;
            return <p className="text-copy text-ink">{cell.value ? 'Yes' : 'No'}</p>;
        case 'list':
            return cell.items.length ? <LinkList items={cell.items} /> : <Muted>Not listed</Muted>;
        case 'checklist':
            return <ChecklistCell cell={cell} />;
        case 'matrix':
            // Rendered as one row per finish by the table body.
            return null;
    }
}

function RowLabel({ attribute }: { attribute: StoneCompareAttribute }) {
    const note = [attribute.hint, attribute.unit].filter(Boolean).join(', ');
    return (
        <>
            <span className="block text-meta font-semibold uppercase tracking-caps text-ink">{attribute.label}</span>
            {note ? <span className="mt-1 block text-meta text-muted">{note}</span> : null}
        </>
    );
}

function DifferencesSwitch({
    checked,
    disabled,
    onChange,
}: {
    checked: boolean;
    disabled: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="urblo-focus-inset inline-flex min-h-10 items-center gap-3 rounded-[4px] pr-1 text-meta font-semibold uppercase tracking-caps text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span
                aria-hidden="true"
                className={cx(
                    'relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors',
                    checked ? 'bg-ink' : 'bg-black/15',
                )}
            >
                <span
                    className={cx(
                        'absolute h-4 w-4 rounded-full transition-transform',
                        checked ? 'translate-x-[18px] bg-lime' : 'translate-x-0.5 bg-white',
                    )}
                />
            </span>
            Differences only
        </button>
    );
}

/**
 * Stone comparison surface. Rows come only from the attribute registry; this component
 * owns layout, the shared finish switch and the "Differences only" filter.
 */
export default function StoneCompareView({
    stones,
    finishOrder,
    missingIds = [],
    overflowCount = 0,
    registry = stoneCompareRegistry,
    initialFinishKey = null,
    initialDifferencesOnly = false,
}: StoneCompareViewProps) {
    const finishOptions = useMemo(() => listCompareFinishOptions(stones, finishOrder), [stones, finishOrder]);
    const [chosenFinish, setChosenFinish] = useState<string | null>(initialFinishKey);
    const finishKey =
        chosenFinish && finishOptions.some((option) => option.key === chosenFinish)
            ? chosenFinish
            : pickDefaultCompareFinish(stones, finishOrder);
    const [differencesOnly, setDifferencesOnly] = useState(initialDifferencesOnly);
    const canDiffer = stones.length > 1;
    const ctx: StoneCompareContext = { finishKey, finishOrder };
    const rows = buildCompareRows(stones, ctx, registry);
    const visibleRows = filterCompareRows(rows, differencesOnly && canDiffer);
    const hiddenCount = rows.reduce(
        (count, row) =>
            count + (row.matrixRows ? row.matrixRows.length : 1),
        0,
    ) - visibleRows.reduce((count, row) => count + (row.matrixRows ? row.matrixRows.length : 1), 0);
    const ids = stones.map((stone) => stone.detail.stoneGroupId);
    const names = stones.map((stone) => stone.detail.name);
    const finishName = finishKey ? finishLabel(finishKey, ctx) : 'this finish';
    const tableMinWidth = LABEL_COLUMN_MIN_PX + stones.length * STONE_COLUMN_MIN_PX;

    const notices: string[] = [];
    if (missingIds.length) {
        notices.push(
            `${missingIds.length === 1 ? 'One stone link was' : `${missingIds.length} stone links were`} not found in the Stone Library and left out: ${missingIds.join(', ')}.`,
        );
    }
    if (overflowCount > 0) {
        notices.push(
            `Compare shows up to ${MAX_COMPARE_STONES} stones; ${overflowCount} more ${overflowCount === 1 ? 'was' : 'were'} left out.`,
        );
    }

    const intro = (
        <PageIntro
            band
            breadcrumb={[
                { label: 'Home', to: '/' },
                { label: 'Stone Library', to: siteCtas.stoneLibrary.to },
                { label: 'Compare' },
            ]}
            title="Compare stones"
            lede={
                stones.length
                    ? 'Finish photography, available forms, price tier, block size and project use, side by side.'
                    : undefined
            }
            actions={
                stones.length ? (
                    <>
                        <Button to={sampleRequestHref(names)}>{siteCtas.sampleRequest.label}</Button>
                        <Button to={libraryHrefWithSelection(ids)} variant="ghost">
                            Edit selection
                        </Button>
                    </>
                ) : undefined
            }
        />
    );

    const noticeBlock = notices.length ? (
        <div role="status" className="urblo-page-container pt-6">
            <div className="rounded-[4px] border border-line bg-white px-4 py-3 text-small text-body">
                {notices.map((notice) => (
                    <p key={notice}>{notice}</p>
                ))}
            </div>
        </div>
    ) : null;

    if (!stones.length) {
        return (
            <div className="bg-white" data-compare-state="empty">
                {intro}
                {noticeBlock}
                <section className="urblo-page-container py-12 md:py-16">
                    <div className="max-w-2xl border-t border-ink pt-6">
                        <p className="text-title-sm font-light text-ink">No stones to compare yet.</p>
                        <p className="mt-3 text-copy text-body">
                            Choose up to {MAX_COMPARE_STONES} stones in the Stone Library with Compare, then open the comparison.
                        </p>
                        <div className="mt-6">
                            <Button to={siteCtas.stoneLibrary.to}>{siteCtas.stoneLibrary.label}</Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-white" data-compare-state="ready" data-compare-count={stones.length}>
            {intro}

            <section
                aria-label="Comparison controls"
                className="sticky top-0 z-30 border-b border-line bg-white/98 shadow-[0_8px_24px_rgba(0,0,0,0.035)] backdrop-blur"
            >
                <div className="urblo-page-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex-none text-meta font-semibold uppercase tracking-caps text-muted" id="compare-finish-label">
                            Finish shown
                        </span>
                        <div
                            role="group"
                            aria-labelledby="compare-finish-label"
                            className="-my-1 flex min-w-0 gap-2 overflow-x-auto py-1"
                        >
                            {finishOptions.map((option) => {
                                const active = option.key === finishKey;
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setChosenFinish(option.key)}
                                        aria-label={`${option.label}, offered by ${option.offeredBy} of ${stones.length} stones`}
                                        className={cx(
                                            'urblo-focus-inset inline-flex min-h-10 flex-none items-center gap-2 rounded-[4px] border px-3 text-meta font-semibold uppercase tracking-caps transition-colors',
                                            active
                                                ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-ink'
                                                : 'border-black/15 bg-white text-muted hover:border-black hover:text-ink',
                                        )}
                                    >
                                        {option.label}
                                        <span className="font-normal text-muted">
                                            {option.offeredBy}/{stones.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-none items-center justify-between gap-4">
                        <DifferencesSwitch checked={differencesOnly && canDiffer} disabled={!canDiffer} onChange={setDifferencesOnly} />
                        <p className="text-meta uppercase tracking-caps text-muted" aria-live="polite">
                            {differencesOnly && canDiffer && hiddenCount > 0
                                ? `${hiddenCount} matching ${hiddenCount === 1 ? 'row' : 'rows'} hidden`
                                : `${stones.length} ${stones.length === 1 ? 'stone' : 'stones'}`}
                        </p>
                    </div>
                </div>
            </section>

            {noticeBlock}

            <section className="bg-surface py-8 md:py-10">
                <div className="urblo-page-container">
                    {stones.length === 1 ? (
                        <p className="mb-4 text-small text-body">
                            Add another stone to compare side by side.{' '}
                            <Link to={libraryHrefWithSelection(ids)} className="underline underline-offset-4">
                                Choose stones
                            </Link>
                        </p>
                    ) : null}
                    <div
                        role="region"
                        aria-labelledby="compare-caption"
                        tabIndex={0}
                        data-compare-scroll="true"
                        className="relative overflow-x-auto rounded-[4px] border border-line bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                        <table className="w-full table-fixed border-separate border-spacing-0" style={{ minWidth: tableMinWidth }}>
                            <caption id="compare-caption" className="sr-only">
                                Comparison of {names.join(', ')}
                            </caption>
                            <colgroup>
                                <col className={LABEL_COLUMN} />
                                {stones.map((stone) => (
                                    <col key={stone.detail.stoneGroupId} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className={cx(stickyCell, 'px-4 py-5 text-left align-bottom md:px-5')}>
                                        <span className="text-meta font-semibold uppercase tracking-caps text-muted">
                                            {stones.length} of {MAX_COMPARE_STONES}
                                        </span>
                                    </th>
                                    {stones.map((stone) => {
                                        const { detail } = stone;
                                        const remaining = ids.filter((id) => id !== detail.stoneGroupId);
                                        return (
                                            <th
                                                key={detail.stoneGroupId}
                                                scope="col"
                                                className="border-l border-line px-4 py-5 text-left align-top font-normal md:px-5"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link
                                                        to={`/stone-library/${detail.stoneGroupId}`}
                                                        className="group inline-flex min-w-0 items-start gap-1.5 text-title-sm font-light text-ink"
                                                    >
                                                        <span className="min-w-0 break-words">{detail.name}</span>
                                                        <ArrowUpRight
                                                            aria-hidden="true"
                                                            className="mt-1 h-4 w-4 flex-none text-black/40 transition group-hover:text-ink"
                                                        />
                                                    </Link>
                                                    <Link
                                                        to={compareHref(remaining)}
                                                        replace
                                                        aria-label={`Remove ${detail.name} from comparison`}
                                                        className="urblo-focus-inset -mr-2 -mt-1 inline-flex h-9 w-9 flex-none items-center justify-center rounded-sm text-muted transition-colors hover:bg-black/5 hover:text-ink"
                                                    >
                                                        <X className="h-4 w-4" aria-hidden="true" />
                                                    </Link>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleRows.length ? (
                                    visibleRows.map((row) => (
                                        <CompareRowView
                                            key={row.attribute.key}
                                            row={row}
                                            stones={stones}
                                            finishName={finishName}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td className={cx(stickyCell, 'border-t border-line px-4 py-6 md:px-5')} />
                                        <td colSpan={stones.length} className="border-t border-line px-4 py-6 text-copy text-body md:px-5">
                                            These stones match on every compared attribute.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-small text-muted">
                        Price tiers are indicative and confirmed per project. Capability and photography reflect the
                        current Stone Library record.
                    </p>
                </div>
            </section>

            <section className="border-t border-line bg-white">
                <div className="urblo-page-container flex flex-col gap-6 py-section-tight md:flex-row md:items-end md:justify-between">
                    <SectionHeading
                        eyebrow="Samples"
                        title="See them in hand"
                        copy={`The sample request form opens with ${names.join(', ')} filled in. Add finishes, quantity and delivery there.`}
                        className="max-w-3xl"
                    />
                    <div className="flex flex-none flex-col gap-3 sm:flex-row">
                        <Button to={sampleRequestHref(names)}>{siteCtas.sampleRequest.label}</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function CompareRowView({
    row,
    stones,
    finishName,
}: {
    row: CompareRow;
    stones: StoneCompareSubject[];
    finishName: string;
}) {
    const cellClass = 'border-l border-t border-line px-4 py-4 align-top md:px-5';
    const labelClass = cx(stickyCell, 'border-t border-line px-4 py-4 text-left align-top font-normal md:px-5');

    if (row.matrixRows) {
        return (
            <>
                <tr data-compare-row={row.attribute.key}>
                    <th scope="rowgroup" className={cx(labelClass, 'bg-white')}>
                        <RowLabel attribute={row.attribute} />
                    </th>
                    <td colSpan={stones.length} className="border-l border-t border-line px-4 py-4 align-middle md:px-5">
                        <CapabilityLegend />
                    </td>
                </tr>
                {row.matrixRows.map((matrixRow) => (
                    <tr key={matrixRow.key} data-compare-row={`${row.attribute.key}:${matrixRow.key}`}>
                        <th scope="row" className={cx(stickyCell, 'border-t border-black/5 py-2.5 pl-6 pr-4 text-left align-middle font-normal md:pl-8')}>
                            <span className="text-small text-body">{matrixRow.label}</span>
                        </th>
                        {matrixRow.values.map((value, index) => (
                            <td
                                key={stones[index].detail.stoneGroupId}
                                className="border-l border-t border-black/5 border-l-line px-4 py-2.5 align-middle md:px-5"
                            >
                                <CapabilityMark value={value} />
                            </td>
                        ))}
                    </tr>
                ))}
            </>
        );
    }

    return (
        <tr data-compare-row={row.attribute.key}>
            <th scope="row" className={labelClass}>
                <RowLabel attribute={row.attribute} />
            </th>
            {row.cells.map((cell, index) => (
                <td key={stones[index].detail.stoneGroupId} className={cellClass}>
                    <ValueCell cell={cell} stoneName={stones[index].detail.name} finishName={finishName} />
                </td>
            ))}
        </tr>
    );
}
