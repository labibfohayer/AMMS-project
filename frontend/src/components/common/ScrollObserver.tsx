'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Enable CSS scroll reveal
    document.documentElement.classList.add('enable-scroll-reveal');

    // Create single shared IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add('aos-animate', 'is-revealed');
            observer.unobserve(target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -45px 0px', // Trigger slightly before it hits bottom of viewport
        threshold: 0.08, // 8% visibility is enough to trigger smooth slide-up
      }
    );

    const observeElements = () => {
      // Elements that should slide up from bottom as user scrolls
      const candidateSelectors = [
        '[data-aos]',
        '.scroll-reveal',
        '.hm-sec-head',
        '.hm-card',
        '.hm-about__media',
        '.hm-about__text',
        '.hm-notices',
        '.hm-hero__grid > *',
        'section > div > h2',
        'section > div > p',
        '.grid > *',
        'article',
        '[class*="rounded-2xl shadow"]',
        '[class*="rounded-3xl shadow"]',
        '.card'
      ];

      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(candidateSelectors.join(','))
      );

      elements.forEach((el) => {
        // Exclude preloader, fixed/sticky navigation, dialogs, and already revealed elements
        if (
          el.dataset.observed === 'true' ||
          el.closest('[aria-label="Welcome Splash Screen"]') ||
          el.closest('header') ||
          el.closest('nav') ||
          el.closest('.sticky') ||
          el.closest('.fixed') ||
          el.classList.contains('no-scroll-reveal')
        ) {
          return;
        }

        // Mark as observed
        el.dataset.observed = 'true';

        // Check if element is already inside the initial viewport
        const rect = el.getBoundingClientRect();
        const isInInitialViewport = rect.top < window.innerHeight - 30;

        if (isInInitialViewport) {
          // Immediately reveal without delaying top-of-page content
          el.classList.add('aos-animate', 'is-revealed');
        } else {
          // Apply scroll-reveal base style
          if (!el.hasAttribute('data-aos')) {
            el.setAttribute('data-aos', 'fade-up');
          }
          el.classList.add('scroll-reveal');

          // Add subtle stagger delay if sibling in grid/flex
          if (el.parentElement) {
            const siblings = Array.from(el.parentElement.children);
            const index = siblings.indexOf(el);
            if (index > 0 && siblings.length > 1) {
              const delay = Math.min((index % 4) * 100, 400);
              if (delay > 0 && !el.style.transitionDelay) {
                el.style.transitionDelay = `${delay}ms`;
              }
            }
          }

          observer.observe(el);
        }
      });
    };

    // Run initial scan
    observeElements();

    // Re-scan after short delay for dynamically rendered or hydrated items
    const timer = setTimeout(observeElements, 400);

    // Watch for DOM changes (e.g. state changes, data fetching)
    let debounceTimer: NodeJS.Timeout;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(observeElements, 250);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      clearTimeout(debounceTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
