import type { Dataset } from '../../engine/dataset';
import { recommendations } from '../../data/recommendations';
import { findingById } from '../../data/findings';
import { rankRecommendations } from '../../engine/session';
import { resolveMetric, categoricalFor } from '../../engine/aggregate';
import type { MetricSpec } from '../../data/types';
import { withUnit } from '../../lib/format';

const current = (dataset: Dataset, metric: MetricSpec, unit?: string): string => {
  if (metric.kind === 'categorical') return categoricalFor(dataset, metric.indicatorId, metric.group, metric.map).modal;
  return withUnit(resolveMetric(dataset, metric), unit);
};

/** Finding → Diagnosis → Action → Owner → Evidence to re-measure → Target → Review point, ranked on a stated basis. */
export const Recommendations = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void }) => {
  const ranked = rankRecommendations(dataset);
  return (
    <div className="column">
      <p className="section-label">Recommendations</p>
      <h1 className="screen-title">Closing the loop.</h1>
      <p className="screen-lede">
        Ranked by strength of evidence × breadth of cohort affected: the number of independent source types behind the finding, multiplied by the share of the cohort the action reaches. The basis is shown on each item; there is no hidden priority number.
      </p>

      {ranked.map((rk, i) => {
        const r = recommendations.find((x) => x.id === rk.id)!;
        const f = findingById(r.findingId);
        return (
          <article className="rec" key={r.id}>
            <div className="rec__head">
              <span className="rec__rank">{i + 1}</span>
              <h3>{f.title}</h3>
              <span className="rec__basis">
                {r.id} · {rk.basis}
              </span>
            </div>
            <dl className="loop">
              <dt>Finding</dt>
              <dd>
                <button type="button" className="btn--link" onClick={() => onOpenFinding(f.id)}>
                  {f.id} · {f.headline}
                </button>
              </dd>
              <dt>Diagnosis (hypothesis)</dt>
              <dd>{r.diagnosis}</dd>
              <dt>Recommended action</dt>
              <dd>{r.action}</dd>
              <dt>Owner</dt>
              <dd>{r.owner}</dd>
              <dt>Evidence to re-measure</dt>
              <dd>
                <div className="table-scroll">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th className="num">This cycle</th>
                        <th>Target</th>
                        <th className="num">Next cycle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.remeasure.map((m) => (
                        <tr key={m.label}>
                          <td>{m.label}</td>
                          <td className="num">{current(dataset, m.metric, m.unit)}</td>
                          <td>{m.target}</td>
                          <td className="num empty-state">awaiting</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </dd>
              <dt>Target</dt>
              <dd>{r.target}</dd>
              <dt>Review point</dt>
              <dd>{r.reviewPoint}</dd>
            </dl>
          </article>
        );
      })}

      <hr className="hairline" />
      <p className="section-label">Re-measurement</p>
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>
        What AQIP compares next cycle
      </h2>
      <p className="muted" style={{ marginBottom: 24, maxWidth: '70ch' }}>
        Each metric below is re-derived from the same sources next cycle and set against this cycle&apos;s value and its target. The comparison is empty until that measurement exists.
      </p>
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Recommendation</th>
              <th className="num">This cycle</th>
              <th>Target</th>
              <th className="num">Next cycle</th>
              <th>Did it improve?</th>
            </tr>
          </thead>
          <tbody>
            {ranked.flatMap((rk) => {
              const r = recommendations.find((x) => x.id === rk.id)!;
              return r.remeasure.map((m) => (
                <tr key={`${r.id}-${m.label}`}>
                  <td>{m.label}</td>
                  <td>{r.id}</td>
                  <td className="num">{current(dataset, m.metric, m.unit)}</td>
                  <td>{m.target}</td>
                  <td className="num empty-state">—</td>
                  <td className="empty-state">Awaiting next measurement cycle</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
