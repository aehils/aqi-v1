import type { EvidenceRef, SourceGroup } from '../../data/types';
import type { Dataset } from '../../engine/dataset';
import { distributionFor, selectionsFor, matrixRowsFor } from '../../engine/aggregate';
import { derived, releasesFollowedByTaskWithinWindow } from '../../engine/derived';
import { assessmentEvents, feedbackPolicy, attendanceRegister, resultsExtract, itemPerformance } from '../../data/institutionalData';
import { artefacts, bloomLevelLabels, curriculumDocument, applyPlusLevels } from '../../data/artefacts';
import { lmsExtract } from '../../data/lmsData';
import { observations } from '../../data/observations';
import { course } from '../../data/course';
import { evidenceClassLabel, sourceLabel } from '../../data/indicators';
import { DistributionBars } from '../charts/DistributionBars';
import { TurnaroundHistogram } from '../charts/TurnaroundHistogram';
import { LevelBars } from '../charts/LevelBars';
import { f1, pct } from '../../lib/format';

const Item = ({ evidence: r, children }: { evidence: EvidenceRef; children: React.ReactNode }) => (
  <div className="evidence-item">
    <div className="evidence-item__title">
      <span>{r.title}</span>
      <span className="evidence-tag">
        {sourceLabel[r.source]} · {evidenceClassLabel[r.evidenceClass]}
      </span>
    </div>
    {children}
  </div>
);

const groupWord: Record<SourceGroup, string> = { student: 'students', faculty: 'lecturers', institution: 'administrators' };

