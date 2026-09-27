import './report.css';
import { useMemo, useState } from 'react';
import { computeViewerImpact, type ViewerSubmission } from '../../engine/session';
import { EvaluationInsights } from './EvaluationInsights';
import { ResponseContext } from './ResponseContext';
import type { Dataset } from '../../engine/dataset';
import { buildReport } from '../../engine/report';
import { validationRule } from '../../data/validation';
import { constructById } from '../../data/constructs';
import { domainById } from '../../data/domains';
import { questionById, groupNouns, instruments } from '../../instruments';
import { f1, withUnit } from '../../lib/format';
import { findingById } from '../../data/findings';
import { seedDataset } from '../../engine/dataset';
import { ChainView, statusLabel } from './ChainView';
import { ProportionRing, FiveDots } from './ReportVisuals';

const readingLabels: Record<string, string> = {
  'IND-RES-01': 'Access to learning resources',
  'IND-CLR-01': 'Clear explanations',
  'IND-CLR-02': 'Clarity of your explanations',
  'IND-ACT-01': 'Opportunities you provide to participate',
  'IND-ACT-02': 'Opportunities to participate',
  'IND-ALN-01': 'Assessments follow the learning outcomes',
  'IND-CGD-01': 'Applying knowledge in assessments',
  'IND-CGD-02': 'Applying knowledge in assessments',
  'IND-FBQ-01': 'Feedback that helps you improve',
  'IND-FBQ-02': 'Feedback that helps students improve',
  'IND-FBT-01': 'Getting feedback on time',
  'IND-SAT-01': 'Your overall course experience',
  'IND-EFF-01': 'Your view of your teaching effectiveness',
};
const readingLabel = (r: { indicatorId: string; label: string }) => readingLabels[r.indicatorId] ?? r.label;

const checkLabels = { corroborated: 'Answers align', marginal: 'Some difference', contradicted: 'Worth a closer look', unscored: 'Not enough information' };
const difference = (delta: number) => !Number.isFinite(delta) ? 'No comparison available' : Math.abs(delta) < 0.05 ? 'In line with the average' : `${f1(Math.abs(delta))} ${Math.abs(delta) === 1 ? 'point' : 'points'} ${delta > 0 ? 'above' : 'below'} average`;

