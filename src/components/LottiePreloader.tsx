'use client';

import { useEffect } from 'react';
import { LOTTIE_ASSETS, loadLottieData } from '@/lib/lottie-cache';

export default function LottiePreloader() {
  useEffect(() => {
    function warmCache() {
      void import('@lottiefiles/dotlottie-react');
      LOTTIE_ASSETS.forEach((src) => {
        void loadLottieData(src).catch(() => undefined);
      });
    }

    const idleApi = window as unknown as {
      requestIdleCallback?: typeof window.requestIdleCallback;
      cancelIdleCallback?: typeof window.cancelIdleCallback;
    };

    if (idleApi.requestIdleCallback) {
      const idleId = idleApi.requestIdleCallback(warmCache, { timeout: 1500 });
      return () => idleApi.cancelIdleCallback?.(idleId);
    }

    const timerId = window.setTimeout(warmCache, 250);
    return () => window.clearTimeout(timerId);
  }, []);

  return null;
}
