import type { Dataset } from '../../engine/dataset';
import type { FindingMetric } from '../../data/types';
import type { ViewerImpact, ViewerSubmission } from '../../engine/session';
import { firingFindings } from '../../engine/session';
import { groupSizes, metricN, resolveMetric } from '../../engine/aggregate';
import { derived } from '../../engine/derived';
import { findings } from '../../data/findings';
import { evaluateTrigger } from '../../engine/triggers';
import { constructBand } from '../../engine/bands';
import { indicatorById } from '../../data/indicators';
import { questionById, groupNouns } from '../../instruments';
import { DomainProfile } from './DomainProfile';
import { BandTag } from '../shell/BandTag';
import { f1, withUnit, share } from '../../lib/format';

const kindLabel: Record<string, string> = {
  problem: 'Finding',
  strength: 'Confirmed strength',
  relationship: 'Relationship to investigate',
};

const formatMetric = (ds: Dataset, m: FindingMetric): string => {
  const value = resolveMetric(ds, m.metric);
  if (m.metric.kind === 'selection') {
    const n = metricN(ds, m.metric) ?? 0;
    return share(value, n);
  }
  if (m.unit === '%') return `${Math.round(value)}%`;
  return withUnit(value, m.unit);
};

/** Overview: the lead, the evidence base, the quality profile, and every reading the analysis supports. */
export const Overview = ({ dataset, impact, submission, onOpenFinding }: { dataset: Dataset; impact: ViewerImpact | null; submission: ViewerSubmission | null; onOpenFinding: (id: string) => void }) => {
  const firing = firingFindings(dataset);
  const lead = firing.find((f) => f.overviewHeadline) ?? null;
  const n = groupSizes(dataset);
  const counts = {
    problem: firing.filter((f) => f.kind === 'problem').length,
    strength: firing.filter((f) => f.kind === 'strength').length,
    relationship: firing.filter((f) => f.kind === 'relationship').length,
  };
  const notFiring = findings.length - firing.length;

  return (
    <div className="column">
      <p className="section-label">Overview</p>

      <div className="split block">
        <div>
          <h1 className="headline" style={{ marginBottom: 'var(--s2)' }}>
            {lead ? lead.overviewHeadline : 'No finding currently fires against the evidence base.'}
          </h1>
          {lead && (
            <p className="muted">
              Derived by joining the assessment schedule to the feedback records. No respondent reported it.{' '}
              <button type="button" className="btn--link" onClick={() => onOpenFinding(lead.id)}>
                Open the finding
              </button>
              .
            </p>
          )}
        </div>
        <aside className="split__aside">
          <p className="section-label" style={{ marginBottom: 0 }}>
            Evidence base
          </p>
          <dl>
            <dt>Student responses</dt>
            <dd>{n.student}</dd>
            <dt>Lecturer responses</dt>
            <dd>{n.faculty}</dd>
            <dt>Administrative responses</dt>
            <dd>{n.institution}</dd>
            <dt>Feedback records</dt>
            <dd>{derived('feedback.turnaround.n')}</dd>
            <dt>Assessment artefacts</dt>
            <dd>{derived('artefact.count')}</dd>
            <dt>Observation records</dt>
            <dd>{derived('observation.count')}</dd>
          </dl>
          <p>Plus the curriculum document, the LMS extract and the records office return. Every figure on this page resolves from these sources.</p>
        </aside>
      </div>

      <div className="block">
        <p className="section-label">Quality profile</p>
        <p className="section-note">
          AQIP reads academic quality across seven domains. Each carries a band derived from the constructs evidenced within it, never a score. Open a domain to see how its band was derived.
        </p>
        <DomainProfile dataset={dataset} />
      </div>

      <div className="block">
        <p className="section-label">What the analysis found</p>
        <p className="section-note">
          {counts.problem} problem finding{counts.problem === 1 ? '' : 's'}, {counts.strength} confirmed strength and {counts.relationship} relationship worth investigating.
          {notFiring > 0 && ` ${notFiring} further rule${notFiring === 1 ? ' does' : 's do'} not fire against the current evidence base, and ${notFiring === 1 ? 'is' : 'are'} marked below.`} Each opens the rule that fired and the evidence behind it.
        </p>
        <div className="signals">
          {findings.map((f) => {
            const fires = evaluateTrigger(f, dataset).fires;
            const band = constructBand(dataset, f.lineage.constructId).band;
            return (
              <button key={f.id} type="button" className="signal" onClick={() => onOpenFinding(f.id)}>
                <span className="signal__head">
                  <span>{kindLabel[f.kind]}</span>
                  <span className="signal__head-right">
                    {!fires && <span className="nearmiss">Rule did not fire</span>}
                    {f.kind === 'relationship' ? <span className="chip">Association</span> : <BandTag band={band} />}
                  </span>
                </span>
                <span className="signal__title">{f.title}</span>
                <span className="signal__metrics">
                  {f.overviewMetrics.map((m) => (
                    <span className="signal__metric" key={m.label}>
                      {m.label}
                      <span className="figure">{formatMetric(dataset, m)}</span>
                    </span>
                  ))}
                </span>
                <span className="signal__foot">Open the evidence →</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="viewer-line">
        {impact && submission ? <ViewerLine impact={impact} onOpenFinding={onOpenFinding} /> : 'No response from you is included in this evidence base. The analysis reads the simulated base alone.'}
      </p>
    </div>
  );
};

const ViewerLine = ({ impact, onOpenFinding }: { impact: ViewerImpact; onOpenFinding: (id: string) => void }) => {
  const noun = groupNouns[impact.role].plural;
  const changed = impact.changedFindings;
  const div = impact.divergences[0];
  return (
    <>
      Your response is 1 of {impact.groupN} {noun} responses. It shifted {impact.shifts.length} indicator value{impact.shifts.length === 1 ? '' : 's'} by ≤{impact.maxAbsDelta.toFixed(2)} and{' '}
      {changed.length === 0 ? (
        'changed no finding'
      ) : (
        <>
          changed {changed.length} finding{changed.length === 1 ? '' : 's'} (
          {changed.map((id, i) => (
            <span key={id}>
              {i > 0 && ', '}
              <button type="button" className="btn--link" onClick={() => onOpenFinding(id)}>
                {id}
              </button>
            </span>
          ))}
          : the rule no longer fires with your response included)
        </>
      )}
      .
      {div && div.findingId && (
        <>
          {' '}
          Your answer on {indicatorById(div.indicatorId).label.toLowerCase()} ({questionById(div.questionId).id}) sits apart from the cohort at {div.viewerValue} against {f1(div.cohortMean)}.{' '}
          <button type="button" className="btn--link" onClick={() => onOpenFinding(div.findingId!)}>
            See the distribution
          </button>
          .
        </>
      )}
    </>
  );
};