/** Personal feedback first; course evidence and measurement detail stay explicitly scoped. */
export const ResponseReport = ({ submission, dataset, onContinue, onOpenFinding }: { submission: ViewerSubmission; dataset: Dataset; onContinue: () => void; onOpenFinding: (id: string) => void }) => {
  const report = useMemo(() => buildReport(submission, dataset), [submission, dataset]);
  const [domain, setDomain] = useState('all');
  const noun = groupNouns[report.role].plural;
  const base = seedDataset.responses[report.role].length;
  const impact = useMemo(() => computeViewerImpact(submission), [submission]);
  const readings = report.readings.filter(r => domain === 'all' || (r.domainId ?? 'other') === domain);
  const broken = report.chain.find(r => r.status === 'cut');
  const notes = instruments[report.role].filter(q => q.type === 'open' && typeof submission.answers[q.id] === 'string' && String(submission.answers[q.id]).trim());

  return (
    <div className="column report report-page">
      <h1 className="report-title">Your {report.role === 'student' ? 'Student' : 'Lecturer'} Report</h1>
      <section className="report-summary" aria-labelledby="summary-title">
        <div className="report-summary__intro">
          <h2 id="summary-title">Start with your perspective</h2>
          <p>Your answers alongside the course evidence.</p>
        </div>
        <dl className="report-summary-stats">
          <div><dt>Your ratings</dt><dd>{report.readings.length}</dd></div>
          <div><dt>Other {noun} responses</dt><dd>{base}</dd></div>
          <div><dt>Topics covered</dt><dd>{report.domains.length}</dd></div>
        </dl>
        {notes.length > 0 && <div className="report-summary-words"><p className="report-kicker">In your words</p>{notes.map(q => <blockquote className="report-concern" key={q.id}>{String(submission.answers[q.id])}</blockquote>)}</div>}
        {notes.length > 0 && <p className="report-summary-caption">Written comments are preserved, not interpreted automatically.</p>}
      </section>

      <nav className="report-jumps" aria-label="Report sections">
        <a href="#evaluation">Findings & next steps <span>↘</span></a>
        <a href="#your-ratings">Your answers in context <span>↘</span></a>
        <a href="#answer-checks">Reading the evidence <span>↘</span></a><a href="#course-context">Learning pathway <span>↘</span></a>
      </nav>
      <EvaluationInsights submission={submission} dataset={dataset} onOpenFinding={onOpenFinding} />

      <section className="report-section" id="your-ratings" aria-labelledby="ratings-title">
        <div className="report-section-heading"><div><p className="section-label">02 · Your answers in context</p><h2 id="ratings-title">How your experience compares</h2><p>Your ratings beside the group average, excluding your response.</p></div>
          <label className="report-filter">Show topic<select value={domain} onChange={e => setDomain(e.target.value)}><option value="all">All topics ({report.readings.length})</option>{report.domains.map(d => <option key={d.domainId} value={d.domainId}>{domainById(d.domainId).shortName} ({d.n})</option>)}{report.readings.some(r => !r.domainId) && <option value="other">Other readings</option>}</select></label>
        </div>
        <p className="report-footnote">Unscored answers are excluded.{report.role === 'faculty' && ' Small lecturer sample: descriptive context only.'}</p>
        <div className="report-legend"><span><i className="report-dot" /> Your answer</span><span><i className="report-diamond" /> Other {noun} respondents (average)</span></div>
        <div className="report-readings">
          {readings.map(r => <article className="report-reading" key={r.questionId}>
            <div><span className="report-kicker">{r.domainId ? domainById(r.domainId).shortName : 'Other readings'}</span><h3>{readingLabel(r)}</h3><details className="report-question"><summary>Your answer & question</summary><p><strong>{r.answerLabel}</strong></p><p>{questionById(r.questionId).text}</p><p>{questionById(r.questionId).options?.filter(o => typeof o.value === 'number').map(o => `${o.value}: ${o.label}`).join(' · ')}</p></details></div>
            <div className="report-comparison"><div className="report-comparison__values"><strong>You {r.value}/5</strong><span>Group {Number.isFinite(r.cohortMean) ? `${f1(r.cohortMean)}/5` : 'unavailable'}</span></div><div className="report-scale" aria-hidden="true">{Number.isFinite(r.cohortMean) && <span className="report-scale__connector" style={{ left: `${(Math.min(r.value, r.cohortMean) - 1) * 25}%`, width: `${Math.abs(r.value - r.cohortMean) * 25}%` }} />}<span className="report-scale__you" style={{ left: `${(r.value - 1) * 25}%` }} />{Number.isFinite(r.cohortMean) && <span className="report-scale__group" style={{ left: `${(r.cohortMean - 1) * 25}%` }} />}</div><div className="report-scale-labels" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div><p>{difference(r.delta)} · {r.cohortN} scored responses</p>
              <details className="report-distribution"><summary>How others answered</summary>
                <ul>{r.distribution.map(row => <li key={row.option.key}>
                  <span>{row.option.label}</span><strong>{row.count}</strong>
                  <div className="report-distribution__track" aria-hidden="true"><span style={{ width: `${row.share * 100}%` }} /></div>
                </li>)}</ul>
                <p>{r.cohortUnscored} unscored responses excluded from the average. Counts include only the original group.</p>
              </details>
            </div>
          </article>)}
          {!readings.length && <p className="report-empty">No scored ratings to display. Answers without a scale value are kept as evidence.</p>}
        </div>
        {report.unscoredCount > 0 && <p className="report-footnote">{report.unscoredCount} additional {report.unscoredCount === 1 ? 'answer has' : 'answers have'} no score (written responses or “not sure”). These are retained and excluded from averages.</p>}
        <ResponseContext submission={submission} />
      </section>

      <section className="report-section" id="answer-checks" aria-labelledby="checks-title">
        <p className="section-label">03 · A second look</p><h2 id="checks-title">Your rating and your example</h2>
        <p className="report-section-lede">Related questions can tell different stories. Example scores are mapped by the demo, not ratings you chose.</p>
        <div className="paired-insights">{report.checks.map(c => <article key={c.pair.id} className={`paired-insight paired-insight--${c.status}`}>
          <header><h3>{constructById(c.pair.constructId).name}</h3><span>{checkLabels[c.status]}</span></header>
          <FiveDots value={c.primaryValue} label="Your rating" /><FiveDots value={c.impliedValue} label="Example · mapped" />
          <details><summary>Compare your answers</summary><dl><dt>General rating</dt><dd>{c.primaryLabel ?? 'Not answered'}</dd><dt>Specific example</dt><dd>{c.validatorLabel ?? 'Not answered'}</dd></dl><p>{c.pair.checks}</p></details>
        </article>)}</div>
        <details className="report-disclosure"><summary>How to interpret this</summary><div className="report-disclosure__body"><p>{validationRule} These demo rules flag differences to explore, not honesty or reliability. All answers are retained without reweighting.</p></div></details>
      </section>

      <section className="report-section report-context" id="course-context" aria-labelledby="context-title"><p className="section-label">04 · The bigger picture</p><h2 id="context-title">From intention to capability.</h2><p className="report-section-lede">Where the course meets its targets—and where the learning pathway needs attention.</p><p className="report-footnote">Course-level measures · targets are set by the demo model.</p><ol className="report-journey">{report.chain.map(r => <li key={r.link.id} className={`journey-stage journey-stage--${r.status}`}><span>{r.link.step.toString().padStart(2, '0')} <span aria-hidden="true">→</span></span><strong>{r.link.name}</strong><div className="journey-stage__graphic">{r.link.unit === '%' ? <ProportionRing value={r.value} label={r.link.id === 'L1' ? 'Outcomes requiring application or higher' : r.link.id === 'L2' ? 'Marks for application or higher' : 'Application score'} /> : r.link.unit === '/5' ? <FiveDots value={r.value} label="Participation" /> : <div className="release-count"><strong>{withUnit(r.value)}</strong><span>releases with a follow-up task</span><span className="release-count__link" aria-hidden="true">Feedback ··· Task</span></div>}</div><span className="journey-stage__status">{statusLabel[r.status]}</span><small>Target {r.link.direction === 'higher' ? '≥' : '≤'} {r.link.unit === 'releases' && r.link.intact === 1 ? '1 release' : withUnit(r.link.intact, r.link.unit)}</small></li>)}</ol>
        <details className="report-disclosure"><summary>Preview the course evidence <span>{broken ? `First stage below threshold: ${broken.link.name.toLowerCase()}` : 'View all stages'}</span></summary><div className="report-disclosure__body"><p className="report-footnote">Source measures and thresholds for each stage.</p><ChainView chain={report.chain} evidenced={report.linksYouEvidence} /></div></details>
      </section>
      <aside className="report-contribution">
        <div className="contribution-visual" aria-hidden="true"><span>{base}</span><b>+ you</b><span>→ {impact.groupN}</span></div><h3>What your contribution changed</h3>
        <p>Your response is now one of {impact.groupN} {noun} responses in this session. {impact.changedFindings.length === 0 ? 'It did not change which course findings meet the evidence rules.' : `${impact.changedFindings.length} course finding${impact.changedFindings.length === 1 ? '' : 's'} changed status under the evidence rules.`}</p>
        {impact.changedFindings.length > 0 && <ul>{impact.changedFindings.map(id => <li key={id}><button type="button" className="btn--link" onClick={() => onOpenFinding(id)}>{findingById(id).title} →</button></li>)}</ul>}
        <p className="report-footnote">Session only: reloading clears your answers. No actions have been sent or assigned.</p>
      </aside>
      <section className="report-next"><div><p className="section-label">Up next · Course analysis</p><h2>See what all the evidence says.</h2></div><button type="button" className="btn" onClick={onContinue}>See the course analysis <span aria-hidden="true">→</span></button></section>
    </div>
  );
};
