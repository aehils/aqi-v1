/** Evidence coverage is a count, never an inferred quality score. */
export const CoverageMeter = ({ measured, total }: { measured: number; total: number }) => <span className="coverage-meter">
  <span><strong>{measured}</strong> / {total} aspects measured</span>
  <span className="coverage-meter__track" aria-hidden="true"><span style={{ width: `${total > 0 ? Math.min(100, measured / total * 100) : 0}%` }} /></span>
</span>;
