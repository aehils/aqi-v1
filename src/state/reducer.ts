import type { AnswerValue, Role } from '../data/types';
import type { ViewerSubmission } from '../engine/session';

export type View = 'entry' | 'role' | 'context' | 'questionnaire' | 'assembly' | 'report' | 'intelligence';
export type Tab = 'overview' | 'perspectives' | 'findings' | 'recommendations';

export interface State {
  view: View;
  role: Role | null;
  answers: Record<string, AnswerValue>;
  questionIndex: number;
  evidenceLens: boolean;
  tab: Tab;
  openFindingId: string | null;
  openConstructId: string | null;
  submission: ViewerSubmission | null;
}

export type Action =
  | { type: 'BEGIN' }
  | { type: 'SELECT_ROLE'; role: Role }
  | { type: 'CONTINUE_CONTEXT' }
  | { type: 'ANSWER'; questionId: string; value: AnswerValue }
  | { type: 'NEXT_QUESTION'; total: number }
  | { type: 'PREV_QUESTION' }
  | { type: 'TOGGLE_LENS' }
  | { type: 'SUBMIT' }
  | { type: 'ASSEMBLY_DONE' }
  | { type: 'REPORT_DONE' }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'OPEN_FINDING'; id: string | null }
  | { type: 'OPEN_CONSTRUCT'; id: string | null }
  | { type: 'RESTART' }
  | { type: 'ENTER_INTELLIGENCE'; tab: Tab; findingId: string | null };

export const initialState: State = {
  view: 'entry',
  role: null,
  answers: {},
  questionIndex: 0,
  evidenceLens: false,
  tab: 'overview',
  openFindingId: null,
  openConstructId: null,
  submission: null,
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'BEGIN':
      return { ...state, view: 'role' };
    case 'SELECT_ROLE':
      return { ...state, role: action.role, answers: state.role === action.role ? state.answers : {}, questionIndex: 0, view: 'context' };
    case 'CONTINUE_CONTEXT':
      return { ...state, view: 'questionnaire' };
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } };
    case 'NEXT_QUESTION':
      if (state.questionIndex >= action.total - 1) return state;
      return { ...state, questionIndex: state.questionIndex + 1 };
    case 'PREV_QUESTION':
      if (state.questionIndex === 0) return { ...state, view: 'context' };
      return { ...state, questionIndex: state.questionIndex - 1 };
    case 'TOGGLE_LENS':
      return { ...state, evidenceLens: !state.evidenceLens };
    case 'SUBMIT':
      if (!state.role) return state;
      return { ...state, view: 'assembly', submission: { role: state.role, answers: state.answers } };
    case 'ASSEMBLY_DONE':
      return { ...state, view: 'report' };
    case 'REPORT_DONE':
      return { ...state, view: 'intelligence', tab: 'overview' };
    case 'SET_TAB':
      return { ...state, tab: action.tab, openFindingId: null, openConstructId: null };
    case 'OPEN_FINDING':
      return { ...state, openFindingId: action.id, openConstructId: null };
    case 'OPEN_CONSTRUCT':
      return { ...state, openConstructId: action.id };
    case 'RESTART':
      return { ...initialState };
    case 'ENTER_INTELLIGENCE':
      return { ...state, view: 'intelligence', tab: action.tab, openFindingId: action.findingId };
  }
};
