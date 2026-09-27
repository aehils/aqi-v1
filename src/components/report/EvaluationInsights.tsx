import { useMemo, useState } from 'react';
import { EvidenceGraphic } from './ReportVisuals';
import type { Dataset } from '../../engine/dataset';
import type { ViewerSubmission } from '../../engine/session';
import { buildReportEvaluation } from '../../engine/reportEvaluation';
import { resolveMetric } from '../../engine/aggregate';
import { withUnit } from '../../lib/format';
import type { AnswerValue, Question } from '../../data/types';

export const answerText = (question: Question, answer: AnswerValue | undefined): string => {
  if (answer === undefined) return 'Not answered';
  if (Array.isArray(answer)) return answer.length
    ? answer.map(key => question.options?.find(o => o.key === key)?.label ?? key).join(', ')
    : 'No options selected';
  if (typeof answer === 'object') return (question.rows ?? []).filter(row => answer[row.key] !== undefined)
    .map(row => `${row.label}: ${question.options?.find(o => o.key === answer[row.key])?.label ?? answer[row.key]}`).join('; ');
  return question.type === 'open' ? answer : question.options?.find(o => o.key === answer)?.label ?? answer;
};

const shortSteps: Record<string, [string, string]> = {
 F1: ['Ask for a task where you can use your feedback.', 'Schedule feedback before a follow-up practice task.'],
 F2: ['Request an application problem with feedback on your reasoning.', 'Review how many assessment marks reward application.'],
 F3: ['Ask for an offline or low-bandwidth route to materials.', 'Provide low-bandwidth materials and a campus access route.'],
 F4: ['Bring an example of when you could not participate.', 'Check who participates; discuss smaller tutorial groups.'],
};

export const EvaluationInsights = ({ submission, dataset, onOpenFinding }: {
  submission: ViewerSubmission;
  dataset: Dataset;
  onOpenFinding: (id: string) => void;
}) => {
  const evaluation = useMemo(() => buildReportEvaluation(submission, dataset), [submission, dataset]);
  const [focus, setFocus] = useState('all');
  const priorities = evaluation.priorities.filter(p => focus === 'all' || p.finding.id === focus);

  return <section className="report-section report-evaluation" id="evaluation" aria-labelledby="evaluation-title">
    <div className="report-section-heading">
      <div><p className="section-label">01 · Put your answers to use</p>
        <h2 id="evaluation-title">Where change could help most.</h2>
        <p>Combined course evidence, including your response. Actions below are suggestions.</p>
      </div>
      <label className="report-filter">Explore a concern
        <select value={focus} onChange={e => setFocus(e.target.value)}>
          <option value="all">All course priorities</option>
          {evaluation.priorities.map(p => <option value={p.finding.id} key={p.finding.id}>{p.guidance.topic}</option>)}
        </select>
      </label>
    </div>
    <div className={`report-priorities${priorities.length === 1 ? ' report-priorities--focused' : ''}`}>
      {priorities.map(({ finding, guidance, recommendation, relatedQuestions, rank }) => <article className="report-priority" key={finding.id}>
        <div className="report-priority__heading"><span className="report-priority__number">{String(evaluation.priorities.findIndex(p => p.finding.id === finding.id) + 1).padStart(2, '0')}</span><p className="report-kicker">Course finding · {guidance.topic}</p></div>
        <h3>{({ F1: 'Feedback arrives too late', F2: 'Assessment underweights application', F3: 'Available does not mean accessible', F4: 'Participation feels different' } as Record<string, string>)[finding.id] ?? guidance.title}</h3>
        <EvidenceGraphic finding={finding} dataset={dataset} />
        <div className="report-action"><span className="report-kicker">A step you can take · {submission.role === 'student' ? 'Student' : 'Lecturer'}</span>
          <p>{shortSteps[finding.id]?.[submission.role === 'student' ? 0 : 1] ?? (submission.role === 'student' ? guidance.studentStep : guidance.facultyStep)}</p>
        </div>

        <details className="report-priority-detail">
          <summary>Why this matters & action details</summary><p>{guidance.meaning}</p><p><strong>Owner:</strong> {recommendation.owner}</p>
          <p className="report-footnote">Priority rule: {rank.basis}. This is a planning rule, not a confidence score. These readings describe the course, not your individual performance.</p>
          <dl className="report-metrics">{finding.overviewMetrics.map(m => <div key={m.label}><dt>{m.label}</dt><dd>{withUnit(resolveMetric(dataset, m.metric), m.unit)}</dd></div>)}</dl>
        <details className="report-personal-link">
          <summary>{relatedQuestions.length ? `Your related answers (${relatedQuestions.length})` : 'No related answer from you'}</summary>
          {relatedQuestions.length ? relatedQuestions.map(q => <div className="report-linked-answer" key={q.id}>
            <p>{q.text}</p><strong>{answerText(q, submission.answers[q.id])}</strong>
          </div>) : <p>This finding comes from the wider course evidence. It is not a conclusion about your experience.</p>}
        </details>
          <h4>What still needs investigation</h4><p>{finding.hypothesis}</p>
          <h4>Proposed course action</h4><p>{recommendation.action}</p>
          <h4>How progress would be checked</h4>
          <ul>{recommendation.remeasure.map(m => <li key={m.label}>{m.label}: <strong>{withUnit(resolveMetric(dataset, m.metric), m.unit)}</strong> now; target <strong>{m.target}</strong>.</li>)}</ul>
          <h4>Review point</h4><p>{recommendation.reviewPoint}</p>
        </details>
        <button className="btn--link" type="button" onClick={() => onOpenFinding(finding.id)}>Open the full finding <span aria-hidden="true">→</span></button>
      </article>)}
    </div>
    {!priorities.length && <p className="report-empty">No action-linked findings meet the current evidence rules. Your answers are still available below; this does not establish that the course has no problems.</p>}
    {evaluation.strengths.map(finding => <aside className="report-strength" key={finding.id}>
      <p className="report-kicker">A course strength to preserve</p><h3>{finding.id === 'F5' ? 'Clear explanations' : finding.title}</h3>
      <EvidenceGraphic finding={finding} dataset={dataset} />
      <button className="btn--link" type="button" onClick={() => onOpenFinding(finding.id)}>See the supporting evidence →</button>
    </aside>)}
  </section>;
};
