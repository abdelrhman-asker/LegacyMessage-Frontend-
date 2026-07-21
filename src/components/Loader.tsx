'use client';

import DotLottie from './DotLottie';

/** Swap this URL to change the loading animation everywhere. */
export const LOADER_SRC =
  'https://lottie.host/f8b6b9d1-546f-42ff-9107-bfa063b12ba0/8B6k4fKuIu.json';

type LoaderProps = {
  label?: string;
  className?: string;
};

export default function Loader({
  label,
  className = 'h-40 w-56 sm:h-48 sm:w-64',
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <DotLottie src={LOADER_SRC} className={className} />
      {label ? (
        <p className="text-sm font-semibold text-[#6a5b52]">{label}</p>
      ) : null}
    </div>
  );
}
