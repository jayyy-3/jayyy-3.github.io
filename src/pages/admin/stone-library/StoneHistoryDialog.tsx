import { useEffect, useState } from 'react';
import StoneDialog from '../../../features/stone-library/StoneDialog';
import { stoneApi } from '../../../lib/adminStoneApi';
import type {
  StoneDraft,
  StoneFinishDefinition,
} from '../../../features/stone-library/stoneDraft';
interface Version {
  id: number;
  reason: string;
  createdAt: string;
  snapshot: StoneDraft;
}
export default function StoneHistoryDialog({
  stoneId,
  finishes,
  onClose,
}: {
  stoneId: number;
  finishes: StoneFinishDefinition[];
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    stoneApi<{ history: Version[] }>(`?stoneId=${stoneId}&view=history`)
      .then((r) => {
        if (active) setVersions(r.history);
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
  }, [stoneId, retry]);
  return (
    <StoneDialog
      label="Previous stone versions"
      onClose={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
    >
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl">Previous versions</h2>
          <button className="stone-button" onClick={onClose}>
            Close history
          </button>
        </div>
        <p className="my-4 text-sm text-black/60">
          The original content and each published version are kept here for
          comparison. Opening a version does not change the current draft.
        </p>
        {loading && <p role="status">Loading versions…</p>}
        {error && (
          <div role="alert" className="stone-error">
            {error}
            <button
              className="stone-button ml-2"
              onClick={() => setRetry((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        )}
        {versions.map((version) => (
          <details className="border-t py-4" key={version.id}>
            <summary className="cursor-pointer font-semibold">
              {version.reason} · {new Date(version.createdAt).toLocaleString()}
            </summary>
            <div className="mt-4 space-y-3 text-sm">
              <h3 className="text-lg">{version.snapshot.stone.name}</h3>
              <p>
                {version.snapshot.stone.type} ·{' '}
                {version.snapshot.stone.availability === 'tbc'
                  ? 'Availability to be confirmed'
                  : 'Available for project sourcing'}
              </p>
              <p>
                {version.snapshot.stone.summary ||
                  'No introduction in this version.'}
              </p>
              {version.snapshot.variants.map((v) => (
                <div key={v.key}>
                  <p className="font-semibold">
                    {v.label || 'Standard'}
                    {!v.enabled ? ' · Disabled' : ''}
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {v.finishes
                      .filter((f) => f.capability !== 'no')
                      .map((f) => (
                        <li key={f.definitionId}>
                          {finishes.find((d) => d.id === f.definitionId)
                            ?.name || 'Finish'}{' '}
                          ·{' '}
                          {f.capability === 'tbc'
                            ? 'To be confirmed'
                            : 'Available'}{' '}
                          · {f.images.length} images
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
        {!loading && !error && !versions.length && (
          <p>
            No previous versions yet. The first saved draft will retain the
            original content.
          </p>
        )}
      </section>
    </StoneDialog>
  );
}
