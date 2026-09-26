import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import type { ViewerImpact, ViewerSubmission } from '../../engine/session';
import type { Tab } from '../../state/reducer';
import type { Finding } from '../../data/types';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { groupSizes, resolveMetric } from '../../engine/aggregate';
import { derived } from '../../engine/derived';
import { DomainProfile } from './DomainProfile';
import { FindingMetrics } from './FindingSummary';
import { ChainView, statusLabel } from '../report/ChainView';
import { readChain } from '../../engine/report';
import { allDomainBands } from '../../engine/bands';
import { course } from '../../data/course';
import { findingById } from '../../data/findings';
import { sourceLabel } from '../../data/indicators';
import { actionTitles, actionSummaries, analysisCopy } from '../../data/analysisPresentation';
import { groupNouns } from '../../instruments';
import { withUnit } from '../../lib/format';

type Priority = ReturnType<typeof buildCourseAnalysis>['priorities'][number];

const titleOf = (f: Finding) => analysisCopy[f.id]?.title ?? f.title;
const topicOf = (f: Finding) => analysisCopy[f.id]?.topic ?? f.title;

const PriorityCard = ({ priority: { finding, lead, further }, order, dataset, onOpenFinding }: {
  priority: Priority; order: number; dataset: Dataset; onOpenFinding: (id: string) => void;
}) => {
  const sources = [...new Set(finding.evidenceRefs.map(e => e.source))];
  return <article className="report-priority analysis-priority">
    <p className="report-kicker">Priority {order} · {topicOf(finding)}</p>
    <h3>{titleOf(finding)}</h3>
    <p className="report-priority__meaning">{analysisCopy[finding.id]?.meaning ?? finding.headline}</p>
    <FindingMetrics finding={finding} dataset={dataset} />
    {lead ? <div className="report-action"><span className="report-kicker">Proposed course action · {actionTitles[lead.id]}</span>
      <p>{actionSummaries[lead.id]}</p>
    </div> : <p className="report-footnote">No proposed action is linked to this finding yet.</p>}
    {lead && <p className="report-owner"><strong>Proposed owner</strong><br />{lead.recommendation.owner}</p>}
    <details className="report-priority-detail">
      <summary>Evidence & improvement plan</summary>
      {lead && <p className="report-footnote">Planning order: {lead.basis}. This is a planning rule, not a confidence score.</p>}
      <h4>What still needs investigation</h4><p>{finding.hypothesis}</p>
      {lead && <>
        <h4>How progress would be checked</h4>
        <ul>{lead.recommendation.remeasure.map(m => <li key={m.label}>{m.label}: <strong>{withUnit(resolveMetric(dataset, m.metric), m.unit)}</strong> now; target <strong>{m.target}</strong>.</li>)}</ul>
        <h4>Review point</h4><p>{lead.recommendation.reviewPoint}</p>
      </>}
      {further.length > 0 && <><h4>Further proposed {further.length === 1 ? 'action' : 'actions'}</h4>
        <ul>{further.map(a => <li key={a.id}><strong>{actionTitles[a.id]}.</strong> {actionSummaries[a.id]}</li>)}</ul></>}
      <h4>Evidence behind this finding</h4><p>{sources.map(s => sourceLabel[s]).join(' · ')}</p>
    </details>
    <button className="btn--link" type="button" onClick={() => onOpenFinding(finding.id)}>Open the full finding <span aria-hidden="true">→</span></button>
  </article>;
};

