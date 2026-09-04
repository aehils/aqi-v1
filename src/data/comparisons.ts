import type { MetricSpec, SourceGroup } from './types';
import { categoricalMaps } from './readings';

// Cross-source comparison rows for the discrepancy matrix. Each cell is a
// metric resolved live; the divergence flag is computed by engine/compare.

export type Column = SourceGroup | 'objective';

export interface CellSpec {
  metric: MetricSpec;
  /** how to phrase the value */
  format: 'scale' | 'share' | 'pct' | 'days' | 'count' | 'ratio' | 'label';
  /** what the number is */
  caption: string;
  /** Categorical: show the modal label rather than the mapped mean. */
  modalOf?: { indicatorId: string; group: SourceGroup };
  /** for signal classification in the matrix */
  direction: 'higher' | 'lower';
  good: number;
  bad: number;
  onFivePoint?: boolean;
  evidenceSource?: 'records' | 'artefact' | 'lms' | 'observation' | 'curriculum';
}

export interface ComparisonSpec {
  constructId: string;
  findingId: string;
  cells: Partial<Record<Column, CellSpec>>;
  /** Which two 5-point readings the dumbbell draws. */
  dumbbell?: { a: SourceGroup; b: SourceGroup };
  /** Which respondent reading the objective evidence is consistent with. Authored interpretation. */
  adjudication: string;
}

const S = 'student';
const F = 'faculty';
const I = 'institution';

export const comparisons: ComparisonSpec[] = [
  {
    constructId: 'feedback-timeliness',
    findingId: 'F1',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-FBT-01', group: S }, format: 'scale', caption: 'timeliness of feedback', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      faculty: { metric: { kind: 'selection', indicatorId: 'IND-FBB-01', group: F, option: 'class-size' }, format: 'share', caption: 'name class size as a barrier', direction: 'lower', good: 0.3, bad: 0.6 },
      institution: { metric: { kind: 'categorical', indicatorId: 'IND-MON-01', group: I, map: categoricalMaps['IND-MON-01'] }, format: 'label', caption: 'turnaround monitored', modalOf: { indicatorId: 'IND-MON-01', group: I }, direction: 'higher', good: 4, bad: 2 },
      objective: { metric: { kind: 'derived', key: 'feedback.turnaround.median' }, format: 'days', caption: 'median turnaround against a 14-day policy', direction: 'lower', good: 14, bad: 15, evidenceSource: 'records' },
    },
    adjudication: 'Records agree with students: turnaround exceeds policy in most events. Lecturers do not dispute it; they explain it.',
  },
  {
    constructId: 'feedback-quality',
    findingId: 'F1',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-FBQ-01', group: S }, format: 'scale', caption: 'usefulness of feedback', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      faculty: { metric: { kind: 'mean', indicatorId: 'IND-FBQ-02', group: F }, format: 'scale', caption: 'feedback designed to improve work', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      objective: { metric: { kind: 'derived', key: 'assessment.tasks_within_window' }, format: 'count', caption: 'feedback releases followed by a task within 14 days', direction: 'higher', good: 100, bad: 0, evidenceSource: 'records' },
    },
    dumbbell: { a: S, b: F },
    adjudication: 'The schedule is consistent with the student reading: however feedback is designed, no task follows on which it could be used.',
  },
  {
    constructId: 'cognitive-demand',
    findingId: 'F2',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-CGD-01', group: S }, format: 'scale', caption: 'assessments require application', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      faculty: { metric: { kind: 'mean', indicatorId: 'IND-CGD-02', group: F }, format: 'scale', caption: 'assessments require application', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      objective: { metric: { kind: 'derived', key: 'artefact.marks_analyse_plus_pct' }, format: 'pct', caption: 'of marks at Analyse or above across 3 artefacts', direction: 'higher', good: 25, bad: 15, evidenceSource: 'artefact' },
    },
    dumbbell: { a: S, b: F },
    adjudication: 'The papers agree with students, not with the lecturer report.',
  },
  {
    constructId: 'assessment-alignment',
    findingId: 'F2',
    cells: {
      faculty: { metric: { kind: 'mean', indicatorId: 'IND-ALN-01', group: F }, format: 'scale', caption: 'ILOs used to determine what is assessed', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      objective: { metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, format: 'pct', caption: 'of marks at Apply or above, against 4 of 6 ILOs written at Apply or above', direction: 'higher', good: 50, bad: 35, evidenceSource: 'artefact' },
    },
    adjudication: 'The intent is in the curriculum document and in the lecturer report; it is not in the marks.',
  },
  {
    constructId: 'learning-technology-integration',
    findingId: 'F3',
    cells: {
      student: { metric: { kind: 'selection', indicatorId: 'IND-TECH-STU', group: S, option: 'lms' }, format: 'share', caption: 'experienced the LMS in this course', direction: 'higher', good: 0.6, bad: 0.4 },
      faculty: { metric: { kind: 'matrix', indicatorId: 'IND-TECH-FAC', group: F, row: 'lms' }, format: 'scale', caption: 'frequency of LMS use', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      institution: { metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: I, option: 'lms' }, format: 'share', caption: 'declare the LMS available', direction: 'higher', good: 0.75, bad: 0.5 },
      objective: { metric: { kind: 'derived', key: 'lms.active_pct' }, format: 'pct', caption: 'of enrolment accessed the course space at least once', direction: 'higher', good: 60, bad: 40, evidenceSource: 'lms' },
    },
    adjudication: 'System data sides with lecturers and students: the platform exists, and it is barely used.',
  },
  {
    constructId: 'resource-accessibility-availability',
    findingId: 'F3',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-RES-01', group: S }, format: 'scale', caption: 'ease of access to resources', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      institution: { metric: { kind: 'selection', indicatorId: 'IND-PROV-02', group: I, option: 'connectivity' }, format: 'share', caption: 'name connectivity as an access limitation', direction: 'lower', good: 0.25, bad: 0.5 },
    },
    adjudication: 'Students and the institution agree on the barrier. This construct is not divergent; it is simply weak.',
  },
  {
    constructId: 'active-learning-engagement',
    findingId: 'F4',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-ACT-02', group: S }, format: 'scale', caption: 'opportunities to participate, as experienced', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      faculty: { metric: { kind: 'mean', indicatorId: 'IND-ACT-01', group: F }, format: 'scale', caption: 'opportunities to participate, as provided', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      objective: { metric: { kind: 'derived', key: 'room.capacity_ratio' }, format: 'ratio', caption: 'enrolment relative to the largest teaching room', direction: 'lower', good: 1, bad: 1.01, evidenceSource: 'records' },
    },
    dumbbell: { a: S, b: F },
    adjudication: 'No objective source measures the construct itself. Room capacity is context, not adjudication: both readings can be true.',
  },
  {
    constructId: 'instructional-clarity',
    findingId: 'F5',
    cells: {
      student: { metric: { kind: 'mean', indicatorId: 'IND-CLR-01', group: S }, format: 'scale', caption: 'clarity of explanations', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      faculty: { metric: { kind: 'mean', indicatorId: 'IND-CLR-02', group: F }, format: 'scale', caption: 'own clarity, self-rated', direction: 'higher', good: 3.5, bad: 2.8, onFivePoint: true },
      objective: { metric: { kind: 'derived', key: 'observation.clarity_meets_pct' }, format: 'pct', caption: 'of observations rate clarity at or above expectation', direction: 'higher', good: 67, bad: 50, evidenceSource: 'observation' },
    },
    dumbbell: { a: S, b: F },
    adjudication: 'Three independent sources agree. The strength is confirmed on the same basis as the problems.',
  },
];
