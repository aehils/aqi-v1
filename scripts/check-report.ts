import { buildReport } from '../src/engine/report';
import { buildReportEvaluation } from '../src/engine/reportEvaluation';
import { buildDataset, type ViewerSubmission } from '../src/engine/session';
import { seedDataset } from '../src/engine/dataset';
import { instruments } from '../src/instruments';
import type { Role } from '../src/data/types';
import { evaluateTrigger } from '../src/engine/triggers';

const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };

for (const role of ['student', 'faculty'] as Role[]) {
  const submission: ViewerSubmission = { role, answers: { ...seedDataset.responses[role][0].answers } };
  const report = buildReport(submission, buildDataset(submission));
  for (const r of report.readings) {
    const scoringCount = r.distribution.filter(row => row.scoring).reduce((sum, row) => sum + row.count, 0);
    assert(r.cohortN === scoringCount, `${role}: denominator must match scored distribution for ${r.questionId}`);
    assert(r.distribution.reduce((sum, row) => sum + row.count, 0) === r.cohortN + r.cohortUnscored, 'Distribution must account for unscored answers');
    assert(r.cohortN + r.cohortUnscored <= seedDataset.responses[role].length, 'Viewer must not enter comparison base');
  }
  const ds = buildDataset(submission);
  const evaluation = buildReportEvaluation(submission, ds);
  assert(new Set(evaluation.priorities.map(p => p.finding.id)).size === evaluation.priorities.length, 'Multiple recommendations must not duplicate a finding');
  assert(evaluation.priorities.every(p => evaluateTrigger(p.finding, ds).fires), 'Only supported findings get an action card');
  assert(evaluation.priorities.every(p => p.recommendation.findingId === p.finding.id), 'Actions must belong to their finding');
  const written = instruments[role].find(q => q.type === 'open')!;
  const withNote = { ...submission, answers: { ...submission.answers, [written.id]: 'My concern is unrelated to the available findings.' } };
  assert(JSON.stringify(buildReportEvaluation(withNote, buildDataset(withNote)).priorities.map(p => p.finding.id)) === JSON.stringify(evaluation.priorities.map(p => p.finding.id)), 'Free text must not manufacture matching findings');
}

const lowFaculty: ViewerSubmission = { role: 'faculty', answers: Object.fromEntries(instruments.faculty.filter(q => q.type === 'single').map(q => [q.id, '1'])) };
assert(!buildReportEvaluation(lowFaculty, buildDataset(lowFaculty)).priorities.some(p => p.finding.id === 'F4'), 'Do not recommend a participation finding that no longer meets its rule');
const empty: ViewerSubmission = { role: 'student', answers: {} };
assert(buildReport(empty, buildDataset(empty)).readings.length === 0, 'Empty response must not generate ratings');
assert(buildReportEvaluation(empty, buildDataset(empty)).priorities.every(p => p.relatedQuestions.length === 0), 'Course findings must not invent personal answers');
console.log('Report checks passed: denominators, viewer exclusion, finding/action gating, free-text handling, and empty responses.');
