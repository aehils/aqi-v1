import type { Construct, DomainId, SourceType } from './types';

// The full 67-construct AQIP registry. It drives banding, coverage and
// "not instrumented" states. It is never rendered as a list.

type Row = [number, DomainId, string, string, string, SourceType[], boolean?];

const S: SourceType[] = ['student'];
const rows: Row[] = [
  // Domain 1 — Academic Intent & Curriculum
  [1, 'D1', 'intended-learning-outcomes', 'Intended Learning Outcomes', 'Clearly stated, measurable outcomes describing what students should know, understand and be able to do.', ['curriculum', 'faculty', 'institution'], true],
  [2, 'D1', 'curriculum-alignment', 'Curriculum Alignment', 'The curriculum aligns with intended outcomes, regulatory requirements, professional expectations and relevant external benchmarks.', ['curriculum', 'faculty', 'institution'], true],
  [3, 'D1', 'curriculum-coherence-progression', 'Curriculum Coherence & Progression', 'Content progresses logically from foundational to advanced knowledge and capabilities.', ['curriculum', 'faculty', 'student']],
  [4, 'D1', 'cognitive-development', 'Cognitive Development', 'The curriculum progressively develops appropriate cognitive abilities.', ['curriculum', 'artefact', 'faculty'], true],
  [5, 'D1', 'curriculum-relevance-currency', 'Curriculum Relevance & Currency', 'Content reflects current disciplinary knowledge, professional practice and relevant developments.', ['curriculum', 'faculty']],
  [6, 'D1', 'curriculum-assessment-alignment', 'Curriculum–Assessment Alignment', 'Assessment tests the intended curriculum outcomes; important outcomes are not taught but left unassessed.', ['curriculum', 'artefact', 'faculty'], true],
  [7, 'D1', 'programme-accreditation-compliance', 'Programme & Accreditation Compliance', 'Applicable regulatory and professional requirements are satisfied.', ['institution', 'curriculum', 'records'], true],
  // Domain 2 — Learning Environment & Provision
  [8, 'D2', 'learning-resources-facilities', 'Learning Resources & Facilities', 'Appropriate physical and learning resources exist.', ['institution', 'faculty', 'student', 'observation'], true],
  [9, 'D2', 'digital-learning-environment', 'Digital Learning Environment', 'Digital platforms support teaching, learning and communication.', ['institution', 'faculty', 'student', 'lms']],
  [10, 'D2', 'resource-accessibility-availability', 'Resource Accessibility & Availability', 'Students can actually access the resources they need. Existence ≠ accessibility ≠ use.', ['student', 'faculty', 'institution', 'lms'], true],
  [11, 'D2', 'learning-technology-integration', 'Learning Technology Integration', 'Technology is meaningfully integrated into teaching, as declared, as used by lecturers, as experienced by students and as recorded by systems.', ['faculty', 'student', 'institution', 'observation', 'lms'], true],
  [12, 'D2', 'academic-support', 'Academic Support', 'Students can obtain useful academic guidance and support.', ['student', 'institution', 'faculty']],
  [13, 'D2', 'learning-environment-suitability', 'Learning Environment Suitability', 'Physical and digital environments are appropriate for the learning activities expected.', ['student', 'faculty', 'observation', 'institution']],
  [14, 'D2', 'learning-continuity', 'Learning Continuity', 'Learning can continue during disruptions.', ['institution', 'faculty', 'student', 'lms']],
  // Domain 3 — Instructional Practice
  [15, 'D3', 'instructional-planning', 'Instructional Planning', 'Teaching is planned around outcomes, content, activities and assessment.', ['faculty', 'institution', 'artefact']],
  [16, 'D3', 'instructional-clarity', 'Instructional Clarity', 'Explanations, instructions and teaching are understandable.', ['student', 'faculty', 'observation', 'artefact'], true],
  [17, 'D3', 'pedagogical-effectiveness', 'Pedagogical Effectiveness', 'Teaching methods appropriately support the intended learning.', ['faculty', 'student', 'observation']],
  [18, 'D3', 'active-learning-engagement', 'Active Learning & Engagement', 'Students have meaningful opportunities to participate, practise, discuss, solve problems and collaborate. Opportunity provided ≠ participation experienced.', ['faculty', 'student', 'observation'], true],
  [19, 'D3', 'cognitive-challenge', 'Cognitive Challenge', 'Instruction requires appropriate intellectual complexity.', ['student', 'faculty', 'observation', 'artefact']],
  [20, 'D3', 'application-relevance', 'Application & Relevance', 'Students are given opportunities to connect knowledge to practical and professional contexts.', ['student', 'faculty']],
  [21, 'D3', 'instructional-responsiveness', 'Instructional Responsiveness', 'Teaching responds to questions, misunderstanding, performance and learning needs.', ['student', 'faculty']],
  [22, 'D3', 'faculty-capability-development', 'Faculty Capability & Development', 'Faculty possess relevant teaching capability and undertake development.', ['faculty', 'institution']],
  [23, 'D3', 'instructional-innovation', 'Instructional Innovation', 'Faculty adopt and evaluate appropriate new instructional approaches.', ['faculty', 'institution']],
  [24, 'D3', 'instructional-consistency', 'Instructional Consistency', 'Teaching is delivered reliably as scheduled.', ['records', 'faculty', 'institution']],
  // Domain 4 — Student Learning Experience & Engagement
  [25, 'D4', 'learning-expectations-clarity', 'Learning Expectations & Clarity', 'Students understand what they are expected to learn and do.', S],
  [26, 'D4', 'perceived-learning-value', 'Perceived Learning Value', 'Students perceive learning activities and content as useful and worthwhile.', S],
  [27, 'D4', 'student-engagement-participation', 'Student Engagement & Participation', 'Students participate and engage with learning: attendance, participation, completion, activity. Engagement evidence is not proof of learning.', ['student', 'records', 'lms'], true],
  [28, 'D4', 'intellectual-challenge', 'Intellectual Challenge', 'Students experience appropriate intellectual demand.', S],
  [29, 'D4', 'workload-manageability', 'Workload & Manageability', 'Academic workload is manageable and appropriately distributed.', S],
  [30, 'D4', 'learning-support-experience', 'Learning Support Experience', 'Students experience support as accessible, useful and responsive.', S],
  [31, 'D4', 'academic-belonging', 'Academic Belonging', 'Students feel connected to their academic learning community.', S],
  [32, 'D4', 'learner-agency', 'Learner Agency', 'Students have meaningful responsibility and choice in learning.', S],
  [33, 'D4', 'accessibility-inclusivity', 'Accessibility & Inclusivity', 'Learning is accessible and inclusive regardless of individual needs or circumstances.', ['student', 'institution']],
  [34, 'D4', 'learner-confidence-self-efficacy', 'Learner Confidence & Self-Efficacy', 'Students believe they can successfully perform the academic tasks expected of them.', S],
  [35, 'D4', 'student-satisfaction', 'Student Satisfaction', "The student's overall evaluation of their experience. A legitimate variable of interest; not a measure of academic quality.", S, true],
  // Domain 5 — Assessment & Feedback
  [36, 'D5', 'assessment-alignment', 'Assessment Alignment', 'Assessment tasks measure the intended learning outcomes.', ['faculty', 'artefact', 'institution'], true],
  [37, 'D5', 'cognitive-demand', 'Cognitive Demand', 'Assessment requires appropriate cognitive levels (question and task cognitive level).', ['artefact', 'faculty', 'student'], true],
  [38, 'D5', 'assessment-breadth-coverage', 'Assessment Breadth & Coverage', 'Assessments adequately cover the curriculum and outcomes.', ['artefact', 'curriculum', 'institution']],
  [39, 'D5', 'authenticity-application', 'Authenticity & Application', 'Assessments require meaningful application where appropriate.', ['artefact', 'faculty', 'student']],
  [40, 'D5', 'assessment-variety', 'Assessment Variety', 'Assessment methods are appropriately varied.', ['artefact', 'faculty', 'student']],
  [41, 'D5', 'assessment-transparency', 'Assessment Transparency', 'Students understand assessment requirements and criteria; rubrics are available.', ['institution', 'artefact', 'student', 'faculty'], true],
  [42, 'D5', 'assessment-reliability-consistency', 'Assessment Reliability & Consistency', 'Assessment decisions are sufficiently consistent.', ['institution', 'records', 'student']],
  [43, 'D5', 'moderation-quality-assurance', 'Moderation & Quality Assurance', 'Assessment and marking undergo appropriate moderation and review.', ['institution', 'artefact'], true],
  [44, 'D5', 'feedback-quality', 'Feedback Quality', 'Feedback is specific, useful and supports improvement in subsequent work.', ['student', 'faculty', 'records'], true],
  [45, 'D5', 'feedback-timeliness', 'Feedback Timeliness', 'Feedback reaches students in time to inform subsequent learning (turnaround from submission to release).', ['records', 'student', 'faculty', 'institution'], true],
  [46, 'D5', 'assessment-integrity', 'Assessment Integrity', 'Assessment is secure, fair and protected against misconduct.', ['institution', 'records']],
  // Domain 6 — Learning Outcomes & Student Progression
  [47, 'D6', 'knowledge-understanding', 'Knowledge & Understanding', 'Students demonstrate relevant knowledge and understanding.', ['records', 'artefact'], true],
  [48, 'D6', 'application-competence', 'Application & Competence', 'Students can apply knowledge to problems and tasks (demonstrated, not merely offered).', ['records', 'artefact'], true],
  [49, 'D6', 'higher-order-thinking', 'Higher-Order Thinking', 'Students demonstrate analysis, evaluation, synthesis or equivalent higher-order capability.', ['records', 'artefact'], true],
  [50, 'D6', 'practical-professional-capability', 'Practical & Professional Capability', 'Students demonstrate expected practical, technical or professional competence.', ['records', 'artefact', 'faculty']],
  [51, 'D6', 'academic-achievement', 'Academic Achievement', 'Students achieve expected academic performance (CA average, grades, pass rate, distribution).', ['records'], true],
  [52, 'D6', 'learning-progression', 'Learning Progression', 'Students demonstrate development over time.', ['records']],
  [53, 'D6', 'completion-continuation', 'Completion & Continuation', 'Students continue and complete programmes and courses.', ['records', 'institution']],
  [54, 'D6', 'academic-risk', 'Academic Risk', 'Students or cohorts display indicators of elevated risk.', ['records', 'lms', 'institution']],
  [55, 'D6', 'learning-engagement-indicators', 'Learning Engagement Indicators', 'Behavioural interaction with learning activities: attendance, LMS activity, completion, participation.', ['records', 'lms']],
  [56, 'D6', 'graduate-exit-outcomes', 'Graduate / Exit Outcomes', 'Graduates demonstrate expected exit-level capabilities and relevant post-programme outcomes.', ['records', 'institution']],
  // Domain 7 — Academic Assurance & Continuous Improvement
  [57, 'D7', 'academic-governance', 'Academic Governance', 'Appropriate structures, responsibilities and decision-making mechanisms exist.', ['institution']],
  [58, 'D7', 'quality-assurance-processes', 'Quality Assurance Processes', 'Formal quality processes exist and are actually used.', ['institution', 'records']],
  [59, 'D7', 'evidence-integrity', 'Evidence Integrity', 'Quality data is accurate, traceable, complete and appropriately governed.', ['institution', 'records']],
  [60, 'D7', 'monitoring-review', 'Monitoring & Review', 'Academic performance and quality are routinely monitored and reviewed.', ['institution', 'records'], true],
  [61, 'D7', 'stakeholder-feedback', 'Stakeholder Feedback', 'Stakeholder perspectives are systematically gathered and considered.', ['institution']],
  [62, 'D7', 'quality-issue-identification', 'Quality Issue Identification', 'The institution can detect significant quality problems.', ['institution'], true],
  [63, 'D7', 'root-cause-analysis', 'Root-Cause Analysis', 'The institution investigates underlying causes rather than symptoms.', ['institution']],
  [64, 'D7', 'corrective-action', 'Corrective Action', 'Identified problems lead to specific actions with ownership and timelines.', ['institution', 'records']],
  [65, 'D7', 'continuous-improvement', 'Continuous Improvement', 'Evidence and review produce iterative improvement.', ['institution', 'records']],
  [66, 'D7', 'intervention-effectiveness', 'Intervention Effectiveness', 'Interventions produce measurable improvement in targeted problems.', ['records', 'institution']],
  [67, 'D7', 'quality-culture', 'Quality Culture', 'Staff and institutional actors treat quality as an ongoing evidence-based improvement responsibility.', ['institution', 'faculty']],
];

export const constructs: Construct[] = rows.map(([number, domainId, id, name, definition, sources, instrumented]) => ({
  number,
  domainId,
  id,
  name,
  definition,
  sources,
  instrumented: Boolean(instrumented),
}));

export const constructById = (id: string): Construct => {
  const c = constructs.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown construct ${id}`);
  return c;
};

export const constructsInDomain = (domainId: DomainId): Construct[] => constructs.filter((c) => c.domainId === domainId);

export const instrumentedCount = constructs.filter((c) => c.instrumented).length;
export const constructCount = constructs.length;
