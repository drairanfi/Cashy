---
name: visual-qa-evaluation
description: Compares a new UI change against an existing visual baseline and decides whether the change is acceptable or should go back to adjustment. Use when a PR is in `ready-for-qa` and needs visual checks, when the user wants visual regression validation, or when you need concrete questions about scope, device size, baseline, and intended change before approving a visual update.
metadata:
  version: 0.2.2
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Visual QA Evaluation

Use this skill when a change is ready to be judged against a baseline.

## Goal
Decide whether the visual change is intentional and acceptable, or whether it should return to adjustment.

## Bundled resources
Read `references/evaluation-contract.md` before judging a change.
Use `scripts/evaluate-visual-diff.ts` to compare captures instead of inventing a new diff flow.

## First, ask concrete questions
Before evaluating, ask the user or the agent for the missing facts that make the comparison meaningful:
- What exactly is being compared?
- Which scope matters: whole page, component, or specific section?
- Which viewport size should be used?
- Should mobile, tablet, and desktop all be checked?
- Which baseline should be treated as the source of truth?
- Is this a deliberate redesign or a regression check?
- Are any regions expected to change dynamically?

## Default evaluation flow
1. Load the baseline for the chosen scope from `visual-baseline/<scope>/<viewport>/`.
2. Capture the current version with the same capture mode and viewport.
3. Compare baseline vs current using the companion visual comparison script or workflow.
4. Inspect the diff, not just the numeric result.
5. Decide one of two outcomes:
   - pass: the visual change matches intent within scope, or
   - fail: send back for adjustment.

## Decision rules
Treat a change as acceptable when:
- it matches the intended change request
- the difference is limited to the expected scope
- responsive states remain consistent
- dynamic regions are the only changed areas

Treat it as a regression when:
- layout shifts outside the intended area
- spacing, alignment, or content changes are unintended
- the difference appears in the wrong viewport
- the baseline and current capture do not match the same scope

## Output expectation
Return a concise QA result with:
- pass/fail decision
- scope reviewed
- viewport reviewed
- what changed
- whether it should move forward or return to adjustment
- visual evidence for the factory trace: current capture path(s), baseline identifier (manifest path + commit/branch), diff image path

## Important principle
Do not approve a screenshot just because it is different. Approve it because the difference matches the intended change in the intended scope.

## Inside the factory QA loop
When this skill runs as part of `workflow-fabrica`, the QA agent owns the label transitions, not this skill:
- pass contributes to moving the PR to `ready-for-human`
- fail is reported in a `QA says:` comment using the bug report structure, and the PR goes to `ready-for-agent, bug`
- whenever a visual flow ran, the QA agent attaches the visual evidence block (current capture + baseline reference + diff) to the `QA says:` comment, pass or fail

See `workflow-fabrica`'s `references/qa-loop-contract.md`.
