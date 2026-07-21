'use client';

import Lottie from 'lottie-react';
import loaderAnimation from '../../public/lottie/loader.json';

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
      <Lottie
        animationData={loaderAnimation}
        loop
        autoplay
        className={className}
        aria-hidden
      />
      {label ? (
        <p className="text-sm font-semibold text-[#6a5b52]">{label}</p>
      ) : null}
    </div>
  );
}