export const EvidenceBlock = ({ refs, dataset }: { refs: EvidenceRef[]; dataset: Dataset }) => (
  <div className="evidence-block">
    {refs.map((r) => {
      switch (r.kind) {
        case 'distribution': {
          const d = distributionFor(dataset, r.indicatorId!, r.group!);
          return (
            <Item key={r.id} evidence={r}>
              <DistributionBars rows={d.rows.map((x) => ({ label: x.option.label, count: x.count, share: x.share, scoring: x.scoring, viewer: x.viewer }))} n={d.n} footnote={`${groupWord[r.group!]}`} />
            </Item>
          );
        }
        case 'selection': {
          const s = selectionsFor(dataset, r.indicatorId!, r.group!);
          const rows = s.rows.filter((x) => x.count > 0 || x.viewer).sort((a, b) => b.count - a.count);
          return (
            <Item key={r.id} evidence={r}>
              <DistributionBars rows={rows.map((x) => ({ label: x.option.label, count: x.count, share: x.rate, viewer: x.viewer }))} n={s.n} footnote="select all that apply; options nobody selected are omitted" />
            </Item>
          );
        }
        case 'matrix': {
          const m = matrixRowsFor(dataset, r.indicatorId!, r.group!);
          return (
            <Item key={r.id} evidence={r}>
              <LevelBars max={5} rows={m.rows.map((x) => ({ label: x.row.label, value: x.mean, display: `${f1(x.mean)} / 5${x.viewerValue !== undefined ? ` · you ${x.viewerValue}` : ''}` }))} footnote={`mean frequency of use, 1 = never, 5 = almost every session · n ${m.n}`} />
            </Item>
          );
        }
        case 'turnaround':
          return (
            <Item key={r.id} evidence={r}>
              <TurnaroundHistogram series={assessmentEvents.map((e) => ({ id: e.id, label: e.id, histogram: e.turnaroundHistogram }))} policyDays={feedbackPolicy.turnaroundDays} marker={21} />
              <dl className="records">
                <dt>Median turnaround</dt>
                <dd>{derived('feedback.turnaround.median')} days</dd>
                <dt>Range</dt>
                <dd>
                  {derived('feedback.turnaround.min')}–{derived('feedback.turnaround.max')} days
                </dd>
                <dt>Institutional policy</dt>
                <dd>{feedbackPolicy.turnaroundDays} days</dd>
                <dt>Events exceeding policy</dt>
                <dd>{pct(derived('feedback.turnaround.pct_over_policy'))}</dd>
                <dt>Events exceeding 21 days</dt>
                <dd>{pct(derived('feedback.turnaround.pct_over_21'))}</dd>
                <dt>Feedback events</dt>
                <dd>{derived('feedback.turnaround.n')} across {assessmentEvents.length} assessments</dd>
              </dl>
            </Item>
          );
        case 'schedule': {
          const join = releasesFollowedByTaskWithinWindow();
          return (
            <Item key={r.id} evidence={r}>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th className="num">Due (day)</th>
                      <th className="num">Weight</th>
                      <th>Next task</th>
                      <th className="num">Earliest gap after release</th>
                      <th className="num">Followed within {feedbackPolicy.usableWindowDays} days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentEvents.map((e) => {
                      const pe = join.perEvent.find((x) => x.eventId === e.id)!;
                      return (
                        <tr key={e.id}>
                          <td>{e.title}</td>
                          <td className="num">{e.dueDay}</td>
                          <td className="num">{e.weight}%</td>
                          <td>{pe.nextTask ?? 'None'}</td>
                          <td className="num">{pe.earliestGapDays === null ? '—' : pe.earliestGapDays < 0 ? `${-pe.earliestGapDays} days before release` : `${pe.earliestGapDays} days`}</td>
                          <td className="num">
                            {pe.withinWindow} of {pe.releases}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="small muted">
                Derived by joining each feedback-release date (submission day plus recorded turnaround) to the due date of the next assessment. Across {join.total} releases, {join.count} were followed by a task within the {feedbackPolicy.usableWindowDays}-day window. No respondent reported this; no questionnaire asked for it.
              </p>
            </Item>
          );
        }
        case 'artefact':
          return (
            <Item key={r.id} evidence={r}>
              <LevelBars
                rows={(Object.keys(bloomLevelLabels) as (keyof typeof bloomLevelLabels)[]).map((k) => {
                  const marks = artefacts.reduce((s, a) => s + a.marksByLevel[k], 0);
                  const total = artefacts.reduce((s, a) => s + a.totalMarks, 0);
                  return { label: bloomLevelLabels[k], value: (100 * marks) / total, display: `${marks} of ${total} marks · ${Math.round((100 * marks) / total)}%` };
                })}
                footnote={`${artefacts.length} artefacts: ${artefacts.map((a) => `${a.title} (${a.totalMarks} marks${a.rubricPresent ? ', rubric present' : ', no rubric'})`).join('; ')}`}
              />
            </Item>
          );
        case 'items':
          return (
            <Item key={r.id} evidence={r}>
              <LevelBars
                rows={[
                  { label: 'Recall items', value: derived('items.recall_mean'), display: pct(derived('items.recall_mean')) },
                  { label: 'Application items', value: derived('items.application_mean'), display: pct(derived('items.application_mean')), emphasis: true },
                  { label: 'Analysis items', value: derived('items.analysis_mean'), display: pct(derived('items.analysis_mean')), emphasis: true },
                ]}
                footnote={`Mark-weighted mean score by item level on ${itemPerformance.assessmentId}: ${itemPerformance.items.map((i) => `${i.id} ${i.level} ${i.marks}m ${i.meanPct}%`).join(' · ')}`}
              />
            </Item>
          );
        case 'curriculum':
          return (
            <Item key={r.id} evidence={r}>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>ILO</th>
                      <th>Statement</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumDocument.ilos.map((i) => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.text}</td>
                        <td>{i.level}{applyPlusLevels.includes(i.level) ? ' · Apply+' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small muted">
                {derived('curriculum.ilo_apply_plus_count')} of {derived('curriculum.ilo_count')} ILOs at Apply level or above · last formal curriculum review {curriculumDocument.lastFormalReview}.
              </p>
            </Item>
          );
        case 'lms':
          return (
            <Item key={r.id} evidence={r}>
              <dl className="records">
                <dt>Students accessing the course space at least once</dt>
                <dd>
                  {derived('lms.active_count')} of {lmsExtract.enrolment} · {pct(derived('lms.active_pct'))}
                </dd>
                <dt>Median sessions per active user</dt>
                <dd>{derived('lms.median_sessions')}</dd>
                <dt>Discussion posts</dt>
                <dd>{derived('lms.discussion_posts')}</dd>
                <dt>Materials posted by teaching team</dt>
                <dd>{lmsExtract.materialsPosted}</dd>
                <dt>Extract</dt>
                <dd>{lmsExtract.extractNote}</dd>
              </dl>
            </Item>
          );
        case 'observation':
          return (
            <Item key={r.id} evidence={r}>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Record</th>
                      <th>Week</th>
                      <th>Observer</th>
                      <th>Clarity</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td className="num">{o.week}</td>
                        <td>{o.observer}</td>
                        <td>{o.clarityRating}</td>
                        <td className="muted">{o.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Item>
          );
        case 'attendance':
          return (
            <Item key={r.id} evidence={r}>
              <dl className="records">
                <dt>Mean attendance</dt>
                <dd>{pct(derived('attendance.mean_pct'))} across {attendanceRegister.sessions.length} sessions</dd>
              </dl>
            </Item>
          );
        case 'results':
          return (
            <Item key={r.id} evidence={r}>
              <dl className="records">
                <dt>CA average</dt>
                <dd>{resultsExtract.caAverage}%</dd>
                <dt>Pass rate</dt>
                <dd>{pct(derived('results.pass_rate'))}</dd>
              </dl>
            </Item>
          );
        case 'room':
          return (
            <Item key={r.id} evidence={r}>
              <dl className="records">
                <dt>Enrolment</dt>
                <dd>{course.enrolment}</dd>
                <dt>Teaching rooms</dt>
                <dd>{course.rooms.map((x) => `${x.id} (${x.capacity})`).join(', ')}</dd>
                <dt>Enrolment relative to largest room</dt>
                <dd>{derived('room.capacity_ratio').toFixed(2)}×</dd>
                <dt>Teaching team</dt>
                <dd>{course.teachingTeam.total} ({course.teachingTeam.note})</dd>
              </dl>
            </Item>
          );
        case 'policy':
          return (
            <Item key={r.id} evidence={r}>
              <p className="small">{feedbackPolicy.source}: {feedbackPolicy.turnaroundDays}-day turnaround.</p>
            </Item>
          );
      }
    })}
  </div>
);
