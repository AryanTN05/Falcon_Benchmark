"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FlamWordmark } from "./FlamWordmark";
import "../styles/header.css";

type ActivePage = "home" | "benchmarks";

interface SiteHeaderProps {
  active?: ActivePage;
}

/**
 * Navbar in the flamapp.ai style, minus the glass pills: fixed over the page,
 * it slides away when scrolling down and returns on any scroll up or near the
 * top of the page. The hide behaviour is desktop-only, like the source site.
 */
export function SiteHeader({ active }: SiteHeaderProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    let lastY = window.scrollY;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      if (!desktop.matches) {
        setHidden(false);
        return;
      }
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const progress = range > 0 ? y / range : 0;
      if (progress < 0.05 || delta < 0) {
        setHidden(false);
      } else if (delta > 0) {
        setHidden(true);
      }
    };

    const schedule = () => {
      if (raf === 0) raf = window.requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    desktop.addEventListener("change", schedule);
    return () => {
      if (raf !== 0) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <header className={`site-header${hidden ? " site-header--hidden" : ""}`}>
      <div className="site-header__bar">
        <Link aria-label="Flam home" className="site-header__logo" href="/">
          <FlamWordmark className="site-header__wordmark" />
        </Link>
        {/* No self-link: on the benchmarks page the nav shows the wordmark only. */}
        {active !== "benchmarks" && (
          <Link className="site-header__benchmarks" href="/benchmarks">
            Benchmarks
          </Link>
        )}
      </div>
    </header>
  );
}
