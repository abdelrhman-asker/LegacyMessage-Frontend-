'use client';

import { useEffect } from 'react';

/**
 * Mounted once (in the root layout). Watches every element with the `reveal`
 * class and adds `in` when it scrolls into view, triggering the CSS transition.
 * A MutationObserver picks up elements rendered later by client components /
 * route changes, so pages only need to add the `reveal` class in their markup.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduce) {
      document
        .querySelectorAll('.reveal')
        .forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    const observeAll = () => {
      document
        .querySelectorAll('.reveal:not(.in)')
        .forEach((el) => io.observe(el));
    };

    observeAll();

    // Re-scan when client components render new content.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(observeAll);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
