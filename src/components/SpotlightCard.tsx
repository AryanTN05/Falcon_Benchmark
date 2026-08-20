import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SpotlightCard({ children, className = '', onPointerMove, onPointerLeave, ...props }: SpotlightCardProps) {
  const frame = useRef<number | undefined>(undefined);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = event.currentTarget;
    const clientX = event.clientX;
    const clientY = event.clientY;
    window.cancelAnimationFrame(frame.current ?? 0);
    frame.current = window.requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--spot-x', `${clientX - rect.left}px`);
      element.style.setProperty('--spot-y', `${clientY - rect.top}px`);
      element.style.setProperty('--spot-opacity', '1');
    });
  };

  const leave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    event.currentTarget.style.setProperty('--spot-opacity', '0');
  };

  return <div className={`spotlight-card ${className}`.trim()} onPointerMove={move} onPointerLeave={leave} {...props}>{children}</div>;
}
