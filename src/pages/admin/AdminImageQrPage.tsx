import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  Archive,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileImage,
  FileUp,
  ImagePlus,
  Pencil,
  RotateCcw,
  Search,
  UploadCloud,
  X,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import {
  formatImageBytes,
  imageNameFromFile,
  optimizeImageForQr,
  type OptimizedQrImage,
} from '../../lib/imageQrOptimization';
import { supabase } from '../../lib/supabaseClient';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

const endpoint = '/api/admin/image-qr';
const privateMediaBucket = 'urblo-admin-media';

type ResourceStatus = 'active' | 'hidden';
type ResourceFilter = 'all' | ResourceStatus;
type ResourceSort = 'newest' | 'name';

interface ImageQrResource {
  id: string;
  slug: string;
  name: string;
  status: ResourceStatus;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  previewUrl: string;
}

interface UploadQueueItem {
  id: string;
  fileName: string;
  name: string;
  state: 'optimizing' | 'uploading' | 'done' | 'error';
  originalBytes: number;
  optimizedBytes: number | null;
  message: string | null;
}

interface ApiPayload {
  resource?: ImageQrResource;
  resources?: ImageQrResource[];
  warning?: string | null;
  message?: string;
  error?: string;
}

export default function AdminImageQrPage() {
  return (
    <RequireAdmin>
      <AdminImageQrContent />
    </RequireAdmin>
  );
}

