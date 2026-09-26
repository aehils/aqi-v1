import type { Dataset } from '../../engine/dataset';
import type { ViewerImpact, ViewerSubmission } from '../../engine/session';
import type { Tab } from '../../state/reducer';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { groupSizes } from '../../engine/aggregate';
import { derived } from '../../engine/derived';
import { DomainProfile } from './DomainProfile';
import { FindingSummary } from './FindingSummary';
import { ChainView } from '../report/ChainView';
import { readChain } from '../../engine/report';
import { allDomainBands } from '../../engine/bands';
import { course } from '../../data/course';
import { actionTitles, actionSummaries } from '../../data/analysisPresentation';
import { groupNouns } from '../../instruments';

export const Overview = ({ dataset, impact, submission, onOpenFinding, onNavigate, onOpenConstruct }: {
  dataset: Dataset; impact: ViewerImpact | null; submission: ViewerSubmission | null;
  onOpenFinding: (id: string) => void; onNavigate: (tab: Tab) => void; onOpenConstruct: (id: string) => void;
}) => {
  const analysis = buildCourseAnalysis(dataset);
  const n = groupSizes(dataset);
  const lead = analysis.actions[0];
  const domains = allDomainBands(dataset);
  const limited = domains.filter(d => d.band === 'insufficient').length;
  const evidenced = domains.reduce((sum, d) => sum + d.evidenced, 0);
  const total = domains.reduce((sum, d) => sum + d.constructs.length + d.notInstrumented, 0);

  return <div className="column analysis-page">
    <header className="analysis-heading">
      <p className="section-label">Course analysis · {course.code}</p>
      <h1>{analysis.concerns.length ? 'Where this course needs attention.' : 'What the course evidence supports.'}</h1>
      <p>Bring student experience, teaching practice and course records together. Start with the priorities, check the evidence, then review a proposed action plan.</p>
    </header>

    <section className="analysis-brief" aria-labelledby="brief-title">
      <div className="analysis-brief__lead"><p className="section-label">Start here</p>
        <h2 id="brief-title">{lead ? actionTitles[lead.id] : 'Review the current evidence before choosing an action.'}</h2>
        <p>{lead ? actionSummaries[lead.id] : 'No action-linked finding currently meets all its evidence rules. Explore the profile and evidence gaps below.'}</p>
        {lead && <p className="analysis-owner"><strong>Proposed owner</strong> {lead.recommendation.owner}</p>}
        <button type="button" className="btn" onClick={() => onNavigate('recommendations')}>Review the action plan →</button>
        {lead && <p className="analysis-small">First in the current planning order, based on evidence coverage and the share of students reached. This is not a certainty score.</p>}
      </div>
      <div className="analysis-brief__stats">
        <div><strong>{analysis.concerns.length}</strong><span>issues supported by the current evidence</span></div>
        <div><strong>{analysis.strengths.length}</strong><span>{analysis.strengths.length === 1 ? 'strength' : 'strengths'} to preserve</span></div>
        <div><strong>{limited}</strong><span>{limited === 1 ? 'domain needs' : 'domains need'} more evidence before a judgement</span></div>
      </div>
    </section>

    <nav className="report-jumps" aria-label="Course analysis sections">
      <a href="#course-priorities">Priorities ↘</a><a href="#quality-profile">Quality profile ↘</a><a href="#evidence-scope">Evidence & limits ↘</a>
    </nav>
    <section className="analysis-section" id="course-priorities" aria-labelledby="priorities-title">
      <div className="analysis-section-heading"><div><p className="section-label">01 · What matters</p><h2 id="priorities-title">Issues to act on, strengths to keep</h2></div>
        <button className="btn--link" type="button" onClick={() => onNavigate('findings')}>Browse all findings →</button>
      </div>
      <p className="analysis-lede">The figures describe the course as a whole. Each finding opens its sources, limits and suggested response.</p>
      <div className="analysis-finding-grid">{analysis.concerns.map(f => <FindingSummary key={f.id} finding={f} dataset={dataset} onOpenFinding={onOpenFinding}
        action={actionSummaries[analysis.actions.find(a => a.findingId === f.id)?.id ?? '']} />)}</div>
      {analysis.concerns.length === 0 && <p className="analysis-empty">No problem findings meet all their current rules. This does not establish that the course is problem-free.</p>}
      <div className="analysis-finding-grid analysis-secondary">{[...analysis.strengths, ...analysis.questions].map(f => <FindingSummary key={f.id} finding={f} dataset={dataset} onOpenFinding={onOpenFinding} />)}</div>
      {analysis.inactive.length > 0 && <p className="analysis-small">{analysis.inactive.length} further {analysis.inactive.length === 1 ? 'finding does' : 'findings do'} not meet the current rules. Inspect these under “Not currently supported” in All findings.</p>}
    </section>

    <section className="analysis-section" id="quality-profile" aria-labelledby="profile-title">
      <p className="section-label">02 · The full profile</p><h2 id="profile-title">Quality across the course</h2>
      <p className="analysis-lede">Each domain covers several aspects of quality. A domain can contain strengths and concerns at the same time. Its label reflects the model’s rules and available evidence, not an overall course score.</p>
      <DomainProfile dataset={dataset} onOpenConstruct={onOpenConstruct} />
      <details className="analysis-disclosure"><summary>How learning becomes a usable skill</summary><div><p className="analysis-lede">This sequence helps locate questions to investigate. A stage below its threshold does not prove the cause of a later outcome.</p><ChainView chain={readChain(dataset)} /></div></details>
    </section>

    <section className="analysis-section" id="evidence-scope" aria-labelledby="scope-title">
      <p className="section-label">03 · Evidence & limits</p><h2 id="scope-title">What this analysis can tell you</h2>
      <div className="analysis-scope">
        <div><h3>What was considered</h3><dl className="analysis-evidence-counts">
          <div><dt>Student responses</dt><dd>{n.student}</dd></div><div><dt>Lecturer responses</dt><dd>{n.faculty}</dd></div><div><dt>Administrative returns</dt><dd>{n.institution}</dd></div>
          <div><dt>Feedback records</dt><dd>{derived('feedback.turnaround.n')}</dd></div><div><dt>Assessment papers</dt><dd>{derived('artefact.count')}</dd></div><div><dt>Teaching observations</dt><dd>{derived('observation.count')}</dd></div>
        </dl><p>Also includes the curriculum, learning-platform activity and institutional records. All course data is simulated.</p></div>
        <div><h3>What remains uncertain</h3><p>{evidenced} of {total} aspects in the quality model have quantitative evidence sufficient for a label. Missing evidence is not a positive result.</p><p>Response counts vary by question. Small lecturer and administrative groups provide context, not a representative benchmark. Associations and possible explanations require further investigation.</p>
          <button type="button" className="btn--link" onClick={() => onNavigate('perspectives')}>Compare the sources →</button>
        </div>
      </div>
      <p className="analysis-contribution">{impact && submission ? <>Your response is one of {impact.groupN} {groupNouns[impact.role].plural} responses. It {impact.changedFindings.length ? `changed the supported status of ${impact.changedFindings.length} finding${impact.changedFindings.length === 1 ? '' : 's'}` : 'did not change which findings meet the rules'}. Your individual experience remains part of the evidence.</> : 'You are viewing the simulated evidence base. No response from you is included.'}</p>
    </section>
  </div>;
};
