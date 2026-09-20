import type { AnswerValue, Role, ValidationStatus } from '../data/types';
import { BIAS_THRESHOLD, VALIDATION_BANDS, pairsForRole, validationPairs, type ValidationPair } from '../data/validation';
import { questionById } from '../instruments';
import type { Dataset } from './dataset';

// The validation layer. Each pair yields a primary value and an implied value
// on one 1–5 scale; everything below is read off the gap between them.

const valueOf = (questionId: string, answer: AnswerValue | undefined): number | null => {
  if (typeof answer !== 'string') return null;
  const opt = questionById(questionId).options?.find((o) => o.key === answer);
  if (!opt || opt.scoring === false) return null;
  const v = opt.implies ?? opt.value;
  return typeof v === 'number' ? v : null;
};

export const statusForGap = (gap: number): ValidationStatus =>
  VALIDATION_BANDS.find((b) => gap <= b.max)?.status ?? 'contradicted';

export interface PairCheck {
  pair: ValidationPair;
  primaryValue: number | null;
  impliedValue: number | null;
  /** primary − implied. Sign carries the direction of any disagreement. */
  signedGap: number | null;
  status: ValidationStatus;
  /** The label of the option the respondent actually chose on each item. */
  primaryLabel: string | null;
  validatorLabel: string | null;
}

const labelOf = (questionId: string, answer: AnswerValue | undefined): string | null => {
  if (typeof answer !== 'string') return null;
  return questionById(questionId).options?.find((o) => o.key === answer)?.label ?? null;
};

/** Validate one respondent's answers. Never mutates or discards them. */
export const checkAnswers = (role: Role, answers: Record<string, AnswerValue>): PairCheck[] =>
  pairsForRole(role).map((pair) => {
    const primaryValue = valueOf(pair.primaryQuestionId, answers[pair.primaryQuestionId]);
    const impliedValue = valueOf(pair.validatorQuestionId, answers[pair.validatorQuestionId]);
    const scored = primaryValue !== null && impliedValue !== null;
    const signedGap = scored ? primaryValue - impliedValue : null;
    return {
      pair,
      primaryValue,
      impliedValue,
      signedGap,
      status: scored ? statusForGap(Math.abs(signedGap!)) : 'unscored',
      primaryLabel: labelOf(pair.primaryQuestionId, answers[pair.primaryQuestionId]),
      validatorLabel: labelOf(pair.validatorQuestionId, answers[pair.validatorQuestionId]),
    };
  });

export interface ConsistencySummary {
  scored: number;
  corroborated: number;
  marginal: number;
  contradicted: number;
  /** Share of scored pairs that are corroborated. NaN when nothing is scored. */
  rate: number;
}

export const summarise = (checks: PairCheck[]): ConsistencySummary => {
  const scored = checks.filter((c) => c.status !== 'unscored');
  const count = (s: ValidationStatus) => scored.filter((c) => c.status === s).length;
  return {
    scored: scored.length,
    corroborated: count('corroborated'),
    marginal: count('marginal'),
    contradicted: count('contradicted'),
    rate: scored.length ? count('corroborated') / scored.length : NaN,
  };
};

export type BiasDirection = 'over-reports' | 'under-reports' | 'none';

export interface CohortValidation {
  pair: ValidationPair;
  n: number;
  corroborated: number;
  marginal: number;
  contradicted: number;
  corroborationRate: number;
  meanPrimary: number;
  meanImplied: number;
  /** Mean of (primary − implied) across respondents who answered both. */
  meanSignedGap: number;
  /** A signed gap beyond the bias threshold is systematic, not noise. */
  bias: BiasDirection;
}

/** Run the validation layer across every respondent in a group. */
export const cohortValidation = (ds: Dataset, role: Role): CohortValidation[] =>
  pairsForRole(role).map((pair) => {
    let n = 0;
    let sumPrimary = 0;
    let sumImplied = 0;
    const counts: Record<ValidationStatus, number> = { corroborated: 0, marginal: 0, contradicted: 0, unscored: 0 };
    for (const r of ds.responses[role]) {
      const p = valueOf(pair.primaryQuestionId, r.answers[pair.primaryQuestionId]);
      const i = valueOf(pair.validatorQuestionId, r.answers[pair.validatorQuestionId]);
      if (p === null || i === null) {
        counts.unscored += 1;
        continue;
      }
      n += 1;
      sumPrimary += p;
      sumImplied += i;
      counts[statusForGap(Math.abs(p - i))] += 1;
    }
    const meanSignedGap = n ? (sumPrimary - sumImplied) / n : NaN;
    return {
      pair,
      n,
      corroborated: counts.corroborated,
      marginal: counts.marginal,
      contradicted: counts.contradicted,
      corroborationRate: n ? counts.corroborated / n : NaN,
      meanPrimary: n ? sumPrimary / n : NaN,
      meanImplied: n ? sumImplied / n : NaN,
      meanSignedGap,
      bias: Number.isNaN(meanSignedGap)
        ? 'none'
        : meanSignedGap >= BIAS_THRESHOLD
          ? 'over-reports'
          : meanSignedGap <= -BIAS_THRESHOLD
            ? 'under-reports'
            : 'none',
    };
  });

/** Every pair in the model, across both tracks, for the assurance view. */
export const allCohortValidation = (ds: Dataset): CohortValidation[] => [
  ...cohortValidation(ds, 'student'),
  ...cohortValidation(ds, 'faculty'),
];

export const pairById = (id: string): ValidationPair => {
  const p = validationPairs.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown validation pair ${id}`);
  return p;
};
