import { useEffect, useMemo, useReducer } from 'react';
import { reducer, initialState, type State } from './state/reducer';
import { parseHash, writeHash } from './state/hash';
import { AppShell } from './components/shell/AppShell';
import { Entry } from './components/flow/Entry';
import { RoleSelect } from './components/flow/RoleSelect';
import { CourseContext } from './components/flow/CourseContext';
import { Questionnaire } from './components/questionnaire/Questionnaire';
import { Assembly } from './components/questionnaire/Assembly';
import { Overview } from './components/intelligence/Overview';
import { Perspectives } from './components/intelligence/Perspectives';
import { FindingsList } from './components/findings/FindingsList';
import { FindingDrawer } from './components/findings/FindingDrawer';
import { ConstructPanel } from './components/model/ConstructPanel';
import { Recommendations } from './components/recommendations/Recommendations';
import { buildDataset, computeViewerImpact } from './engine/session';

const initFromHash = (): State => {
  const parsed = parseHash(window.location.hash);
  if (!parsed) return initialState;
  return { ...initialState, view: 'intelligence', tab: parsed.tab, openFindingId: parsed.findingId };
};

export const App = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initFromHash);

  useEffect(() => {
    writeHash(state.tab, state.openFindingId, state.view === 'intelligence');
  }, [state.view, state.tab, state.openFindingId]);

  useEffect(() => {
    if (state.view === 'intelligence') return;
    window.scrollTo({ top: 0 });
  }, [state.view, state.questionIndex]);

  useEffect(() => {
    if (state.view === 'intelligence' && !state.openFindingId) window.scrollTo({ top: 0 });
  }, [state.tab, state.view, state.openFindingId]);

  const dataset = useMemo(() => buildDataset(state.submission), [state.submission]);
  const impact = useMemo(() => (state.submission ? computeViewerImpact(state.submission) : null), [state.submission]);

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
      case 'intelligence':
        switch (state.tab) {
          case 'overview':
            return <Overview dataset={dataset} impact={impact} submission={state.submission} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
          case 'perspectives':
            return <Perspectives dataset={dataset} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
          case 'findings':
            return <FindingsList dataset={dataset} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} onOpenConstruct={(id) => dispatch({ type: 'OPEN_CONSTRUCT', id })} />;
          case 'recommendations':
            return <Recommendations dataset={dataset} onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })} />;
        }
    }
  })();

  return (
    <AppShell
      view={state.view}
      tab={state.tab}
      onTab={(tab) => dispatch({ type: 'SET_TAB', tab })}
      onRestart={() => dispatch({ type: 'RESTART' })}
    >
      {content}
      {state.view === 'intelligence' && state.openFindingId && (
        <FindingDrawer
          findingId={state.openFindingId}
          dataset={dataset}
          submission={state.submission}
          onClose={() => dispatch({ type: 'OPEN_FINDING', id: null })}
          onOpenConstruct={(id) => dispatch({ type: 'OPEN_CONSTRUCT', id })}
          onOpenFinding={(id) => dispatch({ type: 'OPEN_FINDING', id })}
        />
      )}
      {state.view === 'intelligence' && state.openConstructId && (
        <ConstructPanel constructId={state.openConstructId} dataset={dataset} onClose={() => dispatch({ type: 'OPEN_CONSTRUCT', id: null })} />
      )}
    </AppShell>
  );
};
