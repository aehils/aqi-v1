import type { Question, Option } from '../data/types';

const scale = (labels: string[], escapes: string[] = []): Option[] => [
  ...labels.map((label, i) => ({ key: String(i + 1), label, value: i + 1, scoring: true })),
  ...escapes.map((label, i) => ({ key: `x${i + 1}`, label, scoring: false })),
];

const multi = (labels: [string, string][]): Option[] => labels.map(([key, label]) => ({ key, label }));

/**
 * A forced-choice scale. The neutral midpoint is removed, because an answer of
 * "neither" carries no reading. The four remaining points keep their original
 * 1–5 positions, so these items stay directly comparable with the five-point
 * items on the lecturer instrument and with the 1–5 scale the validators map on
 * to. Values run 1, 2, 4, 5 — there is deliberately no 3.
 */
const FORCED_VALUES = [1, 2, 4, 5];

const forced = (labels: [string, string, string, string], escapes: string[] = []): Option[] => [
  ...labels.map((label, i) => ({ key: String(FORCED_VALUES[i]), label, value: FORCED_VALUES[i], scoring: true })),
  ...escapes.map((label, i) => ({ key: `x${i + 1}`, label, scoring: false })),
];

/** Validator options: each answer carries the value it implies on the paired item's 1-5 scale. */
const anchored = (rows: [string, string, number | null][]): Option[] =>
  rows.map(([key, label, implies]) =>
    implies === null ? { key, label, scoring: false } : { key, label, implies, scoring: true },
  );

