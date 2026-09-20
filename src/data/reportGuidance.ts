/** Plain-language guidance attached to existing findings, never a new finding rule. */
export const reportGuidance: Record<string, {
  topic: string;
  title: string;
  meaning: string;
  studentStep: string;
  facultyStep: string;
}> = {
  F1: {
    topic: 'Feedback',
    title: 'Make feedback usable before the next task',
    meaning: 'Feedback needs both useful advice and an opportunity to apply it. The schedule and turnaround records point to a timing problem worth addressing.',
    studentStep: 'Ask the course coordinator which upcoming task lets you apply your feedback. If there is none, request a short practice opportunity.',
    facultyStep: 'Review feedback release dates alongside the next assessment. Identify where a short practice task and earlier release would let students use the advice.',
  },
  F2: {
    topic: 'Applying knowledge',
    title: 'Give applying knowledge more weight in assessment',
    meaning: 'The course expects students to apply knowledge, but the assessment papers reward it less. This may limit opportunities to practise and demonstrate the intended skills.',
    studentStep: 'Ask for a worked application example and a new problem to attempt independently, with feedback on your reasoning.',
    facultyStep: 'Compare the next assessment with the intended learning outcomes. Identify which marks reward applying knowledge and review the balance with the assessment committee.',
  },
  F3: {
    topic: 'Resources',
    title: 'Make available resources reachable and useful',
    meaning: 'Having a learning platform does not mean students can access or use it. Course activity and respondent accounts point to a gap between provision and use.',
    studentStep: 'Identify a material or activity you cannot access and ask the course team for a low-bandwidth or offline route.',
    facultyStep: 'Check whether students can reach the core course materials. Offer low-bandwidth downloads and agree a campus access route with ICT services.',
  },
  F4: {
    topic: 'Participation',
    title: 'Check who gets to participate',
    meaning: 'Lecturers and students report different levels of participation. Room capacity is relevant context, but does not establish why the experiences differ.',
    studentStep: 'Bring one example of a session where you wanted to participate but could not. Ask about a smaller tutorial or another way to contribute.',
    facultyStep: 'Check participation across the whole class, then discuss smaller tutorial groups with the department and timetabling team.',
  },
};
