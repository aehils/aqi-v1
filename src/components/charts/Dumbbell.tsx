export interface DumbbellPoint {
  label: string;
  value: number;
  n: number;
}

/** Two source means on a 1–5 scale, with the gap shaded and the threshold stated. */
export const Dumbbell = ({ a, b, threshold, flagged }: { a: DumbbellPoint; b: DumbbellPoint; threshold: number; flagged: boolean }) => {
  const W = 420;
  const H = 56;
  const padL = 16;
  const padR = 16;
  const x = (v: number) => padL + ((v - 1) / 4) * (W - padL - padR);
  const y = 30;
  const lo = Math.min(a.value, b.value);
  const hi = Math.max(a.value, b.value);
  const gap = hi - lo;
  return (
    <div>
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${a.label} ${a.value.toFixed(1)}, ${b.label} ${b.value.toFixed(1)} on a 5-point scale`}>
      <line x1={x(1)} x2={x(5)} y1={y} y2={y} stroke="var(--line-strong)" strokeWidth={1} />
      {[1, 2, 3, 4, 5].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={y - 4} y2={y + 4} stroke="var(--line-strong)" />
          <text x={x(t)} y={y + 22} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <line x1={x(lo)} x2={x(hi)} y1={y} y2={y} stroke={flagged ? 'var(--attention)' : 'var(--evidence)'} strokeWidth={4} />
      <circle cx={x(a.value)} cy={y} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
      <circle cx={x(b.value)} cy={y} r={6} fill="var(--ink)" stroke="var(--ink)" strokeWidth={2} />
      <text x={x(a.value)} y={y - 12} textAnchor={a.value <= b.value ? 'end' : 'start'} dx={a.value <= b.value ? -4 : 4} fill="var(--ink)">
        {a.label} {a.value.toFixed(1)}
      </text>
      <text x={x(b.value)} y={y - 12} textAnchor={a.value <= b.value ? 'start' : 'end'} dx={a.value <= b.value ? 4 : -4} fill="var(--ink)">
        {b.label} {b.value.toFixed(1)}
      </text>
    </svg>
      <p className="dist__foot">
        gap {gap.toFixed(1)} · threshold {threshold.toFixed(1)} · n {a.n} / {b.n}
      </p>
    </div>
  );
};
