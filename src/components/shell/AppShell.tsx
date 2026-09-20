import type { ReactNode } from 'react';
import type { Tab, View } from '../../state/reducer';
import { course } from '../../data/course';
import { instrumentedCount, constructCount } from '../../data/constructs';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Course overview' },
  { id: 'perspectives', label: 'Compare sources' },
  { id: 'findings', label: 'All findings' },
  { id: 'recommendations', label: 'Action plan' },
];

const [sessionYear, sessionSemester] = course.session.split(', ');

export const AppShell = ({ view, tab, onTab, onRestart, children }: { view: View; tab: Tab; onTab: (t: Tab) => void; onRestart: () => void; children: ReactNode }) => (
  <div className="shell">
    {view !== 'entry' && (
      <header className="shell__header">
        <div className="shell__header-inner">
          <span className="wordmark">AQIP</span>
          <div className="shell__course">
            {course.code} — {course.title}
            <span className="sep" aria-hidden="true">|</span>
            {sessionSemester}, {sessionYear}
            <span className="sep" aria-hidden="true">|</span>
            {course.institution}
          </div>
        </div>
      </header>
    )}
    {view === 'intelligence' && (
      <nav className="nav" aria-label="Course analysis views">
        <div className="nav__inner">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="nav__tab" aria-current={t.id === tab ? 'page' : undefined} onClick={() => onTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    )}
    <main className="shell__main">{children}</main>
    <footer className="shell__footer">
      <div className="shell__footer-inner">
        <span
          className="simulated simulated--entry"
          title="All institutional data, records, artefacts and responses in this demo are simulated."
        >
          Simulated data
        </span>
        <span>
          This demo instruments {instrumentedCount} of {constructCount} constructs in the AQIP model.
        </span>
        {view !== 'entry' && (
          <button type="button" className="btn--link" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={onRestart}>
            Start again
          </button>
        )}
      </div>
    </footer>
  </div>
);
