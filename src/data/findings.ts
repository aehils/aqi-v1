import type { Finding } from './types';
import { SCALE_NEGATIVE, SCALE_POSITIVE } from './readings';

// Findings are authored; their evidence bindings and displayed values are
// computed. Each trigger term is evaluated live by engine/triggers.

const S = 'student';
const F = 'faculty';
const I = 'institution';

export const findings: Finding[] = [
  {
    id: 'F1',
    kind: 'problem',
    domainIds: ['D5'],
    constructIds: ['feedback-timeliness', 'feedback-quality'],
    band: 'attention',
    title: 'Feedback arrives after it can be used',
    headline: 'Feedback is reaching students after the point at which it can be used, and the assessment schedule provides no task on which to use it.',
    overviewHeadline: 'Feedback is reaching students after the point at which it can be used, and the assessment schedule provides no task on which to use it.',
    trigger: {
      plain: 'Students rate feedback timeliness low; lecturers report feedback is designed to improve subsequent work; the recorded median turnaround exceeds the institutional policy; and no feedback release is followed by a task within the usable window.',
      expression: `student_mean(IND-FBT-01) ≤ ${SCALE_NEGATIVE} AND faculty_mean(IND-FBQ-02) ≥ ${SCALE_POSITIVE} AND derived(feedback.turnaround.median) > policy.threshold AND derived(assessment.tasks_within_window) == 0`,
      terms: [
        { id: 't1', label: 'Students: timeliness of feedback', expression: 'student_mean(IND-FBT-01)', metric: { kind: 'mean', indicatorId: 'IND-FBT-01', group: S }, op: '<=', threshold: SCALE_NEGATIVE, unit: '/5' },
        { id: 't2', label: 'Lecturers: feedback designed to improve subsequent work', expression: 'faculty_mean(IND-FBQ-02)', metric: { kind: 'mean', indicatorId: 'IND-FBQ-02', group: F }, op: '>=', threshold: SCALE_POSITIVE, unit: '/5' },
        { id: 't3', label: 'Records: median turnaround', expression: 'derived(feedback.turnaround.median)', metric: { kind: 'derived', key: 'feedback.turnaround.median' }, op: '>', threshold: { derived: 'policy.threshold' }, unit: 'days' },
        { id: 't4', label: 'Records: feedback releases followed by a task within 14 days', expression: 'derived(assessment.tasks_within_window)', metric: { kind: 'derived', key: 'assessment.tasks_within_window' }, op: '==', threshold: 0, unit: 'releases' },
      ],
    },
    indicatorIds: ['IND-FBT-01', 'IND-FBQ-01', 'IND-FBQ-02', 'IND-FBB-01', 'IND-MON-01', 'IND-TAT-01', 'IND-TAT-02', 'IND-WIN-01'],
    evidenceRefs: [
      { id: 'E1', kind: 'turnaround', title: 'Feedback turnaround by event, against the 14-day policy', evidenceClass: 'A', source: 'records' },
      { id: 'E2', kind: 'schedule', title: 'Assessment schedule joined to feedback releases', evidenceClass: 'D', source: 'records' },
      { id: 'E3', kind: 'distribution', title: 'Students: timeliness of feedback (S-Q34)', indicatorId: 'IND-FBT-01', group: S, evidenceClass: 'B', source: S },
      { id: 'E4', kind: 'distribution', title: 'Students: usefulness of feedback (S-Q33)', indicatorId: 'IND-FBQ-01', group: S, evidenceClass: 'B', source: S },
      { id: 'E5', kind: 'distribution', title: 'Lecturers: feedback designed to improve subsequent work (F23)', indicatorId: 'IND-FBQ-02', group: F, evidenceClass: 'B', source: F },
      { id: 'E6', kind: 'selection', title: 'Lecturers: barriers to prompt feedback (F25)', indicatorId: 'IND-FBB-01', group: F, evidenceClass: 'B', source: F },
      { id: 'E7', kind: 'distribution', title: 'Administrators: how turnaround is monitored (I26)', indicatorId: 'IND-MON-01', group: I, evidenceClass: 'B', source: I },
    ],
    qualitativeRefs: ['V-S1', 'V-S4', 'V-S6', 'V-F1', 'V-I1'],
    hypothesis: 'Students may be receiving feedback they cannot act on. Turnaround exceeds the policy window, and the assessment schedule provides no subsequent task in which feedback could be applied. The low usefulness rating may therefore reflect the timing structure as much as the content of the feedback. This should be investigated before the content of feedback is redesigned.',
    overviewMetrics: [
      { label: 'Students, timeliness', metric: { kind: 'mean', indicatorId: 'IND-FBT-01', group: S }, unit: '/5' },
      { label: 'Median turnaround', metric: { kind: 'derived', key: 'feedback.turnaround.median' }, unit: 'days' },
      { label: 'Releases followed by a task', metric: { kind: 'derived', key: 'assessment.tasks_within_window' }, unit: 'releases' },
    ],
    lineage: { domainId: 'D5', constructId: 'feedback-timeliness', dimension: 'Turnaround relative to the point of use', indicatorId: 'IND-WIN-01', evidence: 'Assessment schedule joined to submission and feedback-release timestamps' },
    recommendationIds: ['R1', 'R5'],
    distinction: 'Feedback quality ≠ feedback timeliness. Both are read here, and the schedule is read as a third thing.',
  },
  {
    id: 'F2',
    kind: 'problem',
    domainIds: ['D1', 'D5', 'D6'],
    constructIds: ['curriculum-assessment-alignment', 'assessment-alignment', 'cognitive-demand', 'application-competence', 'higher-order-thinking'],
    band: 'attention',
    title: 'Analytical intent is not reaching the assessed curriculum',
    headline: 'The course intends analytical capability and lecturers report assessing to the outcomes, but the assessment papers carry most marks at recall, and student performance follows the papers.',
    trigger: {
      plain: 'Most ILOs are written at Apply level or above; lecturers report using ILOs to determine what is assessed; the artefacts carry under 35% of marks at Apply or above; students rate cognitive demand low; and performance on analysis items is below 50%.',
      expression: `derived(curriculum.ilo_apply_plus_pct) ≥ 50 AND faculty_mean(IND-ALN-01) ≥ ${SCALE_POSITIVE} AND derived(artefact.marks_apply_plus_pct) < 35 AND student_mean(IND-CGD-01) ≤ ${SCALE_NEGATIVE} AND derived(items.analysis_mean) < 50`,
      terms: [
        { id: 't1', label: 'Curriculum: ILOs at Apply level or above', expression: 'derived(curriculum.ilo_apply_plus_pct)', metric: { kind: 'derived', key: 'curriculum.ilo_apply_plus_pct' }, op: '>=', threshold: 50, unit: '%' },
        { id: 't2', label: 'Lecturers: ILOs determine what is assessed', expression: 'faculty_mean(IND-ALN-01)', metric: { kind: 'mean', indicatorId: 'IND-ALN-01', group: F }, op: '>=', threshold: SCALE_POSITIVE, unit: '/5' },
        { id: 't3', label: 'Artefacts: marks at Apply level or above', expression: 'derived(artefact.marks_apply_plus_pct)', metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, op: '<', threshold: 35, unit: '%' },
        { id: 't4', label: 'Students: assessments require application', expression: 'student_mean(IND-CGD-01)', metric: { kind: 'mean', indicatorId: 'IND-CGD-01', group: S }, op: '<=', threshold: SCALE_NEGATIVE, unit: '/5' },
        { id: 't5', label: 'Records: performance on analysis items', expression: 'derived(items.analysis_mean)', metric: { kind: 'derived', key: 'items.analysis_mean' }, op: '<', threshold: 50, unit: '%' },
      ],
    },
    indicatorIds: ['IND-ILO-02', 'IND-ALN-01', 'IND-CGD-02', 'IND-BLM-01', 'IND-BLM-02', 'IND-ALN-02', 'IND-CGD-01', 'IND-ITM-01', 'IND-ITM-02', 'IND-ITM-03'],
    evidenceRefs: [
      { id: 'E1', kind: 'curriculum', title: 'Intended learning outcomes by cognitive level', evidenceClass: 'C', source: 'curriculum' },
      { id: 'E2', kind: 'artefact', title: 'Marks by cognitive level across 3 assessment artefacts', evidenceClass: 'C', source: 'artefact' },
      { id: 'E3', kind: 'items', title: 'Item-level performance on the mixed-level assessment (CA2)', evidenceClass: 'D', source: 'records' },
      { id: 'E4', kind: 'distribution', title: 'Students: assessments require application (S-Q31)', indicatorId: 'IND-CGD-01', group: S, evidenceClass: 'B', source: S },
      { id: 'E5', kind: 'distribution', title: 'Lecturers: ILOs determine what is assessed (F19)', indicatorId: 'IND-ALN-01', group: F, evidenceClass: 'B', source: F },
      { id: 'E6', kind: 'distribution', title: 'Lecturers: assessments require application (F21)', indicatorId: 'IND-CGD-02', group: F, evidenceClass: 'B', source: F },
    ],
    qualitativeRefs: ['V-S5', 'V-F2'],
    hypothesis: 'Application may be present in delivery but absent from what is assessed. Lecturers may be reporting their tutorial practice while the examination, which carries 70% of marks, is written to be markable at scale. Outcome evidence is consistent with the artefacts rather than the self-report. Whether the gap sits in assessment design or in marking constraints needs investigation.',
    overviewMetrics: [
      { label: 'ILOs at Apply or above', metric: { kind: 'derived', key: 'curriculum.ilo_apply_plus_pct' }, unit: '%' },
      { label: 'Marks at Apply or above', metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, unit: '%' },
      { label: 'Analysis items', metric: { kind: 'derived', key: 'items.analysis_mean' }, unit: '%' },
    ],
    lineage: { domainId: 'D1', constructId: 'curriculum-assessment-alignment', dimension: 'Intended versus assessed cognitive level', indicatorId: 'IND-ALN-02', evidence: 'Curriculum document ILO levels set against artefact mark allocation' },
    recommendationIds: ['R2'],
    distinction: 'Teaching practice ≠ assessed curriculum ≠ learning outcome. Three readings, kept apart.',
  },
  {
    id: 'F3',
    kind: 'problem',
    domainIds: ['D2'],
    constructIds: ['learning-resources-facilities', 'resource-accessibility-availability', 'learning-technology-integration'],
    band: 'attention',
    title: 'Declared provision is not reaching the learning experience',
    headline: 'The institution declares an LMS and virtual laboratories; lecturers rarely use them; a minority of students experience them; and the system log confirms it.',
    trigger: {
      plain: 'Administrators declare the LMS available; lecturers report using it rarely; under 40% of students report experiencing it; and under 40% of enrolment accessed the course space at all.',
      expression: `institution_rate(IND-PROV-01, lms) ≥ 0.75 AND faculty_matrix(IND-TECH-FAC, lms) ≤ ${SCALE_NEGATIVE} AND student_rate(IND-TECH-STU, lms) < 0.40 AND derived(lms.active_pct) < 40`,
      terms: [
        { id: 't1', label: 'Administrators: LMS declared available', expression: 'institution_rate(IND-PROV-01, lms)', metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: I, option: 'lms' }, op: '>=', threshold: 0.75, unit: 'share' },
        { id: 't2', label: 'Lecturers: frequency of LMS use', expression: 'faculty_matrix(IND-TECH-FAC, lms)', metric: { kind: 'matrix', indicatorId: 'IND-TECH-FAC', group: F, row: 'lms' }, op: '<=', threshold: SCALE_NEGATIVE, unit: '/5' },
        { id: 't3', label: 'Students: LMS experienced in this course', expression: 'student_rate(IND-TECH-STU, lms)', metric: { kind: 'selection', indicatorId: 'IND-TECH-STU', group: S, option: 'lms' }, op: '<', threshold: 0.4, unit: 'share' },
        { id: 't4', label: 'LMS extract: enrolment accessing the course space', expression: 'derived(lms.active_pct)', metric: { kind: 'derived', key: 'lms.active_pct' }, op: '<', threshold: 40, unit: '%' },
      ],
    },
    indicatorIds: ['IND-PROV-01', 'IND-PROV-02', 'IND-TECH-FAC', 'IND-TECH-STU', 'IND-RES-01', 'IND-LMS-01', 'IND-LMS-02', 'IND-LMS-03'],
    evidenceRefs: [
      { id: 'E1', kind: 'selection', title: 'Administrators: declared resources and facilities (I9)', indicatorId: 'IND-PROV-01', group: I, evidenceClass: 'B', source: I },
      { id: 'E2', kind: 'matrix', title: 'Lecturers: frequency of resource and technology use (F10)', indicatorId: 'IND-TECH-FAC', group: F, evidenceClass: 'B', source: F },
      { id: 'E3', kind: 'selection', title: 'Students: resources and technologies experienced (S-Q4)', indicatorId: 'IND-TECH-STU', group: S, evidenceClass: 'B', source: S },
      { id: 'E4', kind: 'lms', title: 'LMS extract: course-space activity', evidenceClass: 'A', source: 'lms' },
      { id: 'E5', kind: 'selection', title: 'Administrators: declared access limitations (I11)', indicatorId: 'IND-PROV-02', group: I, evidenceClass: 'B', source: I },
      { id: 'E6', kind: 'distribution', title: 'Students: ease of access to resources (S-Q5)', indicatorId: 'IND-RES-01', group: S, evidenceClass: 'B', source: S },
    ],
    qualitativeRefs: ['V-S3', 'V-S7', 'V-F3'],
    hypothesis: 'This is unlikely to be an infrastructure-purchase problem. The institution itself names connectivity, power and device limitations as barriers. Existence, accessibility and use are three different things, and the evidence separates them: the platform exists; students cannot reliably reach it; lecturers, knowing that, do not rely on it. Which of the three to act on first needs investigation.',
    overviewMetrics: [
      { label: 'Administrators declaring the LMS', metric: { kind: 'selection', indicatorId: 'IND-PROV-01', group: I, option: 'lms' }, unit: 'share' },
      { label: 'Students experiencing it', metric: { kind: 'selection', indicatorId: 'IND-TECH-STU', group: S, option: 'lms' }, unit: 'share' },
      { label: 'Course-space access', metric: { kind: 'derived', key: 'lms.active_pct' }, unit: '%' },
    ],
    lineage: { domainId: 'D2', constructId: 'learning-technology-integration', dimension: 'Use, as distinct from availability', indicatorId: 'IND-LMS-01', evidence: 'LMS course-space access log, weeks 1–14' },
    recommendationIds: ['R3'],
    distinction: 'Existence ≠ accessibility ≠ use ≠ effective use.',
  },
  {
    id: 'F4',
    kind: 'problem',
    domainIds: ['D3'],
    constructIds: ['active-learning-engagement'],
    band: 'conflicting',
    title: 'Opportunities to participate are provided and not experienced',
    headline: 'Lecturers report frequently providing opportunities to participate; students report experiencing them less often; the cohort is larger than either teaching room.',
    trigger: {
      plain: 'The lecturer reading exceeds the student reading by at least 1.0 on the 5-point scale; most lecturers name class size as a constraint; and enrolment exceeds the largest teaching room.',
      expression: 'faculty_mean(IND-ACT-01) − student_mean(IND-ACT-02) ≥ 1.0 AND faculty_rate(IND-FBB-01, class-size) ≥ 0.6 AND derived(room.capacity_ratio) > 1.0',
      terms: [
        { id: 't1', label: 'Lecturer reading minus student reading', expression: 'faculty_mean(IND-ACT-01) − student_mean(IND-ACT-02)', metric: { kind: 'diff', a: { kind: 'mean', indicatorId: 'IND-ACT-01', group: F }, b: { kind: 'mean', indicatorId: 'IND-ACT-02', group: S } }, op: '>=', threshold: 1.0, unit: '/5' },
        { id: 't2', label: 'Lecturers: class size named as a barrier', expression: 'faculty_rate(IND-FBB-01, class-size)', metric: { kind: 'selection', indicatorId: 'IND-FBB-01', group: F, option: 'class-size' }, op: '>=', threshold: 0.6, unit: 'share' },
        { id: 't3', label: 'Records: enrolment relative to the largest room', expression: 'derived(room.capacity_ratio)', metric: { kind: 'derived', key: 'room.capacity_ratio' }, op: '>', threshold: 1.0, unit: '×' },
      ],
    },
    indicatorIds: ['IND-ACT-01', 'IND-ACT-02', 'IND-FBB-01', 'IND-ROOM-01'],
    evidenceRefs: [
      { id: 'E1', kind: 'distribution', title: 'Lecturers: opportunities to participate, as provided (F11)', indicatorId: 'IND-ACT-01', group: F, evidenceClass: 'B', source: F },
      { id: 'E2', kind: 'distribution', title: 'Students: opportunities to participate, as experienced (S-Q11)', indicatorId: 'IND-ACT-02', group: S, evidenceClass: 'B', source: S },
      { id: 'E3', kind: 'room', title: 'Enrolment against teaching-room capacity', evidenceClass: 'A', source: 'records' },
      { id: 'E4', kind: 'selection', title: 'Lecturers: barriers to prompt feedback (F25)', indicatorId: 'IND-FBB-01', group: F, evidenceClass: 'B', source: F },
    ],
    qualitativeRefs: ['V-S2', 'V-F1', 'V-I2'],
    hypothesis: 'The opportunity may be genuinely provided and still not reach most of the cohort. Teaching practice and student experience are different measurements and should not be reconciled by preferring one source. A cohort of 148 in a room of 90 is a plausible mechanism, not a demonstrated one.',
    overviewMetrics: [
      { label: 'Lecturers, provided', metric: { kind: 'mean', indicatorId: 'IND-ACT-01', group: F }, unit: '/5' },
      { label: 'Students, experienced', metric: { kind: 'mean', indicatorId: 'IND-ACT-02', group: S }, unit: '/5' },
      { label: 'Enrolment against largest room', metric: { kind: 'derived', key: 'room.capacity_ratio' }, unit: '×' },
    ],
    lineage: { domainId: 'D3', constructId: 'active-learning-engagement', dimension: 'Opportunity provided versus opportunity experienced', indicatorId: 'IND-ACT-02', evidence: 'Student responses to S-Q11 set against lecturer responses to F11' },
    recommendationIds: ['R4'],
    distinction: 'Opportunity to participate ≠ actual participation. Teaching practice ≠ student experience.',
  },
  {
    id: 'F5',
    kind: 'strength',
    domainIds: ['D3'],
    constructIds: ['instructional-clarity'],
    band: 'strong',
    title: 'Instructional clarity is confirmed by three independent sources',
    headline: 'Students, lecturers and three observation records agree that explanations are clear.',
    trigger: {
      plain: 'Students rate clarity high; lecturers rate their own clarity high; the two readings sit within 1.0 of each other; and every observation record rates clarity at or above expectation.',
      expression: `student_mean(IND-CLR-01) ≥ ${SCALE_POSITIVE} AND faculty_mean(IND-CLR-02) ≥ ${SCALE_POSITIVE} AND |student_mean(IND-CLR-01) − faculty_mean(IND-CLR-02)| < 1.0 AND derived(observation.clarity_meets_pct) == 100`,
      terms: [
        { id: 't1', label: 'Students: clarity of explanations', expression: 'student_mean(IND-CLR-01)', metric: { kind: 'mean', indicatorId: 'IND-CLR-01', group: S }, op: '>=', threshold: SCALE_POSITIVE, unit: '/5' },
        { id: 't2', label: 'Lecturers: own clarity, self-rated', expression: 'faculty_mean(IND-CLR-02)', metric: { kind: 'mean', indicatorId: 'IND-CLR-02', group: F }, op: '>=', threshold: SCALE_POSITIVE, unit: '/5' },
        { id: 't3', label: 'Spread between the two readings', expression: '|student_mean(IND-CLR-01) − faculty_mean(IND-CLR-02)|', metric: { kind: 'diff', a: { kind: 'mean', indicatorId: 'IND-CLR-01', group: S }, b: { kind: 'mean', indicatorId: 'IND-CLR-02', group: F }, abs: true }, op: '<', threshold: 1.0, unit: '/5' },
        { id: 't4', label: 'Observations rating clarity at or above expectation', expression: 'derived(observation.clarity_meets_pct)', metric: { kind: 'derived', key: 'observation.clarity_meets_pct' }, op: '==', threshold: 100, unit: '%' },
      ],
    },
    indicatorIds: ['IND-CLR-01', 'IND-CLR-02', 'IND-OBS-01'],
    evidenceRefs: [
      { id: 'E1', kind: 'distribution', title: "Students: clarity of lecturer's explanations (S-Q8)", indicatorId: 'IND-CLR-01', group: S, evidenceClass: 'B', source: S },
      { id: 'E2', kind: 'distribution', title: 'Lecturers: clarity of own explanations (F13)', indicatorId: 'IND-CLR-02', group: F, evidenceClass: 'B', source: F },
      { id: 'E3', kind: 'observation', title: 'Teaching observation records', evidenceClass: 'A', source: 'observation' },
    ],
    qualitativeRefs: ['V-S2'],
    hypothesis: 'Clarity of explanation is a genuine strength of the course as delivered. It should be held apart from the participation and assessment findings: a clearly explained course can still assess at recall and leave feedback unusable. AQIP confirms strengths on the same evidential basis it flags problems.',
    overviewMetrics: [
      { label: 'Students', metric: { kind: 'mean', indicatorId: 'IND-CLR-01', group: S }, unit: '/5' },
      { label: 'Lecturers', metric: { kind: 'mean', indicatorId: 'IND-CLR-02', group: F }, unit: '/5' },
      { label: 'Observations at or above expectation', metric: { kind: 'derived', key: 'observation.clarity_meets_pct' }, unit: '%' },
    ],
    lineage: { domainId: 'D3', constructId: 'instructional-clarity', dimension: 'Clarity of explanation', indicatorId: 'IND-OBS-01', evidence: 'Three observation records, weeks 3, 6 and 10' },
    recommendationIds: [],
    distinction: 'A strength is reported with the same source count, n and thresholds as a problem.',
  },
  {
    id: 'F6',
    kind: 'relationship',
    domainIds: ['D4', 'D6'],
    constructIds: ['student-satisfaction', 'application-competence', 'higher-order-thinking'],
    band: 'adequate',
    title: 'Satisfaction is high while application and analysis performance are weak',
    headline: 'Students are satisfied with the course; performance on application and analysis items is below half marks. These co-occur. Neither is evidence about the other.',
    trigger: {
      plain: 'Satisfaction is positive on the stated threshold while application and analysis item performance are both below 50%.',
      expression: `student_mean(IND-SAT-01) ≥ ${SCALE_POSITIVE} AND derived(items.application_mean) < 50 AND derived(items.analysis_mean) < 50`,
      terms: [
        { id: 't1', label: 'Students: overall satisfaction', expression: 'student_mean(IND-SAT-01)', metric: { kind: 'mean', indicatorId: 'IND-SAT-01', group: S }, op: '>=', threshold: SCALE_POSITIVE, unit: '/5' },
        { id: 't2', label: 'Records: performance on application items', expression: 'derived(items.application_mean)', metric: { kind: 'derived', key: 'items.application_mean' }, op: '<', threshold: 50, unit: '%' },
        { id: 't3', label: 'Records: performance on analysis items', expression: 'derived(items.analysis_mean)', metric: { kind: 'derived', key: 'items.analysis_mean' }, op: '<', threshold: 50, unit: '%' },
      ],
    },
    indicatorIds: ['IND-SAT-01', 'IND-ITM-02', 'IND-ITM-03', 'IND-CLR-01'],
    evidenceRefs: [
      { id: 'E1', kind: 'distribution', title: 'Students: overall satisfaction (S-Q37)', indicatorId: 'IND-SAT-01', group: S, evidenceClass: 'B', source: S },
      { id: 'E2', kind: 'items', title: 'Item-level performance on the mixed-level assessment (CA2)', evidenceClass: 'D', source: 'records' },
    ],
    qualitativeRefs: [],
    hypothesis: 'Satisfaction is a legitimate variable of interest. It is not a measure of academic quality, and this co-occurrence is an association to investigate, not evidence that either causes the other. One candidate explanation is that clarity of explanation, which is strong, drives satisfaction while assessment at recall leaves application untested until it is examined. That is a hypothesis to test next cycle, not a conclusion.',
    overviewMetrics: [
      { label: 'Satisfaction', metric: { kind: 'mean', indicatorId: 'IND-SAT-01', group: S }, unit: '/5' },
      { label: 'Application items', metric: { kind: 'derived', key: 'items.application_mean' }, unit: '%' },
      { label: 'Analysis items', metric: { kind: 'derived', key: 'items.analysis_mean' }, unit: '%' },
    ],
    lineage: { domainId: 'D4', constructId: 'student-satisfaction', dimension: 'Overall evaluation of experience', indicatorId: 'IND-SAT-01', evidence: 'Student responses to S-Q37, set beside item-level performance' },
    recommendationIds: [],
    distinction: 'Satisfaction ≠ academic quality. Association ≠ causation.',
  },
];

export const findingById = (id: string): Finding => {
  const f = findings.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown finding ${id}`);
  return f;
};
