import type { Dataset } from './dataset';
import type { MetricSpec, Recommendation } from '../data/types';
import { buildCourseAnalysis } from './courseAnalysis';
import { categoricalFor, resolveMetric } from './aggregate';
import { actionTitles, studentMeasureLabels, studentPlan } from '../data/analysisPresentation';
import { course } from '../data/course';
import { withUnit } from '../lib/format';
import { compare } from './triggers';

export const actionMetric = (dataset: Dataset, metric: MetricSpec, unit?: string) =>
  metric.kind === 'categorical' ? categoricalFor(dataset, metric.indicatorId, metric.group, metric.map).modal : withUnit(resolveMetric(dataset, metric), unit);

type Measure = Recommendation['remeasure'][number];

/** Who the plan is written for. Students see only changes they would experience. */
export type Audience = 'student' | 'staff';

const groupsOf = (m: MetricSpec): string[] => m.kind === 'diff' ? [...groupsOf(m.a), ...groupsOf(m.b)] : m.kind === 'derived' ? [] : [m.group];
/** Student ratings and course records a student lives with; lecturer and admin readings are excluded. */
export const studentFacing = (m: Measure) => groupsOf(m.metric).every(g => g === 'student');

/** Gated actions for an audience, each with the measures that audience is shown. */
export const planFor = (dataset: Dataset, audience: Audience) => buildCourseAnalysis(dataset).actions
  .filter(a => audience === 'staff' || a.id in studentPlan)
  .map(a => ({ ...a, readings: a.recommendation.remeasure.filter(m => audience === 'staff' || studentFacing(m)).map(m => measureReading(dataset, m, audience)) }));

/** One progress measure read against its target. `scale` is set only for bounded
 * measures (five-point ratings and percentages); others show now and target as figures. */
export const measureReading = (dataset: Dataset, m: Measure, audience: Audience = 'staff') => {
  const categorical = m.metric.kind === 'categorical' ? m.metric : null;
  // A categorical measure is judged on its most common answer, the same answer the plan displays.
  const modal = categorical && categoricalFor(dataset, categorical.indicatorId, categorical.group, categorical.map)
    .counts.filter(c => c.count > 0).sort((a, b) => b.count - a.count)[0]?.option.key;
  const value = categorical ? (modal && modal in categorical.map ? categorical.map[modal] : NaN) : resolveMetric(dataset, m.metric);
  const toDisplay = m.unit === 'share' ? 100 : 1;
  const scale = m.metric.kind === 'diff' ? null : m.unit === '/5' ? 5 : m.unit === '%' || m.unit === 'share' ? 100 : null;
  const measured = Number.isFinite(value);
  const met = measured ? compare(m.goal.op, value, m.goal.value) : null;
  const gap = Math.abs(m.goal.value - value) * toDisplay;
  const gapText = m.unit === '%' || m.unit === 'share' ? `${Math.round(gap)} pts` : m.unit === 'days' ? `${withUnit(gap)} days` : withUnit(gap);
  const status = met === null ? 'Not yet measured' : met ? 'At target'
    : categorical ? 'Below target' : `${gapText} ${m.goal.op.startsWith('>') ? 'below' : 'above'} target`;
  return {
    label: audience === 'student' ? studentMeasureLabels[m.label] ?? m.label : m.label, target: m.target,
    // A difference between two ratings is a gap in points, not a rating out of 5.
    now: m.metric.kind === 'diff' ? `${withUnit(value)} pts` : actionMetric(dataset, m.metric, m.unit),
    value: value * toDisplay, goal: m.goal.value * toDisplay, lowerIsBetter: m.goal.op.startsWith('<'),
    scale, met, status,
  };
};

/** Downloadable discussion document. No assignment or completion is implied. */
export const actionPlanMarkdown = (dataset: Dataset, audience: Audience = 'staff'): string => {
  if (audience === 'student') return studentPlanMarkdown(dataset);
  const { actions } = buildCourseAnalysis(dataset);
  return [
    `# ${course.code}: proposed course action plan`,
    `${course.title} · ${course.session}`,
    'Simulated evidence. Actions and owners are proposals for discussion, not approved assignments. No next-cycle results have been collected.',
    'Planning order uses the number of supporting source types × the share of the cohort reached. This is not a confidence score.',
    ...actions.map((a, i) => [
      `## ${i + 1}. ${actionTitles[a.id] ?? a.recommendation.action}`,
      `Finding: ${a.finding.title} (${a.findingId})`,
      `Proposed action: ${a.recommendation.action}`,
      `Proposed owner: ${a.recommendation.owner}`,
      `Review: ${a.recommendation.reviewPoint}`,
      `Planning basis: ${a.basis}`,
      `Possible explanation, to investigate: ${a.recommendation.diagnosis}`,
      '### Measures of progress',
      ...a.recommendation.remeasure.map(m => `- ${m.label}: ${actionMetric(dataset, m.metric, m.unit)} now; target ${m.target}.`),
    ].join('\n\n')),
    ...(actions.length ? [] : ['No action-linked findings currently meet their evidence rules.']),
  ].join('\n\n');
};

const studentPlanMarkdown = (dataset: Dataset): string => {
  const plan = planFor(dataset, 'student');
  return [
    `# ${course.code}: planned changes`,
    `${course.title} · ${course.session}`,
    'Simulated evidence. These changes are proposed by the course team and not yet confirmed.',
    ...plan.map((a, i) => {
      const copy = studentPlan[a.id];
      return [
        `## ${i + 1}. ${copy.title}`,
        `What would change: ${copy.change}`,
        `When you should notice it: ${copy.notice}.`,
        `What you can do now: ${copy.youCanDo}`,
        '### How you’ll know it’s working',
        ...a.readings.map(r => `- ${r.label}: ${r.now} now; target ${r.target}.`),
      ].join('\n\n');
    }),
    ...(plan.length ? [] : ['No planned changes currently meet their evidence rules.']),
  ].join('\n\n');
};
