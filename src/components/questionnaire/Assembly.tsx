import { useEffect, useMemo, useState } from 'react';
import type { ViewerSubmission } from '../../engine/session';
import { seedDataset } from '../../engine/dataset';
import { instruments, roleLabels } from '../../instruments';
import { allComparisons } from '../../engine/compare';
import { buildDataset } from '../../engine/session';
import { constructs } from '../../data/constructs';
import { derived } from '../../engine/derived';
import { checkAnswers, summarise } from '../../engine/validate';

/** Four staged steps, each reporting what the code actually computed. */
export const Assembly = ({ submission, onDone }: { submission: ViewerSubmission; onDone: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => {
    const questions = instruments[submission.role];
    const encoded = questions.filter((q) => q.indicatorId && submission.answers[q.id] !== undefined).length;
    const constructIds = new Set(questions.map((q) => q.constructId).filter(Boolean));
    const n = seedDataset.responses;
    const ds = buildDataset(submission);
    const flagged = allComparisons(ds).filter((c) => c.flagged).length;
    const instrumented = constructs.filter((c) => c.instrumented).length;
    const consistency = summarise(checkAnswers(submission.role, submission.answers));
    return [
      { text: 'Encoding your responses as indicator values', result: `${encoded} indicator values` },
      {
        text: 'Checking your answers on the crucial readings against the anchored items that validate them',
        result: `${consistency.corroborated} of ${consistency.scored} corroborated`,
      },
      { text: 'Mapping indicators to AQIP constructs', result: `${constructIds.size} constructs` },
      {
        text: `Combining with ${n.student.length} student, ${n.faculty.length} lecturer and ${n.institution.length} administrative returns, institutional records, LMS activity and ${derived('artefact.count')} assessment artefacts`,
        result: `${n.student.length + n.faculty.length + n.institution.length + 1} responses`,
      },
      { text: `Running cross-source comparison across ${instrumented} instrumented constructs`, result: `${flagged} constructs flagged` },
    ];
  }, [submission]);

  useEffect(() => {
    const timers = [500, 1000, 1500, 2100, 2700].map((t, i) => window.setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const done = step >= 5;
  const role = roleLabels[submission.role].toLowerCase();

  return (
    <div className="column assembly" aria-live="polite">
      <p className="section-label">Evidence assembly</p>
      <ol>
        {steps.map((s, i) => (
          <li key={s.text} className={step >= i ? 'is-visible' : undefined}>
            <span className="assembly__mark" aria-hidden="true">
              {step > i ? '✓' : `${i + 1}.`}
            </span>
            <span>{s.text}</span>
            {step > i && <span className="assembly__result">{s.result}</span>}
          </li>
        ))}
      </ol>
      <p className={`assembly__frame${done ? ' is-visible' : ''}`}>
        Your responses have been validated against your own anchored answers, then combined with the student and lecturer responses already on file, the administrative returns for this course, institutional records and assessment artefacts. No single response determines a finding.
      </p>
      {done && (
        <div>
          <button type="button" className="btn" onClick={onDone} autoFocus>
            Read your report
          </button>
          <span className="muted small" style={{ marginLeft: 16 }}>
            Your {role} response is now one record in the evidence base. Your report comes first; the course analysis follows it.
          </span>
        </div>
      )}
    </div>
  );
};
