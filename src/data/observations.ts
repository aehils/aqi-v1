// Teaching observation records (class A).

export interface ObservationRecord {
  id: string;
  week: number;
  observer: string;
  clarityRating: 'Below expectation' | 'Meets expectation' | 'Exceeds expectation';
  note: string;
}

export const observations: ObservationRecord[] = [
  { id: 'OBS-1', week: 3, observer: 'Departmental peer reviewer', clarityRating: 'Meets expectation', note: 'Explanations sequenced from pathway overview to regulation; worked example on the board.' },
  { id: 'OBS-2', week: 6, observer: 'Faculty teaching and learning committee', clarityRating: 'Exceeds expectation', note: 'Clear signposting of learning outcomes at the start; misconceptions addressed directly.' },
  { id: 'OBS-3', week: 10, observer: 'Departmental peer reviewer', clarityRating: 'Meets expectation', note: 'Content clear; limited opportunity for questions given room occupancy.' },
];
