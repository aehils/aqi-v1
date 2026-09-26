import type { Option, ResponseRecord } from './types';
import { mulberry32, columnFromCounts } from './seed';
import { studentQuestions } from '../instruments/student';

// Seed marginals for the 96 simulated student responses. Each column is
// expanded to per-respondent values and zipped into response records.
// Means are never stored; the engine computes them.
//
// These are the original five-point marginals. Several items are now
// forced-choice — the neutral midpoint was removed because an answer of
// "neither" carries no reading — so for those items the midpoint count is
// redistributed to the two adjacent points in proportion to the lean already
// present in the cohort. The assumption is stated rather than hidden: a
// respondent taken off the fence falls to the side the cohort already leans.
// Nothing is re-tuned by hand; the redistribution is computed below.

export const studentMarginals: Record<string, Record<string, number>> = {
  // Very difficult … Very easy (forced choice)
  'S-Q5': { '1': 15, '2': 33, '3': 27, '4': 16, '5': 5 },
  // Very unclear … Very clear (forced choice)
  'S-Q8': { '1': 1, '2': 3, '3': 9, '4': 46, '5': 37 },
  // Never … Very often (forced choice)
  'S-Q11': { '1': 10, '2': 25, '3': 32, '4': 21, '5': 8 },
  // Never … Very often, Not sure (x1) (forced choice)
  'S-Q31': { '1': 14, '2': 30, '3': 27, '4': 11, '5': 3, x1: 11 },
  // Not at all useful … Extremely useful, I have not received feedback (x1)
  'S-Q33': { '1': 13, '2': 26, '3': 35, '5': 13, x1: 9 },
  // Much too late … Very timely, I have not received feedback (x1)
  'S-Q34': { '1': 24, '2': 30, '3': 20, '4': 10, '5': 3, x1: 9 },
  // Very dissatisfied … Very satisfied
  'S-Q37': { '1': 2, '2': 6, '3': 17, '4': 46, '5': 25 },
};

/** Multi-select S-Q4: number of respondents (of 96) selecting each option. */
export const studentTechSelections: Record<string, number> = {
  powerpoint: 87,
  whiteboard: 75,
  'online-readings': 60,
  'physical-labs': 45,
  lms: 33,
  'ai-tools': 28,
  recordings: 20,
  forums: 8,
  'virtual-labs': 4,
  simulation: 2,
  none: 0,
};

/**
 * Validator items are seeded conditionally on the primary answer, never
 * independently: for each respondent an offset is drawn from the kernel below
 * and applied to the value they gave on the paired item, then clamped to 1–5
 * and expressed as the option implying that value.
 *
 * A kernel centred on 0 produces disagreement that is merely noise. A kernel
 * weighted to one side produces disagreement with a direction, which is what
 * the validation layer is built to detect. Neither the corroboration rate nor
 * the directional bias is written down anywhere — the engine computes both.
 */
export const validatorKernels: Record<string, Record<string, number>> = {
  // A general impression of demand set against one recalled paper: skewed low.
  'S-V31': { '0': 35, '-1': 34, '-2': 20, '-3': 4, '1': 7 },
  // Feedback rated useful, set against what the student could do with it: skewed low.
  'S-V33': { '0': 33, '-1': 37, '-2': 22, '-3': 6, '1': 2 },
  // A timeliness judgement set against an elapsed period: centred.
  'S-V34': { '0': 46, '-1': 24, '1': 22, '-2': 5, '2': 3 },
};

/** Which primary item each validator is conditioned on. */
const validatorPrimary: Record<string, string> = { 'S-V31': 'S-Q31', 'S-V33': 'S-Q33', 'S-V34': 'S-Q34' };

const N = 96;

/** True when the item has no midpoint option, i.e. it is forced choice. */
const isForced = (questionId: string): boolean =>
  optionsFor(questionId).some((o) => o.scoring) && !optionsFor(questionId).some((o) => o.value === 3);

/**
 * Move the midpoint count onto the two adjacent points, in proportion to the
 * counts they already carry. Largest-remainder rounding keeps the total exact.
 */
