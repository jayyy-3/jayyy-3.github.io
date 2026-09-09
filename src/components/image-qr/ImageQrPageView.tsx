import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Maximize2, Minus, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatQrBlockSize, qrStoneLibraryUrl } from '../../service/ImageQrService';
import type { QrMaterialDetail } from '../../service/ImageQrService';
import type { PublicImageQrResource } from '../../types/image-qr';

interface Props {
  resource: PublicImageQrResource;
  material: QrMaterialDetail | null;
}

export default function ImageQrPageView({ resource, material }: Props) {
  const [expanded, setExpanded] = useState<{ url: string; label: string } | null>(null);
  const title = material?.detail.name || resource.name;
  const finishLabel = material ? [material.variantLabel, `${material.finish.label} finish`].filter(Boolean).join(' · ') : null;
  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-white px-5 pb-5 pt-4 text-black sm:px-8 sm:pt-7" data-testid="image-qr-page">
      <header>
        <Link to="/" aria-label="Urblo home" className="flex w-fit min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <img src="/media/launch/identity/urblo-logo.png" alt="Urblo" className="h-9 w-auto" />
        </Link>
        <h1 className="mt-2 break-words text-[34px] font-light leading-[1.12] tracking-normal sm:text-[44px]">{title}</h1>
        {finishLabel ? <p className="mt-1 text-[16px] leading-6 text-black/60">{finishLabel}</p> : null}
      </header>

      <div className="mt-4 space-y-4">
        <QrFigure
          key={resource.productImageUrl}
          url={resource.productImageUrl}
          alt={`${title} product application, 3D visualisation`}
          title="Product application"
          caption="3D visualisation"
          aspect="aspect-[3/2]"
          onExpand={setExpanded}
          priority
        />
        {material ? (
          <QrFigure
            key={material.finish.imageUrl}
            url={material.finish.imageUrl!}
            alt={material.finish.imageAlt || `${title} ${material.finish.label} stone surface`}
            title="Stone surface"
            caption={`${material.finish.label} · Actual material image`}
            aspect="aspect-[21/10]"
            onExpand={setExpanded}
          />
        ) : (
          <section className="border-y border-black/15 py-6" role="status">
            <h2 className="text-lg">Stone details are being updated</h2>
            <p className="mt-2 text-sm leading-6 text-black/60">Contact Urblo to confirm the material and finish for this image.</p>
          </section>
        )}
      </div>

      {material ? (
        <section aria-label="Stone information" className="mt-5 border-t border-black/15 pt-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/60">Stone information</h2>
          <dl className="mt-3 grid grid-cols-2">
            <div className="min-w-0 border-r border-black/10 pb-3 pr-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-black/55">Type</dt>
              <dd className="mt-2 text-base">{material.detail.stoneType}</dd>
            </div>
            <div className="min-w-0 pb-3 pl-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-black/55">Availability</dt>
              <dd className="mt-2 text-base"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#00df16]" aria-hidden="true" />Available
                <span className="mt-1 block text-sm leading-5 text-black/60">For project sourcing</span>
              </dd>
            </div>
            <div className="min-w-0 border-r border-t border-black/10 pr-3 pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-black/55">Raw block</dt>
              <dd className="mt-2 text-[13px] leading-6">{formatQrBlockSize(material.detail.rawBlockLabel)}</dd>
            </div>
            <div className="min-w-0 border-t border-black/10 pl-3 pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-black/55">Price range</dt>
              <dd className="mt-2 text-base">{material.detail.pricePrimaryLabel}
                <span className="mt-3 flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((level) => <span key={level} className={`h-1.5 flex-1 rounded-sm ${level <= (material.detail.priceTierLevel || 0) ? 'bg-[#00df16]' : 'bg-black/10'}`} />)}
                </span>
                <span className="mt-2 block text-sm leading-5 text-black/60">Indicative tier</span>
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <nav aria-label="Material next steps" className="mt-5 space-y-2.5">
        <Link to={material ? qrStoneLibraryUrl(resource.materialSelection) : '/stone-library'} className="flex min-h-12 items-center justify-center gap-4 rounded-[2px] bg-black px-4 py-3 text-base text-white transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          View in Stone Library <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <a href={`mailto:info@urblo.com.au?subject=${encodeURIComponent(`Stone enquiry: ${title}${material ? ` · ${material.finish.label}` : ''}`)}&body=${encodeURIComponent(`I would like to discuss this material:\nhttps://urblo.com.au/image/${resource.slug}`)}`} className="flex min-h-12 items-center justify-center rounded-[2px] border border-black/20 px-4 py-3 text-base transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          Enquire about this stone
        </a>
      </nav>
      {expanded ? <QrImageDialog image={expanded} onClose={() => setExpanded(null)} /> : null}
    </main>
  );
}

function QrFigure({ url, alt, title, caption, aspect, priority, onExpand }: {
  url: string; alt: string; title: string; caption: string; aspect: string; priority?: boolean;
  onExpand: (image: { url: string; label: string }) => void;
}) {
  const [failed, setFailed] = useState(false);
  return <figure>
    <button type="button" disabled={failed} onClick={() => onExpand({ url, label: `${title} · ${alt}` })} aria-label={`Enlarge ${title.toLowerCase()}`} className={`relative block w-full overflow-hidden bg-[#ededed] ${aspect} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4`}>
      {failed ? <span className="flex h-full items-center justify-center p-5 text-sm text-black/65">Image unavailable. Please try again later.</span> : <img src={url} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} className={`h-full w-full ${priority ? 'object-contain' : 'object-cover'}`} onError={() => setFailed(true)} />}
      {!failed ? <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95"><Maximize2 size={19} aria-hidden="true" /></span> : null}
    </button>
    <figcaption className="mt-2"><h2 className="text-[15px] leading-5">{title}</h2><p className="mt-0.5 text-[13px] leading-[18px] text-black/60">{caption}</p></figcaption>
  </figure>;
}

function QrImageDialog({ image, onClose }: { image: { url: string; label: string }; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} onCancel={onClose} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none bg-white p-0 text-black backdrop:bg-black/70" aria-label={image.label}>
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 p-3">
        <p className="min-w-0 text-sm leading-5">{image.label}</p>
        <div className="flex shrink-0 gap-1">
          <button type="button" aria-label={zoom ? 'Reset zoom' : 'Zoom in'} aria-pressed={zoom} onClick={() => setZoom(!zoom)} className="flex h-11 w-11 items-center justify-center border border-black/15">{zoom ? <Minus size={20} /> : <Plus size={20} />}</button>
          <button type="button" aria-label="Close image" onClick={onClose} className="flex h-11 w-11 items-center justify-center border border-black/15"><X size={20} /></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#ededed]" tabIndex={0} aria-label="Scrollable enlarged image">
        <div className={zoom ? 'h-[200%] w-[200%]' : 'h-full w-full'}><img src={image.url} alt={image.label} className="h-full w-full object-contain" /></div>
      </div>
    </div>
  </dialog>;
}
