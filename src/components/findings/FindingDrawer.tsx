import { useRef } from 'react';
import { useDialog } from '../../lib/useDialog';
import type { Dataset } from '../../engine/dataset';
import type { ViewerSubmission } from '../../engine/session';
import { findingById } from '../../data/findings';
import { evaluateTrigger } from '../../engine/triggers';
import { constructById } from '../../data/constructs';
import { domainById } from '../../data/domains';
import { indicatorById, evidenceClassLabel, sourceLabel } from '../../data/indicators';
import { verbatims } from '../../data/verbatims';
import { instruments, roleLabels, groupLabels, questionById } from '../../instruments';
import { meanFor, selectionsFor, matrixRowsFor, categoricalFor } from '../../engine/aggregate';
import { derived, derivedMeta } from '../../engine/derived';
import { categoricalMaps } from '../../data/readings';
import { constructBand, bandLabel } from '../../engine/bands';
import { BandTag } from '../shell/BandTag';
import { EvidenceBlock } from './EvidenceBlock';
import { f1, f2, withUnit, opLabel } from '../../lib/format';
import { analysisCopy, actionTitles } from '../../data/analysisPresentation';
import { FindingMetrics } from '../intelligence/FindingSummary';
import { recommendationById } from '../../data/recommendations';

const indicatorValue = (ds: Dataset, id: string): { value: string; n: string } => {
  const ind = indicatorById(id);
  switch (ind.measure) {
    case 'scale': {
      const m = meanFor(ds, id, ind.source as 'student' | 'faculty');
      return { value: `${f1(m.mean)} / 5`, n: `${m.nScoring}${m.nNonScoring ? ` (+${m.nNonScoring} not scored)` : ''}` };
    }
    case 'multi': {
      const s = selectionsFor(ds, id, ind.source as 'student' | 'faculty' | 'institution');
      const top = s.rows.filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);
      return { value: top.map((r) => `${r.option.label} ${s.n <= 12 ? `${r.count}/${s.n}` : `${Math.round(r.rate * 100)}%`}`).join(' · '), n: String(s.n) };
    }
    case 'matrix': {
      const m = matrixRowsFor(ds, id, ind.source as 'faculty');
      return { value: m.rows.map((r) => `${r.row.label} ${f1(r.mean)}`).join(' · '), n: String(m.n) };
    }
    case 'categorical': {
      const c = categoricalFor(ds, id, 'institution', categoricalMaps[id as keyof typeof categoricalMaps]);
      return { value: c.modal, n: String(c.n) };
    }
    case 'derived': {
      const v = derived(ind.derivedKey!);
      return { value: withUnit(v, ind.unit ?? derivedMeta(ind.derivedKey!).unit), n: '—' };
    }
  }
};

