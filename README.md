# AQIP — Academic Quality Intelligence Platform (interactive demo)

A working slice of AQIP: a viewer picks a track, answers a short questionnaire drawn from
the AQIP instruments, receives an immediate report on their own responses, and then sees
those responses folded into a simulated evidence base and read against the quality model.

> AQIP is not a questionnaire. The questionnaire is one evidence source feeding a quality model.

The evaluation exists to answer one question — *why do people not walk away with useful
skills from what they learn in school?* — and the demo follows it along a five-link
transfer chain: intention → demand → practice → correction → capability. The chain is
resolved live in `src/data/inquiry.ts` and `src/engine/report.ts`, and the interface names
the first link that is cut.

**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** records the measurement framework, the
architecture decisions and their consequences — read that for what is going on under the hood.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check and production build
npm run check   # re-derives the seed values and prints them for hand-checking
```

## What it demonstrates

The demo walks one course end to end: track selection → questionnaire → response validation
→ your own report → evidence assembly → multi-perspective comparison → findings with
traceable evidence → recommendations and re-measurement.

- **Two tracks: student and lecturer.** Academic and administrative staff are an evidence
  source, not a participant track — their returns on governance, declared provision,
  moderation and monitoring sit in the base and are still read against both tracks. The
  narrowing is enforced by the type system: `Role` excludes `institution`, while
  `SourceGroup` does not.
- **The viewer gets a report before the course does.** The immediate report reads their own
  answers back against the cohort, states what their instrument can and cannot reach, and
  says plainly that it is not a quality verdict. The course profile that follows is
  synthesised from both tracks together with records, artefacts, LMS data, observations and
  the curriculum document.
- **Responses are validated against themselves.** On the crucial readings, each respondent
  answers twice: once as a judgement, once anchored to a quantity, a specific occasion, or
  what followed from it — the principle personality inventories and situational-judgement
  tests use. Both answers are mapped to one 1–5 scale and the *signed* gap is read. A
  scattered gap is noise; a cohort-wide gap with a consistent sign is a measurement bias and
  is reported as such. Contradicted readings are flagged, never dropped or silently
  reweighted.

- **Forced-choice scales.** The neutral midpoint is removed from the student rating items,
  because "neither" carries no reading. The remaining points keep their original 1–5
  positions (values 1, 2, 4, 5 — there is no 3) so those items stay comparable with the
  five-point lecturer items and with the scale the validators map on to.
- **No single quality score.** Quality is reported as a profile across seven domains with
  explicit signal bands and explicit evidence.
- **Everything is traceable.** Every figure on screen resolves from `src/data/` through
  `src/engine/`. No number is a literal in a component.
- **Evidence, finding and hypothesis are separate layers**, labelled differently and never
  blurred. Association is never presented as causation.
- **Cross-source comparison is the point.** Student, lecturer and administrative evidence is
  set against institutional records, assessment artefacts, an LMS extract and observation
  records, with the divergence threshold stated in the interface. Three of the six validator
  pairs also carry an independent, non-respondent reading of the same quantity, so the
  self-check can itself be adjudicated.
- **The viewer's own response enters the evidence base** through the same aggregation as every
  other record, and the interface says plainly how little it moved.

## Structure

```
src/
  data/        course, the overarching question and transfer chain, domains, the 67-construct
               registry, indicators, validator pairs, seeded responses, records, artefacts,
               findings, recommendations
  instruments/ the demo questionnaires, wording and IDs verbatim from the instruments, plus
               the anchored validator items
  engine/      aggregation, banding, cross-source comparison, response validation, the
               transfer chain and viewer report, trigger evaluation, session
  components/  shell, questionnaire, report, charts, intelligence, findings, model,
               recommendations
  styles/      design tokens and one stylesheet
```

Charts are hand-rolled SVG. There is no backend, no database and no external API.

## Simulated data

All institutional data, records, artefacts and responses are simulated. Montessori University
and the course BCH 305 are fictional. The demo instruments 24 of the 67 constructs in the model;
the remainder exist in the registry and drive the "insufficient evidence" states.

Validator answers in the seeded base are generated *conditionally on each respondent's own
primary answer* — an offset drawn from a kernel in `src/data/responses.student.ts`, or given
per respondent in `src/data/responses.faculty.ts`. No corroboration rate or directional bias
is written down anywhere; `npm run check` prints what the engine computes from the seed.
