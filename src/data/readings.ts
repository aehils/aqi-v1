import type { Reading } from './types';

// Evidence readings bound to each instrumented construct. The band engine
// resolves each reading live, classifies its signal against the stated
// thresholds, and derives the construct band from the pattern across sources.

export const SCALE_POSITIVE = 3.5;
export const SCALE_NEGATIVE = 2.8;

const scale = (source: Reading['source'], indicatorId: string, label: string): Reading => ({
  source,
  label,
  metric: { kind: 'mean', indicatorId, group: source as 'student' | 'faculty' },
  direction: 'higher',
  good: SCALE_POSITIVE,
  bad: SCALE_NEGATIVE,
  unit: '/5',
  onFivePoint: true,
});

export const categoricalMaps = {
  'IND-ILO-01': { yes: 5, no: 1, 'not-sure': 2 },
  'IND-TRN-01': { routinely: 5, some: 3, rarely: 2, never: 1, na: 3 },
  'IND-MON-01': { institutionally: 5, 'course-level': 4, 'lecturer-reporting': 2, 'student-feedback': 2, none: 1, other: 2 },
  'IND-REV-01': { continuously: 5, monthly: 5, semester: 4, annually: 3, less: 2, none: 1 },
} as const;

export const readingsByConstruct: Record<string, Reading[]> = {
  'intended-learning-outcomes': [
    { source: 'institution', label: 'Formally approved ILOs', metric: { kind: 'categorical', indicatorId: 'IND-ILO-01', group: 'institution', map: categoricalMaps['IND-ILO-01'] }, direction: 'higher', good: 4, bad: 2, unit: 'mapped' },
    { source: 'curriculum', label: 'Stated ILOs in course specification', metric: { kind: 'derived', key: 'curriculum.ilo_count' }, direction: 'higher', good: 4, bad: 1, unit: 'ILOs' },
  ],
  'curriculum-alignment': [
    { source: 'institution', label: 'NUC CCMAS alignment declared', metric: { kind: 'selection', indicatorId: 'IND-CAL-01', group: 'institution', option: 'nuc' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
    { source: 'institution', label: 'Professional-body alignment declared', metric: { kind: 'selection', indicatorId: 'IND-CAL-01', group: 'institution', option: 'professional' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
  ],
  'cognitive-development': [
    { source: 'curriculum', label: 'ILOs at Apply level or above', metric: { kind: 'derived', key: 'curriculum.ilo_apply_plus_pct' }, direction: 'higher', good: 50, bad: 33, unit: '%' },
  ],
  'curriculum-assessment-alignment': [
    { source: 'curriculum', label: 'ILOs at Apply level or above', metric: { kind: 'derived', key: 'curriculum.ilo_apply_plus_pct' }, direction: 'higher', good: 50, bad: 33, unit: '%' },
    { source: 'artefact', label: 'Marks at Apply level or above', metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, direction: 'higher', good: 50, bad: 35, unit: '%' },
  ],
  'programme-accreditation-compliance': [
    { source: 'records', label: 'Accreditation current', metric: { kind: 'derived', key: 'accreditation.current' }, direction: 'higher', good: 1, bad: 0, unit: '' },
  ],
  'learning-resources-facilities': [
    { source: 'institution', label: 'LMS declared available', metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: 'institution', option: 'lms' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
    { source: 'institution', label: 'Physical laboratories declared available', metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: 'institution', option: 'laboratories' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
  ],
  'resource-accessibility-availability': [
    scale('student', 'IND-RES-01', 'Ease of access to resources'),
    { source: 'institution', label: 'Connectivity named as an access limitation', metric: { kind: 'selection', indicatorId: 'IND-PROV-02', group: 'institution', option: 'connectivity' }, direction: 'lower', good: 0.25, bad: 0.5, unit: 'share' },
  ],
  'learning-technology-integration': [
    { source: 'institution', label: 'LMS declared available', metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: 'institution', option: 'lms' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
    { source: 'faculty', label: 'LMS use frequency', metric: { kind: 'matrix', indicatorId: 'IND-TECH-FAC', group: 'faculty', row: 'lms' }, direction: 'higher', good: SCALE_POSITIVE, bad: SCALE_NEGATIVE, unit: '/5', onFivePoint: true },
    { source: 'student', label: 'LMS experienced in the course', metric: { kind: 'selection', indicatorId: 'IND-TECH-STU', group: 'student', option: 'lms' }, direction: 'higher', good: 0.6, bad: 0.4, unit: 'share' },
    { source: 'lms', label: 'Students accessing course space', metric: { kind: 'derived', key: 'lms.active_pct' }, direction: 'higher', good: 60, bad: 40, unit: '%' },
  ],
  'instructional-clarity': [
    scale('student', 'IND-CLR-01', 'Clarity of explanations'),
    scale('faculty', 'IND-CLR-02', 'Own clarity (self-rated)'),
    { source: 'observation', label: 'Observations at or above expectation', metric: { kind: 'derived', key: 'observation.clarity_meets_pct' }, direction: 'higher', good: 67, bad: 50, unit: '%' },
  ],
  'active-learning-engagement': [
    scale('faculty', 'IND-ACT-01', 'Opportunities provided'),
    scale('student', 'IND-ACT-02', 'Opportunities experienced'),
  ],
  'student-engagement-participation': [
    { source: 'records', label: 'Mean attendance', metric: { kind: 'derived', key: 'attendance.mean_pct' }, direction: 'higher', good: 80, bad: 60, unit: '%' },
    { source: 'records', label: 'Assignment completion', metric: { kind: 'derived', key: 'assignment.completion_pct' }, direction: 'higher', good: 85, bad: 70, unit: '%' },
  ],
  'student-satisfaction': [scale('student', 'IND-SAT-01', 'Overall satisfaction')],
  'assessment-alignment': [
    scale('faculty', 'IND-ALN-01', 'ILOs determine what is assessed'),
    { source: 'artefact', label: 'Marks at Apply level or above', metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, direction: 'higher', good: 50, bad: 35, unit: '%' },
  ],
  'cognitive-demand': [
    scale('student', 'IND-CGD-01', 'Assessments require application'),
    scale('faculty', 'IND-CGD-02', 'Assessments require application'),
    { source: 'artefact', label: 'Marks at Analyse level or above', metric: { kind: 'derived', key: 'artefact.marks_analyse_plus_pct' }, direction: 'higher', good: 25, bad: 15, unit: '%' },
  ],
  'assessment-transparency': [
    { source: 'institution', label: 'Rubric provision policy', metric: { kind: 'categorical', indicatorId: 'IND-TRN-01', group: 'institution', map: categoricalMaps['IND-TRN-01'] }, direction: 'higher', good: 4, bad: 2, unit: 'mapped' },
    { source: 'artefact', label: 'Tasks with a rubric present', metric: { kind: 'derived', key: 'artefact.rubric_present_pct' }, direction: 'higher', good: 67, bad: 50, unit: '%' },
  ],
  'moderation-quality-assurance': [
    { source: 'institution', label: 'Internal moderation in use', metric: { kind: 'selection', indicatorId: 'IND-QA-01', group: 'institution', option: 'internal-moderation' }, direction: 'higher', good: 0.75, bad: 0.5, unit: 'share' },
  ],
  'feedback-quality': [
    scale('student', 'IND-FBQ-01', 'Usefulness of feedback'),
    scale('faculty', 'IND-FBQ-02', 'Feedback designed to improve work'),
    { source: 'records', label: 'Releases followed by a task within 14 days', metric: { kind: 'derived', key: 'assessment.tasks_within_window' }, direction: 'higher', good: 100, bad: 0, unit: 'releases' },
  ],
  'feedback-timeliness': [
    scale('student', 'IND-FBT-01', 'Timeliness of feedback'),
    { source: 'faculty', label: 'Class size named as a barrier', metric: { kind: 'selection', indicatorId: 'IND-FBB-01', group: 'faculty', option: 'class-size' }, direction: 'lower', good: 0.3, bad: 0.6, unit: 'share' },
    { source: 'institution', label: 'How turnaround is monitored', metric: { kind: 'categorical', indicatorId: 'IND-MON-01', group: 'institution', map: categoricalMaps['IND-MON-01'] }, direction: 'higher', good: 4, bad: 2, unit: 'mapped' },
    { source: 'records', label: 'Median turnaround', metric: { kind: 'derived', key: 'feedback.turnaround.median' }, direction: 'lower', good: 14, bad: 15, unit: 'days' },
  ],
  'knowledge-understanding': [
    { source: 'records', label: 'Recall items, mean score', metric: { kind: 'derived', key: 'items.recall_mean' }, direction: 'higher', good: 65, bad: 50, unit: '%' },
  ],
  'application-competence': [
    { source: 'records', label: 'Application items, mean score', metric: { kind: 'derived', key: 'items.application_mean' }, direction: 'higher', good: 60, bad: 50, unit: '%' },
  ],
  'higher-order-thinking': [
    { source: 'records', label: 'Analysis items, mean score', metric: { kind: 'derived', key: 'items.analysis_mean' }, direction: 'higher', good: 60, bad: 50, unit: '%' },
  ],
  'academic-achievement': [
    { source: 'records', label: 'CA average', metric: { kind: 'derived', key: 'results.ca_average' }, direction: 'higher', good: 60, bad: 50, unit: '%' },
    { source: 'records', label: 'Pass rate', metric: { kind: 'derived', key: 'results.pass_rate' }, direction: 'higher', good: 80, bad: 65, unit: '%' },
  ],
  'monitoring-review': [
    { source: 'institution', label: 'Review cadence', metric: { kind: 'categorical', indicatorId: 'IND-REV-01', group: 'institution', map: categoricalMaps['IND-REV-01'] }, direction: 'higher', good: 3.5, bad: 2, unit: 'mapped' },
  ],
  // quality-issue-identification: qualitative evidence only (I41); no quantitative reading.
  'quality-issue-identification': [],
};

export const DIVERGENCE_THRESHOLD = 1.0;
