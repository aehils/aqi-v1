import type { Domain } from './types';

export const domains: Domain[] = [
  { id: 'D1', number: 1, name: 'Academic Intent & Curriculum', shortName: 'Intent & Curriculum', coreQuestion: 'Are we designing the right learning?' },
  { id: 'D2', number: 2, name: 'Learning Environment & Provision', shortName: 'Environment & Provision', coreQuestion: 'Have we created the conditions necessary for learning?' },
  { id: 'D3', number: 3, name: 'Instructional Practice', shortName: 'Instructional Practice', coreQuestion: 'Is teaching being designed and delivered effectively?' },
  { id: 'D4', number: 4, name: 'Student Learning Experience & Engagement', shortName: 'Experience & Engagement', coreQuestion: 'How do students actually experience and engage with the learning process?' },
  { id: 'D5', number: 5, name: 'Assessment & Feedback', shortName: 'Assessment & Feedback', coreQuestion: 'Does assessment validly measure and support learning?' },
  { id: 'D6', number: 6, name: 'Learning Outcomes & Student Progression', shortName: 'Outcomes & Progression', coreQuestion: 'What evidence demonstrates that students are actually learning and progressing?' },
  { id: 'D7', number: 7, name: 'Academic Assurance & Continuous Improvement', shortName: 'Assurance & Improvement', coreQuestion: 'Can the institution detect, understand and improve weaknesses in academic quality?' },
];

export const domainById = (id: string): Domain => {
  const d = domains.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown domain ${id}`);
  return d;
};
