import type { ReactNode } from 'react';
import type { Tab, View } from '../../state/reducer';
import { course } from '../../data/course';
import { instrumentedCount, constructCount } from '../../data/constructs';
import logo from '../../assets/logo.png';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Course overview' },
  { id: 'perspectives', label: 'Compare sources' },
  { id: 'findings', label: 'All findings' },
  { id: 'recommendations', label: 'Action plan' },
];

const [sessionYear, sessionSemester] = course.session.split(', ');

const steps = [
  { view: 'report', label: 'Your report' },
  { view: 'intelligence', label: 'Course analysis' },
] as const;

const Stepper = ({ view, hasReport, onReport, onAnalysis }: { view: View; hasReport: boolean; onReport: () => void; onAnalysis: () => void }) => {
  const current = steps.findIndex((s) => s.view === view);
  return (
    <nav className="stepper" aria-label="Progress">
      <ol className="stepper__inner">
        {steps.map((s, i) => (
          <li key={s.view} className={`stepper__step${i < current && hasReport ? ' stepper__step--done' : ''}`}>
            <button type="button" className="stepper__button" aria-current={i === current ? 'step' : undefined} onClick={i === 0 ? onReport : onAnalysis} disabled={i === current} title={i === 0 && !hasReport ? 'Open your report' : undefined}>
              <span className="stepper__index" aria-hidden="true">{i < current && hasReport ? '✓' : i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

interface ShellProps {
  view: View;
  tab: Tab;
  hasReport: boolean;
  onTab: (t: Tab) => void;
  onReport: () => void;
  onAnalysis: () => void;
  onRestart: () => void;
  onJumpToResults: () => void;
  children: ReactNode;
}

export const AppShell = ({ view, tab, hasReport, onTab, onReport, onAnalysis, onRestart, onJumpToResults, children }: ShellProps) => {
  const showStepper = view === 'report' || view === 'intelligence';
  return (
  <div className="shell">
    <div className="shell__bars">
    {view !== 'entry' && (
      <header className="shell__header">
        <div className="shell__header-inner">
          <img className="wordmark" src={logo} alt="AQIP" />
          <div className="shell__course">
            {course.code}: {course.title}
            <span className="sep" aria-hidden="true">|</span>
            {sessionSemester}, {sessionYear}
            <span className="sep" aria-hidden="true">|</span>
            {course.institution}
          </div>
        </div>
      </header>
    )}
    {showStepper && (
      <div className="nav">
        <div className="nav__inner">
          {view === 'intelligence' && (
            <nav className="nav__tabs" aria-label="Course analysis views">
              {tabs.map((t) => (
                <button key={t.id} type="button" className="nav__tab" aria-current={t.id === tab ? 'page' : undefined} onClick={() => onTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </nav>
          )}
          {showStepper && <Stepper view={view} hasReport={hasReport} onReport={onReport} onAnalysis={onAnalysis} />}
        </div>
      </div>
    )}
    </div>
    <main className="shell__main">{children}</main>
    {view !== 'report' && view !== 'intelligence' && (
      <div className="shell__shortcut">
        <button type="button" className="btn--link" style={{ fontSize: 12 }} onClick={onJumpToResults} title="Prototyping shortcut: fills the questionnaire with a simulated response">
          Jump to results
        </button>
      </div>
    )}
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
};
