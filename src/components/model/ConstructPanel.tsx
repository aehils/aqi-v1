import { useEffect, useRef } from 'react';
import type { Dataset } from '../../engine/dataset';
import { constructById, constructsInDomain } from '../../data/constructs';
import { domainById } from '../../data/domains';
import { indicatorsForConstruct, evidenceClassLabel, sourceLabel } from '../../data/indicators';
import { constructBand } from '../../engine/bands';
import { BandTag } from '../shell/BandTag';
import { withUnit } from '../../lib/format';

/** A small panel for one construct. Not a page, not a registry. */
export const ConstructPanel = ({ constructId, dataset, onClose }: { constructId: string; dataset: Dataset; onClose: () => void }) => {
  const c = constructById(constructId);
  const d = domainById(c.domainId);
  const cb = constructBand(dataset, constructId);
  const inds = indicatorsForConstruct(constructId);
  const others = constructsInDomain(c.domainId).filter((x) => x.id !== c.id);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  return (
    <div className="cpanel-backdrop" onClick={onClose}>
      <div className="cpanel" role="dialog" aria-modal="true" aria-labelledby="cpanel-title" ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <p className="section-label">
          Construct {c.number} · Domain {d.number} · {d.name}
        </p>
        <h2 id="cpanel-title">{c.name}</h2>
        <p>{c.definition}</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BandTag band={cb.band} />
          <span className="small muted">{cb.rationale}</span>
        </div>
        {cb.readings.length > 0 && (
          <div>
            <p className="section-label">Readings in this evidence base</p>
            {cb.readings.map((r, i) => (
              <div className="cpanel__row" key={i}>
                <span>
                  {r.label} <span className="muted small">· {sourceLabel[r.source]}{r.n !== null ? ` · n ${r.n}` : ''}</span>
                </span>
                <span className={`figure signal--${r.signal}`}>
                  {withUnit(r.value, r.unit)} <span className="small">{r.signal}</span>
                </span>
              </div>
            ))}
            {cb.divergenceNote && <p className="small muted" style={{ marginTop: 6 }}>Divergence: {cb.divergenceNote}.</p>}
          </div>
        )}
        <div>
          <p className="section-label">Indicators attached</p>
          {inds.length === 0 && <p className="small muted">No indicator instrumented in this demo.</p>}
          {inds.map((i) => (
            <div className="cpanel__row" key={i.id}>
              <span>
                <span className="mono">{i.id}</span> {i.label}
              </span>
              <span className="small muted" style={{ textAlign: 'right' }}>
                {sourceLabel[i.source]} · {evidenceClassLabel[i.evidenceClass]}
              </span>
            </div>
          ))}
        </div>
        <p className="small">
          <span className="muted">Sources that can evidence it: </span>
          {c.sources.map((s) => sourceLabel[s]).join(', ')}.
        </p>
        <p className="small muted">
          Other constructs in Domain {d.number}: {others.map((o) => o.name).join(', ')}.
        </p>
        <div>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
