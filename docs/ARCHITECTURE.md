# AQIP demo — architecture and the framework behind it

This document records what the demo is built to prove, the measurement framework it
implements, the structure that follows from that framework, and the decisions taken along
the way with their consequences. It is the "under the hood" companion to the README.

Everything described here is implemented. Where a rule is stated, the file that enforces it
is named.

---

## 1. The question the system exists to answer

> **Why do people not walk away with useful skills from what they learn in school?**

This is not a framing device. It determines the structure of the analysis.

The usual instrument for answering it — a satisfaction survey — cannot answer it, for a
reason worth stating plainly: satisfaction is a reading of the experience, not of the
capability. A course can be well liked and teach nothing transferable, and on this course it
very nearly is: student satisfaction resolves to **4.0 / 5** while the mean score on
application items resolves to **47%**. Finding `F6` exists precisely to hold those two
numbers next to each other and refuse to reconcile them.

So the demo does not ask whether teaching was good. It follows the chain by which an
intention becomes a capability, and looks for the link where the chain is cut.

### The transfer chain

Defined in [`src/data/inquiry.ts`](../src/data/inquiry.ts), resolved by `readChain()` in
[`src/engine/report.ts`](../src/engine/report.ts).

| # | Link | The question it answers | Read from |
|---|---|---|---|
| 1 | Intention | Does the course intend a capability, or only knowledge? | Curriculum document |
| 2 | Demand | Does the assessment actually require that capability? | Assessment artefacts |
| 3 | Practice | Do students get to do the thing, rather than watch it being done? | Student + lecturer report |
| 4 | Correction | Does feedback arrive while there is still something to apply it to? | Schedule × feedback timestamps |
| 5 | Capability | Can students do it when asked? | Marked item performance |

Each link carries `intact` and `cut` thresholds and a direction. `firstBreak()` returns the
first link that is cut, reading in order, and the interface names it. Against BCH 305 the
chain holds at intention (67% of ILOs at Apply+) and breaks at demand (29% of marks at
Apply+) — everything downstream is then read in that light rather than as independent
failures.

**Why the chain is ordered.** It encodes a dependency, not a checklist. A downstream link
cannot be sound while an upstream one is cut, because the downstream reading is *conditioned*
on the upstream failure: students score 47% on application items partly because only 29% of
marks ever asked them to apply anything. Reporting five independent red flags would invite
five independent interventions, four of which would be wasted. This is why the demo never
reduces to a single score — a mean of the five links would hide the one fact that matters,
which is *where* the break is.

---

## 2. The measurement framework

### 2.1 Domain → construct → indicator → evidence

Four levels, each in its own module, each resolving downward:

```
Domain (7)            data/domains.ts        A question about academic quality
  Construct (67)      data/constructs.ts     A thing that can be evidenced
    Indicator         data/indicators.ts     A specific reading of that thing
      Evidence        data/*.ts, engine/     Where the number comes from
```

A construct is evidenced by *several* indicators from *different* source types. That is the
whole point: `feedback-timeliness` is read from student perception, lecturer-reported
barriers, administrative monitoring policy and the recorded median turnaround, and those four
readings can disagree.

24 of the 67 constructs are instrumented here. The remaining 43 are present in the registry
and deliberately produce `insufficient` bands, because a model that silently omits what it
cannot measure misrepresents its own coverage.

### 2.2 Evidence classes

Every indicator declares where its data comes from (`data/types.ts`, `EvidenceClass`):

- **A** — existing institutional data (registers, results, LMS logs, observation records)
- **B** — collected through AQIP (the questionnaires)
- **C** — uploaded artefacts (assessment papers, the curriculum document)
- **D** — derived (computed by joining the above)

The class is displayed everywhere the figure is. A class-B perception and a class-A record
are never presented as equivalent, and the strongest findings in the demo are class-D: `F1`'s
headline — no feedback release is followed by a task within the usable window — is not
reported by any respondent. It exists only in the join between the assessment schedule and
the release timestamps, and `releasesFollowedByTaskWithinWindow()` in
[`src/engine/derived.ts`](../src/engine/derived.ts) computes it.

### 2.3 Evidence, finding, hypothesis — three separate layers

Kept apart, labelled differently, never blurred:

- **Evidence** — a resolved number with its source, class and n.
- **Finding** — a named rule that fired against the evidence. The rule, its terms, their
  thresholds and their pass/fail state are all displayed (`engine/triggers.ts`).
- **Hypothesis** — an explanation of *why*, explicitly marked as not established.

`Finding.kind` distinguishes `problem`, `strength` and `relationship`. A `relationship` is
tagged **Association** in the interface and never carries a band, because an association is
not a quality judgement.

