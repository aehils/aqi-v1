import type { ChainLink, LinkStatus } from '../data/inquiry';
import { transferChain } from '../data/inquiry';
import type { DomainId, Role } from '../data/types';
import { indicatorById, indicators } from '../data/indicators';
import { constructById } from '../data/constructs';
import { instruments } from '../instruments';
import { resolveMetric, meanFor } from './aggregate';
import { seedDataset, type Dataset } from './dataset';
import { checkAnswers, cohortValidation, summarise, type CohortValidation, type ConsistencySummary, type PairCheck } from './validate';
import type { ViewerSubmission } from './session';

// The immediate feedback report. It reads the viewer's own responses back to
// them against the cohort already on file, and states plainly what a single
// response cannot establish on its own.

export interface ChainReading {
  link: ChainLink;
  value: number;
  status: LinkStatus;
}

const linkStatus = (link: ChainLink, value: number): LinkStatus => {
  if (Number.isNaN(value)) return 'unread';
  if (link.direction === 'higher') {
    if (value >= link.intact) return 'intact';
    return value < link.cut ? 'cut' : 'weak';
  }
  if (value <= link.intact) return 'intact';
  return value > link.cut ? 'cut' : 'weak';
};

/** Resolve the transfer chain against the evidence base. */
export const readChain = (ds: Dataset): ChainReading[] =>
  transferChain.map((link) => {
    const value = resolveMetric(ds, link.metric);
    return { link, value, status: linkStatus(link, value) };
  });

/** The first link that is cut, reading the chain in order. Null if none is. */
export const firstBreak = (ds: Dataset): ChainReading | null => readChain(ds).find((r) => r.status === 'cut') ?? null;

export interface ResponseReading {
  questionId: string;
  indicatorId: string;
  label: string;
  constructId: string | null;
  constructName: string | null;
  domainId: DomainId | null;
  /** The viewer's own answer, on the 1–5 scale. */
  value: number;
  answerLabel: string;
  /** The cohort's mean before the viewer's response was added. */
  cohortMean: number;
  delta: number;
  /** Whether this reading is one of the crucial ones carrying a validator. */
  validated: boolean;
}

export interface ReportDomainLine {
  domainId: DomainId;
  /** Mean of the viewer's own scale answers falling in this domain. */
  yourMean: number;
  cohortMean: number;
  n: number;
}

export interface ResponseReport {
  role: Role;
  readings: ResponseReading[];
  /** Items answered that are recorded but carry no score (open text, escapes). */
  unscoredCount: number;
  domains: ReportDomainLine[];
  checks: PairCheck[];
  consistency: ConsistencySummary;
  cohortChecks: CohortValidation[];
  chain: ChainReading[];
  /** Chain links this role's instrument can speak to at all. */
  linksYouEvidence: string[];
  /** Widest agreement and widest disagreement with the cohort. */
  closest: ResponseReading | null;
  furthest: ResponseReading | null;
}

const scaleQuestionsFor = (role: Role) =>
  instruments[role].filter((q) => q.type === 'single' && q.indicatorId && !q.validates);

export const buildReport = (submission: ViewerSubmission, ds: Dataset): ResponseReport => {
  const { role, answers } = submission;
  const readings: ResponseReading[] = [];

  for (const q of scaleQuestionsFor(role)) {
    const a = answers[q.id];
    const opt = q.options?.find((o) => o.key === a);
    if (!opt || opt.scoring === false || typeof opt.value !== 'number') continue;
    const ind = indicatorById(q.indicatorId!);
    const construct = ind.constructId ? constructById(ind.constructId) : null;
    // Compared against the base as it stood before this response joined it.
    const cohortMean = meanFor(seedDataset, ind.id, role).mean;
    readings.push({
      questionId: q.id,
      indicatorId: ind.id,
      label: ind.label,
      constructId: construct?.id ?? null,
      constructName: construct?.name ?? null,
      domainId: construct?.domainId ?? null,
      value: opt.value,
      answerLabel: opt.label,
      cohortMean,
      delta: opt.value - cohortMean,
      validated: instruments[role].some((v) => v.validates === q.id),
    });
  }

  const unscoredCount = instruments[role].filter((q) => {
    const a = answers[q.id];
    if (a === undefined) return false;
    if (q.type === 'open') return true;
    const opt = q.options?.find((o) => o.key === a);
    return Boolean(opt && opt.scoring === false);
  }).length;

  const byDomain = new Map<DomainId, ResponseReading[]>();
  for (const r of readings) {
    if (!r.domainId) continue;
    byDomain.set(r.domainId, [...(byDomain.get(r.domainId) ?? []), r]);
  }
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
  const domains: ReportDomainLine[] = [...byDomain.entries()]
    .map(([domainId, rs]) => ({
      domainId,
      yourMean: mean(rs.map((r) => r.value)),
      cohortMean: mean(rs.map((r) => r.cohortMean).filter((v) => !Number.isNaN(v))),
      n: rs.length,
    }))
    .sort((a, b) => a.domainId.localeCompare(b.domainId));

  const checks = checkAnswers(role, answers);
  const ranked = readings.filter((r) => !Number.isNaN(r.delta)).sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));

  return {
    role,
    readings,
    unscoredCount,
    domains,
    checks,
    consistency: summarise(checks),
    cohortChecks: cohortValidation(ds, role),
    chain: readChain(ds),
    linksYouEvidence: transferChain.filter((l) => l.roleEvidence === 'both' || l.roleEvidence === role).map((l) => l.id),
    closest: ranked[0] ?? null,
    furthest: ranked[ranked.length - 1] ?? null,
  };
};

/** Indicators this role's instrument cannot reach, named so the gap is explicit. */
export const beyondThisInstrument = (role: Role): string[] => {
  const mine = new Set(instruments[role].map((q) => q.indicatorId).filter(Boolean));
  return indicators.filter((i) => !mine.has(i.id) && i.source !== role).map((i) => i.id);
};
