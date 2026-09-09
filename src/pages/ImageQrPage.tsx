import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImageQrPageView from '../components/image-qr/ImageQrPageView';
import { loadQrMaterial } from '../service/ImageQrService';
import type { QrMaterialDetail } from '../service/ImageQrService';
import type { PublicImageQrResource } from '../types/image-qr';

function embeddedResource(slug: string): PublicImageQrResource | null {
  try {
    const value = JSON.parse(document.getElementById('image-qr-data')?.textContent || 'null');
    return value?.slug === slug ? value : null;
  } catch { return null; }
}

export default function ImageQrPage() {
  const { slug = '' } = useParams();
  const [state, setState] = useState<{
    resource: PublicImageQrResource | null; material: QrMaterialDetail | null; status: 'loading' | 'ready' | 'missing' | 'error';
  }>({ resource: null, material: null, status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    async function load() {
      setState({ resource: null, material: null, status: 'loading' });
      try {
        let resource = attempt === 0 ? embeddedResource(slug) : null;
        if (!resource) {
          const response = await fetch(`/api/image-qr/${encodeURIComponent(slug)}`, { signal: controller.signal, cache: 'no-store' });
          if (response.status === 404) {
            if (current) setState({ resource: null, material: null, status: 'missing' });
            return;
          }
          if (!response.ok) throw new Error('QR resource unavailable');
          resource = (await response.json()).resource as PublicImageQrResource;
        }
        if (!resource?.materialSelection || !resource.productImageUrl) throw new Error('Invalid QR resource');
        const material = await loadQrMaterial(resource.materialSelection);
        if (current) setState({ resource, material, status: 'ready' });
      } catch {
        if (current) setState({ resource: null, material: null, status: 'error' });
      }
    }
    void load();
    // Re-check active/hidden state on return, including a back-forward-cache restore.
    function refresh() { if (document.visibilityState === 'visible') setAttempt((value) => value + 1); }
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { current = false; controller.abort(); window.removeEventListener('pageshow', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [slug, attempt]);

  useEffect(() => {
    document.title = state.material ? `${state.material.detail.name} · ${state.material.finish.label} | Urblo` : 'Material detail | Urblo';
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex,nofollow';
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://urblo.com.au/image/${encodeURIComponent(slug)}`;
    return () => { robots?.remove(); canonical?.remove(); };
  }, [state.material, slug]);

  if (state.resource && state.status === 'ready') return <ImageQrPageView key={slug} resource={state.resource} material={state.material} />;
  return <main className="mx-auto min-h-screen max-w-[560px] px-5 py-6 text-black">
    <Link to="/" aria-label="Urblo home"><img src="/media/launch/identity/urblo-logo.png" alt="Urblo" className="h-11 w-auto" /></Link>
    <section className="mt-16" aria-live="polite">
      <h1 className="text-3xl font-light">{state.status === 'loading' ? 'Preparing material detail' : state.status === 'missing' ? 'This image link is unavailable' : 'Please try again shortly'}</h1>
      <p className="mt-4 text-base leading-7 text-black/60">{state.status === 'loading' ? 'Loading the product image and stone surface.' : state.status === 'missing' ? 'This link may have been paused. Contact Urblo for help with this material.' : 'The material page could not load. Try again or contact Urblo.'}</p>
      {state.status === 'error' ? <button onClick={() => setAttempt((value) => value + 1)} className="mt-6 min-h-11 bg-black px-5 py-3 text-white">Try again</button> : null}
      {state.status !== 'loading' ? <Link to="/stone-library" className="mt-5 block py-3 underline">Visit Stone Library</Link> : null}
    </section>
  </main>;
}
