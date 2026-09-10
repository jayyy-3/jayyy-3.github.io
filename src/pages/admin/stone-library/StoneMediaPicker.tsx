import { useEffect, useState } from 'react';
import StoneDialog from '../../../features/stone-library/StoneDialog';
import { supabase } from '../../../lib/supabaseClient';
import { useAdminAuth } from '../../../lib/adminAuthHooks';
import { stoneApi } from '../../../lib/adminStoneApi';
import type { StoneMedia } from '../../../features/stone-library/stoneDraft';
export default function StoneMediaPicker({
  onSelect,
  onClose,
  onBusyChange,
}: {
  onSelect: (media: StoneMedia) => void;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { user } = useAdminAuth();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [media, setMedia] = useState<StoneMedia[]>([]);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError('');
    stoneApi<{ media: StoneMedia[]; hasMore: boolean }>(
      `?view=media&q=${encodeURIComponent(query)}&page=${page}`,
    )
      .then((result) => {
        if (active) {
          setMedia((old) => (page ? [...old, ...result.media] : result.media));
          setMore(result.hasMore);
        }
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [query, page, retry]);
  async function upload() {
    if (!file || !alt.trim() || !supabase || !user) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
        file.type,
      ) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError('Choose a JPG, PNG, WebP or AVIF image under 10 MB.');
      return;
    }
    setUploading(true);
    onBusyChange?.(true);
    setError('');
    const path = `stone-drafts/${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    try {
      const result = await supabase.storage
        .from('urblo-admin-media')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (result.error) throw result.error;
      const inserted = await supabase
        .from('media_assets')
        .insert({
          status: 'draft',
          source_kind: 'storage',
          bucket: 'urblo-admin-media',
          object_path: path,
          media_type: 'image',
          mime_type: file.type,
          size_bytes: file.size,
          alt: alt.trim(),
          created_by: user.id,
          updated_by: user.id,
        })
        .select('id')
        .single();
      let id = inserted.data?.id;
      if (!id) {
        const readback = await supabase
          .from('media_assets')
          .select('id')
          .eq('bucket', 'urblo-admin-media')
          .eq('object_path', path)
          .maybeSingle();
        id = readback.data?.id;
      }
      if (!id)
        throw new Error(
          `The private upload was retained, but its library record could not be confirmed. Ask an admin to inspect ${path} before uploading again.`,
        );
      const response = await stoneApi<{ media: StoneMedia[] }>(
        `?view=media&ids=${id}`,
      );
      if (!response.media[0]?.url)
        throw new Error(
          'The image is saved in Media, but its preview could not load. Search the library to select it.',
        );
      onSelect(response.media[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload could not complete.');
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }
  return (
    <StoneDialog
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      label="Choose a finish image"
      onClose={onClose}
      locked={uploading}
    >
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Choose a finish image</h2>
          <button
            disabled={uploading}
            onClick={onClose}
            className="stone-button"
          >
            Close
          </button>
        </div>
        <fieldset
          disabled={uploading}
          className="my-5 grid gap-3 rounded border bg-[#f5f6f2] p-4 sm:grid-cols-2"
        >
          <legend className="font-semibold">Upload a new image</legend>
          <input
            aria-label="Image file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            className="stone-input"
            aria-label="Image description"
            placeholder="Describe the stone and finish"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
          <p className="text-sm text-black/60">
            Uploads stay private until you publish the stone.
          </p>
          <button
            className="stone-button"
            disabled={!file || !alt.trim()}
            onClick={() => void upload()}
          >
            {uploading ? 'Uploading…' : 'Upload and select'}
          </button>
        </fieldset>
        <label className="block font-semibold">
          Search image library
          <input
            autoFocus
            className="stone-input mt-2"
            value={query}
            placeholder="Description or filename"
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        {error && (
          <div role="alert" className="my-3 text-red-800">
            {error}
            <button
              className="stone-button ml-3"
              onClick={() => setRetry((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {media.map((m) => (
            <button
              key={m.id}
              disabled={uploading || !m.url || !m.alt.trim()}
              onClick={() => onSelect(m)}
              className="overflow-hidden rounded border text-left hover:border-black"
            >
              <div className="aspect-square bg-black/5">
                {m.url && (
                  <img
                    src={m.url}
                    alt={m.alt}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="p-2 text-sm">
                {m.name}
                <span className="block text-xs text-black/50">
                  {m.status === 'draft' ? 'Private draft' : 'Published'}
                  {!m.alt.trim() ? ' · Add description in Media' : ''}
                </span>
              </p>
            </button>
          ))}
        </div>
        {busy && (
          <p role="status" className="py-4">
            Loading images…
          </p>
        )}
        {!busy && more && (
          <button
            className="stone-button mt-4"
            onClick={() => setPage((n) => n + 1)}
          >
            Load more images
          </button>
        )}
      </section>
    </StoneDialog>
  );
}
