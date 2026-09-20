import { reportGuidance } from '../data/reportGuidance';
import { recommendationById } from '../data/recommendations';
import { instruments } from '../instruments';
import { firingFindings, rankRecommendations, type ViewerSubmission } from './session';
import type { Dataset } from './dataset';

/** Keep only supported findings. Rank course priorities using the existing, disclosed basis.
 * Written concerns are never classified or treated as proof of a finding.
 */
export const buildReportEvaluation = (submission: ViewerSubmission, dataset: Dataset) => {
  const supported = firingFindings(dataset);
  const seen = new Set<string>();
  const priorities = rankRecommendations(dataset).flatMap(rank => {
    const finding = supported.find(f => f.id === rank.findingId);
    const guidance = reportGuidance[rank.findingId];
    if (!finding || !guidance || seen.has(finding.id)) return [];
    seen.add(finding.id);
    const relatedQuestions = instruments[submission.role].filter(q => {
      const answer = submission.answers[q.id];
      return q.indicatorId && finding.indicatorIds.includes(q.indicatorId)
        && answer !== undefined && (typeof answer !== 'string' || answer.trim() !== '');
    });
    return [{ finding, guidance, rank, recommendation: recommendationById(rank.id), relatedQuestions }];
  });
  return { priorities, strengths: supported.filter(f => f.kind === 'strength') };
};
