import type { MetricSpec, Role, ValidationStatus } from './types';

/**
 * Response validation. Each crucial item is paired with a validator item that
 * asks about the same construct by a different route — a quantity, a specific
 * occasion, or what followed from it. Both answers are placed on the same 1–5
 * scale, and the gap between them is read.
 *
 * The principle is the one personality inventories, situational-judgement tests
 * and aptitude batteries use: a single self-report cannot be checked, so the
 * instrument checks it against another answer from the same respondent.
 */

/** Gap between the primary answer and the value its validator implies. */
export const VALIDATION_BANDS: { max: number; status: ValidationStatus; label: string }[] = [
  { max: 1, status: 'corroborated', label: 'Corroborated' },
  { max: 2, status: 'marginal', label: 'Marginal' },
  { max: 4, status: 'contradicted', label: 'Contradicted' },
];

export const validationRule =
  'Both answers are mapped to the same 1–5 scale. A gap of 0 or 1 is corroborated, 2 is marginal, 3 or more is contradicted. Escape options are not scored.';

export const validationDisposition =
  'A contradicted reading is flagged, never deleted and never silently reweighted. One respondent disagreeing with themselves is noise; a cohort disagreeing with itself in the same direction is a measurement bias, and it is reported as a finding in its own right.';

/** A systematic signed gap this size across a cohort is reported as directional bias. */
export const BIAS_THRESHOLD = 0.4;

export interface ValidationPair {
  id: string;
  role: Role;
  primaryQuestionId: string;
  validatorQuestionId: string;
  constructId: string;
  /** What the pair is checking, in one line. */
  checks: string;
  /** What it means if the primary sits above the validator, and below it. */
  ifPrimaryHigher: string;
  ifPrimaryLower: string;
  /**
   * An independent, non-respondent reading of the same quantity, where one
   * exists. This is what makes the validator adjudicable rather than merely
   * internal.
   */
  objective?: { label: string; metric: MetricSpec; unit?: string; note: string };
}

export const validationPairs: ValidationPair[] = [
  {
    id: 'V-CGD-STU',
    role: 'student',
    primaryQuestionId: 'S-Q31',
    validatorQuestionId: 'S-V31',
    constructId: 'cognitive-demand',
    checks: 'Whether a general impression of how demanding assessment is survives contact with one specific paper.',
    ifPrimaryHigher: 'Students recall the course as more demanding in general than the last paper actually was.',
    ifPrimaryLower: 'Students understate the demand they were put under in general.',
    objective: {
      label: 'Marks at Apply level or above in the papers',
      metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' },
      unit: '%',
      note: 'Computed from the marks in the assessment artefacts, independent of anyone’s report.',
    },
  },
  {
    id: 'V-FBQ-STU',
    role: 'student',
    primaryQuestionId: 'S-Q33',
    validatorQuestionId: 'S-V33',
    constructId: 'feedback-quality',
    checks: 'Whether feedback rated useful was in fact usable — that is, whether anything followed from it.',
    // The "no later task" answer is the one that matters: it separates feedback
    // that was poor from feedback that was sound but had nothing to land on.
    ifPrimaryHigher: 'Feedback is rated more useful than what students could actually do with it. Either the rating is generous, or the feedback was sound and nothing existed to apply it to.',
    ifPrimaryLower: 'Students acted on feedback they rated poorly.',
    objective: {
      label: 'Feedback releases followed by a task within the usable window',
      metric: { kind: 'derived', key: 'assessment.tasks_within_window' },
      unit: 'releases',
      note: 'Derived by joining the assessment schedule to the feedback-release timestamps.',
    },
  },
  {
    id: 'V-FBT-STU',
    role: 'student',
    primaryQuestionId: 'S-Q34',
    validatorQuestionId: 'S-V34',
    constructId: 'feedback-timeliness',
    checks:
      'Whether a judgement of timeliness matches the elapsed period the same student reports. The period is read against the institutional turnaround policy of 14 days: inside the policy implies a timely rating, outside it does not.',
    ifPrimaryHigher: 'Students judge feedback timely at elapsed periods the policy does not treat as timely — an expectation that has adjusted to the delay.',
    ifPrimaryLower: 'Students judge feedback late even at short elapsed periods.',
    objective: {
      label: 'Median recorded turnaround',
      metric: { kind: 'derived', key: 'feedback.turnaround.median' },
      unit: 'days',
      note: 'From submission and feedback-release timestamps, not from anyone’s recollection.',
    },
  },
  {
    id: 'V-ACT-FAC',
    role: 'faculty',
    primaryQuestionId: 'F11',
    validatorQuestionId: 'F-V11',
    constructId: 'active-learning-engagement',
    checks: 'Whether reported frequency of active participation matches the minutes of it in a session.',
    ifPrimaryHigher: 'Participation is reported more often than the session time accounts for.',
    ifPrimaryLower: 'More session time goes to participation than the frequency answer suggests.',
    objective: {
      label: 'Enrolment relative to room capacity',
      metric: { kind: 'derived', key: 'room.capacity_ratio' },
      unit: '×',
      note: 'A constraint on what is physically possible in the room, not a measure of intent.',
    },
  },
  {
    id: 'V-CGD-FAC',
    role: 'faculty',
    primaryQuestionId: 'F21',
    validatorQuestionId: 'F-V21',
    constructId: 'cognitive-demand',
    checks: 'Whether reported frequency of application tasks matches the share of marks carrying them.',
    ifPrimaryHigher: 'Application is set more often than it is weighted. It may be present in the paper without carrying marks.',
    ifPrimaryLower: 'The paper weights application more heavily than the frequency answer suggests.',
    objective: {
      label: 'Marks at Apply level or above in the papers',
      metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' },
      unit: '%',
      note: 'The same quantity the validator asks about, computed from the artefacts.',
    },
  },
  {
    id: 'V-FBQ-FAC',
    role: 'faculty',
    primaryQuestionId: 'F23',
    validatorQuestionId: 'F-V23',
    constructId: 'feedback-quality',
    checks: 'Whether feedback designed to improve subsequent work had subsequent work to improve.',
    ifPrimaryHigher: 'Feedback is designed for a next task more often than a next task exists.',
    ifPrimaryLower: 'Tasks follow feedback more closely than the design intent suggests.',
    objective: {
      label: 'Feedback releases followed by a task within the usable window',
      metric: { kind: 'derived', key: 'assessment.tasks_within_window' },
      unit: 'releases',
      note: 'Derived by joining the assessment schedule to the feedback-release timestamps.',
    },
  },
];

export const pairsForRole = (role: Role): ValidationPair[] => validationPairs.filter((p) => p.role === role);

export const pairByValidator = (questionId: string): ValidationPair | undefined =>
  validationPairs.find((p) => p.validatorQuestionId === questionId);

export const statusLabel: Record<ValidationStatus, string> = {
  corroborated: 'Corroborated',
  marginal: 'Marginal',
  contradicted: 'Contradicted',
  unscored: 'Not scored',
};
