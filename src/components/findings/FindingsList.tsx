import type { Dataset } from '../../engine/dataset';
import { findings } from '../../data/findings';
import { evaluateTrigger } from '../../engine/triggers';
import { constructBand } from '../../engine/bands';
import { constructById } from '../../data/constructs';
import { domainById } from '../../data/domains';
import { sourceLabel } from '../../data/indicators';
import { BandTag } from '../shell/BandTag';

const kindLabel = { problem: 'Finding', strength: 'Strength', relationship: 'Relationship to investigate' } as const;

export const FindingsList = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void; onOpenConstruct: (id: string) => void }) => (
  <div className="column">
    <p className="section-label">Findings</p>
    <h1 className="screen-title">What the evidence shows, and the rule that said so.</h1>
    <p className="screen-lede">Each finding is authored; its evidence bindings and values are computed. Open one to see the rule that fired with its live terms, the contributing indicators, the underlying evidence and the construct lineage.</p>
    <div className="findings">
      {findings.map((f) => {
        const ev = evaluateTrigger(f, dataset);
        const sources = Array.from(new Set(f.constructIds.flatMap((c) => constructBand(dataset, c).sourceTypes)));
        return (
          <button key={f.id} type="button" className="fcard" onClick={() => onOpenFinding(f.id)} aria-label={`Open finding ${f.id}: ${f.title}`}>
            <span className="fcard__meta">
              <span>{f.id}</span>
              <span>{kindLabel[f.kind]}</span>
              <span>{f.domainIds.map((d) => `Domain ${domainById(d).number}`).join(' · ')}</span>
              <span>{f.constructIds.map((c) => constructById(c).name).join(' · ')}</span>
              {f.kind === 'relationship' ? <span className="chip">Association</span> : <BandTag band={constructBand(dataset, f.lineage.constructId).band} />}
              {!ev.fires && <span className="nearmiss">Rule did not fire with the current evidence base</span>}
            </span>
            <h3>{f.title}</h3>
            <span className="fcard__open">Open →</span>
            <span className="fcard__headline">{f.headline}</span>
            <span className="fcard__sources">Sources: {sources.map((s) => sourceLabel[s]).join(' · ')}</span>
          </button>
        );
      })}
    </div>
  </div>
);
