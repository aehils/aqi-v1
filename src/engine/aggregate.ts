import type { Dataset } from './dataset';
import type { MetricSpec, Option, SourceGroup } from '../data/types';
import { indicatorById } from '../data/indicators';
import { questionById } from '../instruments';
import { derived } from './derived';

// Aggregation over response records. Non-scoring options (escapes such as
// "Not sure") are excluded from means and reported separately.

const questionForIndicator = (indicatorId: string) => {
  const ind = indicatorById(indicatorId);
  if (!ind.questionId) throw new Error(`Indicator ${indicatorId} has no question`);
  return questionById(ind.questionId);
};

export interface MeanResult {
  mean: number;
  n: number;
  nScoring: number;
  nNonScoring: number;
}

export const meanFor = (ds: Dataset, indicatorId: string, group: SourceGroup): MeanResult => {
  const q = questionForIndicator(indicatorId);
  const options = q.options ?? [];
  let sum = 0;
  let nScoring = 0;
  let nNonScoring = 0;
  let n = 0;
  for (const r of ds.responses[group]) {
    const a = r.answers[q.id];
    if (typeof a !== 'string') continue;
    n += 1;
    const opt = options.find((o) => o.key === a);
    if (!opt) continue;
    if (opt.scoring && typeof opt.value === 'number') {
      sum += opt.value;
      nScoring += 1;
    } else nNonScoring += 1;
  }
  return { mean: nScoring ? sum / nScoring : NaN, n, nScoring, nNonScoring };
};

export interface DistributionRow {
  option: Option;
  count: number;
  share: number;
  scoring: boolean;
  viewer: boolean;
}

export const distributionFor = (ds: Dataset, indicatorId: string, group: SourceGroup): { rows: DistributionRow[]; n: number } => {
  const q = questionForIndicator(indicatorId);
  const responses = ds.responses[group];
  const rows: DistributionRow[] = (q.options ?? []).map((option) => {
    let count = 0;
    let viewer = false;
    for (const r of responses) {
      const a = r.answers[q.id];
      if (a === option.key) {
        count += 1;
        if (r.isViewer) viewer = true;
      }
    }
    return { option, count, share: responses.length ? count / responses.length : 0, scoring: option.scoring !== false, viewer };
  });
  return { rows, n: responses.length };
};

export interface SelectionRow {
  option: Option;
  count: number;
  rate: number;
  viewer: boolean;
}

export const selectionsFor = (ds: Dataset, indicatorId: string, group: SourceGroup): { rows: SelectionRow[]; n: number } => {
  const q = questionForIndicator(indicatorId);
  const responses = ds.responses[group];
  const rows: SelectionRow[] = (q.options ?? []).map((option) => {
    let count = 0;
    let viewer = false;
    for (const r of responses) {
      const a = r.answers[q.id];
      if (Array.isArray(a) && a.includes(option.key)) {
        count += 1;
        if (r.isViewer) viewer = true;
      }
    }
    return { option, count, rate: responses.length ? count / responses.length : 0, viewer };
  });
  return { rows, n: responses.length };
};

export const selectionRateFor = (ds: Dataset, indicatorId: string, group: SourceGroup, optionKey: string): { rate: number; count: number; n: number } => {
  const { rows, n } = selectionsFor(ds, indicatorId, group);
  const row = rows.find((r) => r.option.key === optionKey);
  return { rate: row ? row.rate : 0, count: row ? row.count : 0, n };
};

export const matrixMeanFor = (ds: Dataset, indicatorId: string, group: SourceGroup, rowKey: string): MeanResult => {
  const q = questionForIndicator(indicatorId);
  const options = q.options ?? [];
  let sum = 0;
  let nScoring = 0;
  let n = 0;
  for (const r of ds.responses[group]) {
    const a = r.answers[q.id];
    if (!a || typeof a !== 'object' || Array.isArray(a)) continue;
    const v = a[rowKey];
    if (v === undefined) continue;
    n += 1;
    const opt = options.find((o) => o.key === v);
    if (opt && typeof opt.value === 'number') {
      sum += opt.value;
      nScoring += 1;
    }
  }
  return { mean: nScoring ? sum / nScoring : NaN, n, nScoring, nNonScoring: n - nScoring };
};

