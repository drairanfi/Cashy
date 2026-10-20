# Visual evaluation contract

This skill decides whether a change is acceptable against an existing baseline.

## Baseline location
The source of truth is `visual-baseline/<scope>/<viewport>/<viewport>.png`
(tracked in git) with its per-viewport manifest and per-scope manifest
(see `visual-baseline-setup/references/baseline-contract.md`).
`evaluate-visual-diff.ts --baseline=<root> --scope=<scope>` resolves that path;
`visual-eval/` output is ephemeral and never committed.

## Evaluation order
1. Load the matching baseline from `visual-baseline/<scope>/<viewport>/`.
2. Capture the current state with the same scope and viewport.
3. Compare baseline vs current.
4. Inspect the diff image, not just the numeric score.
5. Decide pass or return to adjustment.

## Decision rules
Treat a change as acceptable only when:
- it matches the intended change request
- the diff stays inside the expected scope
- the same viewport size is being compared
- responsive states still behave correctly
- only the expected dynamic regions changed

Treat a change as a regression when:
- layout shifts outside the intended area
- spacing, alignment, or content changed unexpectedly
- the wrong viewport was used
- the baseline and current capture do not describe the same scope

## Evaluation questions
Ask these before approving if the agent is missing context:
- What exactly is being compared?
- Which scope is the source of truth?
- Which viewport should be checked?
- Do mobile, tablet, and desktop all need validation?
- Is this an intentional redesign or a regression check?
- Which areas are expected to change dynamically?

## Output
Return a short result with:
- pass/fail decision
- scope reviewed
- viewport reviewed
- what changed
- whether to move forward or return to adjustment
- visual evidence for the factory trace: current capture path(s), baseline identifier (manifest path + commit/branch, resolvable later), diff image path (required on fail, recommended on pass)
