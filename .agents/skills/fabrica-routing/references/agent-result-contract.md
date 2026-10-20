# Agent result contract

Every Explorer, Builder, Verifier, QA, and Recovery execution MUST return one machine-checkable result record. This record is a handoff receipt, not a replacement for the role's human-readable comment or required evidence.

Store the exact record with the role's accumulated task and PR handoff. The orchestrator validates it with `gatekeeper-contract.md` before dispatching a dependent role.

## Required schema

```yaml
schema_version: 1
role: <explorer | builder | verifier | qa | recovery>
status: <passed | failed | blocked>
evidence:
  - kind: <command | diff | test-report | screenshot | bug-report | conflict-report | repository-finding | tracker-comment | other>
    reference: <repository-relative path, command transcript location, URL, or artifact ID>
    summary: <what this evidence proves>
changed_paths:
  - <repository-relative path>
next_role: <orchestrator | explorer | builder | verifier | qa | recovery | human>
risks:
  - <known risk or limitation; use [] when none>
skill_paths_loaded:
  - <repository-relative path to SKILL.md or required reference read>
```

## Field rules

- `role` MUST match the dispatched profile.
- `status` has only three values: `passed`, `failed`, or `blocked`. A role may not return an unqualified success.
- `evidence` MUST be a non-empty list. Each reference MUST be resolvable by the orchestrator in the current run: a repository-relative path, a stored command transcript location, a task/PR URL, or an artifact ID supported by the runtime.
- `changed_paths` lists all repository files changed by Builder or Recovery. Explorer, Verifier, and QA MUST use `[]` unless their declared QA evidence intentionally writes a tracked test artifact; in that case list it and explain it in `evidence`.
- `next_role` is the requested next actor, not an authorization to skip routing. The orchestrator remains the only dispatcher.
- `risks` records factual limitations such as unavailable fresh context, unrun optional checks, external dependencies, or residual concerns. Use `[]` only when none are known.
- `skill_paths_loaded` MUST list every role-required skill actually read, plus any task-specific skills used. Never list a skill that was not loaded.

## Allowed routes

| Role | `passed` next role | `failed` next role | `blocked` next role |
|---|---|---|---|
| Explorer | `orchestrator` | `orchestrator` | `human` |
| Builder | `verifier` | `orchestrator` | `human` |
| Verifier | `orchestrator` | `builder` or `recovery` | `human` |
| QA | `orchestrator` | `recovery` | `human` |
| Recovery | `verifier` | `orchestrator` | `human` |

For a Verifier pass, `next_role: orchestrator` is intentional: only the Orchestrator may perform the `ready-for-review` -> `ready-for-qa` transition and dispatch QA. For QA pass, the orchestrator performs the `ready-for-human` transition; for QA failure, `ready-for-agent, bug` remains mandatory. No role receipt authorizes itself or another role to bypass a state transition or introduces SDD phases.

## Canonical examples

### Builder pass

```yaml
schema_version: 1
role: builder
status: passed
evidence:
  - kind: command
    reference: artifacts/agent-runs/42/builder-test.txt
    summary: "npm test passed"
  - kind: diff
    reference: "https://github.com/org/repo/pull/99/files"
    summary: "Scoped implementation diff"
changed_paths:
  - src/widget.ts
  - src/widget.test.ts
next_role: verifier
risks: []
skill_paths_loaded:
  - skills/workflow/fabrica-routing/SKILL.md
  - skills/workflow/workflow-fabrica/SKILL.md
```

### QA failure

```yaml
schema_version: 1
role: qa
status: failed
evidence:
  - kind: bug-report
    reference: "https://github.com/org/repo/issues/42#issuecomment-123"
    summary: "Checkout confirmation does not render after the documented steps"
  - kind: screenshot
    reference: artifacts/qa/42/desktop-failure.png
    summary: "Failure at 1440x900"
changed_paths: []
next_role: recovery
risks: []
skill_paths_loaded:
  - skills/qa/user-flow-browser-qa/SKILL.md
  - skills/workflow/workflow-fabrica/references/qa-loop-contract.md
```
