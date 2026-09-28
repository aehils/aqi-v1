import type { ChainReading } from '../../engine/report';
import { withUnit } from '../../lib/format';
import { statusLabel } from './ChainView';
import { FiveDots, ProportionRing } from './ReportVisuals';

export const LearningPath = ({ chain }: { chain: ChainReading[] }) => <ol className="report-journey">{chain.map(r => <li key={r.link.id} className={`journey-stage journey-stage--${r.status}`}>
  <span>{r.link.step.toString().padStart(2, '0')} <span aria-hidden="true">→</span></span><strong>{r.link.name}</strong>
  <div className="journey-stage__graphic">{r.link.unit === '%' ? <ProportionRing value={r.value} label={r.link.id === 'L1' ? 'Outcomes requiring application or higher' : r.link.id === 'L2' ? 'Marks for application or higher' : 'Application score'} /> : r.link.unit === '/5' ? <FiveDots value={r.value} label="Participation" /> : <div className="release-count"><strong>{withUnit(r.value)}</strong><span>releases with a follow-up task</span><span className="release-count__link" aria-hidden="true">Feedback ··· Task</span></div>}</div>
  <span className="journey-stage__status">{statusLabel[r.status]}</span><small>Target {r.link.direction === 'higher' ? '≥' : '≤'} {r.link.unit === 'releases' && r.link.intact === 1 ? '1 release' : withUnit(r.link.intact, r.link.unit)}</small>
</li>)}</ol>;
