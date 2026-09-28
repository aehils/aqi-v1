const canonical = (value: unknown): string => JSON.stringify(value, (_key, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const assert = {
  equal(actual: unknown, expected: unknown) { if (actual !== expected) throw new Error(`Expected ${expected}, received ${actual}`); },
  deepEqual(actual: unknown, expected: unknown) { if (canonical(actual) !== canonical(expected)) throw new Error('Restored submission differs from original'); },
};
import { initialState, reducer } from '../src/state/reducer';
import { restoreReportState, parseReportSession } from '../src/state/reportSession';
import { seedDataset } from '../src/engine/dataset';

for (const role of ['student', 'faculty'] as const) {
  const submission = { role, answers: seedDataset.responses[role][0].answers };
  const saved = JSON.stringify(submission);
  const restored = restoreReportState('#overview', saved);
  assert.deepEqual(restored.submission, submission);
  assert.equal(restored.view, 'intelligence');
  const report = reducer(restored, { type: 'BACK_TO_REPORT' });
  assert.equal(report.view, 'report');
  assert.deepEqual(report.submission, submission);
  assert.equal(restoreReportState('', saved).view, 'report');
  assert.equal(reducer(report, { type: 'REPORT_DONE' }).view, 'intelligence');
  assert.equal(reducer(report, { type: 'RESTART' }).submission, null);
}
assert.equal(reducer({ ...initialState, view: 'intelligence' }, { type: 'BACK_TO_REPORT' }).view, 'report');
assert.equal(restoreReportState('#overview', null).view, 'intelligence');
assert.equal(parseReportSession('{'), null);
assert.equal(parseReportSession('{"role":"unknown","answers":{}}'), null);
assert.equal(parseReportSession('{"role":"student","answers":[]}'), null);
console.log('Report navigation checks passed: session restore, both roles, return navigation, missing reports, reset, and invalid storage.');

assert.equal(restoreReportState('#report', null).view, 'report');
assert.equal(restoreReportState('#report', null).submission, null);
