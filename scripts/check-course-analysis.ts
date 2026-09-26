import { buildCourseAnalysis } from '../src/engine/courseAnalysis';
import { actionPlanMarkdown } from '../src/engine/actionPlan';
import { buildDataset, type ViewerSubmission } from '../src/engine/session';
import { seedDataset } from '../src/engine/dataset';
import { instruments } from '../src/instruments';
import { evaluateTrigger } from '../src/engine/triggers';
import { findings } from '../src/data/findings';
import { reducer, initialState } from '../src/state/reducer';

const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
const seed = buildCourseAnalysis(seedDataset);
assert(seed.supported.length + seed.inactive.length === findings.length, 'Every finding must have exactly one status');
assert(new Set([...seed.supported, ...seed.inactive].map(f => f.id)).size === findings.length, 'Finding status sets must not overlap');
assert(seed.actions.every(a => evaluateTrigger(a.finding, seedDataset).fires), 'Only supported findings get actions');
assert(seed.actions.every((a, i) => i === 0 || seed.actions[i - 1].score >= a.score), 'Action order must preserve the planning rule');
assert(seed.priorities.length === seed.concerns.length && seed.priorities.every((p, i) => p.finding.id === seed.concerns[i].id), 'Each supported concern appears once, in planning order');
assert(seed.priorities.every(p => [p.lead, ...p.further].every(a => !a || a.findingId === p.finding.id)), 'Priorities only carry their own finding\'s actions');
assert(seed.priorities.flatMap(p => [p.lead, ...p.further]).filter(Boolean).length === seed.actions.length, 'Every gated action belongs to one priority');
const lowFaculty: ViewerSubmission = { role: 'faculty', answers: Object.fromEntries(instruments.faculty.filter(q => q.type === 'single').map(q => [q.id, '1'])) };
const changedDataset = buildDataset(lowFaculty);
const changed = buildCourseAnalysis(changedDataset);
assert(changed.inactive.some(f => f.id === 'F4'), 'The changing evidence must make participation inactive');
assert(!changed.actions.some(a => a.findingId === 'F4'), 'Inactive participation must not receive an action');
assert(!changed.priorities.some(p => p.finding.id === 'F4'), 'Inactive participation must not appear as a priority');
assert(!actionPlanMarkdown(changedDataset).includes('Pilot smaller participation groups'), 'The download must not revive excluded actions');
assert(actionPlanMarkdown(seedDataset).includes('not approved assignments'), 'Plan must disclose proposed status');
assert(actionPlanMarkdown(seedDataset).includes('19 days now; target ≤ 14 days'), 'Plan must include resolved current evidence and target');
for (const tab of ['overview', 'perspectives', 'recommendations', 'findings'] as const) {
  const opened = reducer({ ...initialState, view: 'intelligence', tab }, { type: 'OPEN_FINDING', id: 'F1' });
  const closed = reducer(opened, { type: 'OPEN_FINDING', id: null });
  assert(closed.tab === tab, 'Inspecting evidence must preserve the originating view');
}
console.log('Course analysis checks passed: status separation, action gating and order, export values, and contextual navigation.');