export const FindingDrawer = ({ findingId, dataset, submission, onClose, onOpenConstruct, onOpenFinding }: { findingId: string; dataset: Dataset; submission: ViewerSubmission | null; onClose: () => void; onOpenConstruct: (id: string) => void; onOpenFinding: (id: string) => void }) => {
  const f = findingById(findingId);
  const ev = evaluateTrigger(f, dataset);
  const ref = useRef<HTMLDivElement>(null);

  useDialog(ref, onClose, findingId);

  const contributingGroups = new Set(f.indicatorIds.map((i) => indicatorById(i).source));
  const viewerOpen = (() => {
    if (!submission || !contributingGroups.has(submission.role)) return null;
    const q = instruments[submission.role].find((x) => x.type === 'open');
    const a = q ? submission.answers[q.id] : undefined;
    return q && typeof a === 'string' && a.trim() ? { q, text: a.trim() } : null;
  })();
  const quotes = verbatims.filter((v) => v.findingIds.includes(f.id));
  const lin = f.lineage;
  const linConstruct = constructById(lin.constructId);
  const linIndicator = indicatorById(lin.indicatorId);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={ref} tabIndex={-1}>
        <div className="drawer__head">
          <span className="muted small">
            {f.id} · {f.domainIds.map((d) => `Domain ${domainById(d).number}`).join(' · ')}
          </span>
          {f.kind === 'relationship' ? <span className="chip">Association</span> : <BandTag band={constructBand(dataset, f.lineage.constructId).band} title="Band of the lineage construct, derived live" />}
          {!ev.fires && <span className="nearmiss">Not currently supported</span>}
          <button type="button" className="btn btn--secondary" style={{ marginLeft: 'auto', padding: '6px 12px' }} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="drawer__body">
          <section className="layer layer--finding">
            <p className="section-label">{ev.fires ? (f.kind === 'strength' ? 'Strength to preserve' : f.kind === 'relationship' ? 'Question to investigate' : 'Course finding') : 'Candidate finding · conditions not met'}</p>
            <h2 id="drawer-title">{analysisCopy[f.id]?.title ?? f.title}</h2>
            <p>{ev.fires ? f.headline : 'The current evidence does not meet all conditions for this finding. The data below explains what is and is not supported; no action is proposed on this basis.'}</p>
            <FindingMetrics finding={f} dataset={dataset} />
            {f.distinction && <p className="small muted">{f.distinction}</p>}
          </section>

          {ev.fires && f.recommendationIds.length > 0 && <section className="analysis-drawer-action">
            <h3>What to do with this finding</h3>
            {f.recommendationIds.map(id => { const action = recommendationById(id); return <div key={id}>
              <h4>{actionTitles[id]}</h4><p>{action.action}</p><p className="analysis-small"><strong>Proposed owner:</strong> {action.owner}<br /><strong>Review:</strong> {action.reviewPoint}</p>
            </div>; })}
            <p className="analysis-small">Proposals for discussion; not assigned or completed.</p>
          </section>}
          <section className="layer layer--hypothesis"><h3>What remains uncertain</h3><p>{f.hypothesis}</p></section>
          <details className="analysis-disclosure"><summary>Check the finding’s evidence rules</summary><div>
            <p>{f.trigger.plain}</p>
            <pre className="expression">{f.trigger.expression}</pre>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th className="num">Live value</th>
                    <th>Condition</th>
                    <th className="num">n</th>
                    <th>Evaluated</th>
                  </tr>
                </thead>
                <tbody>
                  {ev.terms.map((t) => (
                    <tr key={t.term.id}>
                      <td>
                        {t.term.label}
                        <br />
                        <span className="mono muted">{t.term.expression}</span>
                      </td>
                      <td className="num">{t.term.metric.kind === 'diff' ? `${f2(t.value)} / 5` : withUnit(t.value, t.term.unit)}</td>
                      <td className="mono">
                        {opLabel[t.term.op]} {t.thresholdLabel}
                      </td>
                      <td className="num">{t.n ?? '—'}</td>
                      <td className={t.passed ? 'result-true' : 'result-false'}>{t.passed ? 'Met' : 'Not met'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">All conditions must be met for this finding to be supported. These are the model’s configured thresholds, not a test of causation.</p>
          </div></details>

          <details className="analysis-disclosure"><summary>All contributing measurements</summary><div>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Indicator</th>
                    <th>Value</th>
                    <th className="num">n</th>
                    <th>Source</th>
                    <th>Evidence class</th>
                  </tr>
                </thead>
                <tbody>
                  {f.indicatorIds.map((id) => {
                    const ind = indicatorById(id);
                    const v = indicatorValue(dataset, id);
                    return (
                      <tr key={id}>
                        <td>
                          {ind.label}
                          <br />
                          <span className="mono muted">{ind.id}{ind.questionId ? ` · ${ind.questionId}` : ''}</span>
                        </td>
                        <td>{v.value}</td>
                        <td className="num">{v.n}</td>
                        <td>{sourceLabel[ind.source]}</td>
                        <td className="small">{evidenceClassLabel[ind.evidenceClass]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div></details>

          <details className="analysis-disclosure"><summary>Source records, charts & assessment evidence</summary><div>
            <EvidenceBlock refs={f.evidenceRefs} dataset={dataset} />
          </div></details>

          <details className="analysis-disclosure"><summary>Respondent comments & your account</summary><div><p className="analysis-small">Comments illustrate a finding; they do not establish how common it is.</p>
            {quotes.length === 0 && !viewerOpen && <p className="empty-state">No open responses were coded to this finding.</p>}
            {quotes.map((v) => (
              <blockquote className="quote" key={v.id}>
                {v.text}
                <footer>
                  {groupLabels[v.group]} · {questionById(v.questionId).id} · simulated
                </footer>
              </blockquote>
            ))}
            {viewerOpen && submission && (
              <blockquote className="quote quote--viewer">
                {viewerOpen.text}
                <footer>
                  Your uncoded account · {roleLabels[submission.role]} · {viewerOpen.q.id} · not scored or matched to this finding
                </footer>
              </blockquote>
            )}
          </div></details>

          <details className="analysis-disclosure"><summary>Where this sits in the quality model</summary><div>
            <div className="lineage" aria-label="Domain to construct to dimension to indicator to evidence">
              <span className="lineage__step">
                <small>Domain</small>
                {domainById(lin.domainId).number} · {domainById(lin.domainId).name}
              </span>
              <span className="lineage__arrow" aria-hidden="true">→</span>
              <button type="button" className="lineage__step lineage__step--button" onClick={() => onOpenConstruct(lin.constructId)} title="Open this construct">
                <small>Construct</small>
                {linConstruct.name}
              </button>
              <span className="lineage__arrow" aria-hidden="true">→</span>
              <span className="lineage__step">
                <small>Dimension</small>
                {lin.dimension}
              </span>
              <span className="lineage__arrow" aria-hidden="true">→</span>
              <span className="lineage__step">
                <small>Indicator</small>
                {linIndicator.id} · {linIndicator.label}
              </span>
              <span className="lineage__arrow" aria-hidden="true">→</span>
              <span className="lineage__step">
                <small>Evidence</small>
                {lin.evidence}
              </span>
            </div>
            <p className="small muted" style={{ marginTop: 8 }}>Constructs read by this finding:</p>
            <div className="chip-strip">
              {f.constructIds.map((c) => {
                const cb = constructBand(dataset, c);
                return (
                  <button key={c} type="button" className="chip chip--button" onClick={() => onOpenConstruct(c)}>
                    {constructById(c).name} · {bandLabel[cb.band]}
                  </button>
                );
              })}
            </div>
          </div></details>

          {f.kind === 'relationship' && (
            <p className="small muted">
              Related strength: <button type="button" className="btn--link" onClick={() => onOpenFinding('F5')}>F5 Instructional clarity</button>.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
