import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import { allDomainBands, bandLabel, bandMeaning } from '../../engine/bands';
import { domains } from '../../data/domains';
import { constructById } from '../../data/constructs';
import { BandTag } from '../shell/BandTag';
import { sourceLabel } from '../../data/indicators';

/** The quality profile: seven domains, a band each, derivation on request. No score, no numbers on the face. */
export const DomainProfile = ({ dataset }: { dataset: Dataset }) => {
  const bands = allDomainBands(dataset);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="profile">
      {bands.map((b) => {
        const d = domains.find((x) => x.id === b.domainId)!;
        const total = b.constructs.length + b.notInstrumented;
        const isOpen = open === b.domainId;
        return (
          <div key={b.domainId}>
            <button type="button" className="profile__row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : b.domainId)}>
              <span>
                <span className="profile__name">{d.name}</span>
                <span className="profile__question">{d.coreQuestion}</span>
              </span>
              <span className="profile__evidence">
                {b.evidenced} of {total} constructs evidenced
              </span>
              <BandTag band={b.band} title={b.derivation} />
            </button>
            {isOpen && (
              <div className="profile__detail">
                <p>
                  <strong>{bandLabel[b.band]}.</strong> {bandMeaning[b.band]} Derivation: {b.derivation}.
                </p>
                <ul>
                  {b.constructs.map((cb) => {
                    const c = constructById(cb.constructId);
                    const sources = cb.sourceTypes.map((s) => sourceLabel[s]).join(', ');
                    const ns = cb.readings.filter((r) => r.n !== null).map((r) => r.n as number);
                    return (
                      <li key={cb.constructId}>
                        <span>
                          {c.name}
                          <span className="muted small">
                            {' '}
                            · {cb.sourceTypes.length} source{cb.sourceTypes.length === 1 ? '' : 's'}
                            {sources ? ` (${sources})` : ''}
                            {ns.length ? ` · n ${Math.max(...ns)}` : ''}
                          </span>
                        </span>
                        <span className="small muted">{bandLabel[cb.band]}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="small muted" style={{ marginTop: 12 }}>
                  {b.notInstrumented} further construct{b.notInstrumented === 1 ? '' : 's'} in this domain {b.notInstrumented === 1 ? 'is' : 'are'} not instrumented in this demo.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
