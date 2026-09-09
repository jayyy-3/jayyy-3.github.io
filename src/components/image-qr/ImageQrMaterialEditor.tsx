import { useEffect, useState } from 'react';
import { loadQrMaterial } from '../../service/ImageQrService';
import type { QrMaterialDetail } from '../../service/ImageQrService';
import type { QrMaterialOption, QrMaterialSelection } from '../../types/image-qr';

const inputClass = 'mt-1.5 min-h-11 w-full rounded-[3px] border border-black/20 bg-white px-3 py-2 text-sm disabled:bg-black/5';
const same = (a: QrMaterialSelection, b: QrMaterialSelection) => a.stoneGroupId === b.stoneGroupId && a.stoneVariantId === b.stoneVariantId && a.finishKey === b.finishKey;

export default function ImageQrMaterialEditor({ selection: saved, isDefault, canEdit, loadOptions, onSave, onDirty, onSaving }: {
  selection: QrMaterialSelection;
  isDefault: boolean;
  canEdit: boolean;
  loadOptions: () => Promise<QrMaterialOption[]>;
  onSave: (selection: QrMaterialSelection) => Promise<void>;
  onDirty: (dirty: boolean) => void;
  onSaving: (saving: boolean) => void;
}) {
  const [selection, setSelection] = useState(saved);
  const [options, setOptions] = useState<QrMaterialOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<QrMaterialDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const dirty = !same(selection, saved);
  const valid = options.some((option) => same(option, selection));
  const stones = [...new Map(options.map((option) => [option.stoneGroupId, option.stoneName])).entries()];
  const variants = [...new Map(options.filter((option) => option.stoneGroupId === selection.stoneGroupId).map((option) => [option.stoneVariantId, option.variantName])).entries()];
  const finishes = options.filter((option) => option.stoneGroupId === selection.stoneGroupId && option.stoneVariantId === selection.stoneVariantId);

  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    loadOptions().then((result) => { if (current) setOptions(result); })
      .catch(() => { if (current) setError('Stone choices could not load. Try again.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [loadOptions, attempt]);
  useEffect(() => {
    let current = true;
    setPreviewLoading(true);
    setPreview(null);
    loadQrMaterial(selection).then((value) => { if (current) setPreview(value); })
      .catch(() => { if (current) setPreview(null); })
      .finally(() => { if (current) setPreviewLoading(false); });
    return () => { current = false; };
  }, [selection]);

  function choose(option: QrMaterialOption | undefined) {
    if (!option) return;
    setSelection({ stoneGroupId: option.stoneGroupId, stoneVariantId: option.stoneVariantId, finishKey: option.finishKey });
    setError(null);
  }
  async function save() {
    setSaving(true); onSaving(true); setError(null);
    try { await onSave(selection); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'The selection could not be saved.'); }
    finally { setSaving(false); onSaving(false); }
  }

  return <section className="mt-5 border-t border-black/15 pt-5" aria-labelledby="qr-material-heading">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 id="qr-material-heading" className="text-base font-semibold">Stone & finish</h3>
      <span className={`rounded px-2 py-1 text-xs ${isDefault ? 'bg-amber-50 text-amber-900' : 'bg-black/5 text-black/65'}`}>{isDefault ? 'Default selection' : 'Saved selection'}</span>
    </div>
    <p className="mt-2 text-sm leading-6 text-black/60">{isDefault ? 'Check the material against the product image, then save your choice.' : 'The surface image and stone details follow this selection.'}</p>
    <fieldset disabled={!canEdit || loading || saving} className="mt-4 space-y-3">
      <label className="block text-sm font-medium">Stone
        <select value={selection.stoneGroupId} onChange={(event) => choose(options.find((option) => option.stoneGroupId === event.target.value))} className={inputClass}>
          {!stones.some(([key]) => key === selection.stoneGroupId) ? <option value={selection.stoneGroupId}>{loading ? 'Loading stones…' : 'Current stone unavailable'}</option> : null}
          {stones.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      {variants.length > 1 || (variants.length === 1 && variants[0][1] !== 'Standard') ? <label className="block text-sm font-medium">Variant / cut direction
        <select value={selection.stoneVariantId} onChange={(event) => choose(options.find((option) => option.stoneGroupId === selection.stoneGroupId && option.stoneVariantId === event.target.value))} className={inputClass}>
          {!variants.some(([key]) => key === selection.stoneVariantId) ? <option value={selection.stoneVariantId}>Current variant unavailable</option> : null}
          {variants.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label> : null}
      <label className="block text-sm font-medium">Finish
        <select value={selection.finishKey} onChange={(event) => choose(finishes.find((option) => option.finishKey === event.target.value))} className={inputClass}>
          {!finishes.some((option) => option.finishKey === selection.finishKey) ? <option value={selection.finishKey}>{loading ? 'Loading finishes…' : 'Current finish unavailable'}</option> : null}
          {finishes.map((option) => <option key={option.finishKey} value={option.finishKey}>{option.finishName}</option>)}
        </select>
      </label>
    </fieldset>
    <div className="mt-4" aria-live="polite">
      {previewLoading ? <p className="py-8 text-sm text-black/55">Loading surface preview…</p> : preview ? <figure>
        <img src={preview.finish.imageUrl} alt={`${preview.detail.name} ${preview.finish.label} surface preview`} className="aspect-[21/10] w-full object-cover" />
        <figcaption className="mt-2 text-sm text-black/65">{preview.detail.name} · {[preview.variantLabel, preview.finish.label].filter(Boolean).join(' · ')}</figcaption>
      </figure> : <p className="py-4 text-sm text-amber-900">This selection has no available surface image. Choose another stone or finish.</p>}
      {!loading && !valid ? <p className="mt-2 text-sm text-amber-900">Choose an available material before saving.</p> : null}
    </div>
    {error ? <div role="alert" className="mt-3 text-sm text-red-700"><p>{error}</p>{!options.length ? <button type="button" className="mt-1 min-h-11 underline" onClick={() => setAttempt((value) => value + 1)}>Try again</button> : null}</div> : null}
    {canEdit ? <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => void save()} disabled={loading || saving || previewLoading || !preview || !valid || (!dirty && !isDefault)} className="min-h-11 rounded-[3px] bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{saving ? 'Saving…' : 'Save stone selection'}</button>
      {dirty ? <button type="button" onClick={() => { setSelection(saved); setError(null); }} disabled={saving} className="min-h-11 px-2 text-sm underline">Cancel changes</button> : null}
    </div> : <p className="mt-3 text-sm text-black/55">Read-only access.</p>}
    <p className="mt-3 text-xs leading-5 text-black/55">Saving updates this QR page immediately. The product image and printed QR stay the same.</p>
  </section>;
}