function AdminImageQrContent() {
  const { profile, user } = useAdminAuth();
  const canEdit = Boolean(profile && profile.role !== 'viewer');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resources, setResources] = useState<ImageQrResource[]>([]);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ResourceFilter>('all');
  const [sort, setSort] = useState<ResourceSort>('newest');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await imageQrRequest({ method: 'GET' });
      setResources(payload.resources ?? []);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const counts = useMemo(
    () => ({
      all: resources.length,
      active: resources.filter((resource) => resource.status === 'active').length,
      hidden: resources.filter((resource) => resource.status === 'hidden').length,
    }),
    [resources],
  );

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = resources.filter((resource) => {
      if (filter !== 'all' && resource.status !== filter) return false;
      return !query || [resource.name, resource.slug].some((value) => value.toLowerCase().includes(query));
    });
    return [...matches].sort((left, right) => (
      sort === 'name'
        ? left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
        : new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ));
  }, [filter, resources, search, sort]);

  const selectedResource = selectedResourceId
    ? resources.find((resource) => resource.id === selectedResourceId) ?? null
    : null;

  async function acceptFiles(files: File[]) {
    if (!canEdit || !user || !files.length || isUploading) return;
    setIsUploading(true);
    setError(null);
    setNotice(null);
    const knownNames = new Set(resources.map((resource) => resource.name.trim().toLowerCase()));
    const queued = files.map<UploadQueueItem>((file) => {
      const name = imageNameFromFile(file.name);
      const duplicate = knownNames.has(name.toLowerCase());
      knownNames.add(name.toLowerCase());
      return {
        id: crypto.randomUUID(),
        fileName: file.name,
        name,
        state: duplicate ? 'error' : 'optimizing',
        originalBytes: file.size,
        optimizedBytes: null,
        message: duplicate ? `“${name}” already exists. Use Replace from its details.` : `Preparing as “${name}”…`,
      };
    });
    setQueue(queued);

    let completed = 0;
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const queuedItem = queued[index];
      if (queuedItem.state === 'error') continue;
      try {
        const optimized = await optimizeImageForQr(file);
        updateQueueItem(setQueue, queuedItem.id, {
          state: 'uploading',
          optimizedBytes: optimized.optimizedBytes,
          message: 'Uploading and creating QR…',
        });
        const resource = await createImageResource(user.id, queuedItem.name, optimized);
        setResources((current) => [resource, ...current.filter((item) => item.id !== resource.id)]);
        updateQueueItem(setQueue, queuedItem.id, {
          state: 'done',
          optimizedBytes: optimized.optimizedBytes,
          message: 'Ready',
        });
        completed += 1;
      } catch (uploadError) {
        updateQueueItem(setQueue, queuedItem.id, {
          state: 'error',
          message: errorMessage(uploadError),
        });
      }
    }
    setIsUploading(false);
    if (completed) setNotice(`${completed} ${completed === 1 ? 'image is' : 'images are'} ready with QR codes.`);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    void acceptFiles(files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void acceptFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function updateResource(resource: ImageQrResource) {
    setResources((current) => current.map((item) => (item.id === resource.id ? resource : item)));
  }

  return (
    <AdminShell
      title="Image QR"
      eyebrow="Shareable images"
      actions={
        canEdit ? (
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={primaryButton}>
            <ImagePlus className="h-4 w-4" />
            Add images
          </button>
        ) : null
      }
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="grid gap-4 border border-black/10 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:p-5">
          <div className="max-w-2xl">
            <p className="text-base font-semibold text-black">One image, one permanent QR</p>
            <p className="mt-1 text-sm leading-6 text-black/55">
              Urblo optimizes large files without crushing the detail. Replacing an image later keeps the same QR.
            </p>
          </div>
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (canEdit && !isUploading) setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={[
              'flex min-h-24 items-center justify-center gap-4 border border-dashed px-5 text-left transition',
              isDragging ? 'border-black bg-[rgba(0,255,25,0.1)]' : 'border-black/20 bg-[#f7f8f4]',
              !canEdit ? 'opacity-55' : '',
            ].join(' ')}
            data-testid="image-qr-dropzone"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-white">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-black">Drop several images here</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!canEdit || isUploading} className="mt-1 text-xs font-bold uppercase tracking-[0.12em] underline underline-offset-4 disabled:text-black/30">
                {isUploading ? 'Working…' : 'Choose files'}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileInput}
            className="sr-only"
            tabIndex={-1}
          />
        </section>

        {queue.length ? <UploadQueue items={queue} onClear={() => setQueue([])} /> : null}
        {error ? <Message tone="error">{error}</Message> : null}
        {notice ? <Message tone="success">{notice}</Message> : null}

        <section className="border border-black/10 bg-white">
          <div className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[minmax(260px,1fr)_auto_auto] lg:items-center lg:p-5">
            <label className="relative block max-w-xl">
              <span className="sr-only">Search Image QR resources</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search images" className={`${inputClass} pl-10`} />
            </label>
            <div className="flex flex-wrap gap-2" aria-label="Filter Image QR resources">
              {(['all', 'active', 'hidden'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={filter === value ? activeFilterButton : filterButton}>
                  {value === 'all' ? 'All' : value === 'active' ? 'Ready' : 'Hidden'} {counts[value]}
                </button>
              ))}
            </div>
            <label className="flex min-h-9 items-center gap-2 text-xs font-semibold text-black/55">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as ResourceSort)} className="min-h-9 rounded border border-black/15 bg-white px-2 text-xs font-semibold text-black outline-none focus:border-black">
                <option value="newest">Newest</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <EmptyState title="Loading Image QR…" detail="Getting the current image resources." />
          ) : filteredResources.length ? (
            <div>
              <div className="hidden grid-cols-[96px_minmax(0,1fr)_150px_110px_28px] gap-4 border-b border-black/10 bg-[#f7f8f4] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/42 md:grid">
                <span>Image</span><span>Name</span><span>Updated</span><span>Status</span><span />
              </div>
              <div className="divide-y divide-black/10">
                {filteredResources.map((resource) => (
                  <ImageQrRow key={resource.id} resource={resource} onOpen={() => setSelectedResourceId(resource.id)} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title={resources.length ? 'No matching images' : 'No Image QR resources yet'}
              detail={resources.length ? 'Try a different search or filter.' : 'Add one or several images to create the first QR codes.'}
            />
          )}
        </section>
      </div>

      {selectedResource ? (
        <ImageQrDetails
          resource={selectedResource}
          userId={user?.id ?? null}
          canEdit={canEdit}
          onClose={() => setSelectedResourceId(null)}
          onUpdate={updateResource}
          onError={setError}
          onNotice={setNotice}
        />
      ) : null}
    </AdminShell>
  );
}

