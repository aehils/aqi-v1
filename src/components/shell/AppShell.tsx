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

const Stepper = ({ view, onReport, onAnalysis }: { view: View; onReport: () => void; onAnalysis: () => void }) => {
  const current = steps.findIndex((s) => s.view === view);
  return (
    <nav className="stepper" aria-label="Progress">
      <ol className="stepper__inner">
        {steps.map((s, i) => (
          <li key={s.view} className={`stepper__step${i < current ? ' stepper__step--done' : ''}`}>
            <button type="button" className="stepper__button" aria-current={i === current ? 'step' : undefined} onClick={i === 0 ? onReport : onAnalysis} disabled={i === current}>
              <span className="stepper__index" aria-hidden="true">{i < current ? '✓' : i + 1}</span>
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
  children: ReactNode;
}

export const AppShell = ({ view, tab, hasReport, onTab, onReport, onAnalysis, onRestart, children }: ShellProps) => {
  const showStepper = hasReport && (view === 'report' || view === 'intelligence');
  return (
  <div className="shell">
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
    {(showStepper || view === 'intelligence') && (
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
          {showStepper && <Stepper view={view} onReport={onReport} onAnalysis={onAnalysis} />}
        </div>
      </div>
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
};