### 2.4 Banding, not scoring

`constructBand()` in [`src/engine/bands.ts`](../src/engine/bands.ts) returns one of five
bands — `strong`, `adequate`, `attention`, `conflicting`, `insufficient` — from the resolved
readings, with a rationale string stating how it was reached. `conflicting` is a first-class
outcome: when sources disagree and no source has precedence, the system says so instead of
averaging. Objective source types (`records`, `artefact`, `lms`, `observation`, `curriculum`)
can adjudicate a divergence between respondent groups; respondent groups cannot adjudicate
each other.

### 2.5 Cross-source comparison

[`src/engine/compare.ts`](../src/engine/compare.ts) builds the discrepancy matrix: three
respondent columns plus one objective column per construct, with the divergence threshold
stated in the interface rather than buried. A row is flagged when respondent readings diverge
beyond threshold; the line beneath it says what the objective evidence settles.

---

## 3. Response validation — the layer added for measurement integrity

Cross-source comparison catches sources disagreeing with *each other*. It cannot catch a
source that is internally consistent and wrong — a cohort that uniformly overstates the same
thing looks like agreement.

The fix is the principle personality inventories, situational-judgement tests and aptitude
batteries use: **a self-report cannot be checked against itself, so ask the same thing twice
by different routes and read the gap.**

### 3.1 How a pair is built

Every crucial reading carries a validator item. The primary item asks for a judgement; the
validator asks for something harder to shade:

| Kind | What it asks for | Example |
|---|---|---|
| `behavioural-anchor` | A quantity | "Roughly how many minutes are students doing something other than listening?" |
| `recall-anchor` | One specific, recoverable occasion | "In the most recent test, what did most questions require you to do?" |
| `consequence-anchor` | What followed from it | "The last time you received feedback, what were you able to do with it?" |

Validator options carry `implies` — the value on the primary item's 1–5 scale that the answer
entails ([`src/data/types.ts`](../src/data/types.ts), `Option.implies`). Both answers then sit
on one scale and can be subtracted.

Six pairs are registered in [`src/data/validation.ts`](../src/data/validation.ts) — three on
each track — each declaring what it checks and what a gap in either direction would mean.

### 3.2 How a gap is read

`checkAnswers()` and `cohortValidation()` in
[`src/engine/validate.ts`](../src/engine/validate.ts):

- Gap of **0–1** → corroborated; **2** → marginal; **3+** → contradicted.
- The gap is kept **signed**. This is the load-bearing detail. `|gap|` tells you a respondent
  is inconsistent; the sign tells you *which way*, and a cohort mean signed gap of ±0.4 or
  more is a **directional bias** — a property of the instrument or the population, not of any
  respondent.

Against the seeded base:

| Pair | Corroborated | Mean signed gap | Reads as |
|---|---|---|---|
| Student — cognitive demand | 92% | +0.53 | over-reports |
| Student — feedback quality | 67% | +0.72 | over-reports |
| Student — feedback timeliness | 84% | −0.01 | no bias |
| Lecturer — active learning | 57% | +1.43 | over-reports |
| Lecturer — cognitive demand | 57% | +1.43 | over-reports |
| Lecturer — feedback quality | 0% | +2.71 | over-reports |

The third row is as important as the others: students judging timeliness are *accurate*, and
the layer says so. A validation layer that only ever finds fault is measuring its own
assumptions.

The last row is the strongest result in the demo. Lecturers report, sincerely, that feedback
is designed to improve subsequent work — and when asked when the next task actually fell due,
answer that there was none. Both answers are true. The construct was never a property of the
feedback; it was a property of the calendar.

### 3.3 Disposition of a failed check

**Flagged, never deleted, never silently reweighted.** Stated in the interface, in
`validationDisposition`.

Dropping contradicted responses would be the obvious move and is the wrong one: it discards
exactly the respondents carrying the signal, and it lets an instrument quietly launder its own
bias into a cleaner-looking mean. One respondent disagreeing with themselves is noise. A
cohort disagreeing with itself in one direction is a finding.

### 3.4 Adjudicating the self-check

Three of the six pairs carry an **objective counterpart** — an independent, non-respondent
reading of the same quantity (`ValidationPair.objective`). The lecturer cognitive-demand
validator asks what share of marks require application; the artefact analysis computes that
same share at 29%. So the self-check is not merely internal — it can itself be checked.

---

## 4. Two tracks, three sources

**Decision: student and lecturer are participant tracks; academic/administrative staff are an
evidence source only.**

