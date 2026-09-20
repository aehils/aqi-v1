import { course } from '../../data/course';
import { overarchingQuestion, inquiryFraming } from '../../data/inquiry';

const chain = ['Evidence', 'Validation', 'Analysis', 'Findings', 'Recommendations'];

export const Entry = ({ onBegin }: { onBegin: () => void }) => (
  <div className="column entry">
    <div className="entry__hero">
      <div>
        <p className="section-label">Interactive demonstration</p>
        <h1>Academic Quality Intelligence Platform</h1>
      </div>
      <div>
        <p className="entry__lede">
          AQIP assembles evidence from students, lecturers, administrative returns, institutional records and assessment artefacts, and reads it against one quality model.
        </p>
        <p className="entry__lede">
          The questionnaire is one evidence source. The intelligence is in what the system does with all of them: it checks each respondent's answers against their own anchored answers, compares what each source says, adjudicates against the record, and traces every figure back to where it came from.
        </p>
      </div>
    </div>

    <div className="inquiry-banner inquiry-banner--entry">
      <p className="section-label" style={{ marginBottom: 0 }}>
        The question this evaluation exists to answer
      </p>
      <p className="inquiry-banner__q">{overarchingQuestion}</p>
      <p className="inquiry-banner__note">{inquiryFraming}</p>
    </div>

    <div className="chain">
      {chain.map((step, i) => (
        <span key={step}>
          <span className="chain__step">{step}</span>
          {i < chain.length - 1 && (
            <span className="chain__sep" aria-hidden="true">
              {' → '}
            </span>
          )}
        </span>
      ))}
      <span className="chain__note">
        You answer as a student or a lecturer, receive your own report immediately, and then see the course profile synthesised from both sides. Quality is reported across seven domains, never as a single score.
      </span>
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
      <span className="muted small">
        {course.institution} is a fictional institution. All data is simulated.
      </span>
    </div>
  </div>
);
