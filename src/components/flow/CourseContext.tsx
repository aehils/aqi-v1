import { useEffect } from 'react';
import { course, seedRespondentBase } from '../../data/course';
import { derived } from '../../engine/derived';

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
        <div>
          <p className="screen-lede">
            Your responses will be read alongside the evidence already assembled for this course, and against the records the institution holds about it. A few of the questions ask about the same thing twice, once as a judgement and once anchored to a specific occasion; that pairing is what lets the analysis check a response rather than simply accept it. Nothing you answer is attributed to you, and no single response determines a finding.
          </p>
        </div>
      </div>

      <div className="split">
        <div className="context-card">
          <h2 className="context-card__title">
            {course.code} — {course.title}
          </h2>
          <dl>
            <dt>Institution</dt>
            <dd>
              {course.institution} <span className="muted">({course.institutionNote})</span>
            </dd>
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
            <dt>Teaching team</dt>
            <dd>
              {course.teachingTeam.total} <span className="muted">({course.teachingTeam.note})</span>
            </dd>
            <dt>Rooms</dt>
            <dd>
              {course.rooms.length} teaching rooms, capacity {course.rooms[0].capacity} each
            </dd>
            <dt>Regulatory</dt>
            <dd>{course.regulatory}</dd>
          </dl>
        </div>
        <div className="split__aside">
          <p className="section-label" style={{ marginBottom: 0 }}>
            Already in the evidence base
          </p>
          <dl>
            <dt>Student responses</dt>
            <dd>{seedRespondentBase.student}</dd>
            <dt>Lecturer responses</dt>
            <dd>{seedRespondentBase.faculty}</dd>
            <dt>Administrative returns</dt>
            <dd>{seedRespondentBase.institution}</dd>
            <dt>Feedback records</dt>
            <dd>{derived('feedback.turnaround.n')}</dd>
            <dt>Assessment artefacts</dt>
            <dd>{derived('artefact.count')}</dd>
            <dt>Observation records</dt>
            <dd>{derived('observation.count')}</dd>
          </dl>
          <p>All of it simulated for this demonstration.</p>
        </div>
      </div>
      <div className="screen__tail" style={{ display: 'flex', gap: 16 }}>
        <button type="button" className="btn" onClick={onContinue} autoFocus>
          Continue
        </button>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};
