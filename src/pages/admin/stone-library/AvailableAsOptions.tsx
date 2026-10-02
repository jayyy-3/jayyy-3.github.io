import { useEffect, useState, type FormEvent } from 'react';
import {
  StoneApiError,
  stoneApi,
  type StoneOptionWrite,
} from '../../../lib/adminStoneApi';
import type {
  StoneAvailabilityOption,
  StoneAvailabilityOptionList,
} from '../../../features/stone-library/availableAs';

type Op = StoneOptionWrite['op'];

/**
 * "Available as options" block at the top of the Stone Library list. Everyone sees the
 * one-line summary; owners and admins can add, rename, reorder, hide and restore options.
 */
export default function AvailableAsOptions({ canManage }: { canManage: boolean }) {
  const [list, setList] = useState<StoneAvailabilityOptionList | null>(null);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);
  const [confirmHide, setConfirmHide] = useState<StoneAvailabilityOption | null>(null);
  // A write whose result is uncertain is retried with the same identity, never duplicated.
  const [pending, setPending] = useState<StoneOptionWrite | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError('');
    stoneApi<StoneAvailabilityOptionList>('?view=availability-options')
      .then((r) => {
        if (active) setList(r);
      })
      .catch((e: Error) => {
        if (active) setLoadError(e.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);

  async function send(body: StoneOptionWrite, done: string) {
    setBusy(true);
    setError('');
    setMessage('');
    setPending(body);
    try {
      const next = await stoneApi<StoneAvailabilityOptionList>('', body);
      setPending(null);
      setList(next);
      setMessage(done);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The change could not be saved.');
      if (!(e instanceof StoneApiError) || (e.status >= 400 && e.status < 500))
        setPending(null);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function write(op: Op, option: StoneOptionWrite['option'], done: string) {
    return send(
      { action: 'availability-option', op, requestId: crypto.randomUUID(), option },
      done,
    );
  }

  const published = list?.published ?? [];
  const archived = list?.archived ?? [];
  const summary = published.length
    ? published.map((o) => o.name).join(', ')
    : 'No options yet';

  async function add(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (await write('create', { name }, `Added ${name}. Tick it on each stone that offers it.`))
      setNewName('');
  }
  function move(index: number, delta: number) {
    const ids = published.map((o) => o.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    void write('reorder', { ids }, 'Order saved. The website follows this order.');
  }
  async function rename(e: FormEvent) {
    e.preventDefault();
    if (!renaming) return;
    const name = renaming.name.trim();
    if (!name) return;
    if (await write('rename', { id: renaming.id, name }, `Renamed to ${name}.`))
      setRenaming(null);
  }
  async function hide(option: StoneAvailabilityOption) {
    if (
      await write(
        'archive',
        { id: option.id },
        `${option.name} is hidden and removed from every stone.`,
      )
    )
      setConfirmHide(null);
  }

  return (
    <section
      className="stone-section mb-6"
      aria-labelledby="available-as-options-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="available-as-options-title" className="!mb-0 !text-base">
            Available as options
          </h2>
          <p className="mt-1 text-sm text-black/60">
            {list ? summary : loadError ? 'Options could not load.' : 'Loading options…'}
          </p>
        </div>
        {canManage && list && (
          <button
            type="button"
            className="stone-button"
            aria-expanded={open}
            aria-controls="available-as-options-panel"
            onClick={() => {
              setOpen((v) => !v);
              setMessage('');
              setError('');
              setConfirmHide(null);
              setRenaming(null);
            }}
          >
            {open ? 'Done' : 'Manage'}
          </button>
        )}
      </div>
      {loadError && (
        <div role="alert" className="stone-error">
          {loadError}
          <button
            type="button"
            className="stone-button ml-3"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {open && canManage && list && (
        <div id="available-as-options-panel" className="mt-5">
          <p className="text-sm text-black/60">
            These are the forms a stone can be supplied as. Each stone ticks its own
            under Available as in the stone editor. The website lists every option on
            each stone as Offered or Not offered, in this order.
          </p>
          {message && (
            <p className="stone-notice" role="status">
              {message}
            </p>
          )}
          {error && (
            <div className="stone-error" role="alert">
              <p>{error}</p>
              {pending && (
                <button
                  type="button"
                  className="stone-button mt-3"
                  disabled={busy}
                  onClick={() => void send(pending, 'Saved.')}
                >
                  Check previous result
                </button>
              )}
            </div>
          )}
          <ol className="mt-4 border-b border-black/10">
            {published.map((option, index) => (
              <li
                key={option.id}
                className="flex flex-wrap items-center gap-2 border-t border-black/10 py-3"
              >
                {renaming?.id === option.id ? (
                  <form
                    className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                    onSubmit={(e) => void rename(e)}
                  >
                    <label className="min-w-48 flex-1">
                      New name for {option.name}
                      <input
                        className="stone-input"
                        maxLength={60}
                        autoFocus
                        value={renaming.name}
                        onChange={(e) =>
                          setRenaming({ id: option.id, name: e.target.value })
                        }
                      />
                    </label>
                    <button
                      type="submit"
                      className="stone-button stone-primary"
                      disabled={busy || !renaming.name.trim()}
                    >
                      Save name
                    </button>
                    <button
                      type="button"
                      className="stone-button"
                      onClick={() => setRenaming(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : confirmHide?.id === option.id ? (
                  <div
                    role="group"
                    aria-label={`Hide ${option.name}`}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                  >
                    <p className="min-w-0 flex-1 text-sm">
                      Hide <strong>{option.name}</strong>? It is removed from every
                      stone that offers it. Restoring it later does not tick it again.
                    </p>
                    <button
                      type="button"
                      className="stone-button stone-primary"
                      disabled={busy}
                      onClick={() => void hide(option)}
                    >
                      Hide option
                    </button>
                    <button
                      type="button"
                      className="stone-button"
                      onClick={() => setConfirmHide(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 break-words font-semibold">
                      {option.name}
                    </span>
                    <button
                      type="button"
                      className="stone-button"
                      disabled={busy || index === 0}
                      aria-label={`Move ${option.name} up`}
                      onClick={() => move(index, -1)}
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      className="stone-button"
                      disabled={busy || index === published.length - 1}
                      aria-label={`Move ${option.name} down`}
                      onClick={() => move(index, 1)}
                    >
                      ↓ Down
                    </button>
                    <button
                      type="button"
                      className="stone-button"
                      disabled={busy}
                      aria-label={`Rename ${option.name}`}
                      onClick={() => {
                        setConfirmHide(null);
                        setRenaming({ id: option.id, name: option.name });
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="stone-button"
                      disabled={busy}
                      aria-label={`Hide ${option.name}`}
                      onClick={() => {
                        setRenaming(null);
                        setConfirmHide(option);
                      }}
                    >
                      Hide
                    </button>
                  </>
                )}
              </li>
            ))}
          </ol>
          {!published.length && (
            <p className="py-3 text-sm">No options yet. Add the first one below.</p>
          )}
          <form
            className="mt-4 flex flex-wrap items-end gap-2"
            onSubmit={(e) => void add(e)}
          >
            <label className="min-w-48 flex-1">
              New option
              <input
                className="stone-input"
                placeholder="e.g. Kerbs"
                maxLength={60}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="stone-button stone-primary"
              disabled={busy || !newName.trim() || published.length >= 24}
            >
              Add option
            </button>
          </form>
          {published.length >= 24 && (
            <p className="mt-2 text-sm text-black/60">
              You can keep up to 24 options. Hide one to add another.
            </p>
          )}
          {archived.length > 0 && (
            <details className="mt-5">
              <summary>Hidden options ({archived.length})</summary>
              <ul className="mt-3">
                {archived.map((option) => (
                  <li
                    key={option.id}
                    className="flex flex-wrap items-center gap-2 border-t border-black/10 py-3"
                  >
                    <span className="min-w-0 flex-1 break-words">{option.name}</span>
                    <button
                      type="button"
                      className="stone-button"
                      disabled={busy || published.length >= 24}
                      aria-label={`Restore ${option.name}`}
                      onClick={() =>
                        void write(
                          'restore',
                          { id: option.id },
                          `${option.name} is back. Tick it on each stone that offers it.`,
                        )
                      }
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
