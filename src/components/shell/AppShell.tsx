import type { ReactNode } from 'react';
import type { Tab, View } from '../../state/reducer';
import { course } from '../../data/course';
import { instrumentedCount, constructCount } from '../../data/constructs';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'perspectives', label: 'Perspectives' },
  { id: 'findings', label: 'Findings' },
  { id: 'recommendations', label: 'Recommendations' },
];

export const AppShell = ({ view, tab, onTab, onRestart, children }: { view: View; tab: Tab; onTab: (t: Tab) => void; onRestart: () => void; children: ReactNode }) => (
  <div className="shell">
    {view === 'entry' ? (
      <div className="shell__entry-mark">
        <span
          className="simulated simulated--entry"
          title="All institutional data, records, artefacts and responses in this demo are simulated."
        >
          Simulated data
        </span>
      </div>
    ) : (
      <header className="shell__header">
        <div className="shell__header-inner">
          <div>
            <span className="wordmark">AQIP</span>
            <span className="wordmark__sub">Academic Quality Intelligence Platform</span>
          </div>
          <div className="shell__course">
            {course.code} — {course.title}
            <span className="header-detail">
              <span className="sep" aria-hidden="true">|</span>
              {course.department}, {course.institution}
              <span className="sep" aria-hidden="true">|</span>
              {course.session}
            </span>
          </div>
          <span className="simulated" title="All institutional data, records, artefacts and responses in this demo are simulated.">
            Simulated data
          </span>
        </div>
      </header>
    )}
    {view === 'intelligence' && (
      <nav className="nav" aria-label="Intelligence views">
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
