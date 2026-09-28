import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { actionPlanMarkdown, planFor, type Audience } from '../../engine/actionPlan';
import { actionSummaries, actionTitles, analysisCopy, findingTitles, planSentences, studentPlan } from '../../data/analysisPresentation';
import { course } from '../../data/course';
import '../report/report.css';
import '../intelligence/analysis.css';
import './plan.css';

type Reading = ReturnType<typeof planFor>[number]['readings'][number];

/** Now against target. Bounded measures get a scale; the hatched span is the gap still to close. */
const MeasureRow = ({ reading: r }: { reading: Reading }) => {
  const at = (v: number) => `${r.scale ? Math.max(0, Math.min(100, v / r.scale * 100)) : 0}%`;
  const solidTo = r.met === false && r.lowerIsBetter ? r.goal : r.value;
  const gap = r.met === false ? [Math.min(r.value, r.goal), Math.max(r.value, r.goal)] : null;
  return <div className="plan-measure">
    <div className="plan-measure__head"><span>{r.label}</span><strong>{r.now}</strong></div>
    {r.scale && Number.isFinite(r.value) && <span className="plan-measure__track" aria-hidden="true">
      <span className="plan-measure__now" style={{ width: at(solidTo) }} />
      {gap && <span className="plan-measure__gap" style={{ left: at(gap[0]), width: `calc(${at(gap[1])} - ${at(gap[0])})` }} />}
      <i style={{ left: at(r.goal) }} />
    </span>}
    <p className="plan-measure__foot"><span>Target: {r.target}</span><span className={r.met ? 'is-met' : undefined}>{r.status}</span></p>
  </div>;
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const Recommendations = ({ dataset, audience, onOpenFinding }: { dataset: Dataset; audience: Audience; onOpenFinding: (id: string) => void }) => {
  const { inactive } = buildCourseAnalysis(dataset);
  const student = audience === 'student';
  const plan = planFor(dataset, audience);
  const actions = plan;
  const readings = plan.flatMap(a => a.readings);
  const excluded = inactive.filter(f => f.recommendationIds.length > 0).length;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const plainText = actionPlanMarkdown(dataset, audience).replace(/^#{1,3} /gm, '');
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
    const url = URL.createObjectURL(new Blob([actionPlanMarkdown(dataset, audience)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.code.replace(/\s+/g, '-')}-${student ? 'planned-changes' : 'proposed-action-plan'}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="column report-page analysis-page plan-page">
    <section className="report-summary analysis-summary" aria-labelledby="plan-title">
      <div className="report-summary__intro"><h2 id="plan-title">Action Plan</h2>
        <div className="plan-export">
          <button type="button" className="plan-text-button" disabled={!actions.length} onClick={download}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" /></svg>
            Download (.md)
          </button>
          <button type="button" className="plan-text-button" disabled={!actions.length || copyStatus === 'copying'} onClick={copy}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></svg>
            Copy as text
          </button>
          <span role="status" className="analysis-copy-status">{copyStatus === 'copied' ? 'Copied.' : copyStatus === 'error' ? 'Couldn’t copy. Select the text below instead.' : ''}</span>
        </div>
      </div>
      <dl className="report-summary-stats plan-stats">
        <div><dt>{student ? `Planned ${actions.length === 1 ? 'change' : 'changes'}` : `Proposed ${actions.length === 1 ? 'action' : 'actions'}`}</dt><dd>{actions.length}</dd></div>
        <div><dt>{student ? 'Issues' : new Set(actions.map(a => a.findingId)).size === 1 ? 'Finding' : 'Findings'} addressed</dt><dd>{new Set(actions.map(a => a.findingId)).size}</dd></div>
        <div><dt>Targets already met</dt><dd>{readings.filter(r => r.met).length}<small> of {readings.length}</small></dd></div>
      </dl>
    </section>
    {copyStatus === 'error' && <textarea className="analysis-plan-text" aria-label="Action plan plain text: select to copy" readOnly value={plainText} onFocus={event => event.currentTarget.select()} />}

    {plan.length > 0 && <section className="report-section" aria-labelledby="plan-glance-title">
      <p className="section-label">01 · {student ? 'What’s changing' : 'The plan in order'}</p><h2 id="plan-glance-title">{plan.length} {student ? (plan.length === 1 ? 'change' : 'changes') : (plan.length === 1 ? 'action' : 'actions')}, most pressing first</h2>
      <p className="report-section-lede">{student ? 'Changes' : 'Actions'} backed by more kinds of evidence, and affecting more students, come first. Select one to see the details.</p>
      <ol className="plan-glance">
        {plan.map((a, i) => <li key={a.id}><a href={`#action-${a.id}`}>
          <span className="plan-number">{i + 1}</span>
          <span className="plan-glance__text"><strong>{student ? studentPlan[a.id].title : actionTitles[a.id]}</strong>
            {student ? <span>You should notice this {studentPlan[a.id].notice}.</span>
              : planSentences[a.id] && <span>Led by {planSentences[a.id].lead}. Progress reviewed {planSentences[a.id].review}.</span>}</span>
          <span className="plan-glance__go" aria-hidden="true">↓</span>
        </a></li>)}
      </ol>
    </section>}

    {plan.length > 0 && <section className="report-section" aria-labelledby="plan-actions-title">
      <p className="section-label">02 · {student ? 'The changes' : 'The actions'}</p><h2 id="plan-actions-title">{student ? 'What changes for you, and how you’ll know' : 'What changes, and how progress is checked'}</h2>
      <p className="plan-legend" aria-hidden="true"><span><i className="plan-legend__now" />Now</span><span><i className="plan-legend__gap" />Gap to close</span><span><i className="plan-legend__target" />Target</span></p>
      {plan.map((a, i) => <article className="plan-action" id={`action-${a.id}`} key={a.id}>
        <div className="plan-action__main">
          <div className="plan-action__heading"><span className="plan-number">{i + 1}</span><div><p className="report-kicker">{analysisCopy[a.findingId]?.topic}</p><h3>{student ? studentPlan[a.id].title : actionTitles[a.id]}</h3></div></div>
          {student ? <>
            <p className="plan-action__summary">{studentPlan[a.id].change}</p>
            <dl className="plan-action__meta"><div><dt>When</dt><dd>{capitalise(studentPlan[a.id].notice)}</dd></div><div><dt>You can</dt><dd>{studentPlan[a.id].youCanDo}</dd></div></dl>
            <details className="report-priority-detail"><summary>Why this is planned</summary><p>{studentPlan[a.id].why}</p></details>
          </> : <>
            <p className="plan-action__summary">{actionSummaries[a.id] ?? a.recommendation.action}</p>
            <dl className="plan-action__meta"><div><dt>Lead</dt><dd>{a.recommendation.owner}</dd></div><div><dt>Review</dt><dd>{a.recommendation.reviewPoint}</dd></div></dl>
            <details className="report-priority-detail"><summary>Full proposal and rationale</summary>
              <p>{a.recommendation.action}</p>
              <h4>Possible explanation, to investigate</h4><p>{a.recommendation.diagnosis}</p>
              <p className="report-footnote">Planning basis: {a.basis}.</p>
            </details>
          </>}
          <button type="button" className="btn--link" onClick={() => onOpenFinding(a.findingId)}>Finding: {findingTitles[a.findingId] ?? a.finding.title} <span aria-hidden="true">→</span></button>
        </div>
        <figure className="plan-measures"><figcaption>Now vs target</figcaption>{a.readings.map(r => <MeasureRow key={r.label} reading={r} />)}</figure>
      </article>)}
      <p className="report-footnote">{student ? 'These changes are proposed by the course team, not yet confirmed. Figures show where the course stands now.' : 'Current values are this cycle’s baseline. No follow-up evidence has been collected.'}</p>
    </section>}

    {!plan.length && <p className="analysis-empty">{student ? 'No planned changes currently meet the evidence rules.' : 'No action-linked findings currently meet the evidence rules. Review the evidence before choosing an intervention.'}</p>}
    {!student && excluded > 0 && <p className="report-footnote">{excluded} {excluded === 1 ? 'finding no longer meets its' : 'findings no longer meet their'} evidence rules, so {excluded === 1 ? 'its actions are' : 'their actions are'} left out. See All findings.</p>}
  </div>;
};
