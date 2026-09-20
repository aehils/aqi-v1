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
        <dl className="record">
          <div className="record__row">
            <dt>Faculty</dt>
            <dd>{course.faculty}</dd>
          </div>
          <div className="record__row">
            <dt>Department</dt>
            <dd>{course.department}</dd>
          </div>
          <div className="record__row">
            <dt>Programme</dt>
            <dd>{course.programme}</dd>
          </div>
          <div className="record__row">
            <dt>Level</dt>
            <dd className="num">{course.level}</dd>
          </div>
          <div className="record__row">
            <dt>Session</dt>
            <dd className="num">{course.session}</dd>
          </div>
          <div className="record__row">
            <dt>Enrolment</dt>
            <dd className="num">{course.enrolment} students</dd>
          </div>
        </dl>
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
