import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { FindingSummary } from '../intelligence/FindingSummary';
import { analysisCopy } from '../../data/analysisPresentation';
import { domainById } from '../../data/domains';

export const FindingsList = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void; onOpenConstruct: (id: string) => void }) => {
  const analysis = buildCourseAnalysis(dataset);
  const [filter, setFilter] = useState('current');
  const [query, setQuery] = useState('');
  const groups = [
    { id: 'current', label: 'All current', findings: analysis.supported },
    { id: 'problem', label: 'Needs attention', findings: analysis.concerns },
    { id: 'strength', label: 'Strengths', findings: analysis.strengths },
    { id: 'relationship', label: 'To investigate', findings: analysis.questions },
    { id: 'inactive', label: 'Not currently supported', findings: analysis.inactive },
  ];
  const visible = groups.find(g => g.id === filter)!.findings.filter(f =>
    `${f.title} ${analysisCopy[f.id]?.title ?? ''} ${f.headline} ${f.domainIds.map(d => domainById(d).name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="column analysis-page">
    <header className="analysis-heading"><p className="section-label">Course analysis · All findings</p><h1>Explore what the evidence supports.</h1><p>Separate concerns, strengths and questions that need investigation. A finding’s status comes from the current evidence; a missing finding is not proof that everything is working.</p></header>
    <div className="analysis-toolbar"><div className="analysis-filters" role="group" aria-label="Filter findings">{groups.map(g => <button type="button" key={g.id} aria-pressed={filter === g.id} onClick={() => setFilter(g.id)}>{g.label} <span>{g.findings.length}</span></button>)}</div>
      <label className="analysis-search">Find a topic<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Feedback, resources, assessment…" /></label>
    </div>
    <p className="analysis-small" role="status">{visible.length} {visible.length === 1 ? 'finding' : 'findings'} shown</p>
    <div className="analysis-finding-grid">{visible.map(f => <FindingSummary key={f.id} finding={f} dataset={dataset} onOpenFinding={onOpenFinding} inactive={filter === 'inactive'} />)}</div>
    {!visible.length && <p className="analysis-empty">No findings match this view. Choose another category or clear the search.</p>}
  </div>;
};
