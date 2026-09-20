import type { Dataset } from '../../engine/dataset';
import type { Finding, FindingMetric } from '../../data/types';
import { resolveMetric, metricN } from '../../engine/aggregate';
import { withUnit, share } from '../../lib/format';
import { analysisCopy } from '../../data/analysisPresentation';
import { sourceLabel } from '../../data/indicators';

export const formatFindingMetric = (dataset: Dataset, metric: FindingMetric) => {
  const value = resolveMetric(dataset, metric.metric);
  return metric.metric.kind === 'selection'
    ? share(value, metricN(dataset, metric.metric) ?? 0)
    : withUnit(value, metric.unit);
};

export const FindingMetrics = ({ finding, dataset }: { finding: Finding; dataset: Dataset }) => <dl className="analysis-metrics">
  {finding.overviewMetrics.map(m => <div key={m.label}>
    <dt>{m.label}</dt><dd>{formatFindingMetric(dataset, m)}</dd>
    {m.metric.kind !== 'derived' && metricN(dataset, m.metric) !== null && <span>{metricN(dataset, m.metric)} contributing responses</span>}
  </div>)}
</dl>;

export const FindingSummary = ({ finding, dataset, onOpenFinding, action, inactive = false }: {
  finding: Finding; dataset: Dataset; onOpenFinding: (id: string) => void; action?: string; inactive?: boolean;
}) => {
  const copy = analysisCopy[finding.id];
  const sources = [...new Set(finding.evidenceRefs.map(e => e.source))];
  return <article className={`analysis-finding analysis-finding--${inactive ? 'inactive' : finding.kind}`}>
    <p className="report-kicker">{inactive ? 'Not currently supported' : finding.kind === 'problem' ? 'Needs attention' : finding.kind === 'strength' ? 'Strength to preserve' : 'Question to investigate'}</p>
    <h3>{copy?.title ?? finding.title}</h3>
    <p className="analysis-finding__meaning">{inactive ? 'The current evidence does not meet every condition for this finding. This is not proof that the issue is absent.' : copy?.meaning ?? finding.headline}</p>
    <FindingMetrics finding={finding} dataset={dataset} />
    {action && !inactive && <p className="analysis-finding__action"><strong>Proposed next step</strong><br />{action}</p>}
    <p className="analysis-source-line">Evidence: {sources.map(s => sourceLabel[s]).join(' · ')}</p>
    <button type="button" className="btn--link" onClick={() => onOpenFinding(finding.id)}>{inactive ? 'Inspect the unmet conditions' : 'Explore this finding'} <span aria-hidden="true">→</span></button>
  </article>;
};
