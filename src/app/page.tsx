import type { Metadata } from 'next';
import BenchmarksPage from '../views/BenchmarksPage';
import { siteUrl } from '../lib/site';

const title = 'Falcon Bench — Every number, re-runnable';
const description =
  'Falcon’s measured serving cost, Indic and global language quality, English reasoning and a 506-case document Q&A evaluation — one pinned pipeline, stated limits, reproducible by anyone.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  ...(siteUrl ? { alternates: { canonical: '/' } } : {}),
};

export default function Page() {
  return <BenchmarksPage />;
}
