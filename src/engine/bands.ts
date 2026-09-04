import type { Band, DomainId, Reading, Signal, SourceType } from '../data/types';
import { constructs, constructsInDomain } from '../data/constructs';
import { readingsByConstruct, DIVERGENCE_THRESHOLD } from '../data/readings';
import type { Dataset } from './dataset';
import { resolveMetric, metricN } from './aggregate';

export const bandLabel: Record<Band, string> = {
  strong: 'Strong',
  adequate: 'Adequate',
  attention: 'Attention required',
  conflicting: 'Conflicting evidence',
  insufficient: 'Insufficient evidence',
};

export const bandMeaning: Record<Band, string> = {
  strong: 'Multiple independent sources converge positively.',
  adequate: 'Evidence positive but from a narrow source base, or mixed within acceptable range.',
  attention: 'Evidence indicates a problem, or sources diverge materially and the objective evidence supports the concern.',
  conflicting: 'Sources disagree and no source has precedence.',
  insufficient: 'Not instrumented in this demo, or too little evidence to read.',
};

const OBJECTIVE: SourceType[] = ['records', 'artefact', 'lms', 'observation', 'curriculum'];

export interface ResolvedReading extends Reading {
  value: number;
  n: number | null;
  signal: Signal;
}

export const signalFor = (r: Reading, value: number): Signal => {
  if (Number.isNaN(value)) return 'neutral';
  if (r.direction === 'higher') {
    if (value >= r.good) return 'positive';
    if (value <= r.bad) return 'negative';
    return 'neutral';
  }
  if (value <= r.good) return 'positive';
  if (value >= r.bad) return 'negative';
  return 'neutral';
};

export const resolveReadings = (ds: Dataset, constructId: string): ResolvedReading[] =>
  (readingsByConstruct[constructId] ?? []).map((r) => {
    const value = resolveMetric(ds, r.metric);
    return { ...r, value, n: metricN(ds, r.metric), signal: signalFor(r, value) };
  });

export interface ConstructBand {
  constructId: string;
  band: Band;
  readings: ResolvedReading[];
  sourceTypes: SourceType[];
  divergent: boolean;
  divergenceNote: string | null;
  rationale: string;
}

/**
 * Band derivation. Stated rules:
 *  - no readings → Insufficient evidence
 *  - single source → never above Adequate; negative → Attention required
 *  - divergent (≥1.0 between 5-point means, or positive and negative signals
 *    from different sources): objective evidence present → follows the
 *    objective signal (negative → Attention required); none → Conflicting evidence
 *  - not divergent: all positive → Strong; any negative → Attention required; else Adequate
 */
