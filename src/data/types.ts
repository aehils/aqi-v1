// Core types for the AQIP demo. Everything displayed in the UI resolves
// from data/ through engine/ using these shapes.

export type DomainId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7';

export type Band = 'strong' | 'adequate' | 'attention' | 'conflicting' | 'insufficient';

/** Data-availability class (evidence mapping §13). */
export type EvidenceClass = 'A' | 'B' | 'C' | 'D';

/** Respondent groups that complete an instrument. */
export type SourceGroup = 'student' | 'faculty' | 'institution';

/** Every source type that can evidence a construct. */
export type SourceType =
  | SourceGroup
  | 'records'
  | 'artefact'
  | 'lms'
  | 'observation'
  | 'curriculum';

export type EvidenceType =
  | 'direct'
  | 'perceptual'
  | 'behavioural'
  | 'derived'
  | 'artefact'
  | 'record'
  | 'variable';

export type Role = SourceGroup;

export interface Domain {
  id: DomainId;
  number: number;
  name: string;
  shortName: string;
  coreQuestion: string;
}

export interface Construct {
  id: string;
  number: number;
  domainId: DomainId;
  name: string;
  definition: string;
  sources: SourceType[];
  instrumented: boolean;
}

export type QuestionType = 'single' | 'multi' | 'matrix' | 'open';

export interface Option {
  key: string;
  label: string;
  /** Scale value for scoring options. */
  value?: number;
  /** false for escape options ("Not sure", "I have not received feedback"). */
  scoring?: boolean;
}

export interface Question {
  id: string;
  number: number;
  section: string;
  text: string;
  note?: string;
  type: QuestionType;
  options?: Option[];
  rows?: Option[];
  indicatorId?: string;
  constructId?: string;
  whyThisRespondent?: string;
}

export type AnswerValue = string | string[] | Record<string, string>;

export interface ResponseRecord {
  id: string;
  group: SourceGroup;
  answers: Record<string, AnswerValue>;
  isViewer?: boolean;
}

export type Measure = 'scale' | 'multi' | 'matrix' | 'categorical' | 'derived';

export interface Indicator {
  id: string;
  constructId: string | null;
  label: string;
  source: SourceType;
  evidenceClass: EvidenceClass;
  evidenceType: EvidenceType;
  measure: Measure;
  questionId?: string;
  derivedKey?: string;
  unit?: string;
  note?: string;
}

// ----- Metric specifications (resolved live by the engine) -----

export type MetricSpec =
  | { kind: 'mean'; indicatorId: string; group: SourceGroup }
  | { kind: 'matrix'; indicatorId: string; group: SourceGroup; row: string }
  | { kind: 'selection'; indicatorId: string; group: SourceGroup; option: string }
  | { kind: 'categorical'; indicatorId: string; group: SourceGroup; map: Record<string, number> }
  | { kind: 'derived'; key: string }
  | { kind: 'diff'; a: MetricSpec; b: MetricSpec; abs?: boolean };

export type Comparator = '<=' | '>=' | '<' | '>' | '==';

export interface TriggerTerm {
  id: string;
  label: string;
  expression: string;
  metric: MetricSpec;
  op: Comparator;
  threshold: number | { derived: string };
  unit?: string;
}

/** A single evidence reading bound to a construct for banding/comparison. */
export interface Reading {
  source: SourceType;
  label: string;
  metric: MetricSpec;
  direction: 'higher' | 'lower';
  good: number;
  bad: number;
  unit?: string;
  /** 1–5 respondent scale readings are comparable across sources. */
  onFivePoint?: boolean;
  /** Optional display override (e.g. modal categorical label). */
  display?: MetricSpec;
}

export type Signal = 'positive' | 'neutral' | 'negative';

export interface EvidenceRef {
  id: string;
  kind: 'turnaround' | 'schedule' | 'artefact' | 'items' | 'lms' | 'curriculum' | 'observation' | 'attendance' | 'results' | 'room' | 'distribution' | 'matrix' | 'selection' | 'policy';
  title: string;
  /** For distribution/selection/matrix kinds. */
  indicatorId?: string;
  group?: SourceGroup;
  evidenceClass: EvidenceClass;
  source: SourceType;
}

export type FindingKind = 'problem' | 'strength' | 'relationship';

/** A figure shown for a finding on the Overview, resolved live from the dataset. */
export interface FindingMetric {
  label: string;
  metric: MetricSpec;
  unit?: string;
}

export interface LineageStep {
  domainId: DomainId;
  constructId: string;
  dimension: string;
  indicatorId: string;
  evidence: string;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  domainIds: DomainId[];
  constructIds: string[];
  band: Band;
  title: string;
  headline: string;
  overviewHeadline?: string;
  trigger: {
    plain: string;
    expression: string;
    terms: TriggerTerm[];
  };
  indicatorIds: string[];
  evidenceRefs: EvidenceRef[];
  qualitativeRefs: string[];
  hypothesis: string;
  overviewMetrics: FindingMetric[];
  lineage: LineageStep;
  recommendationIds: string[];
  distinction?: string;
}

export interface Recommendation {
  id: string;
  findingId: string;
  diagnosis: string;
  action: string;
  owner: string;
  remeasure: { metric: MetricSpec; label: string; unit?: string; target: string }[];
  target: string;
  reviewPoint: string;
  breadth: { label: string; share: number };
}

export interface Verbatim {
  id: string;
  group: SourceGroup;
  questionId: string;
  text: string;
  findingIds: string[];
}
