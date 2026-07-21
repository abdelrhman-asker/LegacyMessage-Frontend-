const CACHE_NAME = 'lastdot-lottie-v1';

export const LOTTIE_ASSETS = [
  '/lottie/pay-success.json',
  '/lottie/pay-failed.json',
] as const;

const pending = new Map<string, Promise<string>>();
const loaded = new Map<string, string>();

async function fetchAnimation(src: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Lottie animations can only be loaded in the browser.');
  }

  if ('caches' in window) {
    const cache = await window.caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(src);

    if (cachedResponse) {
      return cachedResponse.text();
    }

    const response = await fetch(src, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Could not load Lottie animation: ${src}`);
    }

    await cache.put(src, response.clone());
    return response.text();
  }

  const response = await fetch(src, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Could not load Lottie animation: ${src}`);
  }

  return response.text();
}

export function getLoadedLottieData(src: string): string | undefined {
  return loaded.get(src);
}

export function loadLottieData(src: string): Promise<string> {
  const existingData = loaded.get(src);
  if (existingData) {
    return Promise.resolve(existingData);
  }

  const existingRequest = pending.get(src);
  if (existingRequest) {
    return existingRequest;
  }

  const request = fetchAnimation(src)
    .then((data) => {
      loaded.set(src, data);
      pending.delete(src);
      return data;
    })
    .catch((error) => {
      pending.delete(src);
      throw error;
    });

  pending.set(src, request);
  return request;
}
