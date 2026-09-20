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

  const done = step >= 5;

  return (
    <div className="column assembly" aria-live="polite">
      <p className="section-label">Evidence assembly</p>
      <ol>
        {steps.map((text, i) => (
          <li key={text} className={step >= i ? 'is-visible' : undefined}>
            <span className="assembly__mark" aria-hidden="true">
              {step > i ? '✓' : `${i + 1}.`}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <p className={`assembly__frame${done ? ' is-visible' : ''}`}>
        Your responses have been validated against your own anchored answers, then combined with the student and lecturer responses already on file, the administrative returns for this course, institutional records and assessment artefacts. No single response determines a finding.
      </p>
      {done && (
        <div>
          <p className="assembly__collated">
            Your responses have been collated, and your report is ready. The analysis of the course itself follows it.
          </p>
          <button type="button" className="btn" onClick={onDone} autoFocus>
            Read your report
          </button>
        </div>
      )}
    </div>
  );
};
