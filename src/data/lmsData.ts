// LMS extract (class A). Sessions per active user stored as a histogram.

export const lmsExtract = {
  enrolment: 148,
  /** sessions → number of users with that many sessions (users with 0 sessions are absent) */
  sessionsHistogram: { 1: 19, 2: 12, 3: 8, 4: 4, 5: 2, 7: 1 } as Record<number, number>,
  discussionPosts: 0,
  materialsPosted: 6,
  extractNote: 'Course-space access log, weeks 1–14',
};
