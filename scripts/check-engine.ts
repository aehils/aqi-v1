// Hand-check engine values against the build brief §6.
import { seedDataset } from '../src/engine/dataset';
import { meanFor, matrixMeanFor, selectionRateFor, categoricalFor } from '../src/engine/aggregate';
import { derived, releasesFollowedByTaskWithinWindow } from '../src/engine/derived';
import { allDomainBands, constructBand } from '../src/engine/bands';
import { allComparisons } from '../src/engine/compare';
import { findings } from '../src/data/findings';
import { evaluateTrigger } from '../src/engine/triggers';
import { buildDataset, computeViewerImpact, rankRecommendations } from '../src/engine/session';
import { constructs } from '../src/data/constructs';
import { categoricalMaps } from '../src/data/readings';
import { allCohortValidation, checkAnswers, summarise } from '../src/engine/validate';
import { readChain } from '../src/engine/report';

const ds = seedDataset;
const f1 = (x: number) => x.toFixed(2);
const check = (label: string, value: number, expect: number, tol = 0.06) => {
  const ok = Math.abs(value - expect) <= tol;
  console.log(`${ok ? 'ok ' : 'XX '} ${label.padEnd(44)} ${f1(value)}  (expect ${expect})`);
};

// The four forced-choice student items carry expectations re-derived after the
// midpoint was removed: the brief's five-point marginals are redistributed by
// splitMidpoint() in responses.student.ts, and these are the means that
// redistribution produces. The five-point items keep the brief's values.
console.log('--- students n=' + ds.responses.student.length);
check('IND-RES-01 (forced)', meanFor(ds, 'IND-RES-01', 'student').mean, 2.52);
check('IND-CLR-01 (forced)', meanFor(ds, 'IND-CLR-01', 'student').mean, 4.27);
check('IND-ACT-02 (forced)', meanFor(ds, 'IND-ACT-02', 'student').mean, 2.9);
check('IND-CGD-01 (forced)', meanFor(ds, 'IND-CGD-01', 'student').mean, 2.36);
check('IND-FBQ-01', meanFor(ds, 'IND-FBQ-01', 'student').mean, 2.7);
check('IND-FBT-01', meanFor(ds, 'IND-FBT-01', 'student').mean, 2.3);
check('IND-SAT-01 (forced)', meanFor(ds, 'IND-SAT-01', 'student').mean, 4.03);
check('CGD not sure share', meanFor(ds, 'IND-CGD-01', 'student').nNonScoring / 96, 0.11, 0.01);
check('LMS experienced', selectionRateFor(ds, 'IND-TECH-STU', 'student', 'lms').rate, 0.34, 0.01);
console.log('--- faculty n=' + ds.responses.faculty.length);
check('TECH powerpoint', matrixMeanFor(ds, 'IND-TECH-FAC', 'faculty', 'powerpoint').mean, 4.6);
check('TECH lms', matrixMeanFor(ds, 'IND-TECH-FAC', 'faculty', 'lms').mean, 2.1);
check('TECH virtual-labs', matrixMeanFor(ds, 'IND-TECH-FAC', 'faculty', 'virtual-labs').mean, 1.3);
check('IND-ACT-01', meanFor(ds, 'IND-ACT-01', 'faculty').mean, 4.0);
check('IND-CLR-02', meanFor(ds, 'IND-CLR-02', 'faculty').mean, 4.1);
check('IND-ALN-01', meanFor(ds, 'IND-ALN-01', 'faculty').mean, 4.4);
check('IND-CGD-02', meanFor(ds, 'IND-CGD-02', 'faculty').mean, 3.8);
check('IND-FBQ-02', meanFor(ds, 'IND-FBQ-02', 'faculty').mean, 4.3);
check('IND-EFF-01', meanFor(ds, 'IND-EFF-01', 'faculty').mean, 3.9);
check('class-size barrier', selectionRateFor(ds, 'IND-FBB-01', 'faculty', 'class-size').rate, 1.0, 0.01);
console.log('--- institution n=' + ds.responses.institution.length);
console.log('MON modal:', categoricalFor(ds, 'IND-MON-01', 'institution', categoricalMaps['IND-MON-01']).modal);
console.log('TRN modal:', categoricalFor(ds, 'IND-TRN-01', 'institution', categoricalMaps['IND-TRN-01']).modal);
console.log('REV modal:', categoricalFor(ds, 'IND-REV-01', 'institution', categoricalMaps['IND-REV-01']).modal);
console.log('--- records');
check('turnaround median', derived('feedback.turnaround.median'), 19, 0);
check('turnaround min', derived('feedback.turnaround.min'), 9, 0);
check('turnaround max', derived('feedback.turnaround.max'), 34, 0);
check('pct over 21', derived('feedback.turnaround.pct_over_21'), 38, 0.5);
check('tasks within window', derived('assessment.tasks_within_window'), 0, 0);
console.log(JSON.stringify(releasesFollowedByTaskWithinWindow().perEvent));
check('attendance', derived('attendance.mean_pct'), 71, 0.5);
check('completion', derived('assignment.completion_pct'), 86, 0.5);
check('pass rate', derived('results.pass_rate'), 81, 0.5);
check('recall', derived('items.recall_mean'), 68, 0.5);
check('application', derived('items.application_mean'), 47, 0.5);
check('analysis', derived('items.analysis_mean'), 41, 0.5);
check('lms active', derived('lms.active_pct'), 31, 0.5);
check('lms median sessions', derived('lms.median_sessions'), 2, 0);
check('RU marks', derived('artefact.marks_remember_understand_pct'), 71, 0);
check('Apply marks', derived('artefact.marks_apply_pct'), 22, 0);
check('Analyse marks', derived('artefact.marks_analyse_pct'), 7, 0);
check('ILO apply+', derived('curriculum.ilo_apply_plus_count'), 4, 0);
check('obs meets', derived('observation.clarity_meets_pct'), 100, 0);
console.log('--- bands');
for (const d of allDomainBands(ds)) console.log(d.domainId.padEnd(4), d.band.padEnd(13), d.derivation);
for (const c of constructs.filter((x) => x.instrumented)) {
  const cb = constructBand(ds, c.id);
  console.log('  ', c.id.padEnd(40), cb.band.padEnd(13), cb.sourceTypes.join(','), cb.divergent ? ' DIVERGENT ' + cb.divergenceNote : '');
}
console.log('instrumented:', constructs.filter((x) => x.instrumented).length, 'of', constructs.length);
console.log('--- comparisons');
for (const c of allComparisons(ds)) console.log(c.spec.constructId.padEnd(40), c.flagged ? 'FLAG' : '    ', c.divergence.padEnd(28), c.supports ?? '', Object.values(c.cells).map((x) => `${x!.column}=${x!.display}`).join(' | '));
console.log('--- triggers');
for (const f of findings) {
  const ev = evaluateTrigger(f, ds);
  console.log(f.id, ev.fires ? 'FIRES' : 'DOES NOT FIRE', ev.terms.map((t) => `${t.term.expression}=${f1(t.value)} ${t.term.op} ${t.thresholdLabel} ${t.passed ? '✓' : '✗'}`).join(' ; '));
}
console.log('--- viewer impact (student, all 1s)');
const v1 = computeViewerImpact({ role: 'student', answers: { 'S-Q4': ['lms'], 'S-Q5': '1', 'S-Q8': '1', 'S-Q11': '1', 'S-Q31': '1', 'S-Q33': '1', 'S-Q34': '1', 'S-Q37': '1', 'S-Q39': 'x' } });
console.log(v1.groupN, v1.shifts.length, f1(v1.maxAbsDelta), v1.changedFindings, v1.divergences.map((d) => d.indicatorId));
console.log('--- viewer impact (faculty, all 1s)');
const v2 = computeViewerImpact({ role: 'faculty', answers: { F10: { powerpoint: '1', whiteboard: '1', lms: '1', videos: '1', 'virtual-labs': '1', 'ai-tools': '1' }, F11: '1', F13: '1', F19: '1', F21: '1', F23: '1', F25: ['none'], F37: '1', F38: 'x' } });
console.log(v2.groupN, v2.shifts.length, f1(v2.maxAbsDelta), v2.changedFindings);
const dsF = buildDataset({ role: 'faculty', answers: { F10: { powerpoint: '1', whiteboard: '1', lms: '1', videos: '1', 'virtual-labs': '1', 'ai-tools': '1' }, F11: '1', F13: '1', F19: '1', F21: '1', F23: '1', F25: ['none'], F37: '1', F38: 'x' } });
for (const f of findings) console.log('  faculty-1s', f.id, evaluateTrigger(f, dsF).fires ? 'FIRES' : 'DOES NOT FIRE');
console.log('--- viewer impact (faculty, all 5s)');
const dsF5 = buildDataset({ role: 'faculty', answers: { F10: { powerpoint: '5', whiteboard: '5', lms: '5', videos: '5', 'virtual-labs': '5', 'ai-tools': '5' }, F11: '5', F13: '5', F19: '5', F21: '5', F23: '5', F25: ['none'], F37: '5', F38: 'x' } });
for (const f of findings) console.log('  faculty-5s', f.id, evaluateTrigger(f, dsF5).fires ? 'FIRES' : 'DOES NOT FIRE');
console.log('--- response validation (cohort)');
for (const v of allCohortValidation(ds)) {
  console.log(
    ' ',
    v.pair.id.padEnd(12),
    `n=${String(v.n).padEnd(3)}`,
    `corrob=${(100 * v.corroborationRate).toFixed(0)}%`.padEnd(12),
    `marg=${v.marginal}`.padEnd(9),
    `contra=${v.contradicted}`.padEnd(11),
    `primary=${f1(v.meanPrimary)} implied=${f1(v.meanImplied)} gap=${f1(v.meanSignedGap)}`,
    v.bias,
  );
}
console.log('--- response validation (one viewer: generous student)');
const vChecks = checkAnswers('student', { 'S-Q31': '4', 'S-V31': 'recall', 'S-Q33': '5', 'S-V33': 'knew-no-task', 'S-Q34': '2', 'S-V34': '2to3w' });
for (const c of vChecks) console.log(' ', c.pair.id, c.primaryValue, 'vs', c.impliedValue, '->', c.status);
console.log(' summary', JSON.stringify(summarise(vChecks)));
console.log('--- transfer chain');
for (const l of readChain(ds)) console.log(' ', l.link.id, l.link.name.padEnd(12), f1(l.value), l.link.unit ?? '', l.status);
console.log('--- ranking');
for (const r of rankRecommendations(ds)) console.log(r.id, r.findingId, r.basis, r.score);