export const studentQuestions: Question[] = [
  {
    id: 'S-Q4',
    number: 4,
    section: 'Section B — Learning Resources & Environment',
    text: 'Which of the following have been used as part of teaching or learning in this course?',
    note: 'Select all that apply.',
    type: 'multi',
    options: multi([
      ['powerpoint', 'PowerPoint/presentation slides'],
      ['whiteboard', 'Whiteboard'],
      ['recordings', 'Lecture recordings/videos'],
      ['lms', 'Learning Management System (LMS)'],
      ['online-readings', 'Online readings/materials'],
      ['simulation', 'Simulation tools'],
      ['virtual-labs', 'Virtual laboratories'],
      ['physical-labs', 'Physical laboratories/workshops'],
      ['ai-tools', 'AI tools'],
      ['forums', 'Online discussion forums'],
      ['none', 'None of these'],
    ]),
    indicatorId: 'IND-TECH-STU',
    constructId: 'learning-technology-integration',
    whyThisRespondent: 'Students are the only source for which technologies actually reached the learning experience, as distinct from what was declared available or what lecturers report using.',
  },
  {
    id: 'S-Q5',
    number: 5,
    section: 'Section B — Learning Resources & Environment',
    text: 'How easy is it to access the learning resources you need for this course?',
    type: 'single',
    options: forced(['Very difficult', 'Difficult', 'Easy', 'Very easy']),
    indicatorId: 'IND-RES-01',
    constructId: 'resource-accessibility-availability',
    whyThisRespondent: 'Accessibility is experienced by the student. A resource can exist and be declared without being reachable.',
  },
  {
    id: 'S-Q8',
    number: 8,
    section: 'Section C — Teaching & Instruction',
    text: "How clear are your lecturer's explanations of course content?",
    type: 'single',
    options: forced(['Very unclear', 'Unclear', 'Clear', 'Very clear']),
    indicatorId: 'IND-CLR-01',
    constructId: 'instructional-clarity',
    whyThisRespondent: 'Perceived clarity is a student-side reading that AQIP compares with lecturer self-report and observation records.',
  },
  {
    id: 'S-Q11',
    number: 11,
    section: 'Section C — Teaching & Instruction',
    text: 'How often are you given opportunities to actively participate in your learning during classes or other learning activities?',
    type: 'single',
    options: forced(['Never', 'Rarely', 'Often', 'Very often']),
    indicatorId: 'IND-ACT-02',
    constructId: 'active-learning-engagement',
    whyThisRespondent: 'Students report the opportunity as it reached them. Lecturers report the opportunity as provided. The two are compared, not reconciled.',
  },
  {
    id: 'S-Q31',
    number: 31,
    section: 'Section E — Assessment & Feedback',
    text: 'How often do assessments require you to apply, analyse or use your knowledge rather than mainly recall information?',
    type: 'single',
    options: forced(['Never', 'Rarely', 'Often', 'Very often'], ['Not sure']),
    indicatorId: 'IND-CGD-01',
    constructId: 'cognitive-demand',
    whyThisRespondent: 'Students experience the cognitive demand of assessment directly. Their reading is set beside lecturer report and the assessment papers themselves.',
  },
  {
    id: 'S-V31',
    number: 32,
    section: 'Section E — Assessment & Feedback',
    text: 'Think of the most recent test or exam in this course. What did most of the questions actually require you to do?',
    type: 'single',
    options: anchored([
      ['recall', 'Reproduce facts, definitions or labelled diagrams', 1],
      ['explain', 'Explain something in my own words', 2],
      ['familiar', 'Apply a method to a problem we had already worked through', 3],
      ['unfamiliar', 'Apply what I knew to a situation we had not seen before', 4],
      ['analyse', 'Analyse, evaluate or design something myself', 5],
      ['x1', 'I cannot recall the paper well enough to say', null],
    ]),
    validates: 'S-Q31',
    validationKind: 'recall-anchor',
    constructId: 'cognitive-demand',
    whyThisRespondent: 'Frequency judgements ("how often") are unreliable in isolation. Asking the same student about one recoverable occasion gives a second reading of the same construct that can be placed on the same scale.',
  },
  {
    id: 'S-Q33',
    number: 33,
    section: 'Section E — Assessment & Feedback',
    text: 'How useful is the feedback you receive on your work for improving your future performance?',
    type: 'single',
    options: scale(['Not at all useful', 'Slightly useful', 'Moderately useful', 'Very useful', 'Extremely useful'], ['I have not received feedback']),
    indicatorId: 'IND-FBQ-01',
    constructId: 'feedback-quality',
    whyThisRespondent: 'Whether feedback could be used to improve subsequent work is known only to the student who received it.',
  },
  {
    id: 'S-V33',
    number: 33,
    section: 'Section E — Assessment & Feedback',
    text: 'The last time you received feedback on your work, what were you actually able to do with it?',
    type: 'single',
    options: anchored([
      ['nothing', 'I could not tell what to do differently', 1],
      ['knew-no-task', 'I could see what to improve, but there was no later task to use it on', 3],
      ['next-task', 'I changed how I approached a later piece of work', 4],
      ['changed-method', 'I changed how I study or work in this subject', 5],
      ['x1', 'I have not received feedback', null],
    ]),
    validates: 'S-Q33',
    validationKind: 'consequence-anchor',
    constructId: 'feedback-quality',
    whyThisRespondent: 'Useful feedback is defined by what it enabled. The third option separates feedback that was poor from feedback that was sound but arrived with nothing left to apply it to — a distinction the rating alone cannot carry.',
  },
  {
    id: 'S-Q34',
    number: 34,
    section: 'Section E — Assessment & Feedback',
    text: 'How timely is the feedback you receive on your work?',
    type: 'single',
    options: scale(['Much too late to be useful', 'It arrived after I needed it', 'About the right time', 'Usually timely', 'Very timely'], ['I have not received feedback']),
    indicatorId: 'IND-FBT-01',
    constructId: 'feedback-timeliness',
    whyThisRespondent: 'Students experience when feedback arrives relative to when they could still act on it. Recorded turnaround provides the objective counterpart.',
  },
  {
    id: 'S-V34',
    number: 35,
    section: 'Section E — Assessment & Feedback',
    text: 'How long do you usually receive feedback after an assessment?',
    type: 'single',
    options: anchored([
      ['gt4w', 'More than four weeks', 1],
      ['3to4w', 'About three to four weeks', 1],
      ['2to3w', 'About two to three weeks', 2],
      ['1to2w', 'About one to two weeks', 4],
      ['lt1w', 'Within a week', 5],
      ['x1', 'I have not received feedback', null],
    ]),
    validates: 'S-Q34',
    validationKind: 'behavioural-anchor',
    constructId: 'feedback-timeliness',
    whyThisRespondent: 'An elapsed period can be checked against the feedback-release records. A judgement of timeliness cannot. Where the two disagree systematically, the disagreement is itself a reading.',
  },
  {
    id: 'S-Q37',
    number: 37,
    section: 'Section G — Overall Evaluation',
    text: 'Overall, how satisfied are you with your experience of this course?',
    type: 'single',
    options: forced(['Very dissatisfied', 'Dissatisfied', 'Satisfied', 'Very satisfied']),
    indicatorId: 'IND-SAT-01',
    constructId: 'student-satisfaction',
    whyThisRespondent: 'Satisfaction is a direct variable of interest. AQIP measures it plainly and examines its relationship with learning evidence rather than treating it as quality.',
  },
  {
    id: 'S-Q39',
    number: 39,
    section: 'Section H — Diagnostic Questions',
    text: 'What is the single biggest thing that currently makes learning in this course more difficult than it should be?',
    note: 'Open response.',
    type: 'open',
    whyThisRespondent: 'Open responses are stored as qualitative evidence. They illustrate findings; they are not scored.',
  },
];
