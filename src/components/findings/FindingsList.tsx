import { useState } from 'react';
import type { Dataset } from '../../engine/dataset';
import { buildCourseAnalysis } from '../../engine/courseAnalysis';
import { FindingSummary } from '../intelligence/FindingSummary';
import { analysisCopy, compactActions } from '../../data/analysisPresentation';
import '../report/report.css';
import '../intelligence/analysis.css';
import '../intelligence/exploration.css';
import { domainById } from '../../data/domains';

export const FindingsList = ({ dataset, onOpenFinding }: { dataset: Dataset; onOpenFinding: (id: string) => void; onOpenConstruct: (id: string) => void }) => {
  const analysis = buildCourseAnalysis(dataset);
  const [filter, setFilter] = useState('current');
  const [query, setQuery] = useState('');
  const groups = [
    { id: 'current', label: 'All current', findings: [...analysis.concerns, ...analysis.strengths, ...analysis.questions] },
    { id: 'problem', label: 'Needs attention', findings: analysis.concerns },
    { id: 'strength', label: 'Strengths', findings: analysis.strengths },
    { id: 'relationship', label: 'To investigate', findings: analysis.questions },
    { id: 'inactive', label: 'Not currently supported', findings: analysis.inactive },
  ];
  const visible = groups.find(g => g.id === filter)!.findings.filter(f =>
    `${f.title} ${analysisCopy[f.id]?.title ?? ''} ${f.headline} ${f.domainIds.map(d => domainById(d).name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="column report-page analysis-page findings-page">
    <div className="analysis-toolbar findings-toolbar"><div className="analysis-filters" role="group" aria-label="Filter findings">{groups.map(g => <button type="button" key={g.id} aria-pressed={filter === g.id} onClick={() => setFilter(g.id)}>{g.label} <span>{g.findings.length}</span></button>)}</div>
      <label className="analysis-search">Find a topic<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Feedback, resources, assessment…" /></label>
    </div>
    <p className="analysis-small" role="status">{visible.length} {visible.length === 1 ? 'finding' : 'findings'} shown. {filter === 'inactive' ? 'These findings do not meet the current evidence rules.' : 'Based on the current course evidence.'}</p>
    <div className="analysis-finding-grid">{visible.map(f => <FindingSummary key={f.id} finding={f} dataset={dataset} onOpenFinding={onOpenFinding} inactive={filter === 'inactive'} action={analysis.actions.find(a => a.findingId === f.id) ? compactActions[analysis.actions.find(a => a.findingId === f.id)!.id] : undefined} />)}</div>
    {!visible.length && <div className="analysis-empty"><p>No findings match this view.</p><button type="button" className="btn--link" onClick={() => { setQuery(''); setFilter('current'); }}>Reset filters →</button></div>}
  </div>;
};
