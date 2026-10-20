# Gatekeeper contract

The Orchestrator is the lightweight gatekeeper between completed roles. It validates whether a result receipt is complete and whether its reported evidence is resolvable before dispatching a dependent role. It does **not** repeat code review, implementation verification, or product QA.

This contract adds control-plane validation only. It does not introduce SDD or new planning phases.

## Gate procedure

For every completed Explorer, Builder, Verifier, QA, or Recovery result:

1. Load the result record from `agent-result-contract.md` and confirm its `schema_version`, dispatched `role`, allowed `status`, required keys, and allowed `next_role`.
2. Confirm `skill_paths_loaded` exists and every listed repository path resolves. Compare it with the profile's required paths; record any required skill that was not loaded as a gate failure.
3. Confirm every `evidence[].reference` resolves in the available runtime: repository paths exist, artifacts are accessible, and task/PR URLs or IDs match the current task. Do not treat the worker's prose as evidence.
4. For Builder and Recovery, compare `changed_paths` with the current diff/PR file list when the runtime can inspect it. If inspection is unavailable, record `diff-unavailable` in the gate result; do not assert the paths match.
5. Validate status-specific evidence:
   - `passed`: evidence supports the role's declared completion condition;
   - `failed`: evidence contains reproducible findings or a concrete failed check;
   - `blocked`: evidence names the missing input, access, or capability and the human action required.
6. Record a gate result in the accumulated handoff trail:

```yaml
schema_version: 1
kind: fabrica-gate
role: <completed role>
result: <passed | rejected | blocked>
checks:
  result_schema: <passed | failed>
  skill_paths: <passed | failed>
  evidence_references: <passed | failed>
  changed_paths: <matched | unavailable | failed | not-applicable>
  capability_limitations: [<factual limitation>]
next_action: <dispatch role | request corrected handoff | escalate human>
```

7. Dispatch a dependent role only after `result: passed`. A rejected receipt returns to the same role to correct reporting when work may be valid but the proof is incomplete; it does not silently advance. A blocked receipt follows the existing `blocked` flow.

## Context and evidence limits

- Gatekeeping may inspect the result record, current diff metadata, artifact paths, and tracker/PR state. It MUST NOT make a code-quality approval that belongs to Verifier or a product-behavior approval that belongs to QA.
- Fresh context is required only for an **independent** Verifier or QA assessment. When `fresh_agent_context: false`, the gatekeeper records `shared-context`; it may validate the receipt but must not label the underlying assessment independent.
- Missing evidence capability is not a pass. If evidence cannot be resolved because the runtime lacks tracker, PR, artifact, or repository access, return `blocked` or escalate to the authorized human.

## Gate outcome routing

| Completed role | Gate pass | Gate rejected | Gate blocked |
|---|---|---|---|
| Explorer | Orchestrator reroutes | Explorer corrects receipt | Human |
| Builder / Recovery | Verifier | Same writer corrects receipt | Human |
| Verifier | QA | Verifier corrects receipt | Human |
| QA | Orchestrator applies existing label transition | QA corrects receipt | Human |

Gate rejection is a receipt failure, not a new implementation failure. It must not consume a QA retry round.
