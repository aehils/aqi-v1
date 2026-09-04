export interface TurnaroundSeries {
  id: string;
  label: string;
  histogram: Record<number, number>;
}

/** Stacked turnaround histogram by assessment event, against the policy line. */
export const TurnaroundHistogram = ({ series, policyDays, marker }: { series: TurnaroundSeries[]; policyDays: number; marker: number }) => {
  const days = Array.from(new Set(series.flatMap((s) => Object.keys(s.histogram).map(Number)))).sort((a, b) => a - b);
  const minD = Math.min(...days) - 1;
  const maxD = Math.max(...days) + 1;
  const W = 640;
  const H = 220;
  const padL = 36;
  const padR = 12;
  const padT = 18;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const slot = plotW / (maxD - minD + 1);
  const totals = days.map((d) => series.reduce((s, sr) => s + (sr.histogram[d] ?? 0), 0));
  const maxY = Math.max(...totals, 1);
  const x = (d: number) => padL + (d - minD) * slot;
  const y = (v: number) => padT + plotH - (v / maxY) * plotH;
  const fills = ['var(--evidence)', 'var(--ink-muted)', 'var(--ink)'];
  const total = totals.reduce((a, b) => a + b, 0);
  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Feedback turnaround in days for ${total} feedback events against a ${policyDays}-day policy`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W - padR} y1={y(maxY * f)} y2={y(maxY * f)} stroke="var(--line)" />
            <text x={padL - 6} y={y(maxY * f) + 4} textAnchor="end">
              {Math.round(maxY * f)}
            </text>
          </g>
        ))}
        {days.map((d) => {
          let acc = 0;
          return (
            <g key={d}>
              {series.map((s, i) => {
                const v = s.histogram[d] ?? 0;
                if (!v) return null;
                const y0 = y(acc + v);
                const h = y(acc) - y0;
                acc += v;
                return <rect key={s.id} x={x(d) + 1} y={y0} width={slot - 2} height={h} fill={fills[i % fills.length]} />;
              })}
            </g>
          );
        })}
        {days.filter((d) => d % 5 === 0 || d === days[0] || d === days[days.length - 1]).map((d) => (
          <text key={d} x={x(d) + slot / 2} y={H - padB + 14} textAnchor="middle">
            {d}
          </text>
        ))}
        <line x1={x(policyDays) + slot} x2={x(policyDays) + slot} y1={padT - 4} y2={padT + plotH} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={x(policyDays) + slot + 4} y={padT + 6} fill="var(--accent)">
          policy {policyDays} days
        </text>
        <line x1={x(marker) + slot} x2={x(marker) + slot} y1={padT - 4} y2={padT + plotH} stroke="var(--attention)" strokeWidth={1} strokeDasharray="2 3" />
        <text x={x(marker) + slot + 4} y={padT + 20} fill="var(--attention)">
          {marker} days
        </text>
        <text x={padL} y={H - 6}>
          days from submission to feedback release · n = {total} feedback events
        </text>
      </svg>
      <p className="dist__foot" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {series.map((s, i) => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, background: fills[i % fills.length], display: 'inline-block' }} />
            {s.label}
          </span>
        ))}
        <span>policy line at {policyDays} days · marker at {marker} days</span>
      </p>
    </div>
  );
};
