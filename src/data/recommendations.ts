import type { Recommendation } from './types';

// Recommendations close the loop: Finding → Diagnosis → Action → Owner →
// Evidence to re-measure → Target → Review point. Ranking basis is stated
// in engine/session (strength of evidence × breadth of cohort affected).

export const recommendations: Recommendation[] = [
  {
    id: 'R1',
    findingId: 'F1',
    diagnosis: 'Feedback arrives after the policy window and the schedule provides no subsequent task in which it could be applied. The usefulness problem may be structural before it is a content problem.',
    action: 'Re-sequence the assessment schedule so that at least one low-stakes task falls due within 14 days of each continuous-assessment feedback release, and return CA1 feedback before CA2 is set. Pilot demonstrator-marked short-answer feedback for CA1 to bring turnaround inside policy.',
    owner: 'Course coordinator, with the departmental examinations officer',
    remeasure: [
      { metric: { kind: 'derived', key: 'assessment.tasks_within_window' }, label: 'Feedback releases followed by a task within 14 days', unit: 'releases', target: '≥ 1 per continuous-assessment release' },
      { metric: { kind: 'derived', key: 'feedback.turnaround.median' }, label: 'Median feedback turnaround', unit: 'days', target: '≤ 14 days' },
      { metric: { kind: 'mean', indicatorId: 'IND-FBT-01', group: 'student' }, label: 'Students: timeliness of feedback', unit: '/5', target: '≥ 3.5' },
      { metric: { kind: 'mean', indicatorId: 'IND-FBQ-01', group: 'student' }, label: 'Students: usefulness of feedback', unit: '/5', target: '≥ 3.5' },
    ],
    target: 'Median turnaround within policy; every continuous-assessment release followed by a task; student timeliness and usefulness readings at or above the positive threshold.',
    reviewPoint: 'End of 2026/2027 first semester (next measurement cycle)',
    breadth: { label: 'All 148 enrolled students', share: 1 },
  },
  {
    id: 'R2',
    findingId: 'F2',
    diagnosis: 'Four of six ILOs ask for Apply-level capability or above, but 71% of marks sit at Remember/Understand and the examination, which carries 70% of marks, is written to be markable at scale.',
    action: 'Blueprint the examination and CA tasks against the six ILOs so that at least 35% of total marks sit at Apply or above, with an explicit marking scheme for each analysis item. Review the blueprint through the departmental assessment committee before papers are set.',
    owner: 'Course lecturers, with the departmental assessment committee',
    remeasure: [
      { metric: { kind: 'derived', key: 'artefact.marks_apply_plus_pct' }, label: 'Marks at Apply level or above', unit: '%', target: '≥ 35%' },
      { metric: { kind: 'derived', key: 'items.analysis_mean' }, label: 'Performance on analysis items', unit: '%', target: '≥ 50%' },
      { metric: { kind: 'mean', indicatorId: 'IND-CGD-01', group: 'student' }, label: 'Students: assessments require application', unit: '/5', target: '≥ 3.0' },
    ],
    target: 'Assessed cognitive level moves toward the intended level; analysis-item performance improves as it becomes assessed and practised.',
    reviewPoint: 'After the next examination cycle, on receipt of the papers and item analysis',
    breadth: { label: 'All 148 enrolled students', share: 1 },
  },
  {
    id: 'R3',
    findingId: 'F3',
    diagnosis: 'The LMS and virtual laboratories exist but are neither reliably accessible nor used. The institution itself names connectivity, power and device limitations.',
    action: 'Make the course space the single channel for core materials and one low-stakes activity per fortnight, in low-bandwidth formats with offline download; open a supervised campus access window in the computer facilities; report course-space access monthly to the department.',
    owner: 'Head of Department, with ICT services',
    remeasure: [
      { metric: { kind: 'derived', key: 'lms.active_pct' }, label: 'Students accessing the course space at least once', unit: '%', target: '≥ 60%' },
      { metric: { kind: 'selection', indicatorId: 'IND-TECH-STU', group: 'student', option: 'lms' }, label: 'Students: LMS experienced in this course', unit: 'share', target: '≥ 60%' },
      { metric: { kind: 'matrix', indicatorId: 'IND-TECH-FAC', group: 'faculty', row: 'lms' }, label: 'Lecturers: frequency of LMS use', unit: '/5', target: '≥ 3.5' },
      { metric: { kind: 'mean', indicatorId: 'IND-RES-01', group: 'student' }, label: 'Students: ease of access to resources', unit: '/5', target: '≥ 3.0' },
    ],
    target: 'Use follows accessibility: a majority of the cohort reaches the course space, and lecturers rely on it.',
    reviewPoint: 'Mid-semester access review, then end of 2026/2027 first semester',
    breadth: { label: 'All 148 enrolled students', share: 1 },
  },
  {
    id: 'R4',
    findingId: 'F4',
    diagnosis: 'Opportunities to participate are reported as provided and experienced as infrequent. A cohort of 148 in a room of 90 is a plausible mechanism.',
    action: 'Split the cohort into two tutorial streams led by demonstrators for the participatory component, keeping the lecture as a single stream; record participation opportunities per stream in the course report.',
    owner: 'Head of Department, with faculty timetabling',
    remeasure: [
      { metric: { kind: 'mean', indicatorId: 'IND-ACT-02', group: 'student' }, label: 'Students: opportunities to participate, as experienced', unit: '/5', target: '≥ 3.5' },
      { metric: { kind: 'diff', a: { kind: 'mean', indicatorId: 'IND-ACT-01', group: 'faculty' }, b: { kind: 'mean', indicatorId: 'IND-ACT-02', group: 'student' } }, label: 'Lecturer minus student reading', unit: '/5', target: '< 1.0' },
    ],
    target: 'The student and lecturer readings converge without either being discounted.',
    reviewPoint: 'End of 2026/2027 first semester',
    breadth: { label: 'All 148 enrolled students', share: 1 },
  },
  {
    id: 'R5',
    findingId: 'F1',
    diagnosis: 'Turnaround is monitored through lecturer reporting rather than from timestamps, so the policy breach was not visible to the institution until the records were joined.',
    action: 'Monitor turnaround from submission and release timestamps at course level each semester, and report exceptions against the 14-day policy to the faculty quality committee.',
    owner: 'Quality assurance unit, with Registry',
    remeasure: [
      { metric: { kind: 'categorical', indicatorId: 'IND-MON-01', group: 'institution', map: { institutionally: 5, 'course-level': 4, 'lecturer-reporting': 2, 'student-feedback': 2, none: 1, other: 2 } }, label: 'Administrators: how turnaround is monitored', unit: 'mapped', target: 'Institutionally or at course level' },
      { metric: { kind: 'derived', key: 'feedback.turnaround.pct_over_policy' }, label: 'Feedback events exceeding policy', unit: '%', target: '≤ 20%' },
    ],
    target: 'The institution can see turnaround without asking the people whose turnaround it is.',
    reviewPoint: 'Next faculty quality committee cycle',
    breadth: { label: 'Course-level process; affects the cohort indirectly', share: 0.5 },
  },
];

export const recommendationById = (id: string): Recommendation => {
  const r = recommendations.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown recommendation ${id}`);
  return r;
};
