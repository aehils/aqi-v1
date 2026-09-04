// Uploaded assessment artefacts (class C) analysed for cognitive level.

export interface Artefact {
  id: string;
  assessmentId: string;
  title: string;
  totalMarks: number;
  marksByLevel: { remember_understand: number; apply: number; analyse_evaluate: number; create: number };
  rubricPresent: boolean;
}

export const artefacts: Artefact[] = [
  { id: 'ART-EXAM', assessmentId: 'EXAM', title: 'End-of-semester examination paper', totalMarks: 70, marksByLevel: { remember_understand: 52, apply: 14, analyse_evaluate: 4, create: 0 }, rubricPresent: false },
  { id: 'ART-CA1', assessmentId: 'CA1', title: 'CA1 problem set', totalMarks: 15, marksByLevel: { remember_understand: 12, apply: 3, analyse_evaluate: 0, create: 0 }, rubricPresent: false },
  { id: 'ART-CA2', assessmentId: 'CA2', title: 'CA2 laboratory report brief and marking scheme', totalMarks: 15, marksByLevel: { remember_understand: 7, apply: 5, analyse_evaluate: 3, create: 0 }, rubricPresent: true },
];

export const bloomLevelLabels: Record<keyof Artefact['marksByLevel'], string> = {
  remember_understand: 'Remember / Understand',
  apply: 'Apply',
  analyse_evaluate: 'Analyse / Evaluate',
  create: 'Create',
};

// Curriculum document (class C).
export interface IntendedLearningOutcome {
  id: string;
  text: string;
  verb: string;
  level: 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Evaluate' | 'Create';
}

export const curriculumDocument = {
  title: 'BCH 305 approved course specification',
  lastFormalReview: '3–5 years ago',
  ilos: [
    { id: 'ILO1', text: 'Describe the major pathways of carbohydrate, lipid and amino-acid metabolism.', verb: 'describe', level: 'Understand' },
    { id: 'ILO2', text: 'Explain the regulation of key metabolic enzymes and control points.', verb: 'explain', level: 'Understand' },
    { id: 'ILO3', text: 'Apply principles of bioenergetics to predict the direction of metabolic reactions.', verb: 'apply', level: 'Apply' },
    { id: 'ILO4', text: 'Analyse the integration of metabolic pathways under fed, fasted and exercise states.', verb: 'analyse', level: 'Analyse' },
    { id: 'ILO5', text: 'Interpret experimental data on enzyme kinetics and metabolic flux.', verb: 'interpret', level: 'Analyse' },
    { id: 'ILO6', text: 'Evaluate the metabolic basis of selected inborn errors of metabolism.', verb: 'evaluate', level: 'Evaluate' },
  ] as IntendedLearningOutcome[],
};

export const applyPlusLevels: IntendedLearningOutcome['level'][] = ['Apply', 'Analyse', 'Evaluate', 'Create'];
