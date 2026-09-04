import type { ResponseRecord } from './types';

// Four simulated academic/administrative responses.

const provision = ['lecture-rooms', 'laboratories', 'library', 'computer-facilities', 'virtual-labs', 'wifi', 'lms', 'digital-library'];

export const institutionResponses: ResponseRecord[] = [
  {
    id: 'I-01', group: 'institution',
    answers: { I5: 'yes', I6: ['institutional', 'nuc', 'professional'], I9: provision, I11: ['connectivity', 'power', 'equipment', 'devices'], I24: ['internal-moderation', 'sampling', 'marking-schemes'], I25: 'some', I26: 'lecturer-reporting', I34: 'semester' },
  },
  {
    id: 'I-02', group: 'institution',
    answers: { I5: 'yes', I6: ['institutional', 'nuc', 'professional'], I9: provision, I11: ['connectivity', 'power', 'equipment'], I24: ['internal-moderation', 'sampling', 'marking-schemes'], I25: 'some', I26: 'lecturer-reporting', I34: 'semester' },
  },
  {
    id: 'I-03', group: 'institution',
    answers: { I5: 'yes', I6: ['institutional', 'nuc', 'professional'], I9: provision, I11: ['connectivity', 'power', 'equipment', 'devices'], I24: ['internal-moderation', 'sampling', 'marking-schemes'], I25: 'some', I26: 'lecturer-reporting', I34: 'semester' },
  },
  {
    id: 'I-04', group: 'institution',
    answers: { I5: 'yes', I6: ['institutional', 'nuc', 'professional'], I9: provision, I11: ['connectivity'], I24: ['internal-moderation', 'assessment-review'], I25: 'rarely', I26: 'lecturer-reporting', I34: 'annually' },
  },
];
