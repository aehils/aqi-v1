import { course } from '../../data/course';

export const Entry = ({ onBegin }: { onBegin: () => void }) => (
  <div className="column entry">
    <div className="entry__hero">
      <div>
        <h1>Academic Quality Intelligence Platform</h1>
      </div>
      <div>
        <p className="entry__lede">
          AQIP assembles evidence from students, lecturers, administrative returns, institutional records and assessment artefacts, reads it against one quality model, and traces every figure back to where it came from.
        </p>
        <p className="entry__lede">
          You receive your own report as soon as you finish answering, then the course profile: an analysis synthesised from a comprehensive review of this course's evidence base, your responses included. Quality is computed rather than asserted, each domain's standing derived from the evidence beneath it and openable to see how it was reached.
        </p>
      </div>
    </div>

    <div className="entry-form">
      <div className="field">
        <label htmlFor="entry-course">Course under review</label>
        <input id="entry-course" value={`${course.code} — ${course.title}`} readOnly disabled />
      </div>
      <div className="field">
        <label htmlFor="entry-session">Academic session</label>
        <input id="entry-session" value={course.session} readOnly disabled />
      </div>
      <p className="field__note">Fixed for this demonstration.</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <button type="button" className="btn" onClick={onBegin}>
        Begin review
      </button>
      <span className="muted small">{course.institution} is a fictional institution.</span>
    </div>
  </div>
);
