import type { MetricSpec } from './types';

/**
 * The question this evaluation exists to answer. Every domain, construct and
 * finding in the model is ultimately read against it; the transfer chain below
 * is the specific causal path this course is examined along.
 */
export const overarchingQuestion =
  'Why do people not walk away with useful skills from what they learn in school?';

export const inquiryFraming =
  'AQIP does not answer that question by asking whether teaching was good. It follows the chain by which an intention becomes a capability, and looks for the link where the chain is cut.';

export type LinkStatus = 'intact' | 'weak' | 'cut' | 'unread';

export interface ChainLink {
  id: string;
  step: number;
  name: string;
  question: string;
  /** The reading that tells us whether this link holds. */
  metric: MetricSpec;
  unit?: string;
  /** Link holds at or beyond `intact`; is cut at or beyond `cut`. */
  direction: 'higher' | 'lower';
  intact: number;
  cut: number;
  constructId: string;
  /** Which participant track can speak to this link, if any. */
  roleEvidence: 'student' | 'faculty' | 'both' | 'none';
  reading: string;
}

/**
 * Intention → demand → practice → usable feedback → demonstrated capability.
 * Each link resolves live; none of these numbers is written here.
 */
export const transferChain: ChainLink[] = [
  {
    id: 'L1',
    step: 1,
    name: 'Intention',
    question: 'Does the course intend a capability, or only knowledge?',
    metric: { kind: 'derived', key: 'curriculum.ilo_apply_plus_pct' },
    unit: '%',
    direction: 'higher',
    intact: 50,
    cut: 25,
    constructId: 'cognitive-development',
    roleEvidence: 'none',
    reading: 'Taken from the approved curriculum document, not from anyone’s report of it.',
  },
  {
    id: 'L2',
    step: 2,
    name: 'Demand',
    question: 'Does the assessment actually require that capability?',
    metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' },
    unit: '%',
    direction: 'higher',
    intact: 50,
    cut: 30,
    constructId: 'cognitive-demand',
    roleEvidence: 'both',
    reading: 'Marks in the assessment papers classified by cognitive level. This is what the course rewards, whatever it intends.',
  },
  {
    id: 'L3',
    step: 3,
    name: 'Practice',
    question: 'Do students get to do the thing, rather than watch it being done?',
    metric: { kind: 'mean', indicatorId: 'IND-ACT-02', group: 'student' },
    unit: '/5',
    direction: 'higher',
    intact: 3.5,
    cut: 3,
    constructId: 'active-learning-engagement',
    roleEvidence: 'both',
    reading: 'Opportunity to participate as students experienced it, set against what lecturers report providing.',
  },
  {
    id: 'L4',
    step: 4,
    name: 'Correction',
    question: 'Does feedback arrive while there is still something to apply it to?',
    metric: { kind: 'derived', key: 'assessment.tasks_within_window' },
    unit: 'releases',
    direction: 'higher',
    intact: 1,
    cut: 1,
    constructId: 'feedback-timeliness',
    roleEvidence: 'both',
    reading: 'Feedback releases followed by a task the student could apply it to, from joining the schedule to the release timestamps.',
  },
  {
    id: 'L5',
    step: 5,
    name: 'Capability',
    question: 'Can students do it when asked?',
    metric: { kind: 'derived', key: 'items.application_mean' },
    unit: '%',
    direction: 'higher',
    intact: 60,
    cut: 50,
    constructId: 'application-competence',
    roleEvidence: 'none',
    reading: 'Mean score on the application items in the marked papers, as against the recall items.',
  },
];
