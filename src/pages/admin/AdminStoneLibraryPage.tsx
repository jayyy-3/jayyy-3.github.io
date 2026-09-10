import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import {
  StoneApiError,
  StoneSaveQueue,
  stoneApi,
  type StoneWrite,
} from '../../lib/adminStoneApi';
import {
  emptyStone,
  emptyVariant,
  stoneDraftToDetail,
  stoneMediaIds,
  stoneSlug,
  type StoneDraft,
  type StoneEnvelope,
  type StoneFinishDefinition,
  type StoneListItem,
  type StoneMedia,
  type StoneReference,
} from '../../features/stone-library/stoneDraft';
import StoneDialog from '../../features/stone-library/StoneDialog';
import StoneHistoryDialog from './stone-library/StoneHistoryDialog';
import StoneMediaPicker from './stone-library/StoneMediaPicker';
import StonePageView from '../StonePageView';
import './stone-workspace.css';

export default function AdminStoneLibraryPage() {
  const { stoneId } = useParams();
  return (
    <RequireAdmin>
      {stoneId ? <StoneLoader key={stoneId} id={stoneId} /> : <StoneList />}
    </RequireAdmin>
  );
}
function StoneList() {
  const { profile } = useAdminAuth();
  const [stones, setStones] = useState<StoneListItem[]>([]);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    stoneApi<{ stones: StoneListItem[] }>()
      .then((r) => {
        if (active) setStones(r.stones);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const visible = stones.filter(
    (s) =>
      (history || (!s.isTest && s.status !== 'archived')) &&
      `${s.name} ${s.type}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AdminShell
      title="Stone Library"
      actions={
        profile?.role !== 'viewer' && (
          <Link
            className="stone-button stone-primary"
            to="/admin/stone-library/new"
          >
            Add stone
          </Link>
        )
      }
    >
      <div className="stone-workspace">
        <p className="mb-6 text-black/60">
          Edit your stones, preview changes and publish when they are ready.
          Saved drafts leave the website unchanged.
        </p>
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <label className="min-w-60 flex-1 font-semibold">
            Find a stone
            <input
              className="stone-input mt-2"
              placeholder="Search name or stone type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="py-3 text-sm">
            <input
              type="checkbox"
              checked={history}
              onChange={(e) => setHistory(e.target.checked)}
            />{' '}
            Include archived and historical records
          </label>
        </div>
        {loading && <p role="status">Loading stones…</p>}
        {error && (
          <div role="alert" className="stone-error">
            {error}
            <button
              className="stone-button ml-3"
              onClick={() => setRetry((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((s) => (
            <Link
              key={s.id}
              to={`/admin/stone-library/${s.id}`}
              className="group overflow-hidden rounded-lg border border-black/10 bg-white hover:border-black/50"
            >
              <div className="aspect-[16/9] bg-[#e8e9e2]">
                {s.cover ? (
                  <img
                    src={s.cover}
                    alt={s.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-black/45">
                    No finish image yet
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="stone-pill">
                    {s.isTest
                      ? 'Historical'
                      : s.status === 'published'
                        ? 'On website'
                        : s.status === 'archived'
                          ? 'Hidden'
                          : 'Draft'}
                  </span>
                  {s.hasChanges && (
                    <span className="stone-pill bg-amber-50">
                      Unpublished changes
                    </span>
                  )}
                  {s.availability === 'tbc' && (
                    <span className="stone-pill">Availability TBC</span>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{s.name}</h2>
                <p className="mt-1 text-sm text-black/55">
                  {s.type || 'Stone type needed'}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {!loading && !error && !visible.length && (
          <p className="py-10">No stones match this view.</p>
        )}
      </div>
    </AdminShell>
  );
}
function StoneLoader({ id }: { id: string }) {
  const [loaded, setLoaded] = useState<{
    envelope: StoneEnvelope | null;
    finishes: StoneFinishDefinition[];
  } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    Promise.all([
      stoneApi<{ finishes: StoneFinishDefinition[] }>('?view=finishes'),
      id === 'new'
        ? Promise.resolve(null)
        : stoneApi<StoneEnvelope>(`?stoneId=${encodeURIComponent(id)}`),
    ])
      .then(([f, envelope]) => {
        if (active) setLoaded({ envelope, finishes: f.finishes });
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  if (!loaded)
    return (
      <AdminShell title="Stone Library">
        <Link to="/admin/stone-library">← All stones</Link>
        {error ? (
          <div className="stone-error" role="alert">
            {error}
            <button
              className="stone-button"
              onClick={() => setRetry((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        ) : (
          <p role="status" className="mt-6">
            Opening stone…
          </p>
        )}
      </AdminShell>
    );
  return <StoneEditor initial={loaded.envelope} finishes={loaded.finishes} />;
}
function StoneEditor({
  initial,
  finishes,
}: {
  initial: StoneEnvelope | null;
  finishes: StoneFinishDefinition[];
}) {
  const { profile } = useAdminAuth();
  const readOnly = profile?.role === 'viewer';
  const navigate = useNavigate();
  const [queue] = useState(
    () =>
      new StoneSaveQueue(
        initial?.draft.variants.length
          ? initial.draft
          : initial
            ? {
                ...initial.draft,
                variants: [
                  { ...emptyVariant(finishes), slug: initial.draft.stone.slug },
                ],
              }
            : emptyStone(finishes),
        initial,
        (body) => stoneApi('', body),
      ),
  );
  const [, render] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mediaBusyRef = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [references, setReferences] = useState<StoneReference[]>([]);
  const [media, setMedia] = useState<StoneMedia[]>([]);
  const [picker, setPicker] = useState<{
    variant: string;
    finish: number;
  } | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewVariant, setPreviewVariant] = useState('');
  const [variantKey, setVariantKey] = useState(
    queue.draft.variants[0]?.key || '',
  );
  const [hideDialog, setHideDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const actionRef = useRef<StoneWrite | null>(null);
  const draft = queue.draft;
  const envelope = queue.envelope;
  const variant =
    draft.variants.find((v) => v.key === variantKey) || draft.variants[0];
  useEffect(() => {
    queue.onChange = () => {
      render((n) => n + 1);
      if (queue.state === 'saved') setMessage('');
    };
    return () => queue.dispose();
  }, [queue]);
  const id = envelope?.stoneId;
  useEffect(() => {
    if (
      !initial &&
      id &&
      !queue.dirty &&
      !busyRef.current &&
      !mediaBusyRef.current &&
      !picker &&
      !preview
    )
      navigate(`/admin/stone-library/${id}`, { replace: true });
  }, [initial, id, queue, queue.state, busy, picker, preview, navigate]);
  const mediaKey = stoneMediaIds(draft).join(',');
  useEffect(() => {
    let active = true;
    const load = () => {
      if (mediaKey)
        void stoneApi<{ media: StoneMedia[] }>(`?view=media&ids=${mediaKey}`)
          .then((r) => {
            if (active) setMedia(r.media);
          })
          .catch((e: Error) => {
            if (active) setError(e.message);
          });
    };
    load();
    const timer = setInterval(load, 45 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [mediaKey]);
  useEffect(() => {
    let active = true;
    if (id)
      void stoneApi<{ references: StoneReference[] }>(
        `?stoneId=${id}&view=usage`,
      )
        .then((r) => {
          if (active) setReferences(r.references);
        })
        .catch((e: Error) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [id, envelope?.liveVersion]);
  useEffect(() => {
    let bypass = false;
    let restoring = false;
    let afterRestore: (() => void) | null = null;
    const protectedUrl = window.location.href;
    const protectedIndex = window.history.state?.idx;
    const saveThen = async (action: () => void) => {
      if (busyRef.current || mediaBusyRef.current) {
        setMessage('Wait for the current action to finish.');
        return;
      }
      try {
        await queue.flush();
        action();
      } catch {
        setMessage(
          'Your changes are still here. Resolve the save before leaving this stone.',
        );
      }
    };
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (queue.dirty || busyRef.current || mediaBusyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const click = (e: MouseEvent) => {
      if (bypass || e.defaultPrevented) return;
      const target = e.target instanceof Element ? e.target : null;
      const anchor = target?.closest('a');
      const button = target?.closest('button');
      const sessionAction =
        button &&
        ['Sign out', 'Refresh'].includes(button.textContent?.trim() || '');
      if (!anchor && !sessionAction) return;
      if (
        anchor &&
        (anchor.target === '_blank' ||
          anchor.hasAttribute('download') ||
          e.metaKey ||
          e.ctrlKey)
      )
        return;
      if (!queue.dirty && !busyRef.current && !mediaBusyRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      void saveThen(() => {
        if (anchor) {
          const url = new URL(anchor.href);
          if (url.origin === location.origin)
            navigate(url.pathname + url.search + url.hash);
          else window.location.assign(url.href);
        } else {
          bypass = true;
          button?.click();
          bypass = false;
        }
      });
    };
    const pop = (e: PopStateEvent) => {
      if (restoring) {
        e.stopImmediatePropagation();
        restoring = false;
        afterRestore?.();
        afterRestore = null;
        return;
      }
      if (!queue.dirty && !busyRef.current && !mediaBusyRef.current) return;
      e.stopImmediatePropagation();
      const attempted = location.pathname + location.search + location.hash;
      const delta =
        typeof protectedIndex === 'number' && typeof e.state?.idx === 'number'
          ? protectedIndex - e.state.idx
          : 0;
      afterRestore = () => {
        void saveThen(() => navigate(attempted));
      };
      if (delta) {
        restoring = true;
        history.go(delta);
      } else {
        history.pushState(history.state, '', protectedUrl);
        afterRestore();
        afterRestore = null;
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
  }, [queue, navigate]);
  function edit(update: (next: StoneDraft) => void) {
    if (readOnly || busyRef.current || actionRef.current) return;
    const next = structuredClone(queue.draft);
    update(next);
    queue.change(next);
    setMessage('');
  }
  function stoneField(key: keyof StoneDraft['stone'], value: string) {
    edit((d) => {
      Object.assign(d.stone, { [key]: value });
      if (key === 'name' && !queue.envelope?.addressLocked) {
        d.stone.slug = stoneSlug(value);
        for (const v of d.variants)
          if (!v.id)
            v.slug =
              v.type === 'none'
                ? d.stone.slug
                : `${d.stone.slug}--${stoneSlug(v.label) || 'variant'}`;
      }
    });
  }
  async function act(action: 'publish' | 'archive') {
    setBusy(true);
    busyRef.current = true;
    setError('');
    setMessage('');
    try {
      await queue.flush();
      const e = queue.envelope;
      if (!e) throw new Error('Name and save this stone first.');
      const body = actionRef.current || {
        action,
        stoneId: e.stoneId,
        revision: e.revision,
        liveVersion: e.liveVersion,
        requestId: crypto.randomUUID(),
        draft: structuredClone(queue.draft),
      };
      actionRef.current = body;
      const next = await stoneApi<StoneEnvelope>('', body);
      actionRef.current = null;
      queue.accept(next);
      setHideDialog(false);
      setMessage(
        action === 'archive'
          ? 'Hidden from the website. The complete draft is kept for restoring.'
          : 'Published. Open the website to check your changes.',
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'The action could not complete.',
      );
      if (e instanceof StoneApiError) {
        if (e.references.length) setReferences(e.references);
        if (e.status >= 400 && e.status < 500) actionRef.current = null;
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }
  const previewDetail = stoneDraftToDetail(
    draft,
    finishes,
    media,
    previewVariant,
  );
  const saveLabel =
    queue.state === 'saved'
      ? envelope
        ? 'All changes saved'
        : 'Name your new stone to start'
      : queue.state === 'waiting'
        ? 'Waiting to save…'
        : queue.state === 'saving'
          ? 'Saving draft…'
          : 'Draft not saved';
  return (
    <AdminShell title={draft.stone.name || 'New stone'}>
      <div className="stone-workspace">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/admin/stone-library" className="font-semibold">
            ← All stones
          </Link>
          {id && (
            <button
              className="stone-button"
              onClick={() => setShowHistory(true)}
            >
              Previous versions
            </button>
          )}
          <span className="text-sm text-black/60">
            {readOnly
              ? 'View only'
              : envelope?.status === 'published'
                ? 'On website · edits stay in draft'
                : envelope?.status === 'archived'
                  ? 'Hidden · publish to restore'
                  : 'Draft · not on website'}
          </span>
        </div>
        <div className="stone-toolbar">
          <div role="status" aria-live="polite" className="mr-auto text-sm">
            {saveLabel}
          </div>
          <button
            className="stone-button"
            disabled={!previewDetail}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
          {envelope?.status === 'published' && (
            <a
              target="_blank"
              rel="noreferrer"
              className="stone-button"
              href={`/stone-library/${draft.stone.slug}`}
            >
              View website ↗
            </a>
          )}
          {!readOnly && (
            <>
              <button
                className="stone-button stone-primary"
                disabled={busy || envelope?.isTest || !!actionRef.current}
                onClick={() => void act('publish')}
              >
                {busy
                  ? 'Working…'
                  : envelope?.status === 'archived'
                    ? 'Restore and publish'
                    : 'Publish'}
              </button>
              {envelope && envelope.status !== 'archived' && (
                <button
                  className="stone-button"
                  disabled={busy || !!actionRef.current}
                  onClick={() => setHideDialog(true)}
                >
                  Hide from website
                </button>
              )}
            </>
          )}
        </div>
        {message && (
          <p className="stone-notice" role="status">
            {message}
          </p>
        )}
        {(error || queue.error) && (
          <div className="stone-error" role="alert">
            <p>{error || queue.error?.message}</p>
            {queue.error && (
              <button
                className="stone-button mt-3"
                onClick={() => void queue.flush().catch(() => {})}
              >
                Retry save
              </button>
            )}
            {actionRef.current && (
              <button
                className="stone-button mt-3"
                onClick={() =>
                  void act(actionRef.current!.action as 'publish' | 'archive')
                }
              >
                Check previous result
              </button>
            )}
            {queue.error instanceof StoneApiError &&
              queue.error.code === 'conflict' && (
                <>
                  <button
                    className="stone-button ml-2"
                    onClick={() => {
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(queue.draft, null, 2)], {
                          type: 'application/json',
                        }),
                      );
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'stone-draft.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download my edits
                  </button>
                  <p className="mt-2 text-sm">
                    Keep a copy of your edits, then reload to review the other
                    editor’s version. Your changes have not overwritten theirs.
                  </p>
                </>
              )}
          </div>
        )}
        <fieldset
          disabled={readOnly || busy || !!actionRef.current}
          className="min-w-0 space-y-6 border-0 p-0"
        >
          <section className="stone-section">
            <h2>1. Basic information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                Stone name
                <input
                  className="stone-input"
                  value={draft.stone.name}
                  onChange={(e) => stoneField('name', e.target.value)}
                />
              </label>
              <label>
                Stone type
                <input
                  className="stone-input"
                  placeholder="e.g. Granite"
                  value={draft.stone.type}
                  onChange={(e) => stoneField('type', e.target.value)}
                />
              </label>
              <label>
                Availability
                <select
                  className="stone-input"
                  value={draft.stone.availability}
                  onChange={(e) => stoneField('availability', e.target.value)}
                >
                  <option value="active">Available for project sourcing</option>
                  <option value="tbc">Upcoming · to be confirmed</option>
                </select>
              </label>
              <div>
                <p className="font-semibold">Website address</p>
                <p className="mt-3 break-all text-sm text-black/60">
                  /stone-library/{draft.stone.slug || 'stone-name'}
                </p>
                <p className="mt-1 text-xs text-black/50">
                  {envelope?.addressLocked
                    ? 'Fixed to preserve existing links.'
                    : 'Created from the name; fixed after first publication.'}
                </p>
              </div>
              <label className="sm:col-span-2">
                Introduction
                <textarea
                  className="stone-input min-h-24"
                  value={draft.stone.summary}
                  onChange={(e) => stoneField('summary', e.target.value)}
                />
              </label>
            </div>
            <details className="mt-5">
              <summary>Advanced information</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    'sourceName',
                    'originRegion',
                    'originCountry',
                    'pricingNote',
                    'internalNote',
                  ] as const
                ).map((key) => (
                  <label key={key}>
                    {
                      {
                        sourceName: 'Internal source name',
                        originRegion: 'Origin region (internal)',
                        originCountry: 'Origin country (internal)',
                        pricingNote: 'Public pricing note',
                        internalNote: 'Internal notes',
                      }[key]
                    }
                    <input
                      className="stone-input"
                      value={draft.stone[key]}
                      onChange={(e) => stoneField(key, e.target.value)}
                    />
                  </label>
                ))}
                <label>
                  Price tier
                  <select
                    className="stone-input"
                    value={draft.stone.priceTier || ''}
                    onChange={(e) =>
                      edit((d) => {
                        d.stone.priceTier = e.target.value
                          ? (Number(e.target.value) as 1 | 2 | 3)
                          : null;
                      })
                    }
                  >
                    <option value="">On request</option>
                    <option value="1">Budget</option>
                    <option value="2">Balanced</option>
                    <option value="3">Premium</option>
                  </select>
                </label>
                {(['blockLength', 'blockWidth', 'blockHeight'] as const).map(
                  (key) => (
                    <label key={key}>
                      {key.replace('block', 'Block ')} (mm)
                      <input
                        type="number"
                        min="1"
                        className="stone-input"
                        value={draft.stone[key] || ''}
                        onChange={(e) =>
                          edit((d) => {
                            d.stone[key] = e.target.value
                              ? Number(e.target.value)
                              : null;
                          })
                        }
                      />
                    </label>
                  ),
                )}
              </div>
            </details>
          </section>
          <section className="stone-section">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2>2. Variants & cut direction</h2>
              <button
                className="stone-button"
                onClick={() => {
                  const v = emptyVariant(finishes, 'shade');
                  v.label = `Variant ${draft.variants.length + 1}`;
                  v.slug = `${draft.stone.slug || 'stone'}--${stoneSlug(v.label)}`;
                  edit((d) => {
                    d.variants.push(v);
                  });
                  setVariantKey(v.key);
                }}
              >
                Add variant
              </button>
            </div>
            <p className="mb-4 text-sm text-black/60">
              Use Standard for a single stone. Add a variant only for a distinct
              shade or cut direction.
            </p>
            <div className="flex flex-wrap gap-2">
              {draft.variants.map((v) => (
                <button
                  key={v.key}
                  className={`stone-button ${variant?.key === v.key ? 'stone-primary' : ''}`}
                  onClick={() => setVariantKey(v.key)}
                >
                  {v.label || 'Standard'}
                  {!v.enabled ? ' · Disabled' : ''}
                </button>
              ))}
            </div>
            {variant && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label>
                  Variant name
                  <input
                    className="stone-input"
                    value={variant.label}
                    onChange={(e) =>
                      edit((d) => {
                        const v = d.variants.find(
                          (x) => x.key === variant.key,
                        )!;
                        v.label = e.target.value;
                        if (!v.id)
                          v.slug = `${d.stone.slug}--${stoneSlug(v.label) || 'variant'}`;
                      })
                    }
                  />
                </label>
                <label>
                  Variant type
                  <select
                    className="stone-input"
                    value={variant.type}
                    onChange={(e) =>
                      edit((d) => {
                        d.variants.find((x) => x.key === variant.key)!.type = e
                          .target.value as 'shade' | 'cut_orientation' | 'none';
                      })
                    }
                  >
                    <option value="none">Standard</option>
                    <option value="shade">Shade</option>
                    <option value="cut_orientation">Cut direction</option>
                  </select>
                </label>
                <label className="self-end py-3">
                  <input
                    type="checkbox"
                    checked={variant.enabled}
                    onChange={(e) =>
                      edit((d) => {
                        d.variants.find((x) => x.key === variant.key)!.enabled =
                          e.target.checked;
                      })
                    }
                  />{' '}
                  Enabled on website
                </label>
              </div>
            )}
          </section>
          <section className="stone-section">
            <h2>
              3. Finishes & images {variant?.label ? `· ${variant.label}` : ''}
            </h2>
            <p className="mb-5 text-sm text-black/60">
              Keep each finish with its own photographs. Missing photographs
              appear as missing images on the website.
            </p>
            {variant?.finishes.map((finish) => {
              const definition = finishes.find(
                (f) => f.id === finish.definitionId,
              );
              const update = (fn: (f: typeof finish) => void) =>
                edit((d) => {
                  fn(
                    d.variants
                      .find((v) => v.key === variant.key)!
                      .finishes.find(
                        (f) => f.definitionId === finish.definitionId,
                      )!,
                  );
                });
              return (
                <details
                  className="stone-finish"
                  key={`${variant.key}-${finish.definitionId}`}
                  open={finish.capability !== 'no'}
                >
                  <summary>
                    {definition?.name || 'Finish'}{' '}
                    <span className="ml-2 text-xs font-normal text-black/50">
                      {finish.capability === 'no'
                        ? 'Not offered'
                        : finish.capability === 'tbc'
                          ? 'To be confirmed'
                          : 'Available'}{' '}
                      · {finish.images.length} images
                    </span>
                  </summary>
                  <div className="mt-4 space-y-4">
                    <label>
                      Finish availability
                      <select
                        className="stone-input max-w-sm"
                        value={finish.capability}
                        onChange={(e) =>
                          update((f) => {
                            f.capability = e.target.value as
                              'yes' | 'no' | 'tbc';
                          })
                        }
                      >
                        <option value="no">Not offered</option>
                        <option value="yes">Available</option>
                        <option value="tbc">To be confirmed</option>
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {finish.images.map((image, index) => {
                        const asset = media.find(
                          (m) => m.id === image.mediaAssetId,
                        );
                        return (
                          <div
                            key={image.key}
                            className="overflow-hidden rounded border"
                          >
                            <div className="aspect-[4/3] bg-black/5">
                              {asset?.url ? (
                                <img
                                  src={asset.url}
                                  alt={asset.alt}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <p className="p-4 text-sm">
                                  Preview unavailable
                                </p>
                              )}
                            </div>
                            <div className="space-y-2 p-3">
                              <select
                                className="stone-input"
                                aria-label={`Image ${index + 1} role`}
                                value={image.role}
                                onChange={(e) =>
                                  update((f) => {
                                    const role = e.target
                                      .value as typeof image.role;
                                    if (role === 'primary')
                                      for (const i of f.images)
                                        if (i.role === 'primary')
                                          i.role = 'secondary';
                                    f.images[index].role = role;
                                  })
                                }
                              >
                                <option value="primary">Main image</option>
                                <option value="secondary">
                                  Additional image
                                </option>
                                <option value="detail">Detail</option>
                                <option value="swatch">Swatch</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  className="stone-button"
                                  aria-label={`Move image ${index + 1} earlier`}
                                  disabled={index === 0}
                                  onClick={() =>
                                    update((f) => {
                                      [f.images[index - 1], f.images[index]] = [
                                        f.images[index],
                                        f.images[index - 1],
                                      ];
                                    })
                                  }
                                >
                                  ←
                                </button>
                                <button
                                  className="stone-button"
                                  aria-label={`Move image ${index + 1} later`}
                                  disabled={index === finish.images.length - 1}
                                  onClick={() =>
                                    update((f) => {
                                      [f.images[index + 1], f.images[index]] = [
                                        f.images[index],
                                        f.images[index + 1],
                                      ];
                                    })
                                  }
                                >
                                  →
                                </button>
                                <button
                                  className="stone-button"
                                  onClick={() =>
                                    update((f) => {
                                      f.images.splice(index, 1);
                                    })
                                  }
                                >
                                  Unlink image
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className="min-h-36 rounded border border-dashed border-black/30 p-5 text-sm font-semibold hover:bg-black/5"
                        onClick={() =>
                          setPicker({
                            variant: variant.key,
                            finish: finish.definitionId,
                          })
                        }
                      >
                        + Add or upload image
                      </button>
                    </div>
                    <label className="block">
                      Public finish description
                      <textarea
                        className="stone-input"
                        value={finish.behaviorNote}
                        onChange={(e) =>
                          update((f) => {
                            f.behaviorNote = e.target.value;
                          })
                        }
                      />
                    </label>
                    <details>
                      <summary>Internal sources & notes</summary>
                      <label className="mt-3 block">
                        Sources (one per line)
                        <textarea
                          className="stone-input"
                          value={finish.sources.join('\n')}
                          onChange={(e) =>
                            update((f) => {
                              f.sources = e.target.value.split('\n');
                            })
                          }
                        />
                      </label>
                      <label className="block">
                        Internal note
                        <textarea
                          className="stone-input"
                          value={finish.internalNote}
                          onChange={(e) =>
                            update((f) => {
                              f.internalNote = e.target.value;
                            })
                          }
                        />
                      </label>
                    </details>
                  </div>
                </details>
              );
            })}
          </section>
        </fieldset>
        <section className="stone-section mt-6">
          <h2>4. Used in</h2>
          <p className="mb-4 text-sm text-black/60">
            Website references must be updated before hiding a stone or
            disabling a referenced finish. Drafts and historical sample requests
            are retained.
          </p>
          {references.length ? (
            <ul className="divide-y">
              {references.map((r, index) => (
                <li
                  key={`${r.module}-${r.id}-${index}`}
                  className="flex flex-wrap justify-between gap-3 py-3"
                >
                  <Link to={r.path} className="font-semibold underline">
                    {r.name}
                  </Link>
                  <span className="text-sm text-black/60">
                    {r.module} ·{' '}
                    {r.live
                      ? 'On website'
                      : r.source === 'history'
                        ? 'History'
                        : 'Draft'}
                    {r.finishId
                      ? ` · ${finishes.find((f) => f.id === r.finishId)?.name || 'Finish'}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">
              {id
                ? 'No linked content found.'
                : 'References appear after the first save.'}
            </p>
          )}
        </section>
        {showHistory && id && (
          <StoneHistoryDialog
            stoneId={id}
            finishes={finishes}
            onClose={() => setShowHistory(false)}
          />
        )}
        {picker && (
          <StoneMediaPicker
            onBusyChange={(value) => {
              mediaBusyRef.current = value;
            }}
            onClose={() => setPicker(null)}
            onSelect={(asset) => {
              setMedia((old) => [
                ...old.filter((m) => m.id !== asset.id),
                asset,
              ]);
              edit((d) => {
                const f = d.variants
                  .find((v) => v.key === picker.variant)!
                  .finishes.find((f) => f.definitionId === picker.finish)!;
                f.images.push({
                  key: crypto.randomUUID(),
                  id: null,
                  mediaAssetId: asset.id,
                  role: f.images.some((i) => i.role === 'primary')
                    ? 'secondary'
                    : 'primary',
                });
              });
              setPicker(null);
            }}
          />
        )}
        {preview && previewDetail && (
          <StoneDialog
            label="Stone website preview"
            onClose={() => setPreview(false)}
            className="fixed inset-0 z-[70] overflow-y-auto bg-white"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-black px-6 py-3 text-white">
              <p>
                Draft preview ·{' '}
                {queue.dirty ? 'includes unsaved changes' : 'saved draft'}
              </p>
              <button
                className="stone-button bg-white text-black"
                onClick={() => setPreview(false)}
              >
                Back to editor
              </button>
            </div>
            <StonePageView
              preview
              detail={previewDetail}
              onVariantChange={setPreviewVariant}
            />
          </StoneDialog>
        )}
        {hideDialog && (
          <StoneDialog
            label="Hide stone"
            onClose={() => setHideDialog(false)}
            locked={busy}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-5"
          >
            <section className="w-full max-w-lg rounded-lg bg-white p-6">
              <h2 className="text-2xl">Hide {draft.stone.name}?</h2>
              <p className="my-4">
                The website page will no longer be available. Your draft and
                history will remain. Linked public pages must be updated first.
              </p>
              {references
                .filter((r) => r.live)
                .map((r, i) => (
                  <p key={i} className="py-1 text-red-800">
                    {r.module}: {r.name}
                  </p>
                ))}
              {error && (
                <p className="stone-error" role="alert">
                  {error}
                </p>
              )}
              <div className="mt-5 flex gap-3">
                <button
                  className="stone-button"
                  disabled={busy}
                  onClick={() => setHideDialog(false)}
                >
                  Keep editing
                </button>
                <button
                  className="stone-button stone-primary"
                  disabled={busy}
                  onClick={() => void act('archive')}
                >
                  {busy ? 'Checking…' : 'Hide stone'}
                </button>
              </div>
            </section>
          </StoneDialog>
        )}
      </div>
    </AdminShell>
  );
}
