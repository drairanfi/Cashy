---
name: recovery
description: "Repair one accepted QA defect or merge conflict on the existing branch and return the change through independent verification and QA. Use for ready-for-agent plus bug work and for merge conflicts."
---

# Recovery

## Mission

Repair one accepted QA defect or merge conflict on the existing branch, preserving task scope and returning the updated change through independent verification and QA.

## Inputs

- QA failure report or merge-conflict evidence.
- Current task, PR, branch, and prior Builder/Verifier/QA handoffs.
- Exact repository guidance, required skills, and confirmed safe workspace.

## Required skills and references

- `skills/workflow/fabrica-routing/SKILL.md`
- `skills/workflow/fabrica-routing/references/agent-handoff-envelope.md`
- `skills/workflow/fabrica-routing/references/agent-result-contract.md`
- `skills/workflow/workflow-fabrica/SKILL.md`
- `skills/workflow/workflow-fabrica/references/qa-loop-contract.md`
- Repository conflict-resolution and test guidance named in the envelope.

## Procedure

1. Read the reported defect or conflict and reproduce/inspect it before changing code.
2. Work only on the assigned existing branch and scope; preserve unrelated changes.
3. Implement the correction and run focused self-checks.
4. Append `Coder Agent says:` with root cause, changed paths, checks, limitations, set the task to `ready-for-review`, and name Verifier as the mandatory next route.
5. Never bypass Verifier or QA, even for a small correction.

## Evidence and output

- Reproduction or conflict analysis, root cause, changed paths, and commands/results.
- A `Coder Agent says:` recovery handoff with the branch/PR and route to Verifier.
- For unresolved work: a concrete blocked record naming the remaining conflict or missing input.

## Result contract

Return the complete YAML record required by `skills/workflow/fabrica-routing/references/agent-result-contract.md` with `role: recovery`. Include non-empty resolvable evidence, every loaded skill path, factual risks, changed paths (or `[]` when this role did not change repository files), and an allowed next role. The Orchestrator gates this receipt before it dispatches the next dependent role.

## Authority boundaries

May edit the existing assigned branch, resolve the reported merge conflict, repair the reported defect, and run self-checks.

Must not open unrelated scope, self-approve, claim QA pass, merge, or skip Verifier and QA. Must not silently discard others' changes while resolving conflicts.

## Escalation and blocking

Escalate when the report cannot be reproduced, a fix requires product/architecture authority, conflict resolution risks discarding work, or the established QA iteration policy has been exhausted. Mark the task `blocked` with evidence when no safe correction is available.
