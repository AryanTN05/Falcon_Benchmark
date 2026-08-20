'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ErrorBoundary } from './ErrorBoundary';

function ScrollAndFocusManager() {
  const pathname = usePathname();
  const initial = useRef(true);

  useEffect(() => {
    const isInitial = initial.current;
    initial.current = false;
    document.documentElement.dataset.route = pathname;

    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const timer = window.setTimeout(() => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 60);
      return () => window.clearTimeout(timer);
    }

    // In-app navigations only. On first load the browser already starts at the
    // top of the document, and focusing <main> there just paints its
    // focus-visible ring across the hero.
    if (!isInitial) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ScrollAndFocusManager />
      {children}
    </ErrorBoundary>
  );
}