const splitMidpoint = (counts: Record<string, number>): Record<string, number> => {
  const middle = counts['3'] ?? 0;
  if (!middle) return counts;
  const low = counts['2'] ?? 0;
  const high = counts['4'] ?? 0;
  const lean = low + high;
  const toLow = lean === 0 ? middle / 2 : (middle * low) / lean;
  const lowShare = Math.round(toLow);
  const out: Record<string, number> = { ...counts, '2': low + lowShare, '4': high + (middle - lowShare) };
  delete out['3'];
  return out;
};

const optionsFor = (questionId: string): Option[] => studentQuestions.find((q) => q.id === questionId)?.options ?? [];

/** A validator's scoring options, ordered from the lowest implied value up. */
const rungsOf = (validatorId: string): Option[] =>
  optionsFor(validatorId)
    .filter((o) => typeof o.implies === 'number')
    .sort((a, b) => a.implies! - b.implies!);

/**
 * The offset in a kernel is a number of rungs on the validator, not a number of
 * scale points. Rungs are what the respondent actually sees and chooses between,
 * and expressing the offset this way keeps the seeded behaviour stable when an
 * option is added to or removed from a validator: "one rung below the rating
 * they gave" means the same thing either way.
 */
const answerAtOffset = (validatorId: string, primaryValue: number, offset: number): string => {
  const rungs = rungsOf(validatorId);
  // The rung closest to the primary answer. Ties resolve upward, so the seeding
  // never nudges a respondent toward the over-reporting the layer detects.
  const base = rungs.reduce(
    (best, o, i) =>
      Math.abs(o.implies! - primaryValue) < Math.abs(rungs[best].implies! - primaryValue) ||
      (Math.abs(o.implies! - primaryValue) === Math.abs(rungs[best].implies! - primaryValue) && o.implies! > rungs[best].implies!)
        ? i
        : best,
    0,
  );
  return rungs[Math.min(rungs.length - 1, Math.max(0, base + offset))].key;
};

/** Turn kernel weights into whole-respondent counts summing to n. */
const scaleCounts = (kernel: Record<string, number>, n: number): Record<string, number> => {
  const total = Object.values(kernel).reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  let assigned = 0;
  const keys = Object.keys(kernel);
  keys.forEach((k, i) => {
    if (i === keys.length - 1) out[k] = n - assigned;
    else {
      out[k] = Math.round((kernel[k] / total) * n);
      assigned += out[k];
    }
  });
  return out;
};

const build = (): ResponseRecord[] => {
  const rand = mulberry32(20252026);
  const columns: Record<string, string[]> = {};
  for (const [qid, counts] of Object.entries(studentMarginals)) {
    columns[qid] = columnFromCounts(isForced(qid) ? splitMidpoint(counts) : counts, rand);
  }
  const techColumns: Record<string, boolean[]> = {};
  for (const [opt, count] of Object.entries(studentTechSelections)) {
    techColumns[opt] = columnFromCounts({ y: count, n: N - count }, rand).map((v) => v === 'y');
  }
  const offsets: Record<string, string[]> = {};
  for (const [vid, kernel] of Object.entries(validatorKernels)) offsets[vid] = columnFromCounts(scaleCounts(kernel, N), rand);

  const records: ResponseRecord[] = [];
  for (let i = 0; i < N; i++) {
    const answers: ResponseRecord['answers'] = {};
    for (const qid of Object.keys(columns)) answers[qid] = columns[qid][i];
    answers['S-Q4'] = Object.keys(techColumns).filter((opt) => techColumns[opt][i]);
    for (const [vid, primaryId] of Object.entries(validatorPrimary)) {
      const primary = optionsFor(primaryId).find((o) => o.key === answers[primaryId]);
      if (!primary || primary.scoring === false || typeof primary.value !== 'number') {
        // No scorable primary answer, so the validator carries its escape option.
        answers[vid] = 'x1';
        continue;
      }
      answers[vid] = answerAtOffset(vid, primary.value, Number(offsets[vid][i]));
    }
    records.push({ id: `S-${String(i + 1).padStart(3, '0')}`, group: 'student', answers });
  }
  return records;
};

export const studentResponses: ResponseRecord[] = build();