export const constructBand = (ds: Dataset, constructId: string): ConstructBand => {
  const readings = resolveReadings(ds, constructId);
  const sourceTypes = Array.from(new Set(readings.map((r) => r.source)));
  if (readings.length === 0) {
    const c = constructs.find((x) => x.id === constructId);
    const rationale = c?.instrumented ? 'Qualitative evidence only in this demo; no quantitative reading to band.' : 'Not instrumented in this demo.';
    return { constructId, band: 'insufficient', readings, sourceTypes, divergent: false, divergenceNote: null, rationale };
  }
  const signals = readings.map((r) => r.signal);
  const fivePoint = readings.filter((r) => r.onFivePoint && !Number.isNaN(r.value));
  let divergent = false;
  let divergenceNote: string | null = null;
  if (fivePoint.length >= 2) {
    const values = fivePoint.map((r) => r.value);
    const spread = Math.max(...values) - Math.min(...values);
    if (spread >= DIVERGENCE_THRESHOLD) {
      divergent = true;
      divergenceNote = `${spread.toFixed(1)} between source means on a 5-point scale (threshold ${DIVERGENCE_THRESHOLD.toFixed(1)})`;
    }
  }
  if (!divergent) {
    const posSources = new Set(readings.filter((r) => r.signal === 'positive').map((r) => r.source));
    const negSources = new Set(readings.filter((r) => r.signal === 'negative').map((r) => r.source));
    const contradiction = [...posSources].some((s) => ![...negSources].every((n) => n === s)) && negSources.size > 0 && posSources.size > 0;
    if (contradiction) {
      divergent = true;
      divergenceNote = 'Positive and negative signals from different sources (categorical contradiction)';
    }
  }
  const objective = readings.filter((r) => OBJECTIVE.includes(r.source));
  let band: Band;
  let rationale: string;
  if (sourceTypes.length === 1) {
    if (signals.includes('negative')) {
      band = 'attention';
      rationale = 'Single source; evidence indicates a problem.';
    } else {
      band = 'adequate';
      rationale = 'Single source; a construct evidenced by one source is never reported above Adequate.';
    }
  } else if (divergent) {
    if (objective.length > 0) {
      const objNeg = objective.some((r) => r.signal === 'negative');
      const objPos = objective.every((r) => r.signal === 'positive');
      if (objNeg) {
        band = 'attention';
        rationale = 'Sources diverge; records, artefacts or system data support the concern.';
      } else if (objPos) {
        band = 'adequate';
        rationale = 'Sources diverge; objective evidence is positive, respondent concern noted.';
      } else {
        band = 'conflicting';
        rationale = 'Sources diverge; objective evidence does not settle it.';
      }
    } else {
      band = 'conflicting';
      rationale = 'Sources diverge and no source has precedence.';
    }
  } else if (signals.every((s) => s === 'positive')) {
    band = 'strong';
    rationale = `${sourceTypes.length} independent sources converge positively.`;
  } else if (signals.includes('negative')) {
    band = 'attention';
    rationale = 'Sources agree that the evidence indicates a problem.';
  } else {
    band = 'adequate';
    rationale = 'Evidence mixed within acceptable range.';
  }
  return { constructId, band, readings, sourceTypes, divergent, divergenceNote, rationale };
};

export interface DomainBand {
  domainId: DomainId;
  band: Band;
  counts: Record<Band, number>;
  notInstrumented: number;
  evidenced: number;
  derivation: string;
  constructs: ConstructBand[];
}

const MIN_EVIDENCED = 2;

export const domainBand = (ds: Dataset, domainId: DomainId): DomainBand => {
  const all = constructsInDomain(domainId);
  const instrumented = all.filter((c) => c.instrumented);
  const cbs = instrumented.map((c) => constructBand(ds, c.id));
  const counts: Record<Band, number> = { strong: 0, adequate: 0, attention: 0, conflicting: 0, insufficient: 0 };
  for (const cb of cbs) counts[cb.band] += 1;
  const notInstrumented = all.length - instrumented.length;
  const evidenced = cbs.filter((cb) => cb.band !== 'insufficient').length;
  let band: Band;
  if (evidenced < MIN_EVIDENCED) band = 'insufficient';
  else if (counts.attention > 0) band = 'attention';
  else if (counts.conflicting > 0) band = 'conflicting';
  else if (counts.strong === evidenced) band = 'strong';
  else band = 'adequate';
  const parts: string[] = [];
  if (counts.attention) parts.push(`${counts.attention} attention required`);
  if (counts.conflicting) parts.push(`${counts.conflicting} conflicting evidence`);
  if (counts.strong) parts.push(`${counts.strong} strong`);
  if (counts.adequate) parts.push(`${counts.adequate} adequate`);
  if (counts.insufficient) parts.push(`${counts.insufficient} qualitative only`);
  parts.push(`${notInstrumented} not instrumented`);
  const derivation = `${parts.join(' · ')}${band === 'insufficient' ? ' — fewer than 2 constructs evidenced, so the domain is not read' : ''}`;
  return { domainId, band, counts, notInstrumented, evidenced, derivation, constructs: cbs };
};

export const allDomainBands = (ds: Dataset): DomainBand[] => (['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'] as DomainId[]).map((d) => domainBand(ds, d));
