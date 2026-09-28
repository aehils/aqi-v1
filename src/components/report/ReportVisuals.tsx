import type { Finding } from '../../data/types';
import type { Dataset } from '../../engine/dataset';
import { resolveMetric } from '../../engine/aggregate';
import { withUnit } from '../../lib/format';

export const ProportionRing = ({ value, label }: { value: number; label: string }) => <div className="proportion">
  <div className="proportion__ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0} 100`} /></svg><strong>{withUnit(value, '%')}</strong></div><span>{label}</span>
</div>;

export const FiveDots = ({ value, label }: { value: number | null; label: string }) => <div className="five-rating"><span>{label}</span><div><span className="five-rating__dots" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i}><b style={{ width: `${value !== null && Number.isFinite(value) ? Math.max(0, Math.min(1, value - i)) * 100 : 0}%` }} /></i>)}</span><strong>{value !== null && Number.isFinite(value) ? `${Number.isInteger(value) ? value : value.toFixed(1)}/5` : 'Unscored'}</strong></div></div>;

/** Different measures need different visual grammars; time is an interval, not a completion score. */
export const EvidenceGraphic = ({ finding, dataset, audience = 'staff' }: { finding: Finding; dataset: Dataset; audience?: 'student' | 'staff' }) => {
  const values = finding.overviewMetrics.map(m => resolveMetric(dataset, m.metric));
  if (finding.id === 'F6') return <figure className="finding-visual relationship-visual"><figcaption>Experience and demonstrated skills</figcaption><FiveDots value={values[0]} label="Student satisfaction" /><div className="ring-comparison"><ProportionRing value={values[1]} label="Application score" /><ProportionRing value={values[2]} label="Analysis score" /></div></figure>;
  if (finding.id === 'F1') {
    const policy = resolveMetric(dataset, { kind: 'derived', key: 'policy.threshold' });
    const days = resolveMetric(dataset, { kind: 'derived', key: 'feedback.turnaround.median' });
    const gap = days - policy;
    return <figure className="finding-visual timing-visual"><figcaption>Feedback turnaround</figcaption><div className="timing-events"><div><strong>{withUnit(policy)}</strong><span>days allowed</span></div><span className="timing-gap"><b>{Number.isFinite(gap) ? `${gap > 0 ? '+' : ''}${withUnit(gap)}` : '—'} days</b><i aria-hidden="true">⟶</i><small>{gap > 0 ? 'past policy' : gap < 0 ? 'before deadline' : 'on policy'}</small></span><div><strong>{withUnit(days)}</strong><span>days · actual median</span></div></div><div className="count-note"><strong>{withUnit(values[2])}</strong><span>releases followed by a task within 14 days</span></div></figure>;
  }
  if (finding.id === 'F2' || finding.id === 'F3') {
    const labels = finding.id === 'F2' ? ['Outcomes requiring application or higher', 'Marks for application or higher', 'Score on analysis items'] : [audience === 'student' ? 'Platform available, per staff records' : 'Admins reporting platform availability', 'Students who experienced it', 'Enrolment accessing the platform'];
    return <figure className="finding-visual"><figcaption>{finding.id === 'F2' ? 'Intended skills vs assessed skills' : 'Provision vs actual reach'}</figcaption><div className="ring-comparison">{values.map((value, i) => <ProportionRing key={labels[i]} value={finding.overviewMetrics[i].unit === 'share' ? value * 100 : value} label={labels[i]} />)}</div></figure>;
  }
  return <figure className="finding-visual"><figcaption>{finding.id === 'F4' ? 'Participation: provided vs experienced' : 'Clear explanations'}</figcaption><div className="rating-comparison">{finding.overviewMetrics.filter(m => m.unit === '/5').map(m => <FiveDots key={m.label} value={resolveMetric(dataset, m.metric)} label={m.label} />)}</div>{finding.overviewMetrics.filter(m => m.unit !== '/5').map(m => m.unit === '%' ? <ProportionRing key={m.label} value={resolveMetric(dataset, m.metric)} label={m.label} /> : <div className="count-note" key={m.label}><strong>{withUnit(resolveMetric(dataset, m.metric), m.unit)}</strong><span>{m.label}</span></div>)}</figure>;
};
