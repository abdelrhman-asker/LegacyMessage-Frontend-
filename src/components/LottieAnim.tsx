'use client';

import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';

type LottieAnimProps = {
  /** Path to a Lottie JSON in /public (e.g. "/lottie/success.json"). */
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Play once, then hold on the last frame (great for success checks). */
  playOnce?: boolean;
};

/**
 * Thin wrapper around lottie-react that loads the animation JSON from /public
 * at runtime, so the (large) JSON never bloats the JS bundle. Renders nothing
 * until the file arrives, then plays.
 */
export default function LottieAnim({
  src,
  loop = true,
  autoplay = true,
  className,
  style,
  playOnce = false,
}: LottieAnimProps) {
  const [data, setData] = useState<unknown>(null);
  const cache = useRef<Record<string, unknown>>({});

  useEffect(() => {
    let alive = true;
    if (cache.current[src]) {
      setData(cache.current[src]);
      return;
    }
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        cache.current[src] = json;
        if (alive) setData(json);
      })
      .catch(() => {
        /* ignore — animation is decorative */
      });
    return () => {
      alive = false;
    };
  }, [src]);

  if (!data) {
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <Lottie
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animationData={data as any}
      loop={playOnce ? false : loop}
      autoplay={autoplay}
      className={className}
      style={style}
      aria-hidden
    />
  );
}
