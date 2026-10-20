---
name: user-flow-browser-qa
description: Validates a user flow derived from a use case by driving the app with agent-browser, following the intended happy path and critical paths, then creates project-appropriate automated tests in the repo's own harness. Use when the user wants end-to-end flow QA, browser-driven scenario validation, or test creation for a concrete user journey.
metadata:
  version: 0.2.2
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# User Flow Browser QA

Use this skill when you need to validate a concrete user journey from the browser and then turn that validation into tests that live in the project's own conventions.

## Goal
Prove that a user flow works the way the use case says it should, then encode that proof as tests in the right place for the repo.

## Bundled resources
Read `references/user-flow-contract.md` before the browser run.
Run `scripts/inspect-project-context.ts` to detect the repo's test harness and conventions before creating tests.
Run `scripts/scaffold-flow-tests.ts` to scaffold the flow test files instead of inventing a new layout.

## Browser rule
Use **agent-browser** as the browser automation path for the live QA run. Do not substitute a different browser tool unless the project already standardizes on it for test generation.

Before you interact with the app, read the project's own rules:
- find `AGENTS.md`
- find `CLAUDE.md`
- read the project `README` for how to install, build, and serve the app
- follow the nearest applicable one for the repo you are in

Bring the app up from the current branch using the README's documented commands before driving it. If the README does not document how to run the app, stop and report it as a blocker instead of guessing ports, env vars, or start commands.

If the repository has a documented browser/testing harness, follow it. If there is no established harness, use the repo's fallback convention and place flow tests under `_tests_/` with one folder per validated user flow.

## Ask the right questions first
Before starting the browser run, make sure the scenario is concrete enough to avoid a vague QA pass:
- What is the use case and the user goal?
- Where does the flow start?
- Which role or auth state should be used?
- Is this desktop, mobile, or both?
- What is the happy path?
- What are the critical paths or failure paths that must be checked?
- What data or fixtures must exist before the flow starts?
- What should happen if the flow fails at any step?

## Selector strategy
Prefer stable selectors in this order:
1. `data-testid`
2. `id`
3. stable, intentional class names
4. text only when there is no better stable hook

If you must use classes, make them specific and stable. Avoid brittle selectors that depend on layout or random generated structure.

When multiple elements match, narrow the selector until it is unique. If the locator is ambiguous, stop and resolve it before continuing.

## Flow validation order
1. Map the intended flow from the use case.
2. Open the app and confirm the starting state.
3. Execute the happy path end to end.
4. Exercise the critical paths that are expected to fail or branch.
5. Record exactly where the flow succeeded or broke.
6. Turn that validated scenario into tests using the repo's existing harness.

## What counts as critical paths
Cover the branches that would break the user journey in a meaningful way:
- validation errors
- permission or auth failures
- empty states
- missing data
- save/submit failures
- required branching choices
- recovery after a blocked step

## Test creation rules
After the browser validation, create automated tests according to the project documentation:
- read `AGENTS.md` / `CLAUDE.md`
- preserve the project's existing test style and location
- do not invent a new harness if one already exists
- if there is no harness, create the tests under `_tests_/` and group them by validated user flow

Create tests for both:
- the happy path
- the critical paths that should fail or branch

## Output expectation
Return a concise result with:
- the use case validated
- the browser path followed
- the selectors used
- the happy path result
- the critical paths checked
- where the tests were created
- any blockers or missing project conventions

## Important principle
This skill is for proving a user flow and then freezing that proof into tests. The browser pass is not the end; the test artifact is the real deliverable.

## Inside the factory QA loop
When this skill runs as part of `workflow-fabrica`, the QA agent works on the PR branch and owns the label transitions:
- pass (flow works and tests are in place) contributes to moving the PR to `ready-for-human`
- fail is reported in a `QA says:` comment using the bug report structure, and the PR goes to `ready-for-agent, bug`

See `workflow-fabrica`'s `references/qa-loop-contract.md`.
