'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  getLoadedLottieData,
  loadLottieData,
} from '@/lib/lottie-cache';

// Load the player client-side only — it touches canvas/WebAssembly, so it must
// never run during static prerender.
const DotLottieReact = dynamic(
  () =>
    import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
  { ssr: false },
);

type DotLottieProps = {
  /** A .lottie or .json URL (e.g. a lottie.host link) or a /public path. */
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  /** Sizing/positioning classes for the wrapper. */
  className?: string;
};

/**
 * Thin wrapper around @lottiefiles/dotlottie-react. The animation fills the
 * wrapper, so size it via `className` (e.g. "h-40 w-64").
 */
export default function DotLottie({
  src,
  loop = true,
  autoplay = true,
  className,
}: DotLottieProps) {
  const [animation, setAnimation] = useState(() => ({
    src,
    data: getLoadedLottieData(src),
  }));
  const [failedSrc, setFailedSrc] = useState<string>();

  useEffect(() => {
    let active = true;

    loadLottieData(src)
      .then((data) => {
        if (active) {
          setAnimation({ src, data });
        }
      })
      .catch(() => {
        if (active) {
          setFailedSrc(src);
        }
      });

    return () => {
      active = false;
    };
  }, [src]);

  const data = animation.src === src ? animation.data : undefined;

  return (
    <div className={className} aria-hidden>
      {data || failedSrc === src ? (
        <DotLottieReact
          {...(data ? { data } : { src })}
          loop={loop}
          autoplay={autoplay}
          style={{ width: '100%', height: '100%' }}
        />
      ) : null}
    </div>
  );
}
