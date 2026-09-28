import { useState, type ReactNode } from 'react';
import type { Dataset } from '../../engine/dataset';
import { allComparisons, comparisonThresholdStatement } from '../../engine/compare';
import { groupSizes, meanFor, selectionRateFor, matrixMeanFor, categoricalFor } from '../../engine/aggregate';
import { categoricalMaps } from '../../data/readings';
import { constructById } from '../../data/constructs';
import { SourceReading } from './SourceReading';
import { FiveDots } from '../report/ReportVisuals';
import '../report/report.css';
import './analysis.css';
import './exploration.css';
import { f1, share } from '../../lib/format';
import { sourceLabel } from '../../data/indicators';
import { allCohortValidation } from '../../engine/validate';
import { validationRule, BIAS_THRESHOLD } from '../../data/validation';
import { groupLabels } from '../../instruments';

const pointLabels = { student: 'Students', faculty: 'Lecturers', institution: 'Academic / admin' } as const;

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

/** One topic at a time: respondent measures, record context, then optional detail. */
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
  const [selected, setSelected] = useState(cmp[0]?.spec.constructId ?? '');
  const visible = onlyDifferences ? cmp.filter(c => c.flagged) : cmp;
  const active = visible.find(c => c.spec.constructId === selected) ?? visible[0];
  const respondents = active ? (['student', 'faculty', 'institution'] as const).flatMap(key => active.cells[key] ? [{ key, cell: active.cells[key]! }] : []) : [];
  const absent = active ? (['student', 'faculty', 'institution'] as const).filter(key => !active.cells[key]).map(key => pointLabels[key]) : [];
  const scaleReadings = respondents.filter(r => r.cell.onFivePoint && Number.isFinite(r.cell.value));
  const gap = scaleReadings.length >= 2 ? Math.max(...scaleReadings.map(r => r.cell.value)) - Math.min(...scaleReadings.map(r => r.cell.value)) : null;

  return (
    <div className="column report-page analysis-page sources-page">
      <div className="sources-toolbar"><p><strong>{cmp.filter(c => c.flagged).length} of {cmp.length}</strong> topics have different respondent signals</p><label><input type="checkbox" checked={onlyDifferences} onChange={e => setOnlyDifferences(e.target.checked)} /> Differences only</label></div>
      <div className="sources-workspace">
        <nav className="source-topics" aria-label="Comparison topics">{visible.map(c => <button type="button" key={c.spec.constructId} aria-pressed={active?.spec.constructId === c.spec.constructId} onClick={() => setSelected(c.spec.constructId)}><strong>{constructById(c.spec.constructId).name}</strong><span>{c.flagged ? 'Different signals' : Object.keys(c.cells).filter(k => k !== 'objective').length < 2 ? 'One respondent source' : 'No difference flagged'}</span></button>)}</nav>
        {active ? <section className="source-workspace-detail" aria-labelledby="comparison-title">
          <header className="source-detail-heading"><div><p className="report-kicker">Selected topic</p><h2 id="comparison-title">{constructById(active.spec.constructId).name}</h2></div><span className={`source-status${active.flagged ? ' source-status--difference' : ''}`}>{active.flagged ? 'Different signals' : respondents.length < 2 ? 'No respondent comparison' : 'No difference flagged'}</span></header>
          <p className="source-comparison-context">{gap !== null ? `${f1(gap)}-point spread between respondent means on the 1–5 scale.` : 'These sources measure different aspects of this topic.'}</p>
          <div className="respondent-readings">{respondents.map(({ key, cell }) => <article className={`respondent-reading respondent-reading--${key}`} key={key}><h3>{pointLabels[key]}</h3><SourceReading cell={cell} />{!(cell.format === 'share' && cell.n !== null && cell.n <= 12) && <p className="source-sample">{cell.n !== null ? `${cell.n} contributing responses` : 'Sample size unavailable'}</p>}</article>)}</div>
          {absent.length > 0 && <p className="source-absence">No reading: {absent.join(' · ')}.</p>}
          <div className="record-context"><div><p className="report-kicker">Course evidence</p><h3>{active.cells.objective?.evidenceSource ? sourceLabel[active.cells.objective.evidenceSource] : 'Record context'}</h3><p>Read alongside the accounts; not verification of an individual response.</p></div>{active.cells.objective ? <SourceReading cell={active.cells.objective} /> : <p>No course-record reading is attached to this topic.</p>}</div>
          <footer className="source-detail-footer"><details><summary>Interpretation & comparison rules</summary><p>{comparisonThresholdStatement}</p><p>No flag does not establish agreement or a positive outcome. Small groups are descriptive; sample sizes belong to each source.</p><p>{active.spec.adjudication}</p></details><button type="button" className="btn--link" onClick={() => onOpenFinding(active.spec.findingId)}>Inspect related finding →</button></footer>
        </section> : <p className="analysis-empty" role="status">No topics match. Turn off “Differences only” to see all sources.</p>}
      </div>
      <p className="exploration-note">Ratings, availability and use are different measures. Source differences identify questions, not who is right.</p>
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
      <details className="analysis-disclosure"><summary>General ratings vs specific examples</summary><div>
        <p className="exploration-note">Example scores are mapped by the demo. A mean gap of {BIAS_THRESHOLD.toFixed(1)} or more is flagged; it does not establish reliability.</p>
        <div className="paired-insights">{allCohortValidation(ds).map(v => <article className="paired-insight" key={v.pair.id}><header><p className="report-kicker">{groupLabels[v.pair.role]} · {v.n} pairs</p><h3>{constructById(v.pair.constructId).name}</h3></header><FiveDots value={v.meanPrimary} label="Mean general rating" /><FiveDots value={v.meanImplied} label="Mean example · mapped" /><p className="source-sample">{v.n ? `${Math.round(v.corroborationRate * 100)}% within alignment threshold` : 'No scored pairs'}</p></article>)}</div>
        <p className="exploration-note">{validationRule} All answers are retained.</p>
      </div></details>

    </div>
  );
};
