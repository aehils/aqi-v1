import type { Question, Role } from '../data/types';
import { studentQuestions } from './student';
import { facultyQuestions } from './faculty';
import { institutionQuestions } from './institution';

export const instruments: Record<Role, Question[]> = {
  student: studentQuestions,
  faculty: facultyQuestions,
  institution: institutionQuestions,
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
  institution: 'Academic / Administrative Staff',
};

export const groupNouns: Record<Role, { singular: string; plural: string }> = {
  student: { singular: 'student', plural: 'student' },
  faculty: { singular: 'lecturer', plural: 'lecturer' },
  institution: { singular: 'administrative', plural: 'administrative' },
};
