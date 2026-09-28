# Course analysis: visual and layout specification

Updated: 27 September 2026

## Scope
Apply the agreed report design to the Course analysis overview (`Overview`). Preserve finding gates, planning order, calculations, source drill-downs, and action-plan navigation. The separate Perspectives, All findings, and Action plan pages retain their workflows.

## Visual language
- Teal: primary measurements and evidence coverage. Slate: comparison ratings. Pale, clearly outlined empty circles distinguish unfilled and fractional ratings from dark fills.
- Status colours belong to text badges: teal for positive, amber for attention/conflict, red for below-minimum stages, neutral for insufficient evidence. No coloured card edges.
- Neutral borders, white cards, a single pale teal summary/strength surface. No decorative colour by card position.
- Main content 16px; metric labels and disclosure controls at least 14px; rating values 18px; ring values 25px; card headings 26–28px. Small section labels may be 12px.
- Numeric values and labels accompany every graphic. Decorative shapes are hidden from assistive technology. Status is never communicated by colour alone.

## Page arrangement
1. **Course Analysis** title and course name. Compact summary: supported issues, strengths, and domains needing evidence. One leading action and an action-plan button; its full explanation stays in the priority card disclosure.
2. **Priorities and strengths**: two columns on desktop, one on mobile. Each card contains topic, short takeaway, measure-specific graphic, one concise proposed course action, a details disclosure, and a full-finding link. Owners, targets, rationale, sources, and further actions live inside details. Strengths use stacked student/lecturer ratings. The satisfaction/skills relationship is presented separately as a question, never a causal conclusion.
3. **Domain profile**: one expandable row per domain. Show name, evidence-coverage meter with exact measured/total count, and textual quality status. Coverage is not a quality score. The domain question, derivation, and construct links appear on expansion.
4. **Learning pathway**: five stage cards with actual readings, status, and target visible. Reuse the personal report's pathway component; source descriptions and threshold methodology remain expandable.
5. **Evidence and limits**: six source-count tiles plus a separate measured/total coverage meter. State simulated provenance, small-group limits, and missing evidence once. Retain the source-comparison link. End with compact contribution information and the action-plan handoff.

## Match the visual to the measure
| Measure | Graphic | Required context |
| --- | --- | --- |
| Proportion / percentage | Ring with number in centre | Label the population or measure; 0–100% domain |
| Five-point rating | Five circles, fractional fill, number /5 | Source label; unscored is explicit, never displayed as 0 |
| Feedback timing | Policy days → actual median days, signed difference | No arbitrary maximum or percentage completion bar |
| Feedback followed by a task | Large absolute count | Task window stated in source detail; no invented denominator |
| Enrolment / room capacity | Explicit multiplier | Name the denominator; no percentage ring |
| Evidence coverage | Horizontal measured/total meter | Exact counts, labelled “coverage”; never quality |
| Source inventory | Number tiles | Different units stay separate; no comparative chart of unrelated counts |
| Satisfaction vs performance | Five-dot satisfaction and two performance rings | Different scales; coexistence does not establish cause |

## Responsive behaviour
- Priority cards stack below 700px. Percentage triplets become labelled rows below 480px to preserve readable type.
- Pathway wraps to three, then two columns. Domain rows stack their coverage and status on narrow screens.
- Source tiles use three columns on desktop and two on mobile. No horizontal page overflow at 390px.
- Student and lecturer ratings remain vertically stacked.

## Acceptance checks
- Existing report and course-analysis checks pass; production build and whitespace checks pass.
- Values are resolved from the supplied dataset; the viewer is included only where existing course-analysis rules include them.
- Unsupported findings are not shown as current priorities; empty states remain useful.
- Topic filtering, domain expansion/construct links, finding links, and action navigation still work.
- Desktop/mobile review confirms legible figures, empty/fractional rating contrast, no coloured edge accents, and no clipping.

## Implementation verification
- Applied to the course overview using shared `EvidenceGraphic`, `FiveDots`, `ProportionRing`, and `LearningPath` components, plus an explicit `CoverageMeter`.
- Production build, existing report/course-analysis checks, and whitespace checks pass.
- Reviewed desktop and 390px layouts. Corrected narrow-screen relationship-ring overlap and confirmed no horizontal page overflow.
- Verified priority filtering, domain expansion, full-finding drawer, and action-plan navigation in the browser.
