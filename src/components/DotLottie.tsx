'use client';

import dynamic from 'next/dynamic';

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
  return (
    <div className={className} aria-hidden>
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
