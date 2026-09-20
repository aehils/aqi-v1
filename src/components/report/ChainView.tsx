import type { ChainReading } from '../../engine/report';
import { inquiryFraming } from '../../data/inquiry';
import { withUnit } from '../../lib/format';

const statusLabel: Record<string, string> = {
  intact: 'Holds',
  weak: 'Weak',
  cut: 'Cut',
  unread: 'Not read',
};

/** The transfer chain, in order, with the first break marked. */
export const ChainView = ({ chain, evidenced }: { chain: ChainReading[]; evidenced?: string[] }) => {
  const firstBreakIndex = chain.findIndex((r) => r.status === 'cut');
  return (
    <>
      <p className="section-note">{inquiryFraming}</p>
      <ol className="chain-links">
        {chain.map((r, i) => (
          <li key={r.link.id} className={`chain-link chain-link--${r.status}${i === firstBreakIndex ? ' is-first-break' : ''}`}>
            <span className="chain-link__step">{r.link.step}</span>
            <div className="chain-link__body">
              <h3>
                {r.link.name}
                <span className={`chain-link__tag chain-link__tag--${r.status}`}>{statusLabel[r.status]}</span>
                {evidenced?.includes(r.link.id) && <span className="tag-mini">your evidence counts here</span>}
              </h3>
              <p className="chain-link__q">{r.link.question}</p>
              <p className="chain-link__value">
                <span className="figure">{withUnit(r.value, r.link.unit)}</span> — {r.link.reading}
              </p>
              {i === firstBreakIndex && (
                <p className="chain-link__break">
                  First break in the chain. Nothing downstream of this link can be read as sound while it is cut, whatever the downstream numbers say.
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
};
