import { course } from './course';

// Institutional records (class A). Turnaround is stored as per-event
// histograms of days from submission to feedback release — the shape a
// records extract takes — and expanded to individual records by the engine.

export interface AssessmentEvent {
  id: string;
  title: string;
  kind: 'submission' | 'examination';
  weight: number;
  /** Semester day on which the task fell due (week 1 = day 1). */
  dueDay: number;
  submissions: number;
  /** turnaround days → number of students whose feedback was released after that many days */
  turnaroundHistogram: Record<number, number>;
}

export const assessmentEvents: AssessmentEvent[] = [
  {
    id: 'CA1',
    title: 'Continuous Assessment 1 — problem set',
    kind: 'submission',
    weight: 15,
    dueDay: 35,
    submissions: 131,
    turnaroundHistogram: { 9: 5, 10: 7, 11: 9, 12: 11, 13: 13, 14: 14, 15: 14, 16: 13, 17: 11, 18: 10, 19: 12, 20: 4, 21: 2, 22: 3, 23: 2, 24: 1 },
  },
  {
    id: 'CA2',
    title: 'Continuous Assessment 2 — laboratory report',
    kind: 'submission',
    weight: 15,
    dueDay: 42,
    submissions: 124,
    turnaroundHistogram: { 14: 3, 15: 5, 16: 7, 17: 9, 18: 11, 19: 17, 20: 11, 21: 10, 22: 11, 23: 10, 24: 9, 25: 7, 26: 6, 27: 4, 28: 2, 29: 1, 30: 1 },
  },
  {
    id: 'EXAM',
    title: 'End-of-semester examination',
    kind: 'examination',
    weight: 70,
    dueDay: 91,
    submissions: 148,
    turnaroundHistogram: { 16: 3, 17: 5, 18: 8, 19: 15, 20: 11, 21: 10, 22: 16, 23: 14, 24: 13, 25: 12, 26: 10, 27: 9, 28: 7, 29: 5, 30: 4, 31: 3, 32: 1, 33: 1, 34: 1 },
  },
];

export const feedbackPolicy = {
  turnaroundDays: 14,
  usableWindowDays: 14,
  source: `${course.institution} Assessment and Feedback Policy, §4.2 (simulated)`,
};

/** Register: students present at each of the 12 scheduled contact sessions. */
export const attendanceRegister = {
  enrolment: 148,
  sessions: [121, 118, 112, 109, 106, 104, 101, 99, 97, 98, 96, 100],
};

/** Results extract from the records office. */
export const resultsExtract = {
  caAverage: 58.4,
  passMark: 40,
  gradeBands: [
    { grade: 'A', range: '70–100', count: 14, pass: true },
    { grade: 'B', range: '60–69', count: 33, pass: true },
    { grade: 'C', range: '50–59', count: 41, pass: true },
    { grade: 'D', range: '45–49', count: 20, pass: true },
    { grade: 'E', range: '40–44', count: 12, pass: true },
    { grade: 'F', range: '0–39', count: 28, pass: false },
  ],
};

/** Item-level performance on the one assessment carrying mixed cognitive levels (CA2). */
export const itemPerformance = {
  assessmentId: 'CA2',
  items: [
    { id: 'Q1', level: 'recall', marks: 2, meanPct: 74 },
    { id: 'Q2', level: 'recall', marks: 2, meanPct: 66 },
    { id: 'Q3', level: 'recall', marks: 3, meanPct: 66 },
    { id: 'Q4', level: 'application', marks: 2, meanPct: 52 },
    { id: 'Q5', level: 'application', marks: 3, meanPct: 44 },
    { id: 'Q6', level: 'analysis', marks: 3, meanPct: 41 },
  ] as { id: string; level: 'recall' | 'application' | 'analysis'; marks: number; meanPct: number }[],
};
