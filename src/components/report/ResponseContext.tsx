import type { ViewerSubmission } from '../../engine/session';
import { seedDataset } from '../../engine/dataset';
import { instruments } from '../../instruments';
import { matrixMeanFor } from '../../engine/aggregate';
import { f1 } from '../../lib/format';

/** Include non-scalar answers without manufacturing a composite resource score. */
export const ResponseContext = ({ submission }: { submission: ViewerSubmission }) => {
  const questions = instruments[submission.role].filter(q =>
    (q.type === 'multi' || q.type === 'matrix') && submission.answers[q.id] !== undefined);
  if (!questions.length) return null;
  return <div className="report-context-answers">
    <h3>Resources and constraints you reported</h3>
    <p className="report-footnote">These answers add context; they are not an overall quality score. Comparisons exclude your response.</p>
    {questions.map(q => {
      const answer = submission.answers[q.id];
      const peers = seedDataset.responses[submission.role].filter(r => Array.isArray(r.answers[q.id]));
      return <details className="report-disclosure" key={q.id}>
        <summary>{q.type === 'matrix' ? 'Your use of teaching resources' : q.id === 'F25' ? 'Your feedback barriers' : 'Resources you experienced'}
          <span>{Array.isArray(answer) ? `${answer.length} selected` : 'By resource'}</span>
        </summary>
        <div className="report-disclosure__body"><p>{q.text}</p>
          {Array.isArray(answer) && <>
            {!answer.length && <p>No options selected.</p>}
            <ul className="report-context-list">{answer.map(key => {
              const count = peers.filter(r => (r.answers[q.id] as string[]).includes(key)).length;
              return <li key={key}><strong>{q.options?.find(o => o.key === key)?.label ?? key}</strong><span>{count} of {peers.length} other respondents also selected this</span></li>;
            })}</ul>
          </>}
          {q.type === 'matrix' && typeof answer === 'object' && !Array.isArray(answer) && <ul className="report-context-list">
            {q.rows?.filter(row => answer[row.key] !== undefined).map(row => {
              const cohort = matrixMeanFor(seedDataset, q.indicatorId!, submission.role, row.key);
              return <li key={row.key}><strong>{row.label}</strong><span>You: {q.options?.find(o => o.key === answer[row.key])?.label ?? answer[row.key]}</span><span>Group: {f1(cohort.mean)}/5 · {cohort.nScoring} scored responses</span></li>;
            })}
          </ul>}
        </div>
      </details>;
    })}
  </div>;
};
