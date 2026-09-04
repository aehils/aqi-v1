export interface DistRow {
  label: string;
  count: number;
  share: number;
  scoring?: boolean;
  viewer?: boolean;
}

/** Horizontal distribution bars. Non-scoring escape options are hatched and labelled. */
export const DistributionBars = ({ rows, n, footnote }: { rows: DistRow[]; n: number; footnote?: string }) => {
  const max = Math.max(1, ...rows.map((r) => r.share));
  const nonScoring = rows.filter((r) => r.scoring === false && r.count > 0);
  return (
    <div>
      <div className="dist" role="list">
        {rows.map((r) => (
          <div className="dist__row" role="listitem" key={r.label}>
            <span className={`dist__label${r.scoring === false ? ' dist__label--escape' : ''}`}>{r.label}</span>
            <span className="dist__track" aria-hidden="true">
              <span className={`dist__bar${r.scoring === false ? ' dist__bar--escape' : ''}`} style={{ width: `${(100 * r.share) / max}%` }} />
              {r.viewer && <span className="dist__you" style={{ left: `calc(${(100 * r.share) / max}% + 4px)` }} />}
            </span>
            <span className="dist__count">
              {r.count} · {Math.round(r.share * 100)}%{r.viewer ? ' · you' : ''}
            </span>
          </div>
        ))}
      </div>
      <p className="dist__foot">
        n = {n}
        {nonScoring.length > 0 && ` · ${nonScoring.map((r) => `${r.count} “${r.label}” not scored`).join(' · ')}`}
        {footnote && ` · ${footnote}`}
      </p>
    </div>
  );
};
