import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '../components/AppShell';
import { ShaderParticles } from '../components/ShaderParticles';
import { siteUrl } from '../lib/site';
import '../styles/fonts.css';
import '../styles/global.css';

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'Falcon Bench — Every number, re-runnable',
  description:
    'Measured serving cost, Indic and global language quality, English reasoning and document Q&A for Falcon 1, on one pinned pipeline.',
  openGraph: {
    type: 'website',
    title: 'Falcon Bench — Every number, re-runnable',
    description:
      'Measured serving cost, Indic and global language quality, English reasoning and document Q&A for Falcon 1, on one pinned pipeline.',
    images: ['/og-image.webp'],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0704',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ShaderParticles />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
