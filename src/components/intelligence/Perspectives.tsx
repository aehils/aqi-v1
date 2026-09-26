import { Fragment, useState, type ReactNode } from 'react';
import type { Dataset } from '../../engine/dataset';
import { allComparisons, comparisonThresholdStatement, type ResolvedCell } from '../../engine/compare';
import { groupSizes, meanFor, selectionRateFor, matrixMeanFor, categoricalFor } from '../../engine/aggregate';
import { categoricalMaps, DIVERGENCE_THRESHOLD } from '../../data/readings';
import { constructById } from '../../data/constructs';
import { Dumbbell } from '../charts/Dumbbell';
import { f1, share } from '../../lib/format';
import { sourceLabel } from '../../data/indicators';
import { allCohortValidation } from '../../engine/validate';
import { validationRule, BIAS_THRESHOLD } from '../../data/validation';
import { questionById, groupLabels } from '../../instruments';

const pointLabels = { student: 'Students', faculty: 'Lecturers', institution: 'Academic / admin' } as const;

const Cell = ({ cell, objective }: { cell: ResolvedCell | undefined; objective?: boolean }) => {
  if (!cell) {
    return <td className={`cell muted${objective ? ' col-objective' : ''}`}>—</td>;
  }
  const mark = cell.signal === 'positive' ? '+' : cell.signal === 'negative' ? '−' : '·';
  return (
    <td className={`cell${objective ? ' col-objective' : ''}`}>
      <span className="cell__value">{cell.display}</span>
      <span className={`cell__signal signal--${cell.signal}`} aria-label={`${cell.signal} on the stated threshold`}>
        {mark}
      </span>
      <span className="cell__caption">
        {cell.caption}
        {cell.evidenceSource ? ` · ${sourceLabel[cell.evidenceSource]}` : ''}
        {cell.n !== null && cell.format === 'scale' ? ` · n ${cell.n}` : ''}
      </span>
    </td>
  );
};

