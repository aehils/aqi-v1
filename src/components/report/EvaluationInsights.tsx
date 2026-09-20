import { useMemo, useState } from 'react';
import { instruments } from '../../instruments';
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
        <h2 id="evaluation-title">What this means. What to do next.</h2>
        <p>These course findings combine all simulated sources, including your response. Your experience may agree or differ. Suggested steps are starting points for discussion, not actions already agreed.</p>
      </div>
      <label className="report-filter">Explore a concern
        <select value={focus} onChange={e => setFocus(e.target.value)}>
          <option value="all">All course priorities</option>
          {evaluation.priorities.map(p => <option value={p.finding.id} key={p.finding.id}>{p.guidance.topic}</option>)}
        </select>
      </label>
    </div>
    <p className="report-footnote">Priorities consider the range of supporting evidence and how many students an action reaches. Choose a topic to focus on what matters to you.</p>
    <div className={`report-priorities${priorities.length === 1 ? ' report-priorities--focused' : ''}`}>
      {priorities.map(({ finding, guidance, recommendation, relatedQuestions, rank }) => <article className="report-priority" key={finding.id}>
        <p className="report-kicker">Course finding · {guidance.topic}</p>
        <h3>{guidance.title}</h3>
        <p className="report-priority__meaning">{guidance.meaning}</p>
        {relatedQuestions.filter(q => q.type === 'single').slice(0, 1).map(q => <p className="report-personal-highlight" key={q.id}><span className="report-kicker">Your perspective on this topic</span><strong>{answerText(q, submission.answers[q.id])}</strong><span>{q.text}</span></p>)}
        <details className="report-personal-link">
          <summary>{relatedQuestions.length ? `Your related answers (${relatedQuestions.length})` : 'No related answer from you'}</summary>
          {relatedQuestions.length ? relatedQuestions.map(q => <div className="report-linked-answer" key={q.id}>
            <p>{q.text}</p><strong>{answerText(q, submission.answers[q.id])}</strong>
          </div>) : <p>This finding comes from the wider course evidence. It is not a conclusion about your experience.</p>}
        </details>
        <div className="report-action"><span className="report-kicker">A step you can take · {submission.role === 'student' ? 'Student' : 'Lecturer'}</span>
          <p>{submission.role === 'student' ? guidance.studentStep : guidance.facultyStep}</p>
        </div>
        <p className="report-owner"><strong>Course improvement owner</strong><br />{recommendation.owner}</p>
        <details className="report-priority-detail">
          <summary>Evidence & improvement plan</summary>
          <p className="report-footnote">Priority rule: {rank.basis}. This is a planning rule, not a confidence score. These readings describe the course, not your individual performance.</p>
          <dl className="report-metrics">{finding.overviewMetrics.map(m => <div key={m.label}><dt>{m.label}</dt><dd>{withUnit(resolveMetric(dataset, m.metric), m.unit)}</dd></div>)}</dl>
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
      <p>At course level: {finding.headline} This does not establish whether every student can apply what they learn.</p>
      {instruments[submission.role].filter(q => q.indicatorId && finding.indicatorIds.includes(q.indicatorId) && submission.answers[q.id] !== undefined).map(q =>
        <p key={q.id}>Your answer on this topic: <strong>{answerText(q, submission.answers[q.id])}</strong>. The course-level finding does not replace your individual experience.</p>
      )}
      <button className="btn--link" type="button" onClick={() => onOpenFinding(finding.id)}>See the supporting evidence →</button>
    </aside>)}
  </section>;
};
