import type { AnswerValue, Finding, Role, ResponseRecord } from '../data/types';
import { findings } from '../data/findings';
import { recommendations } from '../data/recommendations';
import { indicators } from '../data/indicators';
import { instruments, questionById } from '../instruments';
import { seedDataset, type Dataset } from './dataset';
import { meanFor, matrixMeanFor, selectionsFor, categoricalFor, resolveMetric, groupSizes } from './aggregate';
import { categoricalMaps } from '../data/readings';
import { evaluateTrigger } from './triggers';
import { constructBand } from './bands';

export interface ViewerSubmission {
  role: Role;
  answers: Record<string, AnswerValue>;
}

/** The viewer's response flows through the same aggregation as every other record. Never special-cased in a component. */
export const buildDataset = (viewer: ViewerSubmission | null): Dataset => {
  if (!viewer) return seedDataset;
  const record: ResponseRecord = { id: `${viewer.role.toUpperCase()}-VIEWER`, group: viewer.role, answers: viewer.answers, isViewer: true };
  return {
    responses: {
      ...seedDataset.responses,
      [viewer.role]: [...seedDataset.responses[viewer.role], record],
    },
  };
};

export interface IndicatorShift {
  indicatorId: string;
  label: string;
  before: number;
  after: number;
  delta: number;
}

export interface ViewerDivergence {
  indicatorId: string;
  questionId: string;
  viewerValue: number;
  cohortMean: number;
  findingId: string | null;
}

export interface ViewerImpact {
  role: Role;
  groupN: number;
  shifts: IndicatorShift[];
  maxAbsDelta: number;
  changedFindings: string[];
  divergences: ViewerDivergence[];
}

export const computeViewerImpact = (viewer: ViewerSubmission): ViewerImpact => {
  const before = seedDataset;
  const after = buildDataset(viewer);
  const shifts: IndicatorShift[] = [];
  for (const ind of indicators) {
    if (ind.source !== viewer.role || !ind.questionId) continue;
    if (ind.measure === 'scale') {
      const b = meanFor(before, ind.id, viewer.role).mean;
      const a = meanFor(after, ind.id, viewer.role).mean;
      if (!Number.isNaN(a) && !Number.isNaN(b) && Math.abs(a - b) > 1e-9) shifts.push({ indicatorId: ind.id, label: ind.label, before: b, after: a, delta: a - b });
    } else if (ind.measure === 'matrix') {
      const q = questionById(ind.questionId);
      for (const row of q.rows ?? []) {
        const b = matrixMeanFor(before, ind.id, viewer.role, row.key).mean;
        const a = matrixMeanFor(after, ind.id, viewer.role, row.key).mean;
        if (!Number.isNaN(a) && !Number.isNaN(b) && Math.abs(a - b) > 1e-9) shifts.push({ indicatorId: `${ind.id}·${row.key}`, label: `${ind.label} — ${row.label}`, before: b, after: a, delta: a - b });
      }
    } else if (ind.measure === 'multi') {
      const b = selectionsFor(before, ind.id, viewer.role).rows;
      const a = selectionsFor(after, ind.id, viewer.role).rows;
      for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i].rate - b[i].rate) > 1e-9) shifts.push({ indicatorId: `${ind.id}·${a[i].option.key}`, label: `${ind.label} — ${a[i].option.label}`, before: b[i].rate, after: a[i].rate, delta: a[i].rate - b[i].rate });
      }
    } else if (ind.measure === 'categorical') {
      const map = categoricalMaps[ind.id as keyof typeof categoricalMaps];
      if (!map) continue;
      const b = categoricalFor(before, ind.id, viewer.role, map).mean;
      const a = categoricalFor(after, ind.id, viewer.role, map).mean;
      if (!Number.isNaN(a) && !Number.isNaN(b) && Math.abs(a - b) > 1e-9) shifts.push({ indicatorId: ind.id, label: ind.label, before: b, after: a, delta: a - b });
    }
  }
  const changedFindings = findings
    .filter((f) => evaluateTrigger(f, before).fires !== evaluateTrigger(f, after).fires)
    .map((f) => f.id);
  const divergences: ViewerDivergence[] = [];
  for (const q of instruments[viewer.role]) {
    if (q.type !== 'single' || !q.indicatorId) continue;
    const a = viewer.answers[q.id];
    const opt = q.options?.find((o) => o.key === a);
    if (!opt || typeof opt.value !== 'number') continue;
    const cohort = meanFor(before, q.indicatorId, viewer.role).mean;
    if (Number.isNaN(cohort)) continue;
    if (Math.abs(opt.value - cohort) >= 1.5) {
      const f = findings.find((x) => x.indicatorIds.includes(q.indicatorId!));
      divergences.push({ indicatorId: q.indicatorId, questionId: q.id, viewerValue: opt.value, cohortMean: cohort, findingId: f ? f.id : null });
    }
  }
  return {
    role: viewer.role,
    groupN: groupSizes(after)[viewer.role],
    shifts,
    maxAbsDelta: shifts.reduce((m, s) => Math.max(m, Math.abs(s.delta)), 0),
    changedFindings,
    divergences,
  };
};

/** Findings whose trigger fires against the dataset, in authored order. */
export const firingFindings = (ds: Dataset): Finding[] => findings.filter((f) => evaluateTrigger(f, ds).fires);

export interface RankedRecommendation {
  id: string;
  findingId: string;
  evidenceSources: number;
  breadthShare: number;
  score: number;
  basis: string;
}

/** Ranking basis, stated: number of independent source types behind the finding × share of cohort affected. */
export const rankRecommendations = (ds: Dataset): RankedRecommendation[] =>
  recommendations
    .map((r) => {
      const f = findings.find((x) => x.id === r.findingId)!;
      const sources = new Set<string>();
      for (const c of f.constructIds) for (const s of constructBand(ds, c).sourceTypes) sources.add(s);
      const score = sources.size * r.breadth.share;
      return { id: r.id, findingId: r.findingId, evidenceSources: sources.size, breadthShare: r.breadth.share, score, basis: `${sources.size} source types × ${Math.round(r.breadth.share * 100)}% of cohort` };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

export const resolve = (ds: Dataset, spec: Parameters<typeof resolveMetric>[1]) => resolveMetric(ds, spec);
