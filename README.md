# Falcon Benchmark

The Falcon Bench report page, extracted from the Falcon marketing site into a
standalone Next.js app. The report is the site: `/` renders the full benchmark
page — headline metrics, every comparison table, the quality-vs-cost plot and
the 506-case RAG evaluation.

## Stack

- Next.js 16 (App Router, Turbopack) with React 19
- No CSS framework: a custom-property token layer in `src/styles/global.css`
  plus the page's own `src/views/benchmarks.css`
- Fonts are self-hosted from `@fontsource*` packages so the production CSP can
  keep `font-src 'self'`

## Run it

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

`pnpm build` type-checks with `tsc --noEmit` before building; `pnpm start`
serves the production build.

If `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS: esbuild`, run
`pnpm approve-builds` once and pick esbuild.

## Layout

```
src/
  app/            route, metadata, robots, sitemap, 404
  views/          BenchmarksPage.tsx + benchmarks.css
  data/           benchmarks.ts — every table and number, as data
  components/     Icon, Reveal, SpotlightCard, SiteHeader, ShaderParticles…
  styles/         fonts.css, global.css (tokens), header.css
```

All benchmark numbers live in `src/data/benchmarks.ts`. Edit the data, not the
markup — the page renders whatever the tables declare, including which cell in
each row is marked best.

## Deploy

Any Node host that runs `next start`, or Vercel with zero config. Set `SITE_URL`
at build time to emit canonical URLs and a sitemap; without it both are omitted.