Implemented as a type narrowing rather than a hidden button:

```ts
export type SourceGroup = 'student' | 'faculty' | 'institution';
export type Role = Exclude<SourceGroup, 'institution'>;   // data/types.ts
```

`Role` is who can *run* an instrument. `SourceGroup` is whose evidence *counts*. Administrative
returns remain seeded in `data/responses.institution.ts`, still appear as a column in the
discrepancy matrix, and still adjudicate findings `F1` and `F3` — but nobody completes that
instrument here.

Doing this in the type system rather than by removing a card meant the compiler enumerated
every site that had assumed three tracks, and none could be missed. The one genuine casualty
was `roleLabels`, which was serving two jobs; it split into `roleLabels` (tracks) and
`groupLabels` (every group that appears as evidence).

---

## 5. Immediate report, then synthesis

**Decision: the viewer receives a report on their own responses before seeing any course
verdict.**

Flow: `entry → role → context → questionnaire → assembly → report → intelligence`
([`src/state/reducer.ts`](../src/state/reducer.ts)).

The report ([`src/engine/report.ts`](../src/engine/report.ts),
[`src/components/report/`](../src/components/report/)) has five parts:

1. **Consistency check** — their validator pairs, each with the objective counterpart.
2. **Cohort comparison** — the same pairs across everyone, so a personal result can be read
   against the population.
3. **Readings against the cohort** — every scored answer against the cohort mean *as it stood
   before they arrived*, so the comparison is not contaminated by their own contribution.
4. **Position in the chain** — which links their instrument can speak to at all.
5. **What this report is not.**

That last section is the design constraint on the whole screen. The report must not become a
second quality score, because the system's central claim is that quality is a profile from
converging sources — and a single response has no reading that is independent of the person
giving it. So the report reads evidence back, and the synthesis that follows does the
adjudicating.

---

## 6. Forced-choice items

**Decision: the neutral midpoint is removed from five student items, and the four remaining
points keep their original 1–5 positions.**

Values run **1, 2, 4, 5 — there is deliberately no 3** (`forced()` in
`src/instruments/student.ts`). A "neither" answer carries no reading, but renumbering to 1–4
would have been worse than leaving the midpoint in: it would silently rescale those items
relative to the five-point lecturer items they are compared against, and relative to the 1–5
scale the validators map onto. Keeping the original anchor positions preserves every existing
threshold, reading and trigger.

The seeded marginals are still the original five-point ones from the brief. `splitMidpoint()`
in `data/responses.student.ts` redistributes the midpoint count to the two adjacent points in
proportion to the lean already present — the stated assumption being that a respondent taken
off the fence falls to the side the cohort already leans. The transformation is computed and
auditable rather than replaced by hand-written numbers.

Consequence, recorded honestly: four student means moved (e.g. `IND-CGD-01` 2.52 → 2.36,
`IND-SAT-01` 3.90 → 4.03). All six findings still fire and no band changed;
`scripts/check-engine.ts` carries the re-derived expectations, marked `(forced)`, with the
five-point items still holding the brief's original values.

---

## 7. Data architecture

### 7.1 Numbers live in `data/`, meaning lives in `engine/`, nothing lives in components

The rule the codebase is organised around:

> **No figure displayed anywhere is a literal in a component.**

Every number resolves from `data/` through `engine/`. Components receive a `Dataset` and call
resolvers. `npm run check` re-derives the whole surface and prints it for hand-checking — 37
assertions against the brief.

`MetricSpec` (`data/types.ts`) is the mechanism: a small declarative language —
`mean`, `matrix`, `selection`, `categorical`, `derived`, `diff` — resolved by `resolveMetric()`
in `engine/aggregate.ts`. Because a metric is data rather than code, the same spec that
computes a value also renders as a human-readable expression (`metricExpression()`), which is
why every trigger in the interface can show its own arithmetic.

### 7.2 The viewer is not special-cased

`buildDataset()` in [`src/engine/session.ts`](../src/engine/session.ts) appends the viewer's
response to their group as an ordinary `ResponseRecord` with `isViewer: true`. It then flows
through the same aggregation as every other record. The flag is used only to *mark* the
viewer's own bar in a distribution — never to weight, exclude or shortcut anything.

The interface then states plainly how little one response moved: typically a handful of
indicators by ≤0.05, and no finding changed. That is the honest answer, and hiding it would
undermine the claim that no single response determines a finding.

### 7.3 Determinism

The 96 student responses are generated by a seeded PRNG (`mulberry32`, `data/seed.ts`) from
marginal counts, so the base is identical on every load and every figure is reproducible.