export const Overview = ({ dataset, impact, submission, onOpenFinding, onNavigate, onOpenConstruct }: {
  dataset: Dataset; impact: ViewerImpact | null; submission: ViewerSubmission | null;
  onOpenFinding: (id: string) => void; onNavigate: (tab: Tab) => void; onOpenConstruct: (id: string) => void;
}) => {
  const analysis = buildCourseAnalysis(dataset);
  const [focus, setFocus] = useState('all');
  const n = groupSizes(dataset);
  const lead = analysis.actions[0];
  const domains = allDomainBands(dataset);
  const limited = domains.filter(d => d.band === 'insufficient').length;
  const evidenced = domains.reduce((sum, d) => sum + d.evidenced, 0);
  const total = domains.reduce((sum, d) => sum + d.constructs.length + d.notInstrumented, 0);
  const chain = readChain(dataset);
  const broken = chain.find(r => r.status === 'cut');
  const shown = analysis.priorities.filter(p => focus === 'all' || p.finding.id === focus);

  return <div className="column analysis-page">
    <header className="report-heading">
      <p className="section-label">Course analysis · {course.code}</p>
    </header>

    <section className="report-summary" aria-labelledby="brief-title">
      <div className="report-summary__intro analysis-brief__lead">
        <p className="section-label">Start here</p>
        <h2 id="brief-title">{lead ? actionTitles[lead.id] : 'Review the current evidence before choosing an action'}</h2>
        <p>{lead ? actionSummaries[lead.id] : 'No action-linked finding currently meets all its evidence rules. Explore the profile and evidence gaps below.'}</p>
        {lead && <p className="analysis-owner"><strong>Proposed owner</strong> {lead.recommendation.owner}</p>}
        <button type="button" className="btn" onClick={() => onNavigate('recommendations')}>Review the action plan <span aria-hidden="true">→</span></button>
        {lead && <p>First in the current planning order, based on evidence coverage and the share of students reached. This is not a certainty score.</p>}
      </div>
      <div className="report-summary-footer">
        <span><strong>{analysis.concerns.length}</strong> {analysis.concerns.length === 1 ? 'issue' : 'issues'} supported by the current evidence</span>
        <span><strong>{analysis.strengths.length}</strong> {analysis.strengths.length === 1 ? 'strength' : 'strengths'} to preserve</span>
        <span><strong>{limited}</strong> {limited === 1 ? 'domain needs' : 'domains need'} more evidence before a judgement</span>
        <span>Simulated course evidence · no overall score</span>
      </div>
    </section>

    <nav className="report-jumps" aria-label="Course analysis sections">
      <a href="#course-priorities">Priorities & actions <span>↘</span></a>
      <a href="#quality-profile">Quality across the course <span>↘</span></a>
      <a href="#learning-chain">From learning to skill <span>↘</span></a>
      <a href="#evidence-scope">Evidence & limits <span>↘</span></a>
    </nav>

    <section className="report-section" id="course-priorities" aria-labelledby="priorities-title">
      <div className="report-section-heading">
        <div><p className="section-label">01 · What matters</p>
          <h2 id="priorities-title">Issues to act on, strengths to keep</h2>
          <p>The figures describe the course as a whole. Each priority pairs a supported finding with a proposed action; open it for its sources, limits and how progress would be checked.</p>
        </div>
        <label className="report-filter">Focus on a priority
          <select value={focus} onChange={e => setFocus(e.target.value)}>
            <option value="all">All course priorities ({analysis.priorities.length})</option>
            {analysis.priorities.map(p => <option value={p.finding.id} key={p.finding.id}>{topicOf(p.finding)}</option>)}
          </select>
        </label>
      </div>
      <p className="report-footnote">Priorities are ordered by the range of supporting evidence and the share of students an action reaches. <button className="btn--link" type="button" onClick={() => onNavigate('findings')}>Browse all findings →</button></p>
      <div className={`report-priorities${shown.length === 1 ? ' report-priorities--focused' : ''}`}>
        {shown.map(p => <PriorityCard key={p.finding.id} priority={p} order={analysis.priorities.indexOf(p) + 1} dataset={dataset} onOpenFinding={onOpenFinding} />)}
      </div>
      {analysis.priorities.length === 0 && <p className="analysis-empty">No problem findings meet all their current rules. This does not establish that the course is problem-free.</p>}
      {analysis.strengths.map(f => <aside className="report-strength" key={f.id}>
        <p className="report-kicker">A course strength to preserve</p><h3>{titleOf(f)}</h3>
        <p>{analysisCopy[f.id]?.meaning ?? f.headline}</p>
        <FindingMetrics finding={f} dataset={dataset} />
        <button className="btn--link" type="button" onClick={() => onOpenFinding(f.id)}>See the supporting evidence →</button>
      </aside>)}
      {analysis.questions.map(f => <aside className="report-strength analysis-question" key={f.id}>
        <p className="report-kicker">A question to investigate</p><h3>{titleOf(f)}</h3>
        <p>{analysisCopy[f.id]?.meaning ?? f.headline}</p>
        <FindingMetrics finding={f} dataset={dataset} />
        <button className="btn--link" type="button" onClick={() => onOpenFinding(f.id)}>See the supporting evidence →</button>
      </aside>)}
      {analysis.inactive.length > 0 && <p className="report-footnote">{analysis.inactive.length} further {analysis.inactive.length === 1 ? 'finding does' : 'findings do'} not meet the current rules. Inspect these under “Not currently supported” in All findings.</p>}
    </section>

    <section className="report-section" id="quality-profile" aria-labelledby="profile-title">
      <p className="section-label">02 · The full profile</p><h2 id="profile-title">Quality across the course</h2>
      <p className="report-section-lede">Each domain covers several aspects of quality. A domain can contain strengths and concerns at the same time. Its label reflects the model’s rules and available evidence, not an overall course score.</p>
      <div className="analysis-profile"><DomainProfile dataset={dataset} onOpenConstruct={onOpenConstruct} /></div>
    </section>

    <section className="report-section" id="learning-chain" aria-labelledby="chain-title">
      <p className="section-label">03 · From learning to skill</p><h2 id="chain-title">How learning becomes a usable skill</h2>
      <p className="report-section-lede">The course evidence is read against {chain.length} stages in order. A stage below its threshold locates a question to investigate; it does not prove the cause of a later outcome.</p>
      <ol className="report-journey">{chain.map(r => <li key={r.link.id} className={`analysis-stage analysis-stage--${r.status}`}>
        <span>{r.link.step.toString().padStart(2, '0')}</span><strong>{r.link.name}</strong><small>{statusLabel[r.status]}</small>
      </li>)}</ol>
      <details className="report-disclosure"><summary>See the readings behind each stage <span>{broken ? `First stage below minimum: ${broken.link.name.toLowerCase()}` : 'No stage below minimum'}</span></summary>
        <div className="report-disclosure__body"><ChainView chain={chain} /></div>
      </details>
    </section>

    <section className="report-section" id="evidence-scope" aria-labelledby="scope-title">
      <p className="section-label">04 · Evidence & limits</p><h2 id="scope-title">What this analysis can tell you</h2>
      <div className="analysis-scope">
        <div><h3>What was considered</h3><dl className="analysis-evidence-counts">
          <div><dt>Student responses</dt><dd>{n.student}</dd></div><div><dt>Lecturer responses</dt><dd>{n.faculty}</dd></div><div><dt>Administrative returns</dt><dd>{n.institution}</dd></div>
          <div><dt>Feedback records</dt><dd>{derived('feedback.turnaround.n')}</dd></div><div><dt>Assessment papers</dt><dd>{derived('artefact.count')}</dd></div><div><dt>Teaching observations</dt><dd>{derived('observation.count')}</dd></div>
        </dl><p>Also includes the curriculum, learning-platform activity and institutional records. All course data is simulated.</p></div>
        <div><h3>What remains uncertain</h3><p>{evidenced} of {total} aspects in the quality model have quantitative evidence sufficient for a label. Missing evidence is not a positive result.</p><p>Response counts vary by question. Small lecturer and administrative groups provide context, not a representative benchmark. Associations and possible explanations require further investigation.</p>
          <button type="button" className="btn--link" onClick={() => onNavigate('perspectives')}>Compare the sources →</button>
        </div>
      </div>
    </section>

    <aside className="report-contribution">
      <h3>{impact && submission ? 'What your contribution changed' : 'Whose evidence this is'}</h3>
      <p>{impact && submission
        ? <>Your response is one of {impact.groupN} {groupNouns[impact.role].plural} responses in this analysis. {impact.changedFindings.length === 0 ? 'It did not change which course findings meet the evidence rules.' : `${impact.changedFindings.length} course finding${impact.changedFindings.length === 1 ? '' : 's'} changed status under the evidence rules.`} Your individual experience remains part of the evidence.</>
        : 'You are viewing the simulated evidence base. No response from you is included.'}</p>
      {impact && impact.changedFindings.length > 0 && <ul>{impact.changedFindings.map(id => <li key={id}><button type="button" className="btn--link" onClick={() => onOpenFinding(id)}>{titleOf(findingById(id))} →</button></li>)}</ul>}
      <p className="report-footnote">Proposed actions have not been sent to anyone or assigned.</p>
    </aside>

    <section className="report-next"><div><p className="section-label">Up next · Action plan</p><h2>Turn the priorities into a plan.</h2><p>Review each proposed action with its owner, targets and review point, then copy or download the plan for a course review.</p></div>
      <button type="button" className="btn" onClick={() => onNavigate('recommendations')}>Open the action plan <span aria-hidden="true">→</span></button>
    </section>
  </div>;
};
