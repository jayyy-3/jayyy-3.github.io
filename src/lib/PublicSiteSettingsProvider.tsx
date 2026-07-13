import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  loadPublicSiteSettings,
  PublicSiteSettingsContext,
  staticPublicSiteSettings,
} from './publicSiteSettings';

export function PublicSiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(staticPublicSiteSettings);

  useEffect(() => {
    let isActive = true;
    let retryTimer: number | null = null;

    const loadSettings = async (attempt: number) => {
      const nextSettings = await loadPublicSiteSettings();
      if (!isActive) return;

      setSettings(nextSettings);
      if (nextSettings.source === 'static' && attempt === 0) {
        retryTimer = window.setTimeout(() => {
          retryTimer = null;
          void loadSettings(1);
        }, 750);
      }
    };

    void loadSettings(0);

    return () => {
      isActive = false;
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  return (
    <PublicSiteSettingsContext.Provider value={settings}>
      {children}
    </PublicSiteSettingsContext.Provider>
  );
}
