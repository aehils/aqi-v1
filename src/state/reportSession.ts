import type { ViewerSubmission } from '../engine/session';
import { instruments } from '../instruments';
import { initialState, type State } from './reducer';
import { parseHash } from './hash';

export const reportSessionKey = 'aqip.completed-report.v1';

/** Restore only recognised questionnaire answers, never an arbitrary saved app state. */
export const parseReportSession = (raw: string | null): ViewerSubmission | null => {
  try {
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !['student', 'faculty'].includes(saved.role) || !saved.answers || typeof saved.answers !== 'object' || Array.isArray(saved.answers)) return null;
    const role = saved.role as ViewerSubmission['role'];
    const answers: ViewerSubmission['answers'] = {};
    for (const q of instruments[role]) {
      const a = saved.answers[q.id];
      if (a === undefined) continue;
      const option = (v: unknown) => typeof v === 'string' && q.options?.some(o => o.key === v);
      const valid = q.type === 'open' ? typeof a === 'string'
        : q.type === 'single' ? option(a)
        : q.type === 'multi' ? Array.isArray(a) && a.every(option)
        : a && typeof a === 'object' && !Array.isArray(a) && Object.entries(a).every(([key, value]) => q.rows?.some(r => r.key === key) && option(value));
      if (!valid) return null;
      answers[q.id] = a;
    }
    return { role, answers };
  } catch { return null; }
};

export const restoreReportState = (hash: string, raw: string | null): State => {
  const submission = parseReportSession(raw);
  const parsed = parseHash(hash);
  return {
    ...initialState,
    ...(hash === '#report' ? { view: 'report' as const } : {}),
    ...(submission ? { submission, role: submission.role, answers: submission.answers, view: 'report' as const } : {}),
    ...(parsed ? { view: 'intelligence' as const, tab: parsed.tab, openFindingId: parsed.findingId } : {}),
  };
};
