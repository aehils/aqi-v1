import type { ResponseRecord, SourceGroup } from '../data/types';
import { studentResponses } from '../data/responses.student';
import { facultyResponses } from '../data/responses.faculty';
import { institutionResponses } from '../data/responses.institution';

/** The evidence base the engine operates on. Records/artefacts are static modules; responses vary with the viewer. */
export interface Dataset {
  responses: Record<SourceGroup, ResponseRecord[]>;
}

export const seedDataset: Dataset = {
  responses: {
    student: studentResponses,
    faculty: facultyResponses,
    institution: institutionResponses,
  },
};

export const groupN = (ds: Dataset, group: SourceGroup): number => ds.responses[group].length;
