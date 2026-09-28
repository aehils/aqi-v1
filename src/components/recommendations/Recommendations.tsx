import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { actionPlanMarkdown, actionMetric } from '../../engine/actionPlan';
import { actionTitles } from '../../data/analysisPresentation';
import { course } from '../../data/course';

export const Recommendations = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void }) => {
  const { actions, inactive } = buildCourseAnalysis(dataset);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const plainText = actionPlanMarkdown(dataset).replace(/^#{1,3} /gm, '');
  const copy = async () => {
    setCopyStatus('copying');
    try {
      await navigator.clipboard.writeText(plainText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };
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
    <div className="analysis-plan-summary"><div><strong>{actions.length} proposed {actions.length === 1 ? 'action' : 'actions'}</strong><p>Only actions linked to currently supported findings are shown. Planning order considers evidence coverage and the share of students reached. These are discussion proposals; no action has been assigned or completed.</p></div>
      <div className="analysis-plan-buttons">
        <button type="button" className="btn" disabled={!actions.length} onClick={download}>Download action plan ↓</button>
        <button type="button" className="btn btn--copy-plan" disabled={!actions.length || copyStatus === 'copying'} onClick={copy}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></svg>
          Copy as plain-text
        </button>
        <span role="status" className="analysis-copy-status">{copyStatus === 'copied' ? 'Copied to clipboard.' : copyStatus === 'error' ? 'Couldn’t copy. Select the text below to copy manually.' : ''}</span>
      </div>
    </div>
    {copyStatus === 'error' && <textarea className="analysis-plan-text" aria-label="Action plan plain text — select to copy" readOnly value={plainText} onFocus={event => event.currentTarget.select()} />}
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
