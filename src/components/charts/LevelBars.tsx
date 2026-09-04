export interface LevelRow {
  label: string;
  value: number;
  display: string;
  emphasis?: boolean;
}

/** Simple horizontal bars for percentages. */
export const LevelBars = ({ rows, max = 100, footnote }: { rows: LevelRow[]; max?: number; footnote?: string }) => (
  <div>
    <div className="dist" role="list">
      {rows.map((r) => (
        <div className="dist__row" role="listitem" key={r.label}>
          <span className="dist__label">{r.label}</span>
          <span className="dist__track" aria-hidden="true">
            <span className="dist__bar" style={{ width: `${Math.min(100, (100 * r.value) / max)}%`, background: r.emphasis ? 'var(--ink)' : undefined }} />
          </span>
          <span className="dist__count">{r.display}</span>
        </div>
      ))}
    </div>
    {footnote && <p className="dist__foot">{footnote}</p>}
  </div>
);
