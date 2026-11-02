'use client';
import { useEffect } from 'react';

/**
 * FaviconWatcher forces Chrome, Safari and Firefox to invalidate their internal
 * cached tab icon and immediately render the official Al-Madina Madrasah logo.
 */
export default function FaviconWatcher() {
  useEffect(() => {
    try {
      const version = '20261102_' + Math.floor(Date.now() / 60000);
      const iconUrl = `/favicon-32x32.png?v=${version}`;

      // Remove existing static icon link tags if any to prevent browser cache stickiness
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach((el) => {
        el.setAttribute('href', iconUrl);
      });

      // Also force create/append a dedicated link tag to trigger immediate tab repaint
      let dynamicIcon = document.getElementById('dynamic-madrasa-favicon') as HTMLLinkElement | null;
      if (!dynamicIcon) {
        dynamicIcon = document.createElement('link');
        dynamicIcon.id = 'dynamic-madrasa-favicon';
        dynamicIcon.rel = 'shortcut icon';
        dynamicIcon.type = 'image/png';
        document.head.appendChild(dynamicIcon);
      }
      dynamicIcon.href = iconUrl;

      // Force service worker update check on client hydration to bust stale PWA cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.update().catch(() => {});
          }
        }).catch(() => {});
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  return null;
}
