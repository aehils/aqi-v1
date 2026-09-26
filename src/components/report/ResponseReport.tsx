import { useMemo, useState } from 'react';
import { computeViewerImpact, type ViewerSubmission } from '../../engine/session';
import { EvaluationInsights } from './EvaluationInsights';
import { ResponseContext } from './ResponseContext';
import type { Dataset } from '../../engine/dataset';
import { buildReport } from '../../engine/report';
import { validationRule } from '../../data/validation';
import { constructById } from '../../data/constructs';
import { domainById } from '../../data/domains';
import { questionById, roleLabels, groupNouns, instruments } from '../../instruments';
import { f1, withUnit } from '../../lib/format';
import { findingById } from '../../data/findings';
import { seedDataset } from '../../engine/dataset';
import { ChainView } from './ChainView';
import { resolveMetric } from '../../engine/aggregate';

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
  const { consistency } = report;
  const impact = useMemo(() => computeViewerImpact(submission), [submission]);
  const readings = report.readings.filter(r => domain === 'all' || (r.domainId ?? 'other') === domain);
  const broken = report.chain.find(r => r.status === 'cut');
  const notes = instruments[report.role].filter(q => q.type === 'open' && typeof submission.answers[q.id] === 'string' && String(submission.answers[q.id]).trim());

  return (
    <div className="column report report-page">
      <header className="report-heading">
        <p className="section-label">Your evaluation · {roleLabels[report.role]} report</p>
      </header>

      <section className="report-summary" aria-labelledby="summary-title">
        <div className="report-summary__intro">
          <p className="section-label">Start with your perspective</p>
          <h2 id="summary-title">{notes.length ? 'The concern you brought to this evaluation' : 'Your answers are part of the picture'}</h2>
          {notes.length ? notes.map(q => <blockquote className="report-concern" key={q.id}>{String(submission.answers[q.id])}</blockquote>) :
            <p>You did not add a written concern. Explore the course priorities below, or review your individual answers.</p>}
          <p>{notes.length ? 'Your account is kept in your own words. The findings below come from the wider evidence, not an automatic interpretation of this text.' : 'The findings below bring your ratings together with other responses and course records. No written concern has been inferred for you.'}</p>
        </div>
        <div className="report-summary-footer">
          <span><strong>{report.readings.length}</strong> scored ratings from you</span>
          <span><strong>{base}</strong> other {noun} responses for comparison</span>
          <span>Simulated course evidence · no overall score</span>
        </div>
      </section>

      <nav className="report-jumps" aria-label="Report sections">
        <a href="#evaluation">Findings & next steps <span>↘</span></a>
        <a href="#your-ratings">Your answers in context <span>↘</span></a>
        <a href="#answer-checks">How to read the evidence <span>↘</span></a>
      </nav>
      <EvaluationInsights submission={submission} dataset={dataset} onOpenFinding={onOpenFinding} />

      <section className="report-section" id="your-ratings" aria-labelledby="ratings-title">
        <div className="report-section-heading"><div><p className="section-label">02 · Your answers in context</p><h2 id="ratings-title">How your experience compares</h2><p>Your answer is shown alongside the group average. The response breakdown shows whether others share your experience; distance from the average is not a measure of importance.</p></div>
          <label className="report-filter">Show topic<select value={domain} onChange={e => setDomain(e.target.value)}><option value="all">All topics ({report.readings.length})</option>{report.domains.map(d => <option key={d.domainId} value={d.domainId}>{domainById(d.domainId).shortName} ({d.n})</option>)}{report.readings.some(r => !r.domainId) && <option value="other">Other readings</option>}</select></label>
        </div>
        <p className="report-footnote">Comparisons use responses collected before yours. Each average excludes unscored answers.{report.role === 'faculty' && ' The lecturer group is small; treat its averages as descriptive context, not a reliable benchmark.'}</p>
        <div className="report-legend"><span><i className="report-dot" /> Your answer</span><span><i className="report-diamond" /> Other {noun} respondents (average)</span></div>
        <div className="report-readings">
          {readings.map(r => <article className="report-reading" key={r.questionId}>
            <div><span className="report-kicker">{r.domainId ? domainById(r.domainId).shortName : 'Other readings'}</span><h3>{readingLabel(r)}</h3><p>{r.answerLabel}</p><details className="report-question"><summary>See the question</summary><p>{questionById(r.questionId).text}</p><p>{questionById(r.questionId).options?.filter(o => typeof o.value === 'number').map(o => `${o.value}: ${o.label}`).join(' · ')}</p></details></div>
            <div className="report-comparison"><div className="report-comparison__values"><strong>You {r.value}/5</strong><span>Group {Number.isFinite(r.cohortMean) ? `${f1(r.cohortMean)}/5` : 'unavailable'}</span></div><div className="report-scale" aria-hidden="true"><span className="report-scale__you" style={{ left: `${(r.value - 1) * 25}%` }} />{Number.isFinite(r.cohortMean) && <span className="report-scale__group" style={{ left: `${(r.cohortMean - 1) * 25}%` }} />}</div><div className="report-scale-labels" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div><p>{difference(r.delta)} · {r.cohortN} scored responses</p>
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

      <section className="report-section" id="answer-checks" aria-labelledby="checks-title"><p className="section-label">03 · How to read the evidence</p><h2 id="checks-title">The detail behind your ratings</h2><p className="report-section-lede">These topics were asked in two ways. Frequency, time spent and opportunity to use feedback are related, but different. The checks flag a difference to explore; they do not judge whether you answered honestly.</p>
        <p className="report-footnote">{consistency.scored ? `${consistency.corroborated} of ${consistency.scored} scored pairs fall within the demo’s alignment threshold.` : 'No pairs have enough scored information to compare.'} All your answers are retained.</p>
        <div className="report-checks">{report.checks.map(c => <details key={c.pair.id} className={`report-check report-check--${c.status}`}><summary><span>{constructById(c.pair.constructId).name}</span><span className={`check__tag check__tag--${c.status}`}>{checkLabels[c.status]}</span></summary><div className="report-disclosure__body"><p className="report-footnote">{c.pair.checks}</p><dl className="check__pair"><dt>Your general rating</dt><dd>{c.primaryLabel ?? 'Not answered'} <strong>{c.primaryValue !== null ? `${c.primaryValue}/5` : 'Unscored'}</strong></dd><dt>Your specific example</dt><dd>{c.validatorLabel ?? 'Not answered'} <strong>{c.impliedValue !== null ? `${c.impliedValue}/5` : 'Unscored'}</strong></dd></dl>{c.signedGap !== null && c.status !== 'corroborated' && <p className="check__read">Your general rating maps {Math.abs(c.signedGap)} points {c.signedGap > 0 ? 'higher' : 'lower'} than your example under the demo’s rules. Different occasions, wording or opportunities could explain this; the gap alone does not establish why.</p>}{c.pair.objective && <p className="check__objective"><strong>Related course evidence · {c.pair.objective.label}: {withUnit(resolveMetric(dataset, c.pair.objective.metric), c.pair.objective.unit)}.</strong> {c.pair.objective.note} This provides course context, not verification of your individual account.</p>}</div></details>)}</div>
        <details className="report-disclosure"><summary>How these checks work <span>Method & group results</span></summary><div className="report-disclosure__body"><p>{validationRule} These are configured demo rules, not an established test of response reliability. The example’s score is assigned by the model, not a second rating you chose. All answers are retained without reweighting.</p><h3 className="report-method-heading">Do others show a similar pattern?</h3><p>These checks include your response. “Align” means the two answers fall within the consistency threshold; it does not mean they are independently verified.</p><div className="table-scroll"><table className="data"><caption>Paired answers from {noun} respondents, including you</caption><thead><tr><th scope="col">Topic</th><th scope="col">Pairs</th><th scope="col">Align</th><th scope="col">Average rating</th><th scope="col">Average example</th><th scope="col">Pattern</th></tr></thead><tbody>{report.cohortChecks.map(v => <tr key={v.pair.id}><th scope="row">{constructById(v.pair.constructId).name}</th><td>{v.n}</td><td>{v.n ? `${Math.round(v.corroborationRate * 100)}%` : '—'}</td><td>{f1(v.meanPrimary)}</td><td>{f1(v.meanImplied)}</td><td>{v.n === 0 ? 'Insufficient information' : v.bias === 'none' ? 'No consistent direction' : v.bias === 'over-reports' ? 'Ratings tend to exceed examples' : 'Examples tend to exceed ratings'}</td></tr>)}</tbody></table></div></div></details>
      </section>

      <section className="report-section report-context" id="course-context" aria-labelledby="context-title"><p className="section-label">04 · The bigger picture</p><h2 id="context-title">What helps learning become a useful skill?</h2><p className="report-section-lede">Your questionnaire can contribute to {report.linksYouEvidence.length} of the {report.chain.length} stages below. The course analysis also uses assessment papers, feedback records, observations and the curriculum.</p><ol className="report-journey">{report.chain.map(r => <li key={r.link.id}><span>{r.link.step.toString().padStart(2, '0')}</span><strong>{r.link.name}</strong><small>{report.linksYouEvidence.includes(r.link.id) ? 'Your track contributes' : 'Other evidence needed'}</small></li>)}</ol>
        <details className="report-disclosure"><summary>Preview the course evidence <span>{broken ? `First stage below threshold: ${broken.link.name.toLowerCase()}` : 'View all stages'}</span></summary><div className="report-disclosure__body"><p className="report-footnote">These are combined course readings from the simulated evidence base, including your response where applicable. They are not your personal results.</p><ChainView chain={report.chain} evidenced={report.linksYouEvidence} /></div></details>
      </section>
      <aside className="report-contribution">
        <h3>What your contribution changed</h3>
        <p>Your response is now one of {impact.groupN} {noun} responses in this session. {impact.changedFindings.length === 0 ? 'It did not change which course findings meet the evidence rules.' : `${impact.changedFindings.length} course finding${impact.changedFindings.length === 1 ? '' : 's'} changed status under the evidence rules.`} A finding can stay the same while individual experiences differ.</p>
        {impact.changedFindings.length > 0 && <ul>{impact.changedFindings.map(id => <li key={id}><button type="button" className="btn--link" onClick={() => onOpenFinding(id)}>{findingById(id).title} →</button></li>)}</ul>}
        <p className="report-footnote">This demo keeps your answers only in the current session. Reloading or starting again clears them. Suggested actions have not been sent to anyone or assigned.</p>
      </aside>
      <section className="report-next"><div><p className="section-label">Up next · Course analysis</p><h2>See what all the evidence says.</h2><p>Explore the course’s strengths, gaps and recommended actions, with the sources behind each finding.</p></div><button type="button" className="btn" onClick={onContinue}>See the course analysis <span aria-hidden="true">→</span></button></section>
    </div>
  );
};