/** One reading in a stakeholder panel: a label, an optional caveat, and either a figure or a short breakdown. */
const Row = ({ label, note, value, items }: { label: string; note?: string; value?: ReactNode; items?: { name: string; value: string }[] }) => (
  <div className="prow">
    <span className="prow__label">
      {label}
      {note && <span className="prow__note">{note}</span>}
    </span>
    <span className="prow__value">{value ?? ''}</span>
    {items && (
      <ul className="prow__items">
        {items.map((i) => (
          <li className="prow__item" key={i.name}>
            <span>{i.name}</span>
            <span className="figure">{i.value}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/** Three stakeholder panels and the discrepancy matrix. This screen is the argument. */
export const Perspectives = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void }) => {
  const ds = dataset;
  const n = groupSizes(ds);
  const scale = (id: string, g: 'student' | 'faculty') => `${f1(meanFor(ds, id, g).mean)} / 5`;
  const notScored = (id: string) => {
    const r = meanFor(ds, id, 'student');
    return r.nNonScoring ? `${Math.round((100 * r.nNonScoring) / r.n)}% of responses not scored` : undefined;
  };
  const sel = (id: string, g: 'student' | 'faculty' | 'institution', o: string) => {
    const r = selectionRateFor(ds, id, g, o);
    return share(r.rate, r.n);
  };
  const mx = (row: string) => `${f1(matrixMeanFor(ds, 'IND-TECH-FAC', 'faculty', row).mean)} / 5`;
  const cat = (id: 'IND-ILO-01' | 'IND-TRN-01' | 'IND-MON-01' | 'IND-REV-01') => categoricalFor(ds, id, 'institution', categoricalMaps[id]);
  const cmp = allComparisons(ds);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const visible = onlyDifferences ? cmp.filter(c => c.flagged) : cmp;

  return (
    <div className="column analysis-page">
      <header className="report-heading"><p className="section-label">Course analysis · Compare sources</p></header>
      <div className="analysis-comparison-toolbar"><p><strong>{cmp.filter(c => c.flagged).length} of {cmp.length} topics</strong> show different respondent signals under the model’s rules.</p>
        <label><input type="checkbox" checked={onlyDifferences} onChange={e => setOnlyDifferences(e.target.checked)} /> Show only differences</label>
      </div>
      <p className="analysis-small">Different accounts show where to investigate; they do not tell us which person is wrong. Read the label and unit with each value. Frequency, availability and usefulness measure different things. Counts shown belong to that source; they are not a shared sample.</p>
      <div className="analysis-comparisons">{visible.map(c => <article className="analysis-comparison" key={c.spec.constructId}>
        <div className="analysis-section-heading"><h2>{constructById(c.spec.constructId).name}</h2><span className={`analysis-status${c.flagged ? ' analysis-status--attention' : ''}`}>{c.flagged ? 'Different source signals' : 'No respondent difference flagged'}</span></div>
        <div className="analysis-source-cells">{(['student', 'faculty', 'institution', 'objective'] as const).map(key => {
          const cell = c.cells[key];
          return <div className={key === 'objective' ? 'analysis-source-cell analysis-source-cell--record' : 'analysis-source-cell'} key={key}>
            <p className="report-kicker">{key === 'objective' ? 'Course records & other evidence' : pointLabels[key]}</p>
            {cell ? <><strong>{cell.display}</strong><p>{cell.caption}</p><small>{cell.n !== null ? `${cell.n} contributing records or responses` : 'Derived from course evidence'}{cell.evidenceSource ? ` · ${sourceLabel[cell.evidenceSource]}` : ''}</small></> : <p className="analysis-small">No reading for this source.</p>}
          </div>;
        })}</div>
        <p className="analysis-comparison-note">{c.flagged ? 'The respondent readings cross the model’s difference threshold. Compare the questions and the evidence before interpreting why.' : 'No respondent difference crosses the model’s threshold. This does not mean the sources establish the same thing or that the outcome is positive.'} {!c.cells.objective && 'No independent course-record reading is attached to this topic.'}</p>
        <details className="analysis-inline-detail"><summary>Comparison rules</summary><p>{comparisonThresholdStatement} Current result: {c.divergence}. A record can provide context without directly validating a respondent’s account.</p></details>
        <button type="button" className="btn--link" onClick={() => onOpenFinding(c.spec.findingId)}>Inspect the related finding →</button>
      </article>)}</div>
      {!visible.length && <p className="analysis-empty">No respondent differences meet the current threshold. Clear the filter to inspect all sources.</p>}
      <details className="analysis-disclosure"><summary>Full summaries by respondent group</summary><div>
      <div className="panels">
        <div className="panel">
          <h3>Students</h3>
          <p className="panel__n">n = {n.student}</p>
          <p className="panel__note">What the course was like to be taught on, as experienced.</p>
          <Row label="Clarity of explanations" value={scale('IND-CLR-01', 'student')} />
          <Row label="Opportunities to participate" value={scale('IND-ACT-02', 'student')} />
          <Row label="Ease of access to resources" value={scale('IND-RES-01', 'student')} />
          <Row label="Assessments require application" note={notScored('IND-CGD-01')} value={scale('IND-CGD-01', 'student')} />
          <Row label="Feedback usefulness" note={notScored('IND-FBQ-01')} value={scale('IND-FBQ-01', 'student')} />
          <Row label="Feedback timeliness" note={notScored('IND-FBT-01')} value={scale('IND-FBT-01', 'student')} />
          <Row label="Overall satisfaction" note="Variable of interest, not a measure of quality" value={scale('IND-SAT-01', 'student')} />
          <Row
            label="Resources experienced"
            items={[
              { name: 'Presentation slides', value: sel('IND-TECH-STU', 'student', 'powerpoint') },
              { name: 'Learning Management System', value: sel('IND-TECH-STU', 'student', 'lms') },
              { name: 'Virtual laboratories', value: sel('IND-TECH-STU', 'student', 'virtual-labs') },
            ]}
          />
        </div>

        <div className="panel">
          <h3>Lecturers</h3>
          <p className="panel__n">n = {n.faculty}</p>
          <p className="panel__note">What is actually done in teaching and assessment, and what constrains it.</p>
          <Row label="Own clarity, self-rated" value={scale('IND-CLR-02', 'faculty')} />
          <Row label="Opportunities to participate, as provided" value={scale('IND-ACT-01', 'faculty')} />
          <Row label="ILOs determine what is assessed" value={scale('IND-ALN-01', 'faculty')} />
          <Row label="Assessments require application" value={scale('IND-CGD-02', 'faculty')} />
          <Row label="Feedback designed to improve work" value={scale('IND-FBQ-02', 'faculty')} />
          <Row label="Self-rated effectiveness" note="Variable of interest, not a measure of teaching quality" value={scale('IND-EFF-01', 'faculty')} />
          <Row
            label="Barriers to prompt feedback"
            items={[
              { name: 'Large class sizes', value: sel('IND-FBB-01', 'faculty', 'class-size') },
              { name: 'Marking time', value: sel('IND-FBB-01', 'faculty', 'marking-time') },
              { name: 'Multiple courses', value: sel('IND-FBB-01', 'faculty', 'multiple-courses') },
            ]}
          />
          <Row
            label="Frequency of use"
            items={[
              { name: 'Presentation slides', value: mx('powerpoint') },
              { name: 'Learning Management System', value: mx('lms') },
              { name: 'Virtual laboratories', value: mx('virtual-labs') },
            ]}
          />
        </div>

        <div className="panel">
          <h3>Academic / administrative</h3>
          <p className="panel__n">n = {n.institution}</p>
          <p className="panel__note">What the institution has approved, declared and put in place.</p>
          <Row label="Formally approved ILOs" value={`${cat('IND-ILO-01').modal} · ${cat('IND-ILO-01').counts.find((x) => x.option.key === 'yes')?.count ?? 0} of ${n.institution}`} />
          <Row
            label="Curriculum alignment declared"
            items={[
              { name: 'NUC CCMAS', value: sel('IND-CAL-01', 'institution', 'nuc') },
              { name: 'Professional body', value: sel('IND-CAL-01', 'institution', 'professional') },
              { name: 'Industry / employer', value: sel('IND-CAL-01', 'institution', 'industry') },
            ]}
          />
          <Row
            label="Provision declared available"
            items={[
              { name: 'Learning Management System', value: sel('IND-PROV-01', 'institution', 'lms') },
              { name: 'Virtual laboratories', value: sel('IND-PROV-01', 'institution', 'virtual-labs') },
            ]}
          />
          <Row
            label="Access limitations named"
            items={[
              { name: 'Internet / connectivity', value: sel('IND-PROV-02', 'institution', 'connectivity') },
              { name: 'Electricity / power', value: sel('IND-PROV-02', 'institution', 'power') },
              { name: 'Device limitations', value: sel('IND-PROV-02', 'institution', 'devices') },
            ]}
          />
          <Row
            label="Assessment quality assurance"
            items={[
              { name: 'Internal moderation', value: sel('IND-QA-01', 'institution', 'internal-moderation') },
              { name: 'External moderation', value: sel('IND-QA-01', 'institution', 'external-moderation') },
            ]}
          />
          <Row label="Rubrics provided" value={cat('IND-TRN-01').modal} />
          <Row label="Turnaround monitored" value={cat('IND-MON-01').modal} />
          <Row label="Quality indicators reviewed" value={cat('IND-REV-01').modal} />
        </div>
      </div>

      </div></details>
      <details className="analysis-disclosure"><summary>How general ratings compare with specific examples</summary><div>
      <p className="section-label">Within-source checks</p>
      <p className="section-note">
        Some topics are asked as a general rating and a specific example. These are related measures, not necessarily identical ones. {validationRule} A mean gap of {BIAS_THRESHOLD.toFixed(1)} or more
        on the shared scale is flagged for investigation. These are configured demo rules, not proof that a respondent is unreliable.
      </p>
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Reading checked</th>
              <th>Source</th>
              <th>n</th>
              <th>Within alignment threshold</th>
              <th>Some difference</th>
              <th>Larger difference</th>
              <th>Judgement</th>
              <th className="col-objective">Anchor</th>
              <th>Mean gap</th>
            </tr>
          </thead>
          <tbody>
            {allCohortValidation(ds).map((v) => (
              <tr key={v.pair.id} className="values">
                <td className="construct">
                  <strong>{constructById(v.pair.constructId).name}</strong>
                  <br />
                  <span className="cell__caption">
                    {questionById(v.pair.primaryQuestionId).id} checked by {questionById(v.pair.validatorQuestionId).id}
                  </span>
                </td>
                <td>{groupLabels[v.pair.role]}</td>
                <td className="num">{v.n}</td>
                <td className="num">{Math.round(100 * v.corroborationRate)}%</td>
                <td className="num">{v.marginal}</td>
                <td className="num">{v.contradicted}</td>
                <td className="num">{f1(v.meanPrimary)}</td>
                <td className="num col-objective">{f1(v.meanImplied)}</td>
                <td>
                  {v.bias === 'none' ? (
                    <span className="muted">
                      {v.meanSignedGap > 0 ? '+' : ''}
                      {f1(v.meanSignedGap)} · below the directional threshold
                    </span>
                  ) : (
                    <>
                      <span className="row-flag">
                        {v.meanSignedGap > 0 ? '+' : ''}
                        {f1(v.meanSignedGap)}
                      </span>
                      <span className="cell__caption">{v.bias === 'over-reports' ? 'General ratings map higher than examples' : 'Examples map higher than general ratings'}</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="section-note">All answers are retained. A gap alone does not establish its cause or show which answer is more accurate.</p>
      </div></details>
      <details className="analysis-disclosure"><summary>Detailed comparison table & scale charts</summary><div>

      <p className="section-label">Discrepancy matrix</p>
      <p className="section-note">
        Each row is one construct. The first three columns are what people report; the fourth is what the record, the artefacts or the system data show. {comparisonThresholdStatement} Signs mark each reading against its own threshold: + positive, − negative, · neutral. The notes beneath each row describe the model’s interpretation; source agreement is not proof of a cause.
      </p>
      <div className="table-scroll">
        <table className="data matrix-table">
          <thead>
            <tr>
              <th rowSpan={2}>Construct</th>
              <th className="group" colSpan={3}>
                What people report
              </th>
              <th className="group col-objective" rowSpan={2}>
                What the record shows
              </th>
              <th rowSpan={2}>Divergence</th>
            </tr>
            <tr>
              <th>{pointLabels.student}</th>
              <th>{pointLabels.faculty}</th>
              <th>{pointLabels.institution}</th>
            </tr>
          </thead>
          <tbody>
            {cmp.map((c) => (
              <Fragment key={c.spec.constructId}>
                <tr className="values">
                  <td className="construct">
                    <strong>{constructById(c.spec.constructId).name}</strong>
                    <br />
                    <button type="button" className="btn--link small" onClick={() => onOpenFinding(c.spec.findingId)}>
                      Finding {c.spec.findingId}
                    </button>
                  </td>
                  <Cell cell={c.cells.student} />
                  <Cell cell={c.cells.faculty} />
                  <Cell cell={c.cells.institution} />
                  <Cell cell={c.cells.objective} objective />
                  <td>
                    {c.flagged ? (
                      <>
                        <span className="row-flag">Flagged</span>
                        <span className="cell__caption">{c.divergence}</span>
                      </>
                    ) : (
                      <span className="muted">{c.divergence}</span>
                    )}
                  </td>
                </tr>
                <tr className="adjudication">
                  <td colSpan={6}>
                    {c.flagged && c.supports && c.supports !== 'none' && <span className="marker">Objective evidence is consistent with {pointLabels[c.supports].toLowerCase()}. </span>}
                    {c.flagged && c.supports === 'none' && <span className="marker">No record signal matches a respondent signal on this comparison. </span>}
                    {c.spec.adjudication}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="hairline" />
      <p className="section-label">Flagged constructs, source against source</p>
      <p className="section-note">Each line is a 1 to 5 scale. The two markers are the two sources; the bar between them is the gap the threshold is set against.</p>
      <div className="dumbbells">
        {cmp
          .filter((c) => c.spec.dumbbell)
          .map((c) => {
            const a = c.cells[c.spec.dumbbell!.a]!;
            const b = c.cells[c.spec.dumbbell!.b]!;
            return (
              <div key={c.spec.constructId}>
                <p className="dumbbell__title">{constructById(c.spec.constructId).name}</p>
                <Dumbbell
                  a={{ label: pointLabels[c.spec.dumbbell!.a], value: a.value, n: a.n ?? 0 }}
                  b={{ label: pointLabels[c.spec.dumbbell!.b], value: b.value, n: b.n ?? 0 }}
                  threshold={DIVERGENCE_THRESHOLD}
                  flagged={c.flagged}
                />
                <p className="dumbbell__note">
                  {c.cells.objective ? `${sourceLabel[c.cells.objective.evidenceSource ?? 'records']}: ${c.cells.objective.display} ${c.cells.objective.caption}.` : ''} {c.flagged ? 'Flagged.' : 'Within threshold.'}
                </p>
              </div>
            );
          })}
      </div>
      </div></details>
    </div>
  );
};
