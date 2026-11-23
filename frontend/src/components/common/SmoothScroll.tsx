'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Honor reduced-motion accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis 120 FPS inertial momentum scrolling
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.2,
      anchors: true,
      prevent: (node: Element) => {
        return (
          node.classList?.contains('overflow-y-auto') ||
          node.classList?.contains('overflow-auto') ||
          node.hasAttribute?.('data-lenis-prevent') ||
          Boolean(node.closest?.('[data-lenis-prevent]'))
        );
      },
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // If preloader or any modal has body overflow locked initially, pause Lenis
    if (
      document.body.style.overflow === 'hidden' ||
      document.querySelector('[aria-label="Welcome Splash Screen"]')
    ) {
      lenis.stop();
    }

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, []);

  // Smooth reset to top when navigating across pages
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
