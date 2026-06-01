import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
      appearance: 'always';
      theme: 'light';
    },
  ) => string;
  remove?: (widgetId: string) => void;
  reset?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __urbloTurnstileScript?: Promise<void>;
  }
}

const turnstileScriptSrc = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function waitForTurnstileApi() {
  if (window.turnstile) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 40;

    const interval = window.setInterval(() => {
      attempts += 1;
      if (window.turnstile) {
        window.clearInterval(interval);
        resolve();
        return;
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(interval);
        reject(new Error('Turnstile unavailable.'));
      }
    }, 50);
  });
}

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (window.__urbloTurnstileScript) return window.__urbloTurnstileScript;

  window.__urbloTurnstileScript = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${turnstileScriptSrc}"]`,
    );

    const resolveWhenReady = () => {
      waitForTurnstileApi()
        .then(resolve)
        .catch((error) => {
          window.__urbloTurnstileScript = undefined;
          reject(error);
        });
    };

    const rejectLoad = () => {
      window.__urbloTurnstileScript = undefined;
      reject(new Error('Turnstile unavailable.'));
    };

    if (existingScript) {
      if (window.turnstile) {
        resolve();
        return;
      }

      resolveWhenReady();
      existingScript.addEventListener('error', rejectLoad, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = turnstileScriptSrc;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', resolveWhenReady, { once: true });
    script.addEventListener('error', rejectLoad, { once: true });
    document.head.appendChild(script);
  });

  return window.__urbloTurnstileScript;
}

export default function TurnstileField({
  resetSignal,
  siteKey,
  onError,
  onToken,
}: {
  resetSignal: number;
  siteKey: string;
  onError: (message: string | null) => void;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;

    let isMounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          appearance: 'always',
          theme: 'light',
          callback(token) {
            onError(null);
            onToken(token);
          },
          'expired-callback'() {
            onToken('');
            onError('Verification expired. Complete the check again before sending.');
          },
          'error-callback'() {
            onToken('');
            onError('Verification could not be completed. Try again or contact Urblo directly.');
          },
        });
      })
      .catch(() => {
        if (!isMounted) return;
        onToken('');
        onError('Verification could not load. Try again or contact Urblo directly.');
      });

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [onError, onToken, siteKey]);

  useEffect(() => {
    if (!widgetIdRef.current) return;
    window.turnstile?.reset?.(widgetIdRef.current);
    onToken('');
    onError(null);
  }, [onError, onToken, resetSignal]);

  if (!siteKey) return null;

  return (
    <div className="rounded-[4px] border border-black/10 bg-white p-3">
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
