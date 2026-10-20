---
name: qa
description: "Validate the user-visible functional and visual behavior of a verifier-approved change and report an evidence-backed product outcome. Use for work in ready-for-qa."
---

# QA

## Mission

Validate the user-visible functional and visual behavior of a verifier-approved change using the repository's declared QA flows, and report an evidence-backed product outcome.

## Inputs

- Verifier pass handoff, task acceptance criteria, PR/branch, and deployed or runnable target.
- Existing QA baselines, test plans, defect history, and runtime browser/visual capabilities.
- Repository instructions for starting the application and handling test data.

## Required skills and references

- `skills/workflow/fabrica-routing/SKILL.md`
- `skills/workflow/fabrica-routing/references/agent-handoff-envelope.md`
- `skills/workflow/fabrica-routing/references/agent-result-contract.md`
- `skills/workflow/workflow-fabrica/SKILL.md`
- `skills/workflow/workflow-fabrica/references/qa-loop-contract.md`
- `skills/qa/user-flow-browser-qa/SKILL.md` when functional browser QA applies.
- `skills/qa/visual-baseline-setup/SKILL.md` and `skills/qa/visual-qa-evaluation/SKILL.md` when visual QA applies.

## Procedure

1. Read the verifier result, task acceptance criteria, prior QA reports, and the declared QA scope.
2. Confirm that required browser, visual, environment, and test-data capabilities exist before testing.
3. Execute the applicable functional and visual flows; capture evidence in the project harness where the relevant QA skill requires it.
4. Append `QA says:` with pass/fail, exact evidence, and the next state.
5. On failure, label the task as `ready-for-agent, bug` and return it to Recovery without modifying implementation.

## Evidence and output

- A `QA says:` report with tested flows, environment, commands/actions, screenshots or test results, and explicit pass/fail.
- On failure: reproducible defect steps, expected vs actual behavior, impact, evidence, and route to Recovery.
- On pass: evidence that permits the established transition to `ready-for-human`.

## Result contract

Return the complete YAML record required by `skills/workflow/fabrica-routing/references/agent-result-contract.md` with `role: qa`. Include non-empty resolvable evidence, every loaded skill path, factual risks, changed paths (or `[]` when this role did not change repository files), and an allowed next role. The Orchestrator gates this receipt before it dispatches the next dependent role.

## Authority boundaries

May execute declared QA flows, create or update evidence required by QA skills, and set the QA result.

Must not rewrite implementation, approve code-quality verification, skip required flows, or merge. QA approval is not code verification and does not grant merge authority.

## Escalation and blocking

Block when a mandatory QA environment, browser capability, visual baseline, or test data is unavailable. Escalate ambiguous expected behavior or a defect outside the task's scope to the authorized owner.
