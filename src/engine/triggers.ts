import type { Comparator, Finding, TriggerTerm } from '../data/types';
import type { Dataset } from './dataset';
import { resolveMetric, metricN } from './aggregate';
import { derived } from './derived';

export interface EvaluatedTerm {
  term: TriggerTerm;
  value: number;
  threshold: number;
  thresholdLabel: string;
  n: number | null;
  passed: boolean;
}

export interface TriggerEvaluation {
  findingId: string;
  terms: EvaluatedTerm[];
  fires: boolean;
}

const compare = (op: Comparator, a: number, b: number): boolean => {
  switch (op) {
    case '<=':
      return a <= b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '==':
      return a === b;
  }
};

export const evaluateTrigger = (finding: Finding, ds: Dataset): TriggerEvaluation => {
  const terms = finding.trigger.terms.map((term) => {
    const value = resolveMetric(ds, term.metric);
    const threshold = typeof term.threshold === 'number' ? term.threshold : derived(term.threshold.derived);
    const thresholdLabel = typeof term.threshold === 'number' ? String(term.threshold) : `${term.threshold.derived} = ${threshold}`;
    return { term, value, threshold, thresholdLabel, n: metricN(ds, term.metric), passed: !Number.isNaN(value) && compare(term.op, value, threshold) };
  });
  return { findingId: finding.id, terms, fires: terms.every((t) => t.passed) };
};
