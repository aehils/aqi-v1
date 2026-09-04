import type { Indicator } from './types';

// Indicator registry. Questionnaire indicators bind to a question; record,
// artefact and derived indicators bind to a derived metric key.

export const indicators: Indicator[] = [
  // ---- Student instrument (class B) ----
  { id: 'IND-TECH-STU', constructId: 'learning-technology-integration', label: 'Resources and technologies experienced', source: 'student', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'S-Q4' },
  { id: 'IND-RES-01', constructId: 'resource-accessibility-availability', label: 'Ease of access to learning resources', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q5' },
  { id: 'IND-CLR-01', constructId: 'instructional-clarity', label: 'Clarity of lecturer explanations', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q8' },
  { id: 'IND-ACT-02', constructId: 'active-learning-engagement', label: 'Opportunities to participate, as experienced', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q11' },
  { id: 'IND-CGD-01', constructId: 'cognitive-demand', label: 'Assessments require application rather than recall', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q31' },
  { id: 'IND-FBQ-01', constructId: 'feedback-quality', label: 'Usefulness of feedback for improving future work', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q33' },
  { id: 'IND-FBT-01', constructId: 'feedback-timeliness', label: 'Timeliness of feedback', source: 'student', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'S-Q34' },
  { id: 'IND-SAT-01', constructId: 'student-satisfaction', label: 'Overall satisfaction with the course', source: 'student', evidenceClass: 'B', evidenceType: 'variable', measure: 'scale', questionId: 'S-Q37' },

  // ---- Faculty instrument (class B) ----
  { id: 'IND-TECH-FAC', constructId: 'learning-technology-integration', label: 'Frequency of resource and technology use', source: 'faculty', evidenceClass: 'B', evidenceType: 'behavioural', measure: 'matrix', questionId: 'F10' },
  { id: 'IND-ACT-01', constructId: 'active-learning-engagement', label: 'Opportunities to participate, as provided', source: 'faculty', evidenceClass: 'B', evidenceType: 'behavioural', measure: 'scale', questionId: 'F11' },
  { id: 'IND-CLR-02', constructId: 'instructional-clarity', label: 'Clarity of own explanations (self-rated)', source: 'faculty', evidenceClass: 'B', evidenceType: 'perceptual', measure: 'scale', questionId: 'F13' },
  { id: 'IND-ALN-01', constructId: 'assessment-alignment', label: 'ILOs used to determine what is assessed', source: 'faculty', evidenceClass: 'B', evidenceType: 'behavioural', measure: 'scale', questionId: 'F19' },
  { id: 'IND-CGD-02', constructId: 'cognitive-demand', label: 'Assessments require application (lecturer report)', source: 'faculty', evidenceClass: 'B', evidenceType: 'behavioural', measure: 'scale', questionId: 'F21' },
  { id: 'IND-FBQ-02', constructId: 'feedback-quality', label: 'Feedback designed to improve subsequent work', source: 'faculty', evidenceClass: 'B', evidenceType: 'behavioural', measure: 'scale', questionId: 'F23' },
  { id: 'IND-FBB-01', constructId: 'feedback-timeliness', label: 'Barriers to prompt feedback', source: 'faculty', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'F25' },
  { id: 'IND-EFF-01', constructId: null, label: 'Self-rated teaching effectiveness (variable of interest)', source: 'faculty', evidenceClass: 'B', evidenceType: 'variable', measure: 'scale', questionId: 'F37' },

  // ---- Institution instrument (class B) ----
  { id: 'IND-ILO-01', constructId: 'intended-learning-outcomes', label: 'Formally approved ILOs', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'categorical', questionId: 'I5' },
  { id: 'IND-CAL-01', constructId: 'curriculum-alignment', label: 'Formal curriculum alignment', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'I6' },
  { id: 'IND-PROV-01', constructId: 'learning-resources-facilities', label: 'Declared resources and facilities', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'I9' },
  { id: 'IND-PROV-02', constructId: 'resource-accessibility-availability', label: 'Declared access limitations', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'I11' },
  { id: 'IND-QA-01', constructId: 'moderation-quality-assurance', label: 'Assessment QA mechanisms', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'multi', questionId: 'I24' },
  { id: 'IND-TRN-01', constructId: 'assessment-transparency', label: 'Rubric provision policy', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'categorical', questionId: 'I25' },
  { id: 'IND-MON-01', constructId: 'feedback-timeliness', label: 'How turnaround is monitored', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'categorical', questionId: 'I26' },
  { id: 'IND-REV-01', constructId: 'monitoring-review', label: 'Review cadence for quality indicators', source: 'institution', evidenceClass: 'B', evidenceType: 'direct', measure: 'categorical', questionId: 'I34' },

  // ---- Records (class A) and derived (class D) ----
  { id: 'IND-TAT-01', constructId: 'feedback-timeliness', label: 'Median feedback turnaround', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'feedback.turnaround.median', unit: 'days', note: 'Derived from submission and feedback-release timestamps (class A).' },
  { id: 'IND-TAT-02', constructId: 'feedback-timeliness', label: 'Feedback events exceeding 21 days', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'feedback.turnaround.pct_over_21', unit: '%' },
  { id: 'IND-WIN-01', constructId: 'feedback-quality', label: 'Feedback releases followed by a task within the policy window', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'assessment.tasks_within_window', unit: 'releases', note: 'Derived by joining the assessment schedule to feedback-release timestamps.' },
  { id: 'IND-ATT-01', constructId: 'student-engagement-participation', label: 'Mean attendance (register)', source: 'records', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'attendance.mean_pct', unit: '%' },
  { id: 'IND-CMP-01', constructId: 'student-engagement-participation', label: 'Assignment completion', source: 'records', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'assignment.completion_pct', unit: '%' },
  { id: 'IND-ACH-01', constructId: 'academic-achievement', label: 'Continuous-assessment average', source: 'records', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'results.ca_average', unit: '%' },
  { id: 'IND-ACH-02', constructId: 'academic-achievement', label: 'Pass rate', source: 'records', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'results.pass_rate', unit: '%' },
  { id: 'IND-ITM-01', constructId: 'knowledge-understanding', label: 'Performance on recall items', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'items.recall_mean', unit: '%' },
  { id: 'IND-ITM-02', constructId: 'application-competence', label: 'Performance on application items', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'items.application_mean', unit: '%' },
  { id: 'IND-ITM-03', constructId: 'higher-order-thinking', label: 'Performance on analysis items', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'items.analysis_mean', unit: '%' },
  { id: 'IND-LMS-01', constructId: 'learning-technology-integration', label: 'Students accessing the course space at least once', source: 'lms', evidenceClass: 'A', evidenceType: 'behavioural', measure: 'derived', derivedKey: 'lms.active_pct', unit: '%' },
  { id: 'IND-LMS-02', constructId: 'learning-technology-integration', label: 'Median sessions per active user', source: 'lms', evidenceClass: 'A', evidenceType: 'behavioural', measure: 'derived', derivedKey: 'lms.median_sessions', unit: 'sessions' },
  { id: 'IND-LMS-03', constructId: 'learning-technology-integration', label: 'Discussion posts', source: 'lms', evidenceClass: 'A', evidenceType: 'behavioural', measure: 'derived', derivedKey: 'lms.discussion_posts', unit: 'posts' },
  { id: 'IND-BLM-01', constructId: 'cognitive-demand', label: 'Marks at Apply level or above', source: 'artefact', evidenceClass: 'C', evidenceType: 'artefact', measure: 'derived', derivedKey: 'artefact.marks_apply_plus_pct', unit: '%' },
  { id: 'IND-BLM-02', constructId: 'cognitive-demand', label: 'Marks at Analyse level or above', source: 'artefact', evidenceClass: 'C', evidenceType: 'artefact', measure: 'derived', derivedKey: 'artefact.marks_analyse_plus_pct', unit: '%' },
  { id: 'IND-RUB-01', constructId: 'assessment-transparency', label: 'Tasks with a rubric present', source: 'artefact', evidenceClass: 'C', evidenceType: 'artefact', measure: 'derived', derivedKey: 'artefact.rubric_present_pct', unit: '%' },
  { id: 'IND-ILO-02', constructId: 'cognitive-development', label: 'ILOs written at Apply level or above', source: 'curriculum', evidenceClass: 'C', evidenceType: 'artefact', measure: 'derived', derivedKey: 'curriculum.ilo_apply_plus_pct', unit: '%' },
  { id: 'IND-ILO-03', constructId: 'intended-learning-outcomes', label: 'Stated intended learning outcomes', source: 'curriculum', evidenceClass: 'C', evidenceType: 'artefact', measure: 'derived', derivedKey: 'curriculum.ilo_count', unit: 'ILOs' },
  { id: 'IND-ALN-02', constructId: 'curriculum-assessment-alignment', label: 'Gap between intended and assessed cognitive level', source: 'artefact', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'alignment.intent_assessed_gap', unit: 'pts', note: 'ILOs at Apply+ (%) minus marks at Apply+ (%).' },
  { id: 'IND-OBS-01', constructId: 'instructional-clarity', label: 'Observations rating clarity at or above expectation', source: 'observation', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'observation.clarity_meets_pct', unit: '%' },
  { id: 'IND-ROOM-01', constructId: 'active-learning-engagement', label: 'Enrolment relative to room capacity', source: 'records', evidenceClass: 'D', evidenceType: 'derived', measure: 'derived', derivedKey: 'room.capacity_ratio', unit: '×' },
  { id: 'IND-ACC-01', constructId: 'programme-accreditation-compliance', label: 'Accreditation current', source: 'records', evidenceClass: 'A', evidenceType: 'record', measure: 'derived', derivedKey: 'accreditation.current', unit: '' },
];

export const indicatorById = (id: string): Indicator => {
  const i = indicators.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown indicator ${id}`);
  return i;
};

export const indicatorsForConstruct = (constructId: string): Indicator[] => indicators.filter((i) => i.constructId === constructId);

export const evidenceClassLabel: Record<string, string> = {
  A: 'A · existing institutional data',
  B: 'B · collected through AQIP',
  C: 'C · uploaded artefact',
  D: 'D · derived',
};

export const sourceLabel: Record<string, string> = {
  student: 'Student responses',
  faculty: 'Lecturer responses',
  institution: 'Administrative responses',
  records: 'Institutional records',
  artefact: 'Assessment artefacts',
  lms: 'LMS extract',
  observation: 'Observation records',
  curriculum: 'Curriculum document',
};
