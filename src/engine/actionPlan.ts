import type { Dataset } from './dataset';
import type { MetricSpec } from '../data/types';
import { buildCourseAnalysis } from './courseAnalysis';
import { categoricalFor, resolveMetric } from './aggregate';
import { actionTitles } from '../data/analysisPresentation';
import { course } from '../data/course';
import { withUnit } from '../lib/format';

export const actionMetric = (dataset: Dataset, metric: MetricSpec, unit?: string) =>
  metric.kind === 'categorical' ? categoricalFor(dataset, metric.indicatorId, metric.group, metric.map).modal : withUnit(resolveMetric(dataset, metric), unit);

/** Downloadable discussion document. No assignment or completion is implied. */
export const actionPlanMarkdown = (dataset: Dataset): string => {
  const { actions } = buildCourseAnalysis(dataset);
  return [
    `# ${course.code} — proposed course action plan`,
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
