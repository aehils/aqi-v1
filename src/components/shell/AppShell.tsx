import { useState, type MouseEvent, type ReactNode } from 'react';
import type { Tab, View } from '../../state/reducer';
import { course } from '../../data/course';
import { instrumentedCount, constructCount } from '../../data/constructs';
import logo from '../../assets/logo.png';
import { HeaderActionsSlot } from './HeaderActions';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Course Overview' },
  { id: 'perspectives', label: 'Compare Sources' },
  { id: 'findings', label: 'All Findings' },
  { id: 'recommendations', label: 'Action Plan' },
];

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

// Section links like `#course-priorities` share the URL hash with the app's
// routing, so they scroll here instead of changing the hash.
const jumpWithinPage = (e: MouseEvent<HTMLElement>) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  const target = link && document.getElementById(link.hash.slice(1));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ block: 'start' });
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
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
  return (
  <HeaderActionsSlot.Provider value={actionsSlot}>
  <div className={`shell${showStepper ? ' shell--results' : ''}`}>
    <div className="shell__bars">
    {view !== 'entry' && (
      <header className="shell__header">
        <div className="shell__header-inner">
          <img className="wordmark" src={logo} alt="AQIP" />
          <div className="shell__course">
            {course.code}: {course.title}
            <span className="sep" aria-hidden="true">|</span>
            {course.session}
            <span className="sep" aria-hidden="true">|</span>
            {course.institution}
          </div>
          {showStepper ? <Stepper view={view} hasReport={hasReport} onReport={onReport} onAnalysis={onAnalysis} /> : <div className="shell__actions" ref={setActionsSlot} />}
        </div>
      </header>
    )}
    {view === 'intelligence' && (
      <div className="nav">
        <nav className="nav__tabs" aria-label="Course analysis views">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="nav__tab" aria-current={t.id === tab ? 'page' : undefined} onClick={() => onTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    )}
    </div>
    <main className="shell__main" onClick={jumpWithinPage}>{children}</main>
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
  </HeaderActionsSlot.Provider>
  );
};
