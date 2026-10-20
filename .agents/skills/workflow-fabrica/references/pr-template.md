# PR template for workflow-fabrica

Use this structure when creating or updating a PR for a factory task. Always in english.

## Title

`Agent-<task-id>-<short-title>`

## Description

### Summary
What was implemented, in one short paragraph.

### Verification
List the exact checks that were run and whether they passed.

### Changes
Summarize the key files, modules, or behaviors that changed.

### Evidence
- For backend or non-visual work: include verification output or test names.
- For frontend or visual work: include screenshots only when they help prove the result.

### Follow-ups
Mention any remaining work, risks, or intentionally out-of-scope items.

### Factory rounds

The sections below **accumulate**: every round appends a new `#### Round N — <date>` block containing the Coder handoff, Verifier result, and QA result. Never overwrite or delete a prior round, so the PR keeps the full trace.

#### Coder handoff (`Coder Agent says`)
Filled by the coding agent each time the PR moves to `ready-for-review`. Mirror the `Coder Agent says:` comment:
- What to test: `visual`, `functional`, or both, and which QA skill to run.
- Scope touched: whole view or a specific section, and which view/route.
- Viewport(s): `mobile`, `tablet`, `desktop`, or a combination.
- Input for the QA skills: route/URL, auth state or role, fixtures or seed data, use case / expected behavior, dynamic areas to ignore.
- Vision to implement: one or two lines on the intended end state.
- Validation type: `functional-only` | `scoped-visual` | `visual+functional` (binding for QA).
- Visual readiness: `ready`, or `pending <#ticket>` when visual is deferred.
- Baseline viewports: exact viewport(s) the change was built against (e.g. 1440x900, 390x844).

#### Verifier result (`Verifier says`)
Filled by the Verifier each time the PR is reviewed. Mirror the accumulated `Verifier says:` comment:
- Pass: files/diff inspected, exact checks and results, findings, independence limitation if any; only the orchestrator moves the PR from `ready-for-review` to `ready-for-qa`.
- Fail: actionable findings, next writer route, and the shared failure counter; at counter 2 the PR is `blocked`.
- Receipt failure: correct the handoff/evidence without consuming the shared failure counter.

#### QA result (QA says)
- Pass: what was checked (flows, viewports) and the validation type that was run; PR moved to `ready-for-human`.
- Fail: the structured bug report (steps to reproduce, expected result, actual result, environment); PR set to `ready-for-agent, bug`.
- Visual evidence: whenever a visual flow ran, attach the visual evidence block (current capture + baseline reference + diff + metadata), pass or fail. On fail the diff image goes in the bug report's Actual result.
- Second counted Verifier or QA/defect failure: PR set to `blocked` for human review; receipt failures are separate and do not count.
