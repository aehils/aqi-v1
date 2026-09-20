import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { AnswerValue, Question } from '../../data/types';
import type { Action, State } from '../../state/reducer';
import { instruments } from '../../instruments';
import { indicatorById, evidenceClassLabel } from '../../data/indicators';
import { constructById } from '../../data/constructs';
import { domainById } from '../../data/domains';

const evidenceTypeLabel: Record<string, string> = {
  direct: 'Direct evidence',
  perceptual: 'Perceptual evidence',
  behavioural: 'Behavioural evidence',
  variable: 'Variable of interest',
  derived: 'Derived',
  artefact: 'Artefact evidence',
  record: 'Record evidence',
};

const isAnswered = (q: Question, a: AnswerValue | undefined): boolean => {
  if (a === undefined) return false;
  switch (q.type) {
    case 'single':
      return typeof a === 'string' && a.length > 0;
    case 'multi':
      return Array.isArray(a) && a.length > 0;
    case 'matrix':
      return typeof a === 'object' && !Array.isArray(a) && (q.rows ?? []).every((r) => Boolean(a[r.key]));
    case 'open':
      return typeof a === 'string' && a.trim().length > 0;
  }
};

export const Questionnaire = ({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) => {
  const questions = instruments[state.role!];
  const q = questions[state.questionIndex];
  const answer = state.answers[q.id];
  const answered = isAnswered(q, answer);
  const last = state.questionIndex === questions.length - 1;
  const [activeRow, setActiveRow] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setActiveRow(0);
    headingRef.current?.focus();
  }, [q.id]);

  const move = useCallback(() => {
    if (last) dispatch({ type: 'SUBMIT' });
    else dispatch({ type: 'NEXT_QUESTION', total: questions.length });
  }, [last, dispatch, questions.length]);

  const advance = useCallback(() => {
    if (!answered) return;
    move();
  }, [answered, move]);

  // Open responses are qualitative evidence and are never required. Skipping
  // leaves no answer recorded, rather than recording an empty one.
  const skippable = q.type === 'open';

  const setAnswer = useCallback((value: AnswerValue) => dispatch({ type: 'ANSWER', questionId: q.id, value }), [dispatch, q.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inText = Boolean(target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'checkbox')));
      if (e.key === 'Enter' && !inText) {
        e.preventDefault();
        advance();
        return;
      }
      if (inText) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (q.type === 'single') {
        const opt = (q.options ?? [])[n - 1];
        if (opt) setAnswer(opt.key);
      } else if (q.type === 'multi') {
        const opt = (q.options ?? [])[n - 1];
        if (!opt) return;
        const current = Array.isArray(answer) ? answer : [];
        setAnswer(current.includes(opt.key) ? current.filter((k) => k !== opt.key) : [...current, opt.key]);
      } else if (q.type === 'matrix') {
        const opt = (q.options ?? [])[n - 1];
        const row = (q.rows ?? [])[activeRow];
        if (!opt || !row) return;
        const current = answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
        setAnswer({ ...current, [row.key]: opt.key });
        setActiveRow((r) => Math.min(r + 1, (q.rows ?? []).length - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, answer, advance, setAnswer, activeRow]);

  const lens = useMemo(() => {
    if (!q.indicatorId) return null;
    const ind = indicatorById(q.indicatorId);
    const construct = ind.constructId ? constructById(ind.constructId) : null;
    const domain = construct ? domainById(construct.domainId) : null;
    return { ind, construct, domain };
  }, [q]);

  return (
    <div className="column screen">
      <div className="q-meta">
        <div className="q-head">
          <label className="lens">
            <input
              type="checkbox"
              role="switch"
              checked={state.evidenceLens}
              onChange={() => dispatch({ type: 'TOGGLE_LENS' })}
            />
            <span className="switch" aria-hidden="true" />
            Evidence lens
          </label>
          <span className="q-count">
            Question {state.questionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="q-progress" aria-hidden="true">
          <span style={{ width: `${(100 * state.questionIndex) / questions.length}%` }} />
        </div>
        {state.evidenceLens && (
          <div className="lens-panel" aria-live="polite">
            <div className="chip-strip">
              {lens?.domain && <span className="chip">Domain {lens.domain.number} · {lens.domain.name}</span>}
              {lens?.construct && <span className="chip">{lens.construct.name}</span>}
              {lens && <span className="chip">Indicator {lens.ind.id}</span>}
              {lens && <span className="chip">{evidenceTypeLabel[lens.ind.evidenceType]}</span>}
              {lens && <span className="chip">{evidenceClassLabel[lens.ind.evidenceClass]}</span>}
              {!lens && q.constructId && <span className="chip">{constructById(q.constructId).name}</span>}
              {!lens && <span className="chip">Qualitative evidence · not scored</span>}
            </div>
            {q.whyThisRespondent && <p className="small muted">Why this respondent: {q.whyThisRespondent}</p>}
          </div>
        )}
      </div>

      <div className="q-wrap">
      <h1 className="q-text" ref={headingRef} tabIndex={-1}>
        {q.text}
      </h1>
      <p className="section-label screen__eyebrow q-section">{q.section}</p>
      {q.note && <p className="q-note">{q.note}</p>}

      {q.type === 'single' && (
        <ul className="options" role="radiogroup" aria-label={q.text}>
          {(q.options ?? []).map((o, i) => (
            <li key={o.key}>
              <button type="button" role="radio" aria-checked={answer === o.key} className={`option${o.scoring === false ? ' option--escape' : ''}`} onClick={() => setAnswer(o.key)}>
                <span className="option__key" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="option__body">
                  <strong>{o.label}</strong>
                  {o.scoring === false && <span>Not scored · recorded separately</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {q.type === 'multi' && (
        <ul className="options" aria-label={q.text}>
          {(q.options ?? []).map((o, i) => {
            const current = Array.isArray(answer) ? answer : [];
            const on = current.includes(o.key);
            return (
              <li key={o.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  className="option"
                  onClick={() => setAnswer(on ? current.filter((k) => k !== o.key) : [...current, o.key])}
                >
                  <span className="option__key" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="option__body">
                    <strong>{o.label}</strong>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {q.type === 'matrix' && (
        <table className="matrix">
          <thead>
            <tr>
              <th scope="col">Resource / technology</th>
              {(q.options ?? []).map((o, i) => (
                <th scope="col" key={o.key}>
                  <span className="muted">{i + 1}</span>
                  <br />
                  {o.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(q.rows ?? []).map((row, ri) => {
              const current = answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
              return (
                <tr key={row.key} className={ri === activeRow ? 'is-active' : undefined} role="radiogroup" aria-label={row.label}>
                  <td>{row.label}</td>
                  {(q.options ?? []).map((o) => (
                    <td key={o.key}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={current[row.key] === o.key}
                        aria-label={`${row.label}: ${o.label}`}
                        className="matrix__cell"
                        onClick={() => {
                          setAnswer({ ...current, [row.key]: o.key });
                          setActiveRow(Math.min(ri + 1, (q.rows ?? []).length - 1));
                        }}
                        onFocus={() => setActiveRow(ri)}
                      >
                        {current[row.key] === o.key ? '●' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {q.type === 'open' && (
        <textarea
          className="q-open"
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              advance();
            }
          }}
          placeholder="Your answer is stored as qualitative evidence. It is not scored."
          aria-label={q.text}
        />
      )}

      <div className="q-actions screen__tail">
        <button type="button" className="btn btn--secondary" onClick={() => dispatch({ type: 'PREV_QUESTION' })}>
          Back
        </button>
        <button type="button" className="btn" disabled={!answered} onClick={advance}>
          {last ? 'Submit responses' : 'Continue'}
        </button>
        {skippable && (
          <button type="button" className="btn--skip" onClick={move}>
            Skip
          </button>
        )}
        <span className="q-hint">
          {q.type === 'single' && 'Number keys select · Enter continues'}
          {q.type === 'multi' && 'Number keys toggle · Enter continues'}
          {q.type === 'matrix' && 'Number keys fill the highlighted row · Enter continues'}
          {q.type === 'open' && 'Enter continues · Shift+Enter for a new line'}
        </span>
      </div>
      </div>
    </div>
  );
};
