import type { Dataset } from '../../engine/dataset';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { actionPlanMarkdown, actionMetric } from '../../engine/actionPlan';
import { actionTitles } from '../../data/analysisPresentation';
import { course } from '../../data/course';

export const Recommendations = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void }) => {
  const { actions, inactive } = buildCourseAnalysis(dataset);
  const download = () => {
    const url = URL.createObjectURL(new Blob([actionPlanMarkdown(dataset)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.code.replace(/\s+/g, '-')}-proposed-action-plan.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="column analysis-page">
    <header className="analysis-heading"><p className="section-label">Course analysis · Action plan</p><h1>Turn findings into improvements.</h1><p>Each proposal identifies a next step, an owner to involve and a way to check progress. These are discussion proposals; no action has been assigned or completed.</p></header>
    <div className="analysis-plan-summary"><div><strong>{actions.length} proposed {actions.length === 1 ? 'action' : 'actions'}</strong><p>Only actions linked to currently supported findings are shown. Planning order considers evidence coverage and the share of students reached.</p></div><button type="button" className="btn" disabled={!actions.length} onClick={download}>Download action plan ↓</button></div>
    {actions.length > 0 && <details className="analysis-disclosure"><summary>View or copy the action-plan text</summary><div><p className="analysis-small">The same proposed plan is available here for copying into a course review document.</p><textarea className="analysis-plan-text" aria-label="Proposed action plan text" readOnly value={actionPlanMarkdown(dataset)} /></div></details>}
    {actions.map((a, i) => <article className="analysis-action-card" key={a.id}>
      <div className="analysis-action-heading"><span className="analysis-action-number">{i + 1}</span><div><p className="report-kicker">Proposed action · {a.id}</p><h2>{actionTitles[a.id]}</h2></div></div>
      <p className="analysis-action-text">{a.recommendation.action}</p>
      <dl className="analysis-action-meta"><div><dt>Owner to involve</dt><dd>{a.recommendation.owner}</dd></div><div><dt>Review point</dt><dd>{a.recommendation.reviewPoint}</dd></div></dl>
      <details className="analysis-disclosure"><summary>How we would know it is working</summary><div>
        <p>{a.recommendation.target}</p>
        <div className="analysis-targets">{a.recommendation.remeasure.map(m => <div key={m.label}><h3>{m.label}</h3><span><small>Current</small><strong>{actionMetric(dataset, m.metric, m.unit)}</strong></span><span><small>Target</small><strong>{m.target}</strong></span></div>)}</div>
        <p className="analysis-small">Next-cycle evidence has not been collected. Progress cannot yet be assessed.</p>
      </div></details>
      <details className="analysis-disclosure"><summary>Why this action is proposed</summary><div><p><strong>Possible explanation:</strong> {a.recommendation.diagnosis}</p><p className="analysis-small">Planning basis: {a.basis}. Source coverage does not establish certainty or prove the explanation.</p></div></details>
      <button type="button" className="btn--link" onClick={() => onOpenFinding(a.findingId)}>Inspect the supporting finding →</button>
    </article>)}
    {!actions.length && <p className="analysis-empty">No action-linked findings currently meet the evidence rules. Review the evidence before choosing an intervention.</p>}
    {inactive.length > 0 && <p className="analysis-small">Actions for findings that no longer meet their rules are excluded. Those findings remain available in All findings.</p>}
  </div>;
};
