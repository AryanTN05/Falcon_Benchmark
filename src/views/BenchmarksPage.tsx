"use client";

import { Icon } from "../components/Icon";
import { Reveal } from "../components/Reveal";
import { SiteHeader } from "../components/SiteHeader";
import { SpotlightCard } from "../components/SpotlightCard";
import {
  benchmarkTables,
  ragEval,
  type BenchmarkTable,
} from "../data/benchmarks";
import "./benchmarks.css";

interface Metric {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

const headlineMetrics: readonly Metric[] = [
  {
    value: "$0.42",
    label: "per 1M output tokens",
    detail:
      "13× cheaper than Llama-70B, 5× than Gemma-3-27B, measured on the same GPU",
  },
  {
    value: "82.0",
    label: "MMLU-Pro",
    detail:
      "within 3 pts of DeepSeek-V3.1’s published 84.8, at about 4B active params",
  },
  {
    value: "83.2",
    label: "MILU Indic composite (gen-CoT)",
    detail: "best in panel across 10 Indian languages",
  },
  {
    value: "2,029",
    label: "tokens/sec @ 21 ms TTFT",
    detail: "16 concurrent streams, production serving stack",
  },
] as const;

function RagEvaluation() {
  return (
    <section
      className="benchmark-section rag-eval"
      aria-labelledby="rag-eval-title"
    >
      <Reveal>
        <SpotlightCard className="benchmark-table-card rag-eval-card">
          <div className="benchmark-card-heading">
            <div>
              <p className="rag-eval__eyebrow">
                First-party evaluation · retrieval &amp; answer quality
              </p>
              <h2 id="rag-eval-title">RAG evaluation: 506 cases, end to end</h2>
            </div>
            <span>measured 2026-08-16 · dev</span>
          </div>
          <p className="rag-eval__intro">{ragEval.measuredLine}</p>

          <div
            className="benchmark-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="RAG evaluation summary, horizontally scrollable"
          >
            <table style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th className="is-falcon" scope="col">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {ragEval.metrics.map((metric, index) => (
                  <tr key={metric.id}>
                    <th scope="row">
                      <span>
                        <a className="rag-metric-link" href={`#${metric.id}`}>
                          {index + 1} · {metric.name}
                        </a>
                      </span>
                      {metric.summaryNote ? (
                        <small>{metric.summaryNote}</small>
                      ) : null}
                    </th>
                    <td className="is-falcon">{metric.summaryValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rag-metric-list">
            {ragEval.metrics.map((metric, index) => (
              <details className="rag-metric" id={metric.id} key={metric.id}>
                <summary>
                  <span className="rag-metric__num">{index + 1}</span>
                  <span className="rag-metric__name">{metric.name}</span>
                  <span className="rag-metric__value">
                    {metric.headlineValue}
                  </span>
                  <Icon
                    className="rag-metric__chevron"
                    name="chevron-down"
                    size={14}
                  />
                </summary>
                <dl className="rag-metric__facets">
                  {metric.facets.map((facet) => (
                    <div key={facet.label}>
                      <dt>{facet.label}</dt>
                      <dd>{facet.text}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
          </div>
        </SpotlightCard>
      </Reveal>

      <Reveal delay={70}>
        <div className="rag-scope">
          <aside
            className="rag-scope__card"
            aria-label="RAG evaluation scope and limits"
          >
            <h3>Scope and limits</h3>
            <p>{ragEval.scopeAndLimits}</p>
          </aside>
          <aside
            className="rag-scope__card"
            aria-label="RAG evaluation test-set construction"
          >
            <h3>Test-set construction</h3>
            <p>{ragEval.testSetConstruction}</p>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

function BenchmarkDataTable({ report }: { report: BenchmarkTable }) {
  return (
    <SpotlightCard className="benchmark-table-card">
      <div className="benchmark-card-heading">
        <h2>{report.title}</h2>
        {report.unit ? <span>{report.unit}</span> : null}
      </div>

      <div
        className="benchmark-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${report.title}, horizontally scrollable`}
      >
        <table style={{ minWidth: report.minWidth }}>
          <thead>
            <tr>
              <th scope="col">Benchmark</th>
              {report.columns.map((column) => (
                <th
                  className={column.falcon ? "is-falcon" : undefined}
                  key={column.label}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.metric}>
                <th scope="row">
                  <span>{row.metric}</span>
                  {row.description ? <small>{row.description}</small> : null}
                </th>
                {row.cells.map((cell, index) => {
                  const columnLabel =
                    report.columns[index]?.label ?? `column ${index + 1}`;
                  const classes = [
                    cell.falcon ? "is-falcon" : "",
                    cell.best ? "is-best" : "",
                    cell.reported ? "is-reported" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <td
                      className={classes || undefined}
                      key={`${row.metric}-${columnLabel}`}
                    >
                      {cell.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="benchmark-table-note">{report.note}</p>
    </SpotlightCard>
  );
}

function QualityPlot() {
  return (
    <SpotlightCard className="benchmark-plot-card">
      <div className="benchmark-card-heading">
        <h2>Quality per dollar</h2>
        <span>MMLU-Pro vs $/1M tokens · log scale</span>
      </div>

      <div
        className="benchmark-plot-scroll"
        tabIndex={0}
        role="region"
        aria-label="Quality per dollar plot, horizontally scrollable"
      >
        <svg
          viewBox="0 0 560 240"
          role="img"
          aria-labelledby="quality-plot-title quality-plot-description"
        >
          <title id="quality-plot-title">
            MMLU-Pro accuracy versus measured serving cost
          </title>
          <desc id="quality-plot-description">
            Falcon scores 82.0 at about 42 cents per million output tokens, the
            highest measured accuracy at the lowest measured cost among the
            models plotted here.
          </desc>

          <g className="benchmark-plot__axes">
            <path d="M46 14v174h500" />
            <path d="M109 14v174M231 14v174M353 14v174M514 14v174" />
          </g>
          <g className="benchmark-plot__labels">
            <text x="109" y="203" textAnchor="middle">
              $0.5
            </text>
            <text x="231" y="203" textAnchor="middle">
              $1
            </text>
            <text x="353" y="203" textAnchor="middle">
              $2
            </text>
            <text x="514" y="203" textAnchor="middle">
              $5
            </text>
            <text x="38" y="191" textAnchor="end">
              40
            </text>
            <text x="38" y="122" textAnchor="end">
              60
            </text>
            <text x="38" y="52" textAnchor="end">
              80
            </text>
            <text
              className="benchmark-plot__axis-title"
              x="296"
              y="222"
              textAnchor="middle"
            >
              $ per 1M output tokens (log scale) →
            </text>
            <text
              className="benchmark-plot__axis-title"
              x="14"
              y="100"
              textAnchor="middle"
              transform="rotate(-90 14 100)"
            >
              MMLU-Pro →
            </text>
          </g>

          <g className="benchmark-plot__point">
            <circle cx="109" cy="56" r="4" />
            <text x="119" y="60">
              Qwen3-30B-A3B
            </text>
          </g>
          <g className="benchmark-plot__point">
            <circle cx="329" cy="108" r="4" />
            <text x="339" y="112">
              Mistral-Small-3.2
            </text>
          </g>
          <g className="benchmark-plot__point benchmark-plot__point--reported">
            <circle cx="214" cy="69" r="4" />
            <text x="224" y="73">
              Llama-4-Scout 109B°
            </text>
          </g>
          <g className="benchmark-plot__point benchmark-plot__point--reported">
            <circle cx="532" cy="88" r="4" />
            <text x="524" y="92" textAnchor="end">
              Llama-3.3-70B°
            </text>
          </g>
          <g className="benchmark-plot__falcon">
            <circle
              className="benchmark-plot__falcon-halo"
              cx="78"
              cy="42"
              r="8"
            />
            <circle cx="78" cy="42" r="4.5" />
            <text x="90" y="40">
              Falcon
            </text>
          </g>
        </svg>
      </div>

      <p className="benchmark-plot-note">
        MMLU-Pro accuracy vs measured serving cost (log scale). Solid = both
        axes measured by this pipeline; ° = vendor-reported quality with our
        measured cost. Falcon sits at the top-left of the plotted set: the
        highest measured accuracy at the lowest measured cost among these
        models. Frontier APIs (GPT-5.6 class) bill $10–60 per 1M output tokens,
        off this chart’s right edge by an order of magnitude.
      </p>
    </SpotlightCard>
  );
}

export default function BenchmarksPage() {
  // Title/description live in the route's metadata export (app/benchmarks).
  return (
    <div className="benchmarks-page">
      <SiteHeader active="benchmarks" />

      <main id="main-content" tabIndex={-1}>
        <section className="benchmarks-hero" aria-labelledby="benchmarks-title">
          <h1 id="benchmarks-title">Falcon Bench</h1>
          <p className="benchmarks-hero__tagline">
            Frontier-class Indic AI at 1/13th the serving cost.
          </p>
          <p className="benchmarks-hero__intro">
            A 26B-parameter sparse mixture-of-experts, about 4B active per
            query, FP4-quantized and benchmarked exactly as it shipped on a
            single GPU. It outscores every same-class open model measured here
            across 11 Indian languages, tracks models many times its size on
            English reasoning, and serves at <strong>$0.42</strong> per million
            tokens.
          </p>

          <ul className="benchmarks-hero__method" aria-label="Method">
            <li>One pinned pipeline</li>
            <li>Greedy decoding</li>
            <li>Fixed seeds</li>
            <li>Full per-sample audit trail</li>
            <li>Every number re-runnable</li>
          </ul>
        </section>

        <section
          className="benchmark-metrics"
          aria-label="Headline benchmark results"
        >
          {headlineMetrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <h2>{metric.label}</h2>
              <p>{metric.detail}</p>
            </div>
          ))}
        </section>

        <section
          className="benchmark-tables"
          aria-label="Full benchmark tables"
        >
          {benchmarkTables.map((report, index) => (
            <Reveal key={report.title} delay={(index % 3) * 70}>
              <BenchmarkDataTable report={report} />
            </Reveal>
          ))}
        </section>

        <Reveal className="benchmark-section">
          <QualityPlot />
        </Reveal>

        <RagEvaluation />
      </main>

      <footer className="benchmarks-footer">
        falcon-26b · FINAL REPORT v1.1 · 2026-08-14 11:29 UTC · every number
        re-runnable
      </footer>
    </div>
  );
}
