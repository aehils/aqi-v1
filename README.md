# AQIP — Academic Quality Intelligence Platform (interactive demo)

A working slice of AQIP: a viewer picks a role, answers a short questionnaire drawn from
the AQIP instruments, and their response is folded into a simulated evidence base that is
then read against the quality model.

> AQIP is not a questionnaire. The questionnaire is one evidence source feeding a quality model.

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

The demo walks one course end to end: role selection → questionnaire → evidence assembly →
multi-perspective comparison → findings with traceable evidence → recommendations and
re-measurement.

- **No single quality score.** Quality is reported as a profile across seven domains with
  explicit signal bands and explicit evidence.
- **Everything is traceable.** Every figure on screen resolves from `src/data/` through
  `src/engine/`. No number is a literal in a component.
- **Evidence, finding and hypothesis are separate layers**, labelled differently and never
  blurred. Association is never presented as causation.
- **Cross-source comparison is the point.** Students, lecturers and administrators are set
  against institutional records, assessment artefacts, an LMS extract and observation records,
  with the divergence threshold stated in the interface.
- **The viewer's own response enters the evidence base** through the same aggregation as every
  other record, and the interface says plainly how little it moved.

## Structure

```
src/
  data/        course, domains, the 67-construct registry, indicators, seeded responses,
               records, artefacts, findings, recommendations
  instruments/ the three demo questionnaires, wording and IDs verbatim from the instruments
  engine/      aggregation, banding, cross-source comparison, trigger evaluation, session
  components/  shell, questionnaire, charts, intelligence, findings, model, recommendations
  styles/      design tokens and one stylesheet
```

Charts are hand-rolled SVG. There is no backend, no database and no external API.

## Simulated data

All institutional data, records, artefacts and responses are simulated. Montessori University
and the course BCH 305 are fictional. The demo instruments 24 of the 67 constructs in the model;
the remainder exist in the registry and drive the "insufficient evidence" states.
