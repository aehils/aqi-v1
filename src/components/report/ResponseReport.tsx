import { useMemo } from 'react';
import type { ViewerSubmission } from '../../engine/session';
import type { Dataset } from '../../engine/dataset';
import { buildReport } from '../../engine/report';
import { overarchingQuestion } from '../../data/inquiry';
import { statusLabel, validationRule, validationDisposition } from '../../data/validation';
import { domainById } from '../../data/domains';
import { questionById, roleLabels, groupNouns } from '../../instruments';
import { f1, withUnit } from '../../lib/format';
import { seedRespondentBase } from '../../data/course';
import { ChainView } from './ChainView';
import { resolveMetric } from '../../engine/aggregate';
import type { MetricSpec } from '../../data/types';

const resolveObjective = (ds: Dataset, spec: MetricSpec): number => resolveMetric(ds, spec);

const linkLabel: Record<string, string> = {
  'over-reports': 'reports higher than the anchor',
  'under-reports': 'reports lower than the anchor',
  none: 'no directional bias',
};

/**
 * The immediate report. Everything here is read from the viewer's own answers
 * against the base as it stood before they arrived. It is deliberately not a
 * quality verdict: the last section says what it is waiting on.
 */
export const ResponseReport = ({ submission, dataset, onContinue }: { submission: ViewerSubmission; dataset: Dataset; onContinue: () => void }) => {
  const report = useMemo(() => buildReport(submission, dataset), [submission, dataset]);
  const noun = groupNouns[report.role].plural;
  const base = seedRespondentBase[report.role];
  const { consistency } = report;

  return (
    <div className="column report">
      <p className="section-label">Your report</p>
      <h1 className="screen-title">What your responses say, before anything is combined.</h1>
      <p className="screen-lede">
        This is your own evidence read back to you — your answers, what they imply, and where they agree and disagree with the {base} {noun}{' '}
        responses already on file. Nothing here is a quality judgement on the course. That comes later, and from more than you.
      </p>

      <div className="inquiry-banner">
        <p className="section-label" style={{ marginBottom: 0 }}>
          The question this evaluation exists to answer
        </p>
        <p className="inquiry-banner__q">{overarchingQuestion}</p>
      </div>

      <div className="block">
        <p className="section-label">1 · Consistency check</p>
        <p className="section-note">
          {consistency.scored} of your answers on the readings that matter most were asked twice — once as a judgement, once anchored to a quantity, a specific
          occasion, or what followed from it. {validationRule}
        </p>
        <div className="checks">
          {report.checks.map((c) => (
            <article key={c.pair.id} className={`check check--${c.status}`}>
              <header className="check__head">
                <span>{c.pair.checks}</span>
                <span className={`check__tag check__tag--${c.status}`}>{statusLabel[c.status]}</span>
              </header>
              <dl className="check__pair">
                <dt>{questionById(c.pair.primaryQuestionId).id} · your judgement</dt>
                <dd>
                  {c.primaryLabel ?? '—'} <span className="figure">{c.primaryValue ?? '—'}</span>
                </dd>
                <dt>{questionById(c.pair.validatorQuestionId).id} · your anchor</dt>
                <dd>
                  {c.validatorLabel ?? '—'} <span className="figure">{c.impliedValue ?? '—'}</span>
                </dd>
              </dl>
              {c.signedGap !== null && c.status !== 'corroborated' && (
                <p className="check__read">{c.signedGap > 0 ? c.pair.ifPrimaryHigher : c.pair.ifPrimaryLower}</p>
              )}
              {c.pair.objective && (
                <p className="check__objective">
                  Independent reading of the same thing — {c.pair.objective.label}:{' '}
                  <span className="figure">{withUnit(resolveObjective(dataset, c.pair.objective.metric), c.pair.objective.unit)}</span>. {c.pair.objective.note}
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="disposition">{validationDisposition}</p>
      </div>

      <div className="block">
        <p className="section-label">2 · How the cohort answers the same pairs</p>
        <p className="section-note">
          The same check run across every {noun} response in the evidence base, yours now among them. A low corroboration rate scattered in both directions is
          noise. A mean gap with a consistent sign is a measurement bias, and it is reported as a finding rather than corrected away.
        </p>
        <div className="table-scroll">
        <table className="data table--validation">
          <thead>
            <tr>
              <th scope="col">Reading checked</th>
              <th scope="col">n</th>
              <th scope="col">Corroborated</th>
              <th scope="col">Judgement</th>
              <th scope="col">Anchor</th>
              <th scope="col">Gap</th>
              <th scope="col">Reads as</th>
            </tr>
          </thead>
          <tbody>
            {report.cohortChecks.map((v) => (
              <tr key={v.pair.id}>
                <th scope="row">{questionById(v.pair.primaryQuestionId).id} — {v.pair.constructId.replace(/-/g, ' ')}</th>
                <td className="num">{v.n}</td>
                <td className="num">{Math.round(100 * v.corroborationRate)}%</td>
                <td className="num">{f1(v.meanPrimary)}</td>
                <td className="num">{f1(v.meanImplied)}</td>
                <td className="num">{v.meanSignedGap > 0 ? '+' : ''}{f1(v.meanSignedGap)}</td>
                <td className={v.bias === 'none' ? 'muted' : 'is-flagged'}>{linkLabel[v.bias]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="block">
        <p className="section-label">3 · Your readings against the cohort</p>
        <p className="section-note">
          Each answer you gave that carries a scale value, set against the mean of the responses already on file — before yours was added to them.
        </p>
        <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">Reading</th>
              <th scope="col">Your answer</th>
              <th scope="col">You</th>
              <th scope="col">Cohort</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {report.readings.map((r) => (
              <tr key={r.questionId}>
                <th scope="row">
                  {r.label}
                  {r.validated && (
                    <>
                      {' '}
                      <span className="tag-mini" title="This reading carries a validator item.">
                        checked
                      </span>
                    </>
                  )}
                  <span className="muted small"> · {r.domainId ? domainById(r.domainId).shortName : 'variable of interest'}</span>
                </th>
                <td>{r.answerLabel}</td>
                <td className="num">{r.value}</td>
                <td className="num">{f1(r.cohortMean)}</td>
                <td className={`num${Math.abs(r.delta) >= 1.5 ? ' is-flagged' : ''}`}>
                  {r.delta > 0 ? '+' : ''}
                  {f1(r.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="section-note">
          {report.furthest && !Number.isNaN(report.furthest.delta) && (
            <>
              You differ most from the cohort on {report.furthest.label.toLowerCase()} ({f1(report.furthest.delta)}), and agree most closely on{' '}
              {report.closest?.label.toLowerCase()}.{' '}
            </>
          )}
          {report.unscoredCount > 0 && `${report.unscoredCount} further answer${report.unscoredCount === 1 ? '' : 's'} you gave ${report.unscoredCount === 1 ? 'is' : 'are'} recorded but not scored — open text and "not sure" answers are kept as evidence and excluded from every mean.`}
        </p>
      </div>

      <div className="block">
        <p className="section-label">4 · Where your evidence sits in the chain</p>
        <p className="section-note">
          Intention becomes capability along five links. Your instrument can speak to {report.linksYouEvidence.length} of them; the rest are read from records,
          artefacts and the curriculum document, which is why a {roleLabels[report.role].toLowerCase()} questionnaire alone cannot answer the question above.
        </p>
        <ChainView chain={report.chain} evidenced={report.linksYouEvidence} />
      </div>

      <div className="block handoff">
        <p className="section-label">What this report is not</p>
        <p>
          It is one source, read alone. It cannot tell you whether the course is good, because it contains no reading that is independent of the people answering
          it. The quality profile that follows is synthesised from both tracks together with institutional records, the assessment artefacts, the LMS extract,
          observation records and the curriculum document — and where those sources disagree, the analysis says so rather than averaging them.
        </p>
        <button type="button" className="btn" onClick={onContinue} autoFocus>
          See the course analysis
        </button>
      </div>
    </div>
  );
};
