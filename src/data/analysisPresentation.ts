/** Display wording only. Status, values, priorities and actions remain engine-derived. */
export const analysisCopy: Record<string, { topic: string; title: string; meaning: string }> = {
  F1: { topic: 'Feedback', title: 'Feedback arrives too late to use', meaning: 'Review release dates and the next opportunity to apply feedback together. Better comments alone may not resolve a scheduling problem.' },
  F2: { topic: 'Applying knowledge', title: 'Assessment gives too little weight to applying knowledge', meaning: 'The course intends skills beyond recall. Review whether assessment tasks and marks give students enough reason to practise those skills.' },
  F3: { topic: 'Resources', title: 'Available resources are not reaching enough students', meaning: 'Check accessibility and actual use before investing in more provision. A platform being available does not mean students can benefit from it.' },
  F4: { topic: 'Participation', title: 'Participation looks different to students and lecturers', meaning: 'Investigate who gets to participate, not just whether an opportunity was offered. Room capacity provides context, not a proven explanation.' },
  F5: { topic: 'Explanations', title: 'Clear explanations are a course strength', meaning: 'Preserve the clarity of teaching while improving practice, assessment and feedback. A strength in explanation is not proof of skill development.' },
  F6: { topic: 'Satisfaction and skills', title: 'Satisfaction and demonstrated skills tell different stories', meaning: 'Read satisfaction alongside performance on application and analysis tasks. These results occur together; neither establishes the cause of the other.' },
};

export const actionTitles: Record<string, string> = {
  R1: 'Create time to use feedback',
  R2: 'Align assessment with intended skills',
  R3: 'Make course resources accessible in practice',
  R4: 'Pilot smaller participation groups',
  R5: 'Monitor feedback using release records',
};

/** Plain-sentence lead and review wording for the plan overview; full wording stays in recommendations. */
export const planSentences: Record<string, { lead: string; review: string }> = {
  R1: { lead: 'the course coordinator', review: 'at the end of Semester 1, 2026/2027' },
  R2: { lead: 'the course lecturers', review: 'after the Semester 1, 2026/2027 examinations' },
  R3: { lead: 'the Head of Department', review: 'at the end of Semester 1, 2026/2027' },
  R4: { lead: 'the Head of Department', review: 'at the end of Semester 1, 2026/2027' },
  R5: { lead: 'the quality assurance unit', review: 'at the next faculty quality committee' },
};

/** Student track: what each proposed change means for a student. `notice` completes
 * "You should notice this …". Actions without an entry are internal and hidden from students. */
export const studentPlan: Record<string, { title: string; change: string; notice: string; youCanDo: string; why: string }> = {
  R1: {
    title: 'Feedback in time to use it',
    change: 'Feedback on each continuous assessment would come back within the 14-day policy, followed by a short task where you can use it.',
    notice: 'in Semester 1, 2026/2027',
    youCanDo: 'Ask for a task where you can use your feedback.',
    why: 'Feedback is reaching students after the point it can be used, and no task follows it.',
  },
  R2: {
    title: 'Assessments that reward applying knowledge',
    change: 'More exam and assignment marks would go to applying and analysing, with marking criteria agreed before papers are set.',
    notice: 'in the Semester 1, 2026/2027 examinations',
    youCanDo: 'Request an application problem with feedback on your reasoning.',
    why: 'Most of the course aims at applying knowledge, but most marks reward recall.',
  },
  R3: {
    title: 'Course materials you can reach',
    change: 'Core materials would sit on the course platform in low-bandwidth formats you can download, with supervised time in the campus computer rooms.',
    notice: 'in Semester 1, 2026/2027',
    youCanDo: 'Ask for an offline or low-bandwidth route to materials.',
    why: 'The course platform exists, but most students are not reaching it.',
  },
  R4: {
    title: 'Smaller groups so you can take part',
    change: 'Participatory work would move into two smaller tutorial groups led by demonstrators. Lectures stay as one class.',
    notice: 'in Semester 1, 2026/2027',
    youCanDo: 'Bring an example of when you could not participate.',
    why: 'Lecturers say they offer chances to take part, but students experience them less often, and the class is larger than the room.',
  },
};

/** Student wording for progress measures; staff labels stay in recommendations. */
export const studentMeasureLabels: Record<string, string> = {
  'Feedback releases followed by a task within 14 days': 'Feedback followed by a task within 14 days',
  'Median feedback turnaround': 'Typical wait for feedback (median)',
  'Students: timeliness of feedback': 'Students’ rating: feedback on time',
  'Students: usefulness of feedback': 'Students’ rating: useful feedback',
  'Marks at Apply level or above': 'Marks for applying knowledge',
  'Performance on analysis items': 'Scores on analysis questions',
  'Students: assessments require application': 'Students’ rating: assessments need application',
  'Students accessing the course space at least once': 'Students who opened the course platform',
  'Students: LMS experienced in this course': 'Students who used the platform in this course',
  'Students: ease of access to resources': 'Students’ rating: access to resources',
  'Students: opportunities to participate, as experienced': 'Students’ rating: chances to take part',
};

export const actionSummaries: Record<string, string> = {
  R1: 'Return feedback before the next assessment and provide a short task where students can use the advice.',
  R2: 'Review assessments against the intended learning outcomes, give applying knowledge more weight, and agree marking criteria before setting the papers.',
  R3: 'Provide low-bandwidth course materials, an offline download option and a supported route to campus facilities.',
  R4: 'Try smaller tutorial groups for participatory work and check whether more students experience an opportunity to contribute.',
  R5: 'Use submission and feedback-release timestamps to identify delays against the course policy.',
};

export const metricLabels: Record<string, string> = {
  'ILOs at Apply or above': 'Outcomes requiring applied skills',
  'Marks at Apply or above': 'Marks for applying knowledge',
  'Analysis items': 'Score on analysis tasks',
  'Application items': 'Score on application tasks',
  'Students, timeliness': 'Students: feedback timing',
  'Median turnaround': 'Typical feedback wait (median)',
  'Releases followed by a task': 'Feedback followed by a task',
  'Administrators declaring the LMS': 'Staff reporting a learning platform',
  'Students experiencing it': 'Students using it in the course',
  'Course-space access': 'Students accessing the platform',
  'Lecturers, provided': 'Participation: lecturer rating',
  'Students, experienced': 'Participation: student rating',
  'Enrolment against largest room': 'Class size / largest room capacity',
};

/** Short headings shared by the overview and searchable findings catalogue. */
export const findingTitles: Record<string, string> = {
  F1: 'Feedback arrives too late', F2: 'Assessment underweights application',
  F3: 'Resources are not reaching students', F4: 'Participation feels different',
  F5: 'Clear explanations', F6: 'Satisfaction is not demonstrated skill',
};

export const compactActions: Record<string, string> = { R1: 'Return feedback before a follow-up practice task.', R2: 'Give application more assessment weight; agree marking criteria upfront.', R3: 'Offer low-bandwidth materials, offline downloads and campus access.', R4: 'Pilot smaller tutorials and check who participates.', R5: 'Track feedback delays against policy using release records.' };
