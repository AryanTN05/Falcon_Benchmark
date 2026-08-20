export interface BenchmarkColumn {
  readonly label: string;
  readonly falcon?: boolean;
}

export interface BenchmarkCell {
  readonly value: string;
  readonly best?: boolean;
  readonly falcon?: boolean;
  readonly reported?: boolean;
}

export interface BenchmarkRow {
  readonly metric: string;
  readonly description?: string;
  readonly cells: readonly BenchmarkCell[];
}

export interface BenchmarkTable {
  readonly title: string;
  readonly unit: string;
  readonly columns: readonly BenchmarkColumn[];
  readonly rows: readonly BenchmarkRow[];
  readonly note: string;
  readonly minWidth: number;
}

const cells = (
  values: readonly string[],
  falconIndex: number,
  bestIndex: number,
  reportedIndices: readonly number[] = [],
): readonly BenchmarkCell[] =>
  values.map((value, index) => ({
    value,
    falcon: index === falconIndex,
    best: index === bestIndex,
    reported: reportedIndices.includes(index),
  }));

const columns = (
  labels: readonly string[],
  falconIndex: number,
): readonly BenchmarkColumn[] =>
  labels.map((label, index) => ({ label, falcon: index === falconIndex }));

export const benchmarkTables: readonly BenchmarkTable[] = [
  {
    title: 'Serving economics: measured, identical hardware',
    unit: '',
    columns: columns(
      [
        'Falcon',
        'Qwen3-30B-A3B',
        'Gemma-3-27B',
        'Mistral-Small-3.2',
        'Sarvam-M',
        'Llama-4-Scout 109B',
        'Llama-3.3-70B',
      ],
      0,
    ),
    rows: [
      {
        metric: 'TTFT ms',
        description: '512-tok prompt · lower better',
        cells: cells(['21.00', '28.00', '48.00', '40.00', '40.00', '33.00', '59.00'], 0, 0),
      },
      {
        metric: 'Decode tok/s',
        description: '16 concurrent',
        cells: cells(['2,029', '1,699', '388', '480', '479', '921', '152'], 0, 0),
      },
      {
        metric: '$ per 1M output tokens',
        description: 'lower better',
        cells: cells(['0.42', '0.50', '2.17', '1.75', '1.76', '0.91', '5.54'], 0, 0),
      },
    ],
    note: 'Measured on one RTX PRO 6000 (Modal $3.03/h), identical load.',
    minWidth: 880,
  },
  {
    title: 'Indic languages: composite scores',
    unit: '',
    columns: columns(['Falcon', 'Qwen3-30B-A3B'], 0),
    rows: [
      {
        metric: 'MILU (generative CoT)',
        description: 'avg 10 langs, India-centric MCQ',
        cells: cells(['83.2', '73.8'], 0, 0),
      },
      {
        metric: 'MMLU-ProX hard MCQ',
        description: 'avg hi/bn/mr/te, CoT',
        cells: cells(['72.9', '55.4'], 0, 0),
      },
      {
        metric: 'GSM8K-Indic math',
        description: 'avg 10 langs, CoT',
        cells: cells(['88.3', '85.4'], 0, 0),
      },
      {
        metric: 'GSM8K romanized Hindi',
        description: 'Hinglish stressor',
        cells: cells(['86.0', '77.2'], 0, 0),
      },
      {
        metric: 'Translation en→Indic',
        description: 'avg 10, chrF++',
        cells: cells(['50.1', '41.2'], 0, 0),
      },
      {
        metric: 'Translation Indic→en',
        description: 'avg 10, chrF++',
        cells: cells(['61.6', '58.0'], 0, 0),
      },
      {
        metric: 'Hinglish→English',
        description: 'COMI-LINGUA, 3 refs, chrF++',
        cells: cells(['79.3', '76.0'], 0, 0),
      },
    ],
    note: 'Averages over the product’s Indian languages (10 scripts + romanized Hindi). MCQ composites in %, translation in chrF++. Per-language breakdowns: results_flat.csv.',
    minWidth: 620,
  },
  {
    title: 'Global languages: Falcon composite scores (13 locales)',
    unit: 'Falcon, measured',
    columns: columns(['Falcon'], 0),
    rows: [
      {
        metric: 'Belebele reading comp.',
        description: 'avg 13 global langs',
        cells: cells(['56.1'], 0, -1),
      },
      {
        metric: 'MMLU-ProX hard MCQ',
        description: 'avg 9 langs, CoT',
        cells: cells(['75.7'], 0, -1),
      },
    ],
    note: 'zh, ja, ko, es, de, ru, sv, pl, it, nl, ro, ar, id. Falcon’s own measured scores across the 13 non-Indic locales the product supports; no competitor is run on this suite, so no row is marked best.',
    minWidth: 460,
  },
  {
    title: 'English core',
    unit: '',
    columns: columns(['Falcon', 'Qwen3-30B-A3B', 'Mistral-Small-3.2'], 0),
    rows: [
      { metric: 'MMLU-Pro', description: '5-shot CoT', cells: cells(['82.0', '77.9', '63.2'], 0, 0) },
      { metric: 'GSM8K', description: '8-shot CoT', cells: cells(['94.0', '92.1', '83.9'], 0, 0) },
      { metric: 'MATH-500', description: 'math-verify', cells: cells(['95.2', '96.2', '87.6'], 0, 1) },
      { metric: 'AIME 2025', description: 'flex', cells: cells(['76.7', '70.0', '36.7'], 0, 0) },
      { metric: 'IFEval', description: 'prompt-strict', cells: cells(['89.8', '82.6', '74.5'], 0, 0) },
      { metric: 'HumanEval', description: 'pass@1', cells: cells(['99.4', '90.9', '88.4'], 0, 0) },
      { metric: 'MBPP+', description: 'pass@1', cells: cells(['96.6', '92.9', '84.9'], 0, 0) },
    ],
    note: 'All cells measured by this pipeline.',
    minWidth: 660,
  },
  {
    title: 'Scale contrast: bigger Meta models on the same GPU',
    unit: 'Serving rows measured on identical hardware',
    columns: columns(['Llama-4-Scout 109B', 'Llama-3.3-70B', 'Falcon'], 2),
    rows: [
      { metric: 'Total params (B)', cells: cells(['109.0', '70.6', '26.0'], 2, -1) },
      { metric: 'Active params (B)', cells: cells(['17.0', '70.6', '4.0'], 2, -1) },
      { metric: 'Decode tok/s', description: 'measured', cells: cells(['920.8', '151.9', '2,028.9'], 2, 2) },
      { metric: '$ / 1M tokens', description: 'measured', cells: cells(['0.9', '5.5', '0.4'], 2, 2) },
    ],
    note: 'Serving rows measured by this pipeline on the same GPU. This table makes a cost argument only: 4.2× the parameters at 2.2× the cost (Scout) or 13× the cost (70B). Quality is deliberately not compared here — the full quality suites for these two models were not run, and setting our measured scores against vendor-published numbers taken under different protocols would not be a like-for-like comparison.',
    minWidth: 700,
  },
] as const;

