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
