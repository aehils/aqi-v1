/** Display wording only. Status, values, priorities and actions remain engine-derived. */
export const analysisCopy: Record<string, { title: string; meaning: string }> = {
  F1: { title: 'Feedback arrives too late to use', meaning: 'Review release dates and the next opportunity to apply feedback together. Better comments alone may not resolve a scheduling problem.' },
  F2: { title: 'Assessment gives too little weight to applying knowledge', meaning: 'The course intends skills beyond recall. Review whether assessment tasks and marks give students enough reason to practise those skills.' },
  F3: { title: 'Available resources are not reaching enough students', meaning: 'Check accessibility and actual use before investing in more provision. A platform being available does not mean students can benefit from it.' },
  F4: { title: 'Participation looks different to students and lecturers', meaning: 'Investigate who gets to participate, not just whether an opportunity was offered. Room capacity provides context, not a proven explanation.' },
  F5: { title: 'Clear explanations are a course strength', meaning: 'Preserve the clarity of teaching while improving practice, assessment and feedback. A strength in explanation is not proof of skill development.' },
  F6: { title: 'Satisfaction and demonstrated skills tell different stories', meaning: 'Read satisfaction alongside performance on application and analysis tasks. These results occur together; neither establishes the cause of the other.' },
};

export const actionTitles: Record<string, string> = {
  R1: 'Create time to use feedback',
  R2: 'Align assessment with intended skills',
  R3: 'Make course resources accessible in practice',
  R4: 'Pilot smaller participation groups',
  R5: 'Monitor feedback using release records',
};
