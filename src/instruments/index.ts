import type { Question, Role, SourceGroup } from '../data/types';
import { studentQuestions } from './student';
import { facultyQuestions } from './faculty';
import { institutionQuestions } from './institution';

/**
 * The instruments a viewer can run. Administrative staff are an evidence
 * source, not a participant track: their instrument is still aggregated from
 * the seeded returns below, but nobody completes it here.
 */
export const instruments: Record<Role, Question[]> = {
  student: studentQuestions,
  faculty: facultyQuestions,
};

export const allQuestions: Question[] = [...studentQuestions, ...facultyQuestions, ...institutionQuestions];

export const questionById = (id: string): Question => {
  const q = allQuestions.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
};

export const questionForIndicator = (indicatorId: string): Question | undefined => allQuestions.find((q) => q.indicatorId === indicatorId);

export const roleLabels: Record<Role, string> = {
  student: 'Student',
  faculty: 'Lecturer',
};

/** Display names for every group that appears as evidence, whether or not it is a track. */
export const groupLabels: Record<SourceGroup, string> = {
  ...roleLabels,
  institution: 'Academic / administrative staff',
};

export const groupNouns: Record<Role, { singular: string; plural: string }> = {
  student: { singular: 'student', plural: 'student' },
  faculty: { singular: 'lecturer', plural: 'lecturer' },
};

/** Validator items are asked of the viewer but never aggregated as indicators. */
export const validatorQuestions = (role: Role): Question[] => instruments[role].filter((q) => Boolean(q.validates));
