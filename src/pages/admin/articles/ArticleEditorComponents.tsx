import {
    Archive,
    CheckCircle2,
    Image as ImageIcon,
    Plus,
    Save,
    ShieldAlert
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CmsStatusPill } from '../AdminCmsPrimitives';
import { fieldClass, formatMediaOption, getMediaUrl } from './forms';
import type { ArticleStatus, MediaOptionRow } from './types';

export function ArticleStatusHelp({ status }: { status: ArticleStatus }) {
    const messages: Record<ArticleStatus, string> = {
        draft: 'Draft is safe to edit and will not appear on the public website.',
        published: 'Published can appear on public article pages where CMS content is active.',
        archived: 'The Archived CMS version is hidden and kept for history; a matching legacy article may remain visible during migration.',
    };

    return (
        <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
            {messages[status]}
        </p>
    );
}

export function TextField({
    label,
    value,
    disabled,
    required,
    type = 'text',
    inputMode,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    required?: boolean;
    type?: string;
    inputMode?: 'numeric';
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required={required}
                inputMode={inputMode}
                className={fieldClass}
            />
        </label>
    );
}

export function SelectField({
    label,
    value,
    disabled,
    options,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={fieldClass}>
                {options.map(([optionValue, labelText]) => (
                    <option key={optionValue} value={optionValue}>
                        {labelText}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function MediaSelect({
    label,
    value,
    disabled,
    mediaOptions,
    selectedMedia,
    emptyLabel,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    mediaOptions: MediaOptionRow[];
    selectedMedia: MediaOptionRow | null;
    emptyLabel: string;
    onChange: (value: string) => void;
}) {
    const previewUrl = getMediaUrl(selectedMedia);

    return (
        <div className="space-y-2">
            <SelectField
                label={label}
                value={value}
                disabled={disabled}
                onChange={onChange}
                options={[
                    ['', emptyLabel],
                    ...mediaOptions.map((media) => [String(media.id), formatMediaOption(media)] as [string, string]),
                ]}
            />
            {selectedMedia ? (
                <div className="flex gap-3 border border-black/10 bg-[#f8f9f5] p-3">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden bg-white">
                        {previewUrl && selectedMedia.media_type === 'image' ? (
                            <img
                                src={previewUrl}
                                alt={selectedMedia.alt || selectedMedia.caption || label}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-black/35" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {selectedMedia.alt || selectedMedia.caption || 'Untitled media'}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.status === 'published' ? 'Published in Media' : 'Not published in Media'}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/52">
                            {selectedMedia.status === 'published'
                                ? 'This Media library item can support a public article image.'
                                : 'Open Media, review the item, then publish it before relying on it for public article pages.'}
                        </p>
                    </div>
                </div>
            ) : value ? (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                    Selected media is not in the available media list.
                </p>
            ) : null}
        </div>
    );
}

export function TextareaField({
    label,
    value,
    disabled,
    rows = 4,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    rows?: number;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                rows={rows}
                className={`${fieldClass} py-3 leading-6`}
            />
        </label>
    );
}

export function ArticlePublishChecklist({ items }: { items: Array<{ label: string; ready: boolean; detail: string }> }) {
    const readyCount = items.filter((item) => item.ready).length;
    const allReady = readyCount === items.length;

    return (
        <section className="mt-5 border border-black/10 bg-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Article publish checklist</p>
                    <h3 className="mt-2 text-lg font-semibold text-black">
                        {allReady ? 'Ready to publish' : `${items.length - readyCount} item${items.length - readyCount === 1 ? '' : 's'} need review`}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">
                        Published articles can appear on the public Articles page and article detail route.
                    </p>
                </div>
                <span
                    className={[
                        'inline-flex min-h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                        allReady
                            ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                            : 'border-amber-300 bg-amber-50 text-amber-800',
                    ].join(' ')}
                >
                    {readyCount}/{items.length} ready
                </span>
            </div>
            <div className="mt-4 grid gap-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={[
                            'border p-3',
                            item.ready ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]' : 'border-amber-200 bg-amber-50',
                        ].join(' ')}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-black">{item.label}</p>
                            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                                {item.ready ? 'Ready' : 'Fix'}
                            </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-black/58">{item.detail}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function ArticlePublishStatusSummary({
    eyebrow,
    status,
    items,
    disabled,
    liveLabel,
    readyLabel,
    blockedLabel,
    liveDetail,
    readyDetail,
    blockedDetail,
}: {
    eyebrow: string;
    status: ArticleStatus;
    items: Array<{ label: string; ready: boolean; detail: string }>;
    disabled?: boolean;
    liveLabel: string;
    readyLabel: string;
    blockedLabel: string;
    liveDetail: string;
    readyDetail: string;
    blockedDetail: string;
}) {
    const missingItems = items.filter((item) => !item.ready);
    const readyToPublish = !disabled && missingItems.length === 0;
    const isPublished = status === 'published';
    const stateLabel = disabled
        ? 'Choose or create content'
        : isPublished
            ? liveLabel
            : readyToPublish
                ? readyLabel
                : blockedLabel;
    const detail = disabled
        ? 'Select an item or start a new one to see whether it can appear on the website.'
        : isPublished
            ? liveDetail
            : readyToPublish
                ? readyDetail
                : `${blockedDetail} ${missingItems.length} item${missingItems.length === 1 ? '' : 's'} still need review.`;

    return (
        <section
            className={[
                'border p-4',
                isPublished
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]'
                    : readyToPublish
                        ? 'border-black/10 bg-[#f8f9f5]'
                        : 'border-amber-200 bg-amber-50',
            ].join(' ')}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    {isPublished || readyToPublish ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-black" />
                    ) : (
                        <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-800" />
                    )}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">{eyebrow}</p>
                        <h3 className="mt-2 text-lg font-semibold text-black">{stateLabel}</h3>
                        <p className="mt-2 text-sm leading-6 text-black/62">{detail}</p>
                    </div>
                </div>
                <CmsStatusPill status={status} />
            </div>
            {!disabled && missingItems[0] ? (
                <p className="mt-4 inline-flex min-h-10 items-center rounded border border-amber-300 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                    Start with: {missingItems[0].label}
                </p>
            ) : null}
        </section>
    );
}

export function ArticleActionBar({
    label,
    status,
    isSaving,
    disabled,
    canPublish,
    publishLockedLabel,
    saveLabel,
    publishLabel,
    archiveLabel,
    onSave,
    onPublish,
    onArchive,
    compact = false,
}: {
    label: string;
    status: ArticleStatus;
    isSaving: boolean;
    disabled?: boolean;
    canPublish: boolean;
    publishLockedLabel: string;
    saveLabel: string;
    publishLabel: string;
    archiveLabel: string;
    onSave?: () => void;
    onPublish: () => void;
    onArchive: () => void;
    compact?: boolean;
}) {
    const isDisabled = disabled || isSaving;
    const actionNote = canPublish
        ? status === 'published'
            ? 'Published article content can appear on the website after you save.'
            : status === 'archived'
                ? 'Archived article content stays hidden. Save if you are preparing it for future reuse.'
                : 'Save keeps changes in the CMS. Publish only when the checklist is clear.'
        : `Publish locked: ${publishLockedLabel}`;

    return (
        <section className={compact ? 'border border-black/10 bg-white p-4' : 'mt-5 border border-black/10 bg-[#f8f9f5] p-4'}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">{label}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CmsStatusPill status={status} />
                        <p className="text-sm font-semibold leading-6 text-black/62">{actionNote}</p>
                    </div>
                </div>
                <div className={compact ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
                    <button
                        type={onSave ? 'button' : 'submit'}
                        onClick={onSave}
                        disabled={isDisabled}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        <Save className="h-4 w-4" />
                        {saveLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled || !canPublish}
                        onClick={onPublish}
                        title={canPublish ? publishLabel : publishLockedLabel}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {publishLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled}
                        onClick={onArchive}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                    >
                        <Archive className="h-4 w-4" />
                        {archiveLabel}
                    </button>
                </div>
            </div>
        </section>
    );
}

export function SubrecordEditor({
    title,
    eyebrow,
    disabled,
    onNew,
    children,
}: {
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: ReactNode;
}) {
    return (
        <section className="border border-black/10 bg-white p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-black">{title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onNew}
                    disabled={disabled}
                    className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New
                </button>
            </div>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}

export function RecordChips<T extends { id: number }>({
    rows,
    selectedId,
    getLabel,
    onSelect,
}: {
    rows: T[];
    selectedId: number | null;
    getLabel: (row: T) => string;
    onSelect: (row: T) => void;
}) {
    if (!rows.length) {
        return <p className="text-sm leading-6 text-black/50">Nothing added yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
                <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect(row)}
                    className={[
                        'inline-flex min-h-9 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition',
                        row.id === selectedId
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black/58 hover:border-black hover:text-black',
                    ].join(' ')}
                >
                    {getLabel(row)}
                </button>
            ))}
        </div>
    );
}
