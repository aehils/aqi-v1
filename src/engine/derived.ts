import { assessmentEvents, feedbackPolicy, attendanceRegister, resultsExtract, itemPerformance } from '../data/institutionalData';
import { artefacts, curriculumDocument, applyPlusLevels } from '../data/artefacts';
import { lmsExtract } from '../data/lmsData';
import { observations } from '../data/observations';
import { course } from '../data/course';

// Derived metrics (class D) computed from records, artefacts and system data.
// Every derived key referenced by an indicator, reading or trigger term
// resolves here.

export const expandHistogram = (h: Record<number, number>): number[] => {
  const out: number[] = [];
  for (const [k, count] of Object.entries(h)) for (let i = 0; i < count; i++) out.push(Number(k));
  return out.sort((a, b) => a - b);
};

export const median = (values: number[]): number => {
  if (values.length === 0) return NaN;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export const turnaroundRecords = (): { eventId: string; days: number }[] =>
  assessmentEvents.flatMap((e) => expandHistogram(e.turnaroundHistogram).map((days) => ({ eventId: e.id, days })));

/**
 * Join the assessment schedule to feedback releases: for every feedback
 * release, is there a subsequent task falling due within the usable window?
 */
export const releasesFollowedByTaskWithinWindow = (): { count: number; total: number; perEvent: { eventId: string; nextTask: string | null; earliestGapDays: number | null; withinWindow: number; releases: number }[] } => {
  const window = feedbackPolicy.usableWindowDays;
  let count = 0;
  let total = 0;
  const perEvent = assessmentEvents.map((e) => {
    const releases = expandHistogram(e.turnaroundHistogram).map((d) => e.dueDay + d);
    const later = assessmentEvents.filter((o) => o.dueDay > e.dueDay).sort((a, b) => a.dueDay - b.dueDay);
    const next = later[0] ?? null;
    let earliestGap: number | null = null;
    let withinWindow = 0;
    for (const r of releases) {
      total += 1;
      const hit = later.find((o) => o.dueDay >= r && o.dueDay - r <= window);
      if (hit) {
        count += 1;
        withinWindow += 1;
      }
      if (next) {
        const gap = next.dueDay - r;
        earliestGap = earliestGap === null ? gap : Math.min(earliestGap, gap);
      }
    }
    return { eventId: e.id, nextTask: next ? next.id : null, earliestGapDays: earliestGap, withinWindow, releases: releases.length };
  });
  return { count, total, perEvent };
};

const artefactTotals = () => {
  const t = { remember_understand: 0, apply: 0, analyse_evaluate: 0, create: 0, total: 0 };
  for (const a of artefacts) {
    t.remember_understand += a.marksByLevel.remember_understand;
    t.apply += a.marksByLevel.apply;
    t.analyse_evaluate += a.marksByLevel.analyse_evaluate;
    t.create += a.marksByLevel.create;
    t.total += a.totalMarks;
  }
  return t;
};

const itemLevelMean = (level: 'recall' | 'application' | 'analysis'): number => {
  const items = itemPerformance.items.filter((i) => i.level === level);
  const marks = items.reduce((s, i) => s + i.marks, 0);
  return items.reduce((s, i) => s + i.meanPct * i.marks, 0) / marks;
};

const iloApplyPlus = () => curriculumDocument.ilos.filter((i) => applyPlusLevels.includes(i.level)).length;

export interface DerivedMetric {
  key: string;
  label: string;
  unit: string;
  compute: () => number;
}

const pct = (n: number, d: number) => (100 * n) / d;

export const derivedMetrics: DerivedMetric[] = [
  { key: 'feedback.turnaround.median', label: 'Median feedback turnaround', unit: 'days', compute: () => median(turnaroundRecords().map((r) => r.days)) },
  { key: 'feedback.turnaround.min', label: 'Shortest turnaround', unit: 'days', compute: () => Math.min(...turnaroundRecords().map((r) => r.days)) },
  { key: 'feedback.turnaround.max', label: 'Longest turnaround', unit: 'days', compute: () => Math.max(...turnaroundRecords().map((r) => r.days)) },
  { key: 'feedback.turnaround.n', label: 'Feedback events', unit: 'events', compute: () => turnaroundRecords().length },
  { key: 'feedback.turnaround.pct_over_21', label: 'Feedback events exceeding 21 days', unit: '%', compute: () => { const r = turnaroundRecords(); return pct(r.filter((x) => x.days > 21).length, r.length); } },
  { key: 'feedback.turnaround.pct_over_policy', label: 'Feedback events exceeding policy', unit: '%', compute: () => { const r = turnaroundRecords(); return pct(r.filter((x) => x.days > feedbackPolicy.turnaroundDays).length, r.length); } },
  { key: 'policy.threshold', label: 'Institutional turnaround policy', unit: 'days', compute: () => feedbackPolicy.turnaroundDays },
  { key: 'assessment.tasks_within_window', label: 'Feedback releases followed by a task within 14 days', unit: 'releases', compute: () => releasesFollowedByTaskWithinWindow().count },
  { key: 'assessment.count', label: 'Assessment events', unit: 'events', compute: () => assessmentEvents.length },
  { key: 'attendance.mean_pct', label: 'Mean attendance', unit: '%', compute: () => pct(attendanceRegister.sessions.reduce((a, b) => a + b, 0), attendanceRegister.sessions.length * attendanceRegister.enrolment) },
  { key: 'assignment.completion_pct', label: 'Assignment completion', unit: '%', compute: () => { const subs = assessmentEvents.filter((e) => e.kind === 'submission'); return pct(subs.reduce((s, e) => s + e.submissions, 0), subs.length * course.enrolment); } },
  { key: 'results.ca_average', label: 'CA average', unit: '%', compute: () => resultsExtract.caAverage },
  { key: 'results.pass_rate', label: 'Pass rate', unit: '%', compute: () => { const t = resultsExtract.gradeBands.reduce((s, g) => s + g.count, 0); return pct(resultsExtract.gradeBands.filter((g) => g.pass).reduce((s, g) => s + g.count, 0), t); } },
  { key: 'items.recall_mean', label: 'Recall items, mean score', unit: '%', compute: () => itemLevelMean('recall') },
  { key: 'items.application_mean', label: 'Application items, mean score', unit: '%', compute: () => itemLevelMean('application') },
  { key: 'items.analysis_mean', label: 'Analysis items, mean score', unit: '%', compute: () => itemLevelMean('analysis') },
  { key: 'lms.active_pct', label: 'Students accessing course space at least once', unit: '%', compute: () => pct(Object.values(lmsExtract.sessionsHistogram).reduce((a, b) => a + b, 0), lmsExtract.enrolment) },
  { key: 'lms.active_count', label: 'Active LMS users', unit: 'students', compute: () => Object.values(lmsExtract.sessionsHistogram).reduce((a, b) => a + b, 0) },
  { key: 'lms.median_sessions', label: 'Median sessions per active user', unit: 'sessions', compute: () => median(expandHistogram(lmsExtract.sessionsHistogram)) },
  { key: 'lms.discussion_posts', label: 'Discussion posts', unit: 'posts', compute: () => lmsExtract.discussionPosts },
  { key: 'artefact.marks_remember_understand_pct', label: 'Marks at Remember / Understand', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.remember_understand, t.total); } },
  { key: 'artefact.marks_apply_pct', label: 'Marks at Apply', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.apply, t.total); } },
  { key: 'artefact.marks_analyse_pct', label: 'Marks at Analyse / Evaluate', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.analyse_evaluate, t.total); } },
  { key: 'artefact.marks_create_pct', label: 'Marks at Create', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.create, t.total); } },
  { key: 'artefact.marks_apply_plus_pct', label: 'Marks at Apply or above', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.apply + t.analyse_evaluate + t.create, t.total); } },
  { key: 'artefact.marks_analyse_plus_pct', label: 'Marks at Analyse or above', unit: '%', compute: () => { const t = artefactTotals(); return pct(t.analyse_evaluate + t.create, t.total); } },
  { key: 'artefact.rubric_present_count', label: 'Tasks with a rubric', unit: 'tasks', compute: () => artefacts.filter((a) => a.rubricPresent).length },
  { key: 'artefact.rubric_present_pct', label: 'Tasks with a rubric', unit: '%', compute: () => pct(artefacts.filter((a) => a.rubricPresent).length, artefacts.length) },
  { key: 'artefact.count', label: 'Assessment artefacts analysed', unit: 'artefacts', compute: () => artefacts.length },
  { key: 'curriculum.ilo_count', label: 'Stated intended learning outcomes', unit: 'ILOs', compute: () => curriculumDocument.ilos.length },
  { key: 'curriculum.ilo_apply_plus_count', label: 'ILOs at Apply or above', unit: 'ILOs', compute: () => iloApplyPlus() },
  { key: 'curriculum.ilo_apply_plus_pct', label: 'ILOs at Apply or above', unit: '%', compute: () => pct(iloApplyPlus(), curriculumDocument.ilos.length) },
  { key: 'alignment.intent_assessed_gap', label: 'Intended minus assessed Apply+ share', unit: 'pts', compute: () => pct(iloApplyPlus(), curriculumDocument.ilos.length) - (() => { const t = artefactTotals(); return pct(t.apply + t.analyse_evaluate + t.create, t.total); })() },
  { key: 'observation.count', label: 'Teaching observations', unit: 'observations', compute: () => observations.length },
  { key: 'observation.clarity_meets_count', label: 'Observations rating clarity at or above expectation', unit: 'observations', compute: () => observations.filter((o) => o.clarityRating !== 'Below expectation').length },
  { key: 'observation.clarity_meets_pct', label: 'Observations rating clarity at or above expectation', unit: '%', compute: () => pct(observations.filter((o) => o.clarityRating !== 'Below expectation').length, observations.length) },
  { key: 'room.capacity_total', label: 'Largest teaching room capacity', unit: 'seats', compute: () => Math.max(...course.rooms.map((r) => r.capacity)) },
  { key: 'room.capacity_ratio', label: 'Enrolment relative to largest room', unit: '×', compute: () => course.enrolment / Math.max(...course.rooms.map((r) => r.capacity)) },
  { key: 'enrolment', label: 'Enrolment', unit: 'students', compute: () => course.enrolment },
  { key: 'accreditation.current', label: 'Accreditation current', unit: '', compute: () => (course.accreditationCurrent ? 1 : 0) },
];

const byKey = new Map(derivedMetrics.map((m) => [m.key, m]));

export const derived = (key: string): number => {
  const m = byKey.get(key);
  if (!m) throw new Error(`Unknown derived metric ${key}`);
  return m.compute();
};

export const derivedMeta = (key: string): DerivedMetric => {
  const m = byKey.get(key);
  if (!m) throw new Error(`Unknown derived metric ${key}`);
  return m;
};
