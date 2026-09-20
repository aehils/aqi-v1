import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, findingId]);

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
          {!ev.fires && <span className="nearmiss">Rule did not fire with the current evidence base</span>}
          <button type="button" className="btn btn--secondary" style={{ marginLeft: 'auto', padding: '6px 12px' }} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="drawer__body">
          <section className="layer layer--finding">
            <h3>1 · Finding — what the evidence shows</h3>
            <h2 id="drawer-title">{f.headline}</h2>
            {f.distinction && <p className="small muted">{f.distinction}</p>}
          </section>

          <section>
            <h3>2 · Rule that fired</h3>
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
                      <td className={t.passed ? 'result-true' : 'result-false'}>{t.passed ? 'true' : 'false'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">All terms must evaluate true for the rule to fire. Thresholds are stated, not tuned to the data.</p>
          </section>

          <section>
            <h3>3 · Contributing indicators</h3>
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
          </section>

          <section className="layer layer--evidence">
            <h3>4 · Underlying evidence</h3>
            <EvidenceBlock refs={f.evidenceRefs} dataset={dataset} />
          </section>

          <section>
            <h3>5 · Qualitative evidence — illustration, not proof</h3>
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
                  Your response · {roleLabels[submission.role]} · {viewerOpen.q.id} · not scored
                </footer>
              </blockquote>
            )}
          </section>

          <section className="layer layer--hypothesis">
            <h3>6 · Diagnostic hypothesis — requires investigation, not a conclusion</h3>
            <div className="hypothesis">
              <p>{f.hypothesis}</p>
            </div>
          </section>

          <section>
            <h3>7 · Construct lineage</h3>
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
          </section>

          {f.recommendationIds.length > 0 && (
            <section>
              <h3>Recommendations drawn from this finding</h3>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {f.recommendationIds.map((r) => (
                  <li key={r} className="small">
                    {r} · {recommendationById(r).action.split('.')[0]}.
                  </li>
                ))}
              </ul>
            </section>
          )}
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
