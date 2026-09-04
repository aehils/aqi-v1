import type { Signal } from '../data/types';
import { comparisons, type CellSpec, type Column, type ComparisonSpec } from '../data/comparisons';
import { DIVERGENCE_THRESHOLD } from '../data/readings';
import type { Dataset } from './dataset';
import { categoricalFor, metricN, resolveMetric } from './aggregate';
import { signalFor } from './bands';

export interface ResolvedCell extends CellSpec {
  column: Column;
  value: number;
  n: number | null;
  signal: Signal;
  display: string;
}

export interface ComparisonResult {
  spec: ComparisonSpec;
  cells: Partial<Record<Column, ResolvedCell>>;
  flagged: boolean;
  divergence: string;
  supports: 'student' | 'faculty' | 'institution' | 'none' | null;
}

const fmtScale = (v: number) => (Number.isNaN(v) ? '—' : v.toFixed(1));

export const formatCell = (ds: Dataset, cell: CellSpec, value: number): string => {
  switch (cell.format) {
    case 'scale':
      return `${fmtScale(value)} / 5`;
    case 'share': {
      const n = metricN(ds, cell.metric);
      if (n !== null && n <= 12) return `${Math.round(value * n)} of ${n}`;
      return `${Math.round(value * 100)}%`;
    }
    case 'pct':
      return `${Math.round(value)}%`;
    case 'days':
      return `${Number.isInteger(value) ? value : value.toFixed(1)} days`;
    case 'count':
      return `${value}`;
    case 'ratio':
      return `${value.toFixed(2)}×`;
    case 'label': {
      if (cell.modalOf && cell.metric.kind === 'categorical') {
        const c = categoricalFor(ds, cell.modalOf.indicatorId, cell.modalOf.group, cell.metric.map);
        return c.modal;
      }
      return fmtScale(value);
    }
  }
};

export const compareConstruct = (ds: Dataset, spec: ComparisonSpec): ComparisonResult => {
  const cells: Partial<Record<Column, ResolvedCell>> = {};
  for (const col of Object.keys(spec.cells) as Column[]) {
    const c = spec.cells[col]!;
    const value = resolveMetric(ds, c.metric);
    const signal = signalFor({ source: 'records', label: '', metric: c.metric, direction: c.direction, good: c.good, bad: c.bad }, value);
    cells[col] = { ...c, column: col, value, n: metricN(ds, c.metric), signal, display: formatCell(ds, c, value) };
  }
  const respondents = (['student', 'faculty', 'institution'] as Column[]).map((k) => cells[k]).filter((x): x is ResolvedCell => Boolean(x));
  const five = respondents.filter((c) => c.onFivePoint && !Number.isNaN(c.value));
  let flagged = false;
  let divergence = 'Sources agree';
  if (five.length >= 2) {
    const spread = Math.max(...five.map((c) => c.value)) - Math.min(...five.map((c) => c.value));
    if (spread >= DIVERGENCE_THRESHOLD) {
      flagged = true;
      divergence = `${spread.toFixed(1)} on 5-point scale`;
    }
  }
  if (!flagged) {
    const sigs = respondents.map((c) => c.signal);
    if (sigs.includes('positive') && sigs.includes('negative')) {
      flagged = true;
      divergence = 'Categorical contradiction';
    }
  }
  const obj = cells.objective;
  let supports: ComparisonResult['supports'] = null;
  if (obj && flagged) {
    const match = respondents.find((c) => c.signal === obj.signal);
    supports = match ? (match.column as 'student' | 'faculty' | 'institution') : 'none';
  }
  return { spec, cells, flagged, divergence, supports };
};

export const allComparisons = (ds: Dataset): ComparisonResult[] => comparisons.map((spec) => compareConstruct(ds, spec));

export const comparisonThresholdStatement = `Divergence is flagged at ≥${DIVERGENCE_THRESHOLD.toFixed(1)} between source means on a 5-point scale, or where one source reads positive and another negative on the stated thresholds (a categorical contradiction).`;
