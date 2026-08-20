'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Brand } from './Brand';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="error-page" id="main-content">
        <div>
          <Brand showAI />
          <h1>Something interrupted the signal.</h1>
          <p>Falcon could not render this page. Reload to reconnect.</p>
          <button className="button-primary" type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
