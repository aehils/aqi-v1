import type { ResponseRecord } from './types';

// Seven simulated lecturer responses (2 course lecturers, 5 demonstrators/tutors).

type Row = {
  id: string;
  F10: [number, number, number, number, number, number]; // powerpoint, whiteboard, lms, videos, virtual-labs, ai-tools
  F11: number; F13: number; F19: number; F21: number; F23: number; F37: number;
  F25: string[];
};

const rows: Row[] = [
  { id: 'F-01', F10: [5, 5, 3, 3, 2, 3], F11: 5, F13: 5, F19: 5, F21: 5, F23: 5, F37: 5, F25: ['class-size', 'marking-time', 'multiple-courses', 'admin-workload'] },
  { id: 'F-02', F10: [5, 5, 2, 3, 2, 3], F11: 4, F13: 5, F19: 5, F21: 4, F23: 5, F37: 4, F25: ['class-size', 'marking-time', 'multiple-courses', 'admin-workload'] },
  { id: 'F-03', F10: [5, 5, 2, 3, 1, 3], F11: 4, F13: 4, F19: 5, F21: 4, F23: 5, F37: 4, F25: ['class-size', 'marking-time', 'multiple-courses', 'admin-workload'] },
  { id: 'F-04', F10: [5, 4, 2, 3, 1, 2], F11: 4, F13: 4, F19: 4, F21: 4, F23: 4, F37: 4, F25: ['class-size', 'marking-time', 'multiple-courses', 'admin-workload'] },
  { id: 'F-05', F10: [4, 4, 2, 2, 1, 2], F11: 4, F13: 4, F19: 4, F21: 4, F23: 4, F37: 4, F25: ['class-size', 'marking-time', 'multiple-courses'] },
  { id: 'F-06', F10: [4, 4, 2, 2, 1, 2], F11: 4, F13: 4, F19: 4, F21: 3, F23: 4, F37: 3, F25: ['class-size', 'marking-time', 'assessment-count'] },
  { id: 'F-07', F10: [4, 4, 2, 2, 1, 2], F11: 3, F13: 3, F19: 4, F21: 3, F23: 3, F37: 3, F25: ['class-size', 'other-teaching'] },
];

const rowKeys = ['powerpoint', 'whiteboard', 'lms', 'videos', 'virtual-labs', 'ai-tools'];

export const facultyResponses: ResponseRecord[] = rows.map((r) => ({
  id: r.id,
  group: 'faculty',
  answers: {
    F10: Object.fromEntries(rowKeys.map((k, i) => [k, String(r.F10[i])])),
    F11: String(r.F11),
    F13: String(r.F13),
    F19: String(r.F19),
    F21: String(r.F21),
    F23: String(r.F23),
    F25: r.F25,
    F37: String(r.F37),
  },
}));
