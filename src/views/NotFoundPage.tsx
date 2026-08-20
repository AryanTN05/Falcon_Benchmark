import Link from 'next/link';
import { Brand } from '../components/Brand';

export default function NotFoundPage() {
  return (
    <main className="error-page" id="main-content" tabIndex={-1}>
      <div>
        <Brand showAI />
        <div className="eyebrow" style={{ marginTop: 30 }}>404 · Nothing at this address</div>
        <h1 className="gradient-heading" style={{ marginTop: 12, fontSize: 'clamp(42px, 8vw, 76px)' }}>That route left the flight path.</h1>
        <p style={{ color: 'var(--text-subtle)', margin: '16px auto 24px', maxWidth: 440 }}>The page has moved, or the link was incomplete. The Falcon Bench report is still where you left it.</p>
        <Link className="button-primary" href="/">Back to the benchmarks</Link>
      </div>
    </main>
  );
}
