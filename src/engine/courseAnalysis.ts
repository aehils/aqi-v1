import type { Dataset } from './dataset';
import { findings, findingById } from '../data/findings';
import { recommendationById } from '../data/recommendations';
import { evaluateTrigger } from './triggers';
import { rankRecommendations } from './session';

/** One status gate for every course-analysis view and the exported plan. */
export const buildCourseAnalysis = (dataset: Dataset) => {
  const supported = findings.filter(f => evaluateTrigger(f, dataset).fires);
  const supportedIds = new Set(supported.map(f => f.id));
  const actions = rankRecommendations(dataset)
    .filter(rank => supportedIds.has(rank.findingId))
    .map(rank => ({ ...rank, recommendation: recommendationById(rank.id), finding: findingById(rank.findingId) }));
  const priorityIds = [...new Set(actions.map(a => a.findingId))];
  return {
    supported,
    inactive: findings.filter(f => !supportedIds.has(f.id)),
    concerns: supported.filter(f => f.kind === 'problem').sort((a, b) => {
      const ai = priorityIds.indexOf(a.id);
      const bi = priorityIds.indexOf(b.id);
      return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi);
    }),
    strengths: supported.filter(f => f.kind === 'strength'),
    questions: supported.filter(f => f.kind === 'relationship'),
    actions,
  };
};