function ImageQrRow({ resource, onOpen }: { resource: ImageQrResource; onOpen: () => void }) {
  const isActive = resource.status === 'active';
  return (
    <button type="button" onClick={onOpen} className="grid w-full gap-3 px-4 py-3 text-left transition hover:bg-[#f7f8f4] focus-visible:bg-[#f7f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black md:grid-cols-[96px_minmax(0,1fr)_150px_110px_28px] md:items-center md:gap-4 md:px-5">
      <span className="block aspect-[4/3] w-24 overflow-hidden bg-[#eceee8]">
        <img src={resource.previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-black md:text-base">{resource.name}</span>
        <span className="mt-1 block text-xs text-black/46">{resource.width} × {resource.height} · {formatImageBytes(resource.sizeBytes)}</span>
      </span>
      <span className="hidden text-xs text-black/52 md:block">{formatUpdatedDate(resource.updatedAt)}</span>
      <span className="flex items-center gap-2 text-xs font-semibold text-black/60">
        <span className={isActive ? 'h-2 w-2 rounded-full bg-[#00e619]' : 'h-2 w-2 rounded-full bg-black/35'} />
        {isActive ? 'Ready' : 'Hidden'}
      </span>
      <ChevronRight className="hidden h-4 w-4 text-black/35 md:block" />
    </button>
  );
}

function ImageQrDetails({
  resource,
  userId,
  canEdit,
  onClose,
  onUpdate,
  onError,
  onNotice,
}: {
  resource: ImageQrResource;
  userId: string | null;
  canEdit: boolean;
  onClose: () => void;
  onUpdate: (resource: ImageQrResource) => void;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
}) {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(resource.name);
  const [isBusy, setIsBusy] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => setName(resource.name), [resource.name]);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function runAction(action: 'rename' | 'hide' | 'restore', extra: Record<string, unknown> = {}) {
    setIsBusy(true);
    onError(null);
    try {
      const payload = await imageQrRequest({
        method: 'POST',
        body: JSON.stringify({ action, id: resource.id, ...extra }),
      });
      if (!payload.resource) throw new Error('The updated resource was not returned.');
      onUpdate(payload.resource);
      setIsRenaming(false);
      onNotice(action === 'rename' ? 'Image name updated.' : action === 'hide' ? 'QR hidden. Existing scans now stop safely.' : 'QR restored and ready to scan.');
    } catch (actionError) {
      onError(errorMessage(actionError));
    } finally {
      setIsBusy(false);
    }
  }

  async function replaceImage(file: File | null) {
    if (!file || !userId || !canEdit) return;
    setIsBusy(true);
    onError(null);
    onNotice(null);
    try {
      const optimized = await optimizeImageForQr(file);
      const upload = await uploadPrivateOptimizedImage(userId, optimized);
      const payload = await imageQrRequest({
        method: 'POST',
        body: JSON.stringify({ action: 'replace', id: resource.id, upload }),
      });
      if (!payload.resource) throw new Error('The replacement resource was not returned.');
      onUpdate(payload.resource);
      onNotice(`Image replaced. The QR is unchanged. ${formatImageBytes(optimized.originalBytes)} → ${formatImageBytes(optimized.optimizedBytes)}.`);
    } catch (replaceError) {
      onError(errorMessage(replaceError));
    } finally {
      setIsBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(resource.imageUrl);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  const isActive = resource.status === 'active';
  return (
    <div className="fixed inset-0 z-[70] bg-black/30" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="image-qr-details-title" className="ml-auto flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-[#f5f6f2] shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-black/42">Image details</p>
            <h2 id="image-qr-details-title" className="mt-1 max-w-[400px] truncate text-lg font-semibold text-black">{resource.name}</h2>
          </div>
          <button type="button" onClick={onClose} className={iconButton} aria-label="Close image details"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <article className="border border-black/10 bg-white p-4 sm:p-5">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#eceee8]">
              <img src={resource.previewUrl} alt="" className="h-full w-full object-contain" />
              <span className={isActive ? activeStatus : hiddenStatus}>{isActive ? 'Ready' : 'Hidden'}</span>
            </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <div className="flex gap-2">
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} className={inputClass} autoFocus />
              <button type="button" disabled={isBusy || !name.trim()} onClick={() => void runAction('rename', { name: name.trim() })} className={iconButton} aria-label="Save image name"><Check className="h-4 w-4" /></button>
              <button type="button" disabled={isBusy} onClick={() => { setName(resource.name); setIsRenaming(false); }} className={iconButton} aria-label="Cancel rename"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-black">{resource.name}</h3>
              {canEdit ? <button type="button" onClick={() => setIsRenaming(true)} className="shrink-0 text-black/40 transition hover:text-black" aria-label={`Rename ${resource.name}`}><Pencil className="h-4 w-4" /></button> : null}
            </div>
          )}
          <p className="mt-1 text-xs text-black/46">{resource.width} × {resource.height} · {formatImageBytes(resource.sizeBytes)}</p>
        </div>
      </div>

      {isActive ? (
        <div className="mt-5 grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-[152px_minmax(0,1fr)] sm:items-center">
          <QrDownload value={resource.imageUrl} name={resource.name} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Permanent image link</p>
            <p className="mt-2 truncate text-xs text-black/52">{resource.imageUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void copyLink()} className={secondaryButton}>
                {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copyState === 'copied' ? 'Copied' : 'Copy link'}
              </button>
              <a href={resource.imageUrl} target="_blank" rel="noreferrer" className={secondaryButton}><ExternalLink className="h-4 w-4" />Open image</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 border-t border-black/10 pt-5 text-sm leading-6 text-black/55">
          This QR is paused. Restore it whenever the image should be available again.
        </div>
      )}

      {canEdit ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-black/10 pt-4">
          <button type="button" onClick={() => replaceInputRef.current?.click()} disabled={isBusy} className={secondaryButton}>
            <FileUp className="h-4 w-4" />{isBusy ? 'Working…' : 'Replace image'}
          </button>
          <input ref={replaceInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={(event) => { const file = event.target.files?.[0] ?? null; event.target.value = ''; void replaceImage(file); }} />
          <button type="button" onClick={() => void runAction(isActive ? 'hide' : 'restore')} disabled={isBusy} className={secondaryButton}>
            {isActive ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {isActive ? 'Hide QR' : 'Restore QR'}
          </button>
        </div>
      ) : null}
          </article>
        </div>
      </aside>
    </div>
  );
}

