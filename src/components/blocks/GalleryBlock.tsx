import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { GalleryBlockView } from '../../features/blocks/view';
import ProjectResponsiveImage from '../projects/ProjectResponsiveImage';

const viewerButtonClassName =
  'inline-flex min-h-11 items-center gap-2 border border-line-inverse px-4 text-meta font-bold uppercase tracking-caps text-inverse transition hover:border-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** Even grid of equal frames (no masonry); each image opens a full-screen viewer. */
export default function GalleryBlock({ block }: { block: GalleryBlockView }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const count = block.items.length;
  const active = openIndex === null ? null : block.items[openIndex];

  useEffect(() => {
    if (openIndex === null) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
      if (event.key === 'ArrowRight') setOpenIndex((index) => (index === null ? index : (index + 1) % count));
      if (event.key === 'ArrowLeft') setOpenIndex((index) => (index === null ? index : (index - 1 + count) % count));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openIndex, count]);

  useEffect(() => {
    if (openIndex === null) returnFocusRef.current?.focus();
  }, [openIndex]);

  return (
    <figure>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {block.items.map((item, index) => (
          <li key={`${item.src}-${index}`}>
            <button
              type="button"
              className="group block w-full overflow-hidden bg-black text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
              aria-label={`Open image ${index + 1} of ${count}: ${item.alt}`}
            >
              <ProjectResponsiveImage
                src={item.src}
                profile="detail"
                alt=""
                className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:opacity-90"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>
      {active && openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${openIndex + 1} of ${count}`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 px-4 py-4 md:px-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenIndex(null);
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-meta font-bold uppercase tracking-caps text-inverse-muted">
              {openIndex + 1} / {count}
            </p>
            <button ref={closeRef} type="button" className={viewerButtonClassName} onClick={() => setOpenIndex(null)}>
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            <ProjectResponsiveImage src={active.src} profile="hero" alt={active.alt} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-small text-inverse-body">{active.caption}</p>
            {count > 1 ? (
              <div className="flex gap-2">
                <button type="button" className={viewerButtonClassName} onClick={() => setOpenIndex((openIndex - 1 + count) % count)}>
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button type="button" className={viewerButtonClassName} onClick={() => setOpenIndex((openIndex + 1) % count)}>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </figure>
  );
}
