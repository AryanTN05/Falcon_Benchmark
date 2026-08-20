import type { Metadata } from 'next';
import NotFoundPage from '../views/NotFoundPage';

export const metadata: Metadata = {
  title: 'Page not found — Falcon',
  description: 'There is nothing at this address. Head back to the Falcon demo.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}