function QrDownload({ value, name }: { value: string; name: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileName = safeDownloadName(name);

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${fileName}-qr.svg`);
  }

  function downloadPng() {
    canvasRef.current?.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${fileName}-qr.png`);
    }, 'image/png');
  }

  return (
    <div>
      <div className="relative w-fit border border-black/10 bg-white p-2">
        <QRCodeSVG ref={svgRef} value={value} size={132} level="H" marginSize={3} title={`${name} QR code`} />
        <QRCodeCanvas
          ref={canvasRef}
          value={value}
          size={1024}
          level="H"
          marginSize={4}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          style={{ width: 1, height: 1 }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={downloadPng} className={miniButton}><Download className="h-3.5 w-3.5" />PNG</button>
        <button type="button" onClick={downloadSvg} className={miniButton}><Download className="h-3.5 w-3.5" />SVG</button>
      </div>
    </div>
  );
}

function UploadQueue({ items, onClear }: { items: UploadQueueItem[]; onClear: () => void }) {
  const isComplete = items.every((item) => item.state === 'done' || item.state === 'error');
  return (
    <section className="border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/48">Upload progress</p>
        {isComplete ? <button type="button" onClick={onClear} className="text-xs font-semibold text-black/55 underline underline-offset-4">Clear</button> : null}
      </div>
      <div className="divide-y divide-black/10">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center">
            <span className={item.state === 'done' ? 'text-emerald-700' : item.state === 'error' ? 'text-red-600' : 'text-black/50'}>
              {item.state === 'done' ? <Check className="h-5 w-5" /> : item.state === 'error' ? <X className="h-5 w-5" /> : <UploadCloud className="h-5 w-5 animate-pulse" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">{item.fileName}</p>
              <p className={item.state === 'error' ? 'mt-1 text-xs text-red-700' : 'mt-1 text-xs text-black/48'}>{item.message}</p>
            </div>
            <p className="text-xs font-semibold text-black/52">
              {formatImageBytes(item.originalBytes)}{item.optimizedBytes !== null ? ` → ${formatImageBytes(item.optimizedBytes)}` : ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

async function createImageResource(userId: string, name: string, optimized: OptimizedQrImage) {
  const upload = await uploadPrivateOptimizedImage(userId, optimized);
  const payload = await imageQrRequest({
    method: 'POST',
    body: JSON.stringify({ action: 'create', name, upload }),
  });
  if (!payload.resource) throw new Error('The new QR resource was not returned.');
  return payload.resource;
}

async function uploadPrivateOptimizedImage(userId: string, optimized: OptimizedQrImage) {
  if (!supabase) throw new Error('Your admin session is not available.');
  const extension = optimized.file.type === 'image/jpeg' ? 'jpg' : optimized.file.type.split('/')[1];
  const objectPath = `image-qr-drafts/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(privateMediaBucket).upload(objectPath, optimized.file, {
    cacheControl: '3600',
    contentType: optimized.file.type,
    upsert: false,
  });
  if (error) throw new Error('The optimized image could not be uploaded. Check your connection and try again.');
  return {
    objectPath,
    mimeType: optimized.file.type,
    width: optimized.width,
    height: optimized.height,
    sizeBytes: optimized.optimizedBytes,
  };
}

async function imageQrRequest(init: RequestInit) {
  if (!supabase) throw new Error('Your admin session is not available. Sign in again.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Your session has expired. Sign in again.');
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  let payload: ApiPayload = {};
  try {
    payload = (await response.json()) as ApiPayload;
  } catch {
    if (!response.ok) throw new Error('Image QR returned an unreadable response.');
  }
  if (!response.ok) throw new Error(payload.message || payload.error || 'Image QR could not complete that request.');
  return payload;
}

function updateQueueItem(
  setter: React.Dispatch<React.SetStateAction<UploadQueueItem[]>>,
  id: string,
  changes: Partial<UploadQueueItem>,
) {
  setter((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-black text-white"><FileImage className="h-5 w-5" /></span>
        <h3 className="mt-4 text-lg font-semibold text-black">{title}</h3>
        <p className="mt-2 text-sm text-black/52">{detail}</p>
      </div>
    </div>
  );
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return <div className={tone === 'error' ? 'border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800' : 'border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'}>{children}</div>;
}

function safeDownloadName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'urblo-image';
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
}

const inputClass = 'min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10';
const primaryButton = 'inline-flex min-h-10 items-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#33363f] disabled:bg-black/25';
const secondaryButton = 'inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/30';
const iconButton = 'grid min-h-11 min-w-11 place-items-center rounded border border-black/15 bg-white text-black transition hover:border-black disabled:text-black/30';
const miniButton = 'inline-flex min-h-8 items-center justify-center gap-1 rounded border border-black/15 bg-white px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black hover:border-black';
const filterButton = 'min-h-9 rounded border border-black/10 bg-white px-3 text-xs font-bold uppercase tracking-[0.1em] text-black/55 transition hover:border-black/30';
const activeFilterButton = 'min-h-9 rounded border border-black bg-black px-3 text-xs font-bold uppercase tracking-[0.1em] text-white';
const activeStatus = 'absolute right-3 top-3 rounded-full bg-[rgba(0,255,25,0.9)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black';
const hiddenStatus = 'absolute right-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white';
