export const course = {
  institution: 'Montessori University',
  institutionNote: 'fictional demo institution',
  faculty: 'Faculty of Science',
  department: 'Biochemistry',
  programme: 'B.Sc. Biochemistry (Undergraduate)',
  code: 'BCH 305',
  title: 'Metabolic Biochemistry',
  level: '300',
  session: '2025/2026, Second Semester',
  enrolment: 148,
  teachingTeam: { lecturers: 2, total: 9, note: '2 course lecturers, 7 demonstrators/tutors' },
  rooms: [
    { id: 'LT-B2', capacity: 90 },
    { id: 'LT-B4', capacity: 90 },
  ],
  regulatory: 'NUC CCMAS aligned; professional-body aligned; accreditation current',
  accreditationCurrent: true,
  feedbackPolicyDays: 14,
} as const;

export const seedRespondentBase = {
  student: 96,
  faculty: 7,
  institution: 4,
} as const;
