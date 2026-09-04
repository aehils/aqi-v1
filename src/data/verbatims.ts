import type { Verbatim } from './types';

// Simulated open responses. Plain, plausible, not dramatic.

export const verbatims: Verbatim[] = [
  { id: 'V-S1', group: 'student', questionId: 'S-Q39', text: 'We usually get scores back long after we have moved on to another topic, so I never really know what I did wrong.', findingIds: ['F1'] },
  { id: 'V-S2', group: 'student', questionId: 'S-Q39', text: 'The lecturer explains well in class. The problem is the class is too big to ask questions.', findingIds: ['F4', 'F5'] },
  { id: 'V-S3', group: 'student', questionId: 'S-Q39', text: 'The portal is there but most of us cannot afford data to open it every time, so notes come through WhatsApp.', findingIds: ['F3'] },
  { id: 'V-S4', group: 'student', questionId: 'S-Q39', text: 'Feedback was just a mark. Nobody told us what a good answer looked like.', findingIds: ['F1'] },
  { id: 'V-S5', group: 'student', questionId: 'S-Q39', text: 'Tests are mostly things to memorise. The lab report was harder but felt more like real biochemistry.', findingIds: ['F2'] },
  { id: 'V-S6', group: 'student', questionId: 'S-Q39', text: 'By the time we saw the CA1 scores we had already submitted CA2.', findingIds: ['F1'] },
  { id: 'V-S7', group: 'student', questionId: 'S-Q39', text: 'Power goes off in the lab building often, so the practical sessions are cut short.', findingIds: ['F3'] },
  { id: 'V-F1', group: 'faculty', questionId: 'F38', text: 'With 148 students and no marking support, detailed written feedback on three assessments is not achievable within two weeks.', findingIds: ['F1', 'F4'] },
  { id: 'V-F2', group: 'faculty', questionId: 'F38', text: 'I set application questions in the tutorials, but the exam has to be markable at scale, so it leans on recall.', findingIds: ['F2'] },
  { id: 'V-F3', group: 'faculty', questionId: 'F38', text: 'The LMS works when the network works. Students tell me they cannot load it off campus.', findingIds: ['F3'] },
  { id: 'V-I1', group: 'institution', questionId: 'I41', text: 'Delays in results and feedback release at course level.', findingIds: ['F1'] },
  { id: 'V-I2', group: 'institution', questionId: 'I41', text: 'Large cohorts relative to teaching space and demonstrator numbers.', findingIds: ['F4'] },
];
