import type { ResponseRecord } from './types';
import { mulberry32, columnFromCounts } from './seed';

// Seed marginals for the 96 simulated student responses. Each column is
// expanded to per-respondent values and zipped into response records.
// Means are never stored; the engine computes them.

export const studentMarginals: Record<string, Record<string, number>> = {
  // Very difficult … Very easy
  'S-Q5': { '1': 15, '2': 33, '3': 27, '4': 16, '5': 5 },
  // Very unclear … Very clear
  'S-Q8': { '1': 1, '2': 3, '3': 9, '4': 46, '5': 37 },
  // Never … Very often
  'S-Q11': { '1': 10, '2': 25, '3': 32, '4': 21, '5': 8 },
  // Never … Very often, Not sure (x1)
  'S-Q31': { '1': 14, '2': 30, '3': 27, '4': 11, '5': 3, x1: 11 },
  // Not at all useful … Extremely useful, I have not received feedback (x1)
  'S-Q33': { '1': 13, '2': 26, '3': 27, '4': 16, '5': 5, x1: 9 },
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
  other: 0,
  none: 0,
};

const N = 96;

const build = (): ResponseRecord[] => {
  const rand = mulberry32(20252026);
  const columns: Record<string, string[]> = {};
  for (const [qid, counts] of Object.entries(studentMarginals)) columns[qid] = columnFromCounts(counts, rand);
  const techColumns: Record<string, boolean[]> = {};
  for (const [opt, count] of Object.entries(studentTechSelections)) {
    techColumns[opt] = columnFromCounts({ y: count, n: N - count }, rand).map((v) => v === 'y');
  }
  const records: ResponseRecord[] = [];
  for (let i = 0; i < N; i++) {
    const answers: ResponseRecord['answers'] = {};
    for (const qid of Object.keys(columns)) answers[qid] = columns[qid][i];
    answers['S-Q4'] = Object.keys(techColumns).filter((opt) => techColumns[opt][i]);
    records.push({ id: `S-${String(i + 1).padStart(3, '0')}`, group: 'student', answers });
  }
  return records;
};

export const studentResponses: ResponseRecord[] = build();