export interface RagFacet {
  readonly label: string;
  readonly text: string;
}

export interface RagMetric {
  readonly id: string;
  readonly name: string;
  /** Small qualifier line under the name in the summary table. */
  readonly summaryNote?: string;
  /** Value cell in the summary table. */
  readonly summaryValue: string;
  /** Fuller result shown on the expandable block's header. */
  readonly headlineValue: string;
  readonly facets: readonly RagFacet[];
}

export interface RagEval {
  readonly measuredLine: string;
  readonly metrics: readonly RagMetric[];
  readonly scopeAndLimits: string;
  readonly testSetConstruction: string;
}

export const ragEval: RagEval = {
  measuredLine:
    'Measured 2026-08-16 on dev. Corpus: 20 documents, 919 chunks, 9 clients. Test set: 506 cases, each with a verbatim evidence span from its source chunk.',
  metrics: [
    {
      id: 'rag-recall',
      name: 'Gold-chunk recall@10',
      summaryValue: '100.0%',
      headlineValue: '100.0%',
      facets: [
        {
          label: 'Definition',
          text: 'Of all questions asked, the percentage where the specific source chunk containing the answer appears in the top 10 retrieved results.',
        },
        {
          label: 'Why',
          text: 'Every test case is generated from one known chunk, so there is exactly one correct chunk per question. This makes retrieval success objectively checkable rather than a judgement call.',
        },
        {
          label: 'Detail',
          text: 'recall@1 89.5% · recall@3 98.2% · recall@5 99.2% · recall@10 100.0% · MRR@10 0.937 · never-found 0.0%.',
        },
        {
          label: 'Method',
          text: '506 questions issued to the retrieval tool with the same scoping production uses; the returned chunk IDs are matched against the known gold chunk ID.',
        },
      ],
    },
    {
      id: 'rag-multilingual',
      name: 'Multilingual retrieval',
      summaryNote: 'IndicMSMARCO R@10',
      summaryValue: '93.2%',
      headlineValue: '93.2% Recall@10',
      facets: [
        {
          label: 'Definition',
          text: 'On a public external benchmark, the percentage of queries where the correct passage is retrieved in the top 10, averaged across 10 Indian languages.',
        },
        {
          label: 'Why',
          text: 'An independently authored benchmark that we did not write, so the number is comparable to other systems and not self-graded.',
        },
        {
          label: 'Detail',
          text: 'Benchmark: IndicMSMARCO (AI4Bharat), 250 queries per language. Languages: Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia. Range 87.2%–95.6% · strongest Hindi 94.8% · weakest Odia 87.2% · MRR@10 0.843.',
        },
      ],
    },
    {
      id: 'rag-cross-script',
      name: 'Cross-script robustness',
      summaryValue: '−4.8pp',
      headlineValue: '−4.8pp',
      facets: [
        {
          label: 'Definition',
          text: 'The drop in retrieval accuracy when documents in 10 different languages are placed in a single knowledge base, versus each language kept separate.',
        },
        {
          label: 'Why',
          text: 'Real knowledge bases often mix languages. This isolates how much that mixing costs.',
        },
        {
          label: 'Detail',
          text: 'Recall@10 falls 93.2% → 88.4%. Rank-1 accuracy falls further, 79.2% → 64.2%. The loss concentrates in languages sharing a script: Marathi −30.4pp and Hindi −24.8pp at rank 1, both written in Devanagari. Marathi loses the top position to Hindi in 32 of 150 cases.',
        },
      ],
    },
    {
      id: 'rag-factual',
      name: 'Factual accuracy',
      summaryValue: '92.9%',
      headlineValue: '92.9%',
      facets: [
        {
          label: 'Definition',
          text: 'The percentage of answers that are factually correct according to the source document, judged on meaning rather than exact wording.',
        },
        {
          label: 'Why',
          text: 'Exact string matching penalises correct answers that differ in phrasing, spelling, or number format. Semantic assessment measures whether the user got the right answer.',
        },
        {
          label: 'Detail',
          text: 'n = 506 cases, 1012 turns. Assessed by an independent model (Gemini) against the source chunk only. Strict string-matching score on the same run was 81.7%; the 11-point difference is phrasing variance, not correctness. Completeness (all parts of multi-part questions answered): 98.4%.',
        },
      ],
    },
    {
      id: 'rag-hallucination',
      name: 'Hallucination',
      summaryNote: 'unsupported claims',
      summaryValue: '7.9%',
      headlineValue: '7.9% unsupported claims',
      facets: [
        {
          label: 'Definition',
          text: 'The percentage of answers containing at least one statement that cannot be traced back to the retrieved source document.',
        },
        {
          label: 'Why',
          text: 'This is hallucination in the sense that matters: the system answers a legitimate question but adds detail the document does not contain. Such statements are usually plausible and therefore hard for a user to detect.',
        },
        {
          label: 'Detail',
          text: '44 unsupported claims across 40 of 506 answers. Fully grounded answers: 91.7%.',
        },
        {
          label: 'Distinct from',
          text: 'Closed-domain hallucination (answering a question the corpus cannot support at all) measured separately at 0.7% (139 of 140 out-of-scope questions correctly declined; correct-refusal rate 99.3%).',
        },
      ],
    },
    {
      id: 'rag-hygiene',
      name: 'Output hygiene',
      summaryNote: 'defects',
      summaryValue: '1',
      headlineValue: '1 defect',
      facets: [
        {
          label: 'Definition',
          text: 'The count of malformed outputs across all turns, covering five failure types.',
        },
        {
          label: 'Why',
          text: 'These are absolute defects with no acceptable rate, so they are counted rather than averaged and gate a release rather than contributing to a score.',
        },
        {
          label: 'Detail',
          text: 'Across 1012 turns. Internal marker leakage: 0 · Empty answers: 0 · Degenerate repetition: 0 · Script contamination (wrong writing system in output): 0 · Stray channel tokens: 1.',
        },
      ],
    },
    {
      id: 'rag-kb-size',
      name: 'KB-size robustness',
      summaryValue: '−1.4pp',
      headlineValue: '−1.4pp',
      facets: [
        {
          label: 'Definition',
          text: 'The change in answer accuracy when a question is asked against a knowledge base containing all of a client’s documents, versus only the single document holding the answer.',
        },
        {
          label: 'Why',
          text: 'Customer knowledge bases grow over time. This measures whether accuracy holds as the search space expands.',
        },
        {
          label: 'Detail',
          text: 'Paired comparison, same 350 questions in both conditions, knowledge base up to 9× larger. Accuracy 81.4% → 80.0% (−1.4pp). 339 of 350 unchanged, 9 degraded, 2 improved. Retrieval over the same expansion: recall@1 −2.2pp, recall@3 and above unchanged.',
        },
      ],
    },
  ],
  scopeAndLimits:
    'All consumption metrics (4–7) are English only. Multilingual answer quality is not yet measured. Metrics 4 and 5 are produced by an LLM judge whose agreement with human labels has not yet been established. Metric 1 scopes each question to its own document, matching production project scoping. Metric 7 covers the multi-document condition. Metric 2 uses a ~1000-passage haystack per language; real-world corpora are larger, so this is an upper bound. The corpus is internal test and demo documents, not customer production content. Latency was measured on shared infrastructure and is excluded for that reason.',
  testSetConstruction:
    '506 cases generated from 919 chunks across 20 documents, one case per chunk, no duplicates. Every case carries a verbatim evidence span copied from its source chunk, verified by exact string match. Cases failing this check were discarded automatically. Cases are never judged by the model that generated them.',
};
