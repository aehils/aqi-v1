import { useEffect, useMemo, useReducer, useRef } from 'react';
import { reducer, type State } from './state/reducer';
import { parseHash, writeHash } from './state/hash';
import { reportSessionKey, restoreReportState } from './state/reportSession';
import { AppShell } from './components/shell/AppShell';
import { Entry } from './components/flow/Entry';
import { RoleSelect } from './components/flow/RoleSelect';
import { CourseContext } from './components/flow/CourseContext';
import { Questionnaire } from './components/questionnaire/Questionnaire';
import { Assembly } from './components/questionnaire/Assembly';
import { ResponseReport } from './components/report/ResponseReport';
import { Overview } from './components/intelligence/Overview';
import { Perspectives } from './components/intelligence/Perspectives';
import { FindingsList } from './components/findings/FindingsList';
import { FindingDrawer } from './components/findings/FindingDrawer';
import { ConstructPanel } from './components/model/ConstructPanel';
import { Recommendations } from './components/recommendations/Recommendations';
import { buildDataset, computeViewerImpact } from './engine/session';

const initFromHash = (): State => {
  let saved: string | null = null;
  try { saved = window.sessionStorage.getItem(reportSessionKey); } catch { /* Storage may be disabled. */ }
  return restoreReportState(window.location.hash, saved);
};

export const App = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initFromHash);

  useEffect(() => {
    try {
      if (state.submission) window.sessionStorage.setItem(reportSessionKey, JSON.stringify(state.submission));
      else window.sessionStorage.removeItem(reportSessionKey);
    } catch { /* In-memory navigation still works when storage is unavailable. */ }
  }, [state.submission]);

  // Moving between the report and the course analysis adds a history entry,
  // so the browser's Back and Forward buttons step between the two stages.
  const prevView = useRef(state.view);
  useEffect(() => {
    const crossed = (prevView.current === 'report' && state.view === 'intelligence') || (prevView.current === 'intelligence' && state.view === 'report');
    prevView.current = state.view;
    writeHash(state.tab, state.openFindingId, state.view === 'intelligence', crossed, state.view === 'report');
  }, [state.view, state.tab, state.openFindingId]);

  const viewRef = useRef(state.view);
  viewRef.current = state.view;
  useEffect(() => {
    const onPop = () => {
      const parsed = parseHash(window.location.hash);
      // Only the report ↔ analysis boundary is in history; `prevView` is set
      // first so the hash effect doesn't push a duplicate entry.
      if (parsed && viewRef.current === 'report') {
        prevView.current = 'intelligence';
        dispatch({ type: 'ENTER_INTELLIGENCE', tab: parsed.tab, findingId: parsed.findingId });
      } else if (!parsed && viewRef.current === 'intelligence') {
        prevView.current = 'report';
        dispatch({ type: 'BACK_TO_REPORT' });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (state.view === 'intelligence') return;
    window.scrollTo({ top: 0 });
  }, [state.view, state.questionIndex]);

  useEffect(() => {
    if (state.view === 'intelligence') window.scrollTo({ top: 0 });
  }, [state.tab, state.view]);

  const dataset = useMemo(() => buildDataset(state.submission), [state.submission]);
  const impact = useMemo(() => (state.submission ? computeViewerImpact(state.submission) : null), [state.submission]);

  // The student track reads the course analysis as a student; lecturers and unsigned viewers see the staff view.
  const audience = state.submission?.role === 'student' ? 'student' as const : 'staff' as const;

  const content = (() => {
    switch (state.view) {
      case 'entry':
        return <Entry onBegin={() => dispatch({ type: 'BEGIN' })} />;
      case 'role':
        return <RoleSelect onSelect={(role) => dispatch({ type: 'SELECT_ROLE', role })} />;
      case 'context':
        return <CourseContext onContinue={() => dispatch({ type: 'CONTINUE_CONTEXT' })} onBack={() => dispatch({ type: 'BEGIN' })} />;
      case 'questionnaire':
        return <Questionnaire state={state} dispatch={dispatch} />;
      case 'assembly':
        return <Assembly submission={state.submission!} onDone={() => dispatch({ type: 'ASSEMBLY_DONE' })} />;
      case 'report':
        if (!state.submission) return <div className="column report-page">
          <h1 className="report-title">Your Report</h1>
          <section className="report-disclosure report-unavailable">
            <h2>Your answers aren’t available in this tab</h2>
            <p>If you completed the questionnaire in another tab, return there to see your report. If that session has been cleared, you’ll need to complete a new questionnaire.</p>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'BEGIN' })}>Start a new questionnaire</button>
          </section>
        </div>;
        return <ResponseReport submission={state.submission} dataset={dataset} onContinue={() => dispatch({ type: 'REPORT_DONE' })} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
      case 'intelligence':
        switch (state.tab) {
          case 'overview':
            return <Overview dataset={dataset} impact={impact} submission={state.submission} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} onNavigate={(tab) => dispatch({ type: 'SET_TAB', tab })} onOpenConstruct={(id) => dispatch({ type: 'OPEN_CONSTRUCT', id })} />;
          case 'perspectives':
            return <Perspectives dataset={dataset} audience={audience} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
          case 'findings':
            return <FindingsList dataset={dataset} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} onOpenConstruct={(id) => dispatch({ type: 'OPEN_CONSTRUCT', id })} />;
          case 'recommendations':
            return <Recommendations dataset={dataset} audience={audience} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
        }
    }
  })();

  return (
    <AppShell
      view={state.view}
      tab={state.tab}
      hasReport={state.submission !== null}
      onTab={(tab) => dispatch({ type: 'SET_TAB', tab })}
      onReport={() => dispatch({ type: 'BACK_TO_REPORT' })}
      onAnalysis={() => dispatch({ type: 'ENTER_INTELLIGENCE', tab: state.tab, findingId: null })}
      onRestart={() => dispatch({ type: 'RESTART' })}
      onJumpToResults={() => dispatch({ type: 'JUMP_TO_RESULTS' })}
    >
      {content}
      {(state.view === 'intelligence' || state.view === 'report') && state.openFindingId && (
        <FindingDrawer
          findingId={state.openFindingId}
          dataset={dataset}
          submission={state.submission}
          onClose={() => dispatch({ type: 'OPEN_FINDING', id: null })}
          onOpenConstruct={(id) => dispatch({ type: 'OPEN_CONSTRUCT', id })}
          onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })}
        />
      )}
      {(state.view === 'intelligence' || state.view === 'report') && state.openConstructId && (
        <ConstructPanel constructId={state.openConstructId} dataset={dataset} onClose={() => dispatch({ type: 'OPEN_CONSTRUCT', id: null })} />
      )}
    </AppShell>
  );
};