Validator answers are generated **conditionally on each respondent's own primary answer** — an
offset drawn from a kernel, applied in **rungs of the validator** rather than in scale points
(`answerAtOffset()` in `data/responses.student.ts`). Expressing the offset in rungs is what
keeps the seeded behaviour stable when an option is added to or removed from a validator:
"one rung below the rating they gave" means the same thing either way. An earlier version
offset by scale value, and removing one option from a validator silently halved a bias the
kernel was written to express.

Ties resolve **upward**, so the seeding can never nudge a respondent toward the over-reporting
the layer exists to detect.

No corroboration rate and no directional bias is written down anywhere. `npm run check`
prints what the engine computes.

---

## 8. Decision log

| # | Decision | Alternative rejected | Why |
|---|---|---|---|
| 1 | Quality is a profile across seven domains | A single quality score | A mean hides *where* the chain breaks, which is the only actionable fact |
| 2 | `Role` excludes `institution` at the type level | Hiding the third card in the UI | The compiler enumerates every affected site; the admin track becomes unrepresentable rather than merely invisible |
| 3 | Administrative returns stay in the evidence base | Deleting them with the track | They adjudicate `F1` and `F3`; removing them would gut the discrepancy matrix |
| 4 | Validator gaps are kept signed | Absolute inconsistency score | The sign is what separates respondent noise from instrument bias |
| 5 | Contradicted responses are flagged, not dropped | Excluding or down-weighting them | Dropping them discards the signal and launders bias into a cleaner mean |
| 6 | Forced-choice items keep values 1, 2, 4, 5 | Renumbering to 1–4 | Renumbering would silently rescale against five-point items and the validator scale |
| 7 | Midpoint counts are redistributed in code | Hand-written new marginals | The transformation stays visible and auditable |
| 8 | Kernel offsets are expressed in validator rungs | Offsets in scale points | Rung offsets survive a change to the option set |
| 9 | Report precedes the course analysis and refuses to score | One combined results screen | A single source has no reading independent of the respondent; saying so is the point |
| 10 | Chain links are ordered with a stated first break | Five independent flags | Downstream readings are conditioned on upstream failures; five flags invite four wasted interventions |
| 11 | Open responses are skippable and never scored | Requiring them | Qualitative evidence illustrates findings; requiring it would fabricate it |
| 12 | Uninstrumented constructs stay in the registry | Omitting them | A model that hides its own coverage gaps misrepresents itself |

---

## 9. Module map

```
src/
  data/
    inquiry.ts          the overarching question and the five-link transfer chain
    validation.ts       the six validator pairs, bands, disposition, objective counterparts
    types.ts            Role vs SourceGroup, MetricSpec, Finding, Reading, Option.implies
    constructs.ts       the 67-construct registry
    indicators.ts       indicator registry with source, evidence class and evidence type
    readings.ts         per-construct readings and thresholds for banding
    comparisons.ts      discrepancy-matrix specifications
    findings.ts         findings with triggers, terms, evidence refs, lineage, hypotheses
    recommendations.ts  actions, owners, re-measurement metrics, review points
    responses.*.ts      seeded respondent bases (deterministic)
    institutionalData / artefacts / lmsData / observations   records and uploads
  instruments/
    student.ts          student items, forced-choice scales, anchored validators
    faculty.ts          lecturer items and anchored validators
    institution.ts      administrative items (seeded source; not a track)
  engine/
    aggregate.ts        means, distributions, selections, matrices, MetricSpec resolution
    derived.ts          every class-D metric, including the schedule × feedback join
    bands.ts            construct and domain banding with stated rationale
    compare.ts          cross-source comparison and adjudication
    validate.ts         response validation: pair checks, cohort bias
    report.ts           transfer chain and the viewer's immediate report
    triggers.ts         finding rule evaluation
    session.ts          viewer submission, impact, recommendation ranking
  components/
    flow/ questionnaire/ report/ intelligence/ findings/ model/ recommendations/ charts/ shell/
scripts/check-engine.ts  re-derives the surface and prints it for hand-checking
```

---

## 10. Limits of this demo

Stated so they are not mistaken for capabilities:

- All data is simulated. Montessori University and BCH 305 are fictional.
- 24 of 67 constructs are instrumented; the rest report `insufficient`.
- Validation covers 6 pairs on the readings that matter most, not every item.
- The transfer chain is one causal path examined on one course. It is not the model.
- There is no backend, database, persistence or external API. Charts are hand-rolled SVG.
- Findings are authored rules evaluated against evidence, not discovered patterns. The demo
  shows *rules firing transparently*, which is a different and more auditable claim than
  automated detection.
