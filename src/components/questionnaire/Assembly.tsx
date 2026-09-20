import { useEffect, useMemo, useState } from 'react';
import type { ViewerSubmission } from '../../engine/session';
import { seedDataset } from '../../engine/dataset';
import { constructs } from '../../data/constructs';
import { derived } from '../../engine/derived';

/** Staged steps, each naming what the code is actually doing. */
export const Assembly = ({ submission, onDone }: { submission: ViewerSubmission; onDone: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => {
    const n = seedDataset.responses;
    const instrumented = constructs.filter((c) => c.instrumented).length;
    return [
      'Encoding your responses as indicator values',
      'Checking your answers on the crucial readings against the anchored items that validate them',
      'Mapping indicators to AQIP constructs',
      `Combining with ${n.student.length} student, ${n.faculty.length} lecturer and ${n.institution.length} administrative returns, institutional records, LMS activity and ${derived('artefact.count')} assessment artefacts`,
      `Running cross-source comparison across ${instrumented} instrumented constructs`,
    ];
  }, [submission]);

  useEffect(() => {
    const timers = [500, 1000, 1500, 2100, 2700].map((t, i) => window.setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const done = step >= steps.length;

  return (
    <div className="column screen screen--q assembly" aria-live="polite">
      {/* Same meta row as the questionnaire: label left, position right,
          progress rule under it. The steps carry the position here. */}
      <div className="q-meta">
        <div className="q-head">
          <p className="section-label q-section">Evidence assembly</p>
          <span className="q-count">
            <span className="q-count__sizer" aria-hidden="true">
              Step {steps.length} of {steps.length}
            </span>
            <span className="q-count__value">
              {done ? 'Complete' : `Step ${Math.min(step + 1, steps.length)} of ${steps.length}`}
            </span>
          </span>
        </div>
        <div className="q-progress" aria-hidden="true">
          <span style={{ width: `${(100 * step) / steps.length}%` }} />
        </div>
      </div>

      <div className="q-wrap">
        <ol className="assembly__steps">
          {steps.map((text, i) => (
            <li key={text} className={step >= i ? 'is-visible' : undefined}>
              <span className="assembly__mark" aria-hidden="true">
                {step > i ? '✓' : `${i + 1}.`}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>

        <div className={`assembly__frame${done ? ' is-visible' : ''}`}>
          <p className="assembly__claim">No single response determines a finding.</p>
          <p className="assembly__basis">
            Your answers were validated against your own anchored responses, then read beside the
            student, lecturer and administrative returns already on file, together with institutional
            records and assessment artefacts for this course.
          </p>
        </div>

        <div className="q-actions screen__tail">
          <button type="button" className="btn" disabled={!done} onClick={onDone} autoFocus>
            Read your report
          </button>
          <span className="q-hint">
            {done ? 'Your report is ready. The analysis of the course itself follows it.' : 'Assembling evidence…'}
          </span>
        </div>
      </div>
    </div>
  );
};