export const matrixRowsFor = (ds: Dataset, indicatorId: string, group: SourceGroup): { rows: { row: Option; mean: number; n: number; viewerValue?: number }[]; n: number } => {
  const q = questionForIndicator(indicatorId);
  const responses = ds.responses[group];
  const rows = (q.rows ?? []).map((row) => {
    const m = matrixMeanFor(ds, indicatorId, group, row.key);
    const viewer = responses.find((r) => r.isViewer);
    let viewerValue: number | undefined;
    if (viewer) {
      const a = viewer.answers[q.id];
      if (a && typeof a === 'object' && !Array.isArray(a)) {
        const opt = (q.options ?? []).find((o) => o.key === a[row.key]);
        viewerValue = opt?.value;
      }
    }
    return { row, mean: m.mean, n: m.nScoring, viewerValue };
  });
  return { rows, n: responses.length };
};

/** Categorical (institution single-choice) → mean of mapped values, with modal label. */
export const categoricalFor = (ds: Dataset, indicatorId: string, group: SourceGroup, map: Record<string, number>): { mean: number; modal: string; counts: { option: Option; count: number; viewer: boolean }[]; n: number } => {
  const q = questionForIndicator(indicatorId);
  const responses = ds.responses[group];
  const counts = (q.options ?? []).map((option) => ({ option, count: 0, viewer: false }));
  let sum = 0;
  let n = 0;
  for (const r of responses) {
    const a = r.answers[q.id];
    if (typeof a !== 'string') continue;
    const c = counts.find((x) => x.option.key === a);
    if (c) {
      c.count += 1;
      if (r.isViewer) c.viewer = true;
    }
    if (a in map) {
      sum += map[a];
      n += 1;
    }
  }
  const modal = counts.slice().sort((a, b) => b.count - a.count)[0];
  return { mean: n ? sum / n : NaN, modal: modal && modal.count > 0 ? modal.option.label : '—', counts, n: responses.length };
};

/** Resolve any metric spec to a number against the dataset. */
export const resolveMetric = (ds: Dataset, spec: MetricSpec): number => {
  switch (spec.kind) {
    case 'mean':
      return meanFor(ds, spec.indicatorId, spec.group).mean;
    case 'matrix':
      return matrixMeanFor(ds, spec.indicatorId, spec.group, spec.row).mean;
    case 'selection':
      return selectionRateFor(ds, spec.indicatorId, spec.group, spec.option).rate;
    case 'categorical':
      return categoricalFor(ds, spec.indicatorId, spec.group, spec.map).mean;
    case 'derived':
      return derived(spec.key);
    case 'diff': {
      const d = resolveMetric(ds, spec.a) - resolveMetric(ds, spec.b);
      return spec.abs ? Math.abs(d) : d;
    }
  }
};

/** n behind a metric spec (respondents for response-based metrics; records for derived). */
export const metricN = (ds: Dataset, spec: MetricSpec): number | null => {
  switch (spec.kind) {
    case 'mean':
      return meanFor(ds, spec.indicatorId, spec.group).nScoring;
    case 'matrix':
      return matrixMeanFor(ds, spec.indicatorId, spec.group, spec.row).nScoring;
    case 'selection':
      return selectionRateFor(ds, spec.indicatorId, spec.group, spec.option).n;
    case 'categorical':
      return categoricalFor(ds, spec.indicatorId, spec.group, spec.map).n;
    case 'derived':
      return null;
    case 'diff':
      return null;
  }
};

/** Human-readable rendering of a metric spec, e.g. "student_mean(IND-FBT-01)". */
export const metricExpression = (spec: MetricSpec): string => {
  switch (spec.kind) {
    case 'mean':
      return `${spec.group}_mean(${spec.indicatorId})`;
    case 'matrix':
      return `${spec.group}_matrix(${spec.indicatorId}, ${spec.row})`;
    case 'selection':
      return `${spec.group}_rate(${spec.indicatorId}, ${spec.option})`;
    case 'categorical':
      return `${spec.group}_mapped(${spec.indicatorId})`;
    case 'derived':
      return `derived(${spec.key})`;
    case 'diff':
      return spec.abs ? `|${metricExpression(spec.a)} − ${metricExpression(spec.b)}|` : `${metricExpression(spec.a)} − ${metricExpression(spec.b)}`;
  }
};

export const groupSizes = (ds: Dataset): Record<SourceGroup, number> => ({
  student: ds.responses.student.length,
  faculty: ds.responses.faculty.length,
  institution: ds.responses.institution.length,
});
