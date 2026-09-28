import type { ResolvedCell } from '../../engine/compare';
import { FiveDots, ProportionRing } from '../report/ReportVisuals';
import { withUnit } from '../../lib/format';

/** Keep source units intact. Small respondent groups show counts, not percentage precision. */
export const SourceReading = ({ cell }: { cell: ResolvedCell }) => {
  if (!Number.isFinite(cell.value)) return <p className="source-unavailable">No scored reading available.</p>;
  if (cell.format === 'scale') return <FiveDots value={cell.value} label={cell.caption} />;
  if (cell.format === 'pct' || (cell.format === 'share' && (cell.n === null || cell.n > 12))) return <ProportionRing value={cell.format === 'share' ? cell.value * 100 : cell.value} label={cell.caption} />;
  if (cell.format === 'share' && cell.n !== null) return <div className="source-count"><strong>{Math.round(cell.value * cell.n)} <small>of {cell.n}</small></strong><div className="source-count__marks" aria-hidden="true">{Array.from({ length: cell.n }, (_, i) => <i key={i} className={i < Math.round(cell.value * cell.n!) ? 'is-filled' : ''} />)}</div><p>{cell.caption}</p></div>;
  if (cell.format === 'days') return <div className="source-time"><div><strong>{withUnit(cell.good)}</strong><span>days · policy</span></div><span aria-hidden="true">→</span><div><strong>{withUnit(cell.value)}</strong><span>days · median</span></div><p>{withUnit(Math.abs(cell.value - cell.good))} days {cell.value > cell.good ? 'over policy' : cell.value < cell.good ? 'inside policy' : 'difference'}</p></div>;
  return <div className={`source-figure${cell.format === 'label' ? ' source-figure--label' : ''}`}><strong>{cell.display}</strong><p>{cell.caption}</p>{cell.format === 'label' && <span className="source-sample">Most common response</span>}</div>;
};
