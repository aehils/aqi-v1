import { useEffect } from 'react';
import { course } from '../../data/course';

export const CourseContext = ({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onContinue();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onContinue]);
  return (
    <div className="column screen">
      <div className="screen__hero">
        <div>
          <h1 className="screen-title">This course is under review.</h1>
          <p className="section-label screen__eyebrow">Course context</p>
        </div>
        <div className="context-card">
          <h2 className="context-card__title">
            {course.code} — {course.title}
          </h2>
          <dl>
            <dt>Faculty</dt>
            <dd>{course.faculty}</dd>
            <dt>Department</dt>
            <dd>{course.department}</dd>
            <dt>Programme</dt>
            <dd>{course.programme}</dd>
            <dt>Level</dt>
            <dd>{course.level}</dd>
            <dt>Session</dt>
            <dd>{course.session}</dd>
            <dt>Enrolment</dt>
            <dd className="num">{course.enrolment}</dd>
          </dl>
        </div>
      </div>

      <div className="screen__tail" style={{ display: 'flex', gap: 16 }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn" onClick={onContinue} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
};
