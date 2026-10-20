# Agent handoff envelope contract

Every role dispatch and result uses this envelope. It makes the next action reproducible without relying on an implicit chat summary. Keep it in English and append it to the task and PR record; never overwrite earlier rounds.

## Dispatch template

```md
## Fabrica handoff

- **Round:** <number>
- **From / to:** orchestrator -> <explorer | builder | verifier | qa | recovery>
- **Task:** <tracker URL or ID>
- **PR / branch:** <URL or "none yet"> / <branch or "not applicable">
- **Capability mode:** <delegated-isolated | delegated-shared-context | inline-fallback>
- **Runtime limitations:** <none or factual limitation>

### Objective
<One bounded observable outcome.>

### Inputs
- <exact file path, URL, prior handoff, issue, PR, or reproducible evidence>

### Scope
- **In:** <allowed area>
- **Out:** <explicit exclusions>

### Required procedure
- <exact skill paths and repository instructions to read>

### Evidence required
- <commands and expected results, diff findings, screenshots, or bug report>

### Authority and constraints
- <what this role may change or decide>
- <what it must not change or approve>

### Expected result and next route
- **Result:** <concrete completion condition>
- **Next:** <role and label/state, or blocked condition>

### Result record requirement
Return the YAML record defined in `references/agent-result-contract.md`. The Orchestrator validates it with `references/gatekeeper-contract.md` before dispatching a dependent role.
```

## Role-specific constraints

| Role | May do | Must not do |
|---|---|---|
| Orchestrator | Dispatch, coordinate labels/comments, route work, merge when policy permits | Edit code, resolve conflicts, implement, verify code, or run QA |
| Explorer | Inspect and report bounded findings | Modify implementation or approve work |
| Builder | Implement and run required self-checks | Self-approve or run final QA |
| Verifier | Independently inspect changes and run focused checks | Modify the implementation or run product QA |
| QA | Execute declared functional/visual flows and set QA outcome | Rewrite implementation or substitute code verification |
| Recovery | Fix a QA bug or merge conflict on the existing branch | Open unrelated scope, self-approve, or skip verifier/QA |

## Waited handoffs and batches

- A dispatch is complete only when the adapter returns a terminal Result Contract record (`passed`, `failed`, or `blocked`) and the Orchestrator records a gate result. Commentary, partial output, or a started child identifier is not completion.
- For dependent work, dispatch one role, wait for its terminal result, run the gate, then route. Builder/Recovery → Verifier → QA is always sequential.
- Batch only work with no dependency on another in-flight result. Parallel execution requires all of: `delegate_agents`, `wait_for_agent_completion`, `agent_result_visibility`, `parallel_agent_dispatch`, `isolated_workspaces`, and `max_parallel_agents > 1`.
- Never run two writers against one workspace or branch. Explorer tasks may run in parallel only when their scopes do not overlap; QA may never start before its verifier gate passes.
- The Orchestrator correlates every child result with its dispatch `Round`, role, task, branch, and objective. An unmatched result is rejected and must not advance the task.

## Result recording

- Builder and Recovery append `Coder Agent says:` in the format required by `workflow-fabrica`.
- QA appends `QA says:` in the format required by `workflow-fabrica`.
- Explorer and Verifier append `Explorer says:` and `Verifier says:` comments containing the completed envelope result and evidence.
- The orchestrator appends a short status comment that links the current envelope result and next state.
- If the tracker cannot store comments, record the same envelope in the PR description or the run’s durable state; state the chosen location in `Inputs`.
