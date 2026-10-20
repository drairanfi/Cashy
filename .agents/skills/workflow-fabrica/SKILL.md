---
name: workflow-fabrica
description: "Operates the software-factory task workflow after setup-fabrica: routes focused builder, verifier, QA, and recovery roles through the ready-for-agent to ready-for-human loop without assuming a particular runtime. Use this skill whenever the user wants the task-execution workflow for a factory setup, regardless of whether tasks live in GitHub, Notion, or another provider."
allowed-tools: Bash(git status *) Bash(git log *) Bash(git branch *) Bash(git worktree *) Bash(gh issue list *) Bash(gh issue view *) Bash(gh issue edit *) Bash(gh issue comment *) Bash(gh pr list *) Bash(gh pr view *) Bash(gh pr diff *) Bash(gh pr checks *) Bash(gh pr merge *)
metadata:
  version: 0.2.5
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Workflow Fábrica

Use this skill together with `setup-fabrica`.

`setup-fabrica` resolves the project, the local folder, and the task provider. This skill defines what happens once tasks are visible and the factory is ready to work.

## Core workflow

1. Read `fabrica-routing` and its runtime capability manifest before dispatching. Route only to capabilities the current runtime actually declares.
2. Pick tasks in `ready-for-agent` (new work or a bug fix) and, separately, tasks in `ready-for-qa`. `ready-for-review` is a durable Verifier queue, not a queue-drain pickup state.
3. If two or more ready tasks are independent **and** the capability manifest confirms delegated agents, waited completion, visible final results, parallel dispatch, isolated workspaces, and capacity, delegate them in parallel. Otherwise serialize writer work.
4. **Builder:** delegate each new task to a builder in its own isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md` when available. The builder implements, runs self-checks, opens or updates the PR, leaves a `Coder Agent says:` handoff, and sets `ready-for-review`. It does not move work directly to QA.
5. **Verifier:** pick `ready-for-review` only for Verifier dispatch, distinct from the builder, to inspect the PR diff and run focused repository checks. The verifier is a code/change-quality gate, not product QA. If the runtime cannot provide a fresh verifier context, record that limitation; never claim independent verification.
6. **QA:** only after verifier evidence passes, move the PR to `ready-for-qa` and delegate a separate QA agent. QA runs the visual and/or functional flow (see `QA delegation`).
7. **QA outcome:** on pass, QA moves the PR to `ready-for-human` with a `QA says:` comment. On fail, it leaves a `QA says:` bug report and sets the PR labels to `ready-for-agent, bug`.
8. **Recovery:** re-delegate `ready-for-agent, bug` tasks on the same PR to a recovery agent using a goal-format prompt. Recovery fixes the defect, then work returns to verifier and QA.
9. **Combined failure cap:** count implementation-quality Verifier failures and QA/defect failures for the same PR in one counter. At two total failures, stop all Verifier/QA retries, set `blocked`, and escalate with the accumulated rounds. Receipt/schema failures are separate and do not consume this cap.
10. **Merge:** the orchestrator merges `ready-for-human` PRs by default, oldest first by PR creation order (see `Merge and conflict handling`). On a merge conflict it delegates recovery; it never resolves a conflict itself.
11. Leave a short orchestrator status update after each delegation or merge with the role, evidence, capability mode, and related PR.

The full state machine, label list, and comment structures live in `references/qa-loop-contract.md`. Read it before running the loop. Use `fabrica-routing/references/agent-handoff-envelope.md` and `fabrica-routing/references/agent-result-contract.md` for every role dispatch and result; gate a completed result before a dependent dispatch.

## Task pickup rule

Automatic pickup labels: `ready-for-agent` (implementation or bug fix) and `ready-for-qa` (QA). `ready-for-review` is a durable waiting state for Verifier and must not be picked by queue drain.
Never auto-pick `ready-for-review`, `blocked`, `needs-triage`, `needs-info`, `ready-for-human`, or `wontfix`.
Do not start work on tasks outside the pickup labels unless the user explicitly overrides the workflow.

## Queue-drain rule

When the user asks to continue the factory queue, keep delegating until both the `ready-for-agent` and `ready-for-qa` queues are empty for the current batch.
Drain `ready-for-agent` first, then `ready-for-qa`; a QA fail puts a task back into `ready-for-agent`, so revisit the queues until neither has ready items. A Builder/Recovery handoff moves to `ready-for-review`, and only an explicit Verifier dispatch consumes that state.
Do **not** stop after each completion to run conflict checks while queues still have ready items.
Once both queues are empty, move to the merge pass: merge `ready-for-human` PRs oldest-first, delegating any conflict that surfaces (see `Merge and conflict handling`). Then report the final state.

See `references/github-factory-queue.md` for the GitHub-backed bootstrap and queue pattern.

## Role routing and delegation

Before every dispatch, use `fabrica-routing` to select a focused role and create its structured handoff envelope. The orchestrator never edits code, performs implementation verification, reviews code, or runs QA itself.

When the runtime is OpenCode, run its headless-delegation preflight before the first dispatch and after any binary or configuration change: this skill's `references/headless-delegation-preflight.md`. It resolves the binary by absolute path, reads the effective permission rules with `opencode debug config`, and confirms the v2 dispatch shape. When the channel is not ready it stops the dispatch and names the exact file, key, and change to fix. Do not dispatch an OpenCode run without it.

An OpenCode dispatch **MUST** use `--agent build`; never substitute another configured agent for delegated work. Another agent carries its own system prompt and its own model binding, so the substitution changes both the behaviour and the model the run actually executes, and it leaves no signal in the output. The pinned shape is:

```bash
"$HOME/.opencode/bin/opencode" run --agent build --auto "<goal text>"
```

When you send Builder or Recovery work to a subagent, always include these requirements:

- Lead the prompt with the implementation spec as a `## Goal` block (see `Spec handoff format`).
- Dispatch with `--agent build` when the runtime is OpenCode; never another configured agent (see the agent-pinning rule above).
- Work in a separate isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md`.
- Do not edit the main branch directly.
- Implement the requested task.
- Run verification before reporting success.
- Prefer real validation: types, unit tests, integration tests, lint, or whatever the repo uses.
- Confirm that the implementation actually works, not just that the code compiles.
- Open or update a PR for the completed work.
- Leave the required `Coder Agent says:` handoff, then wait for a Verifier dispatch before moving to `ready-for-qa`.
- **Do not touch code yourself.** The orchestrator only delegates, coordinates, records state, and merges by default. All code changes, conflict resolution, and file edits must be done by Builder or Recovery inside an isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md` when the runtime supports it. The orchestrator merges `ready-for-human` PRs by default (an integration action, not a code edit) unless a project policy requires a human gate, but it must never resolve a merge conflict itself — it delegates that (see `Merge and conflict handling`).

## Spec handoff format

Pass the implementation spec to each subagent as an explicit `Goal` block, never as loose prose.

- In Claude Code, put it as a `## Goal` section at the top of the subagent prompt (the `Task` tool `prompt` argument).
- In other coding agents, use the agent's native structured goal/spec field when it supports one; otherwise embed the same `## Goal` block as plain text at the top of the prompt.

The `Goal` block contains:
- **Outcome**: the observable end state the change must produce.
- **Acceptance criteria**: checks that must pass for the task to be done.
- **In scope / Out of scope**: explicit boundaries so the agent does not expand the change.
- **Ticket**: the tracker reference (URL or ID) the work traces back to.

Use the `goal-prompting` skill to turn the task into this block.

## Builder / Recovery handoff

Every Builder or Recovery delegation prompt must require the agent to, before handing back:

1. Open or update the PR on its isolated branch when the capability manifest confirms isolation (never main).
2. Leave a `Coder Agent says: <comment>` comment on **both** the issue and the PR, and add the same block to the PR description under a dated round heading. The comment states:
   - what to test: `visual`, `functional`, or both, and which QA skill to run
   - scope touched: whole view or a specific section, and which view/route
   - viewport(s): `mobile`, `tablet`, `desktop`, or a combination
   - input for the QA skills: route/URL, auth state or role, fixtures or seed data, the use case / expected behavior, dynamic areas to ignore
   - vision to implement: one or two lines on the intended end state
   - validation type: `functional-only` | `scoped-visual` | `visual+functional` (binding for QA)
   - visual readiness: `ready`, or `pending <#ticket>` when visual is deferred
   - baseline viewports: exact viewport(s) the change was built against (e.g. 1440x900, 390x844)

Comments and PR-description blocks **accumulate** — every round appends a new dated block, nothing is overwritten or deleted, so the full trace stays on the issue and the PR. Builder/Recovery move the task to `ready-for-review`; only the orchestrator moves it to `ready-for-qa` after Verifier evidence passes, and on a Recovery pass it removes `bug` and `ready-for-agent` at that time.

Full field list and rationale: `references/qa-loop-contract.md`.

## Verifier delegation

After Builder or Recovery self-checks pass, the writer sets `ready-for-review`; dispatch a Verifier using the `fabrica-routing` envelope. The Verifier must be distinct from the writer when the runtime supports it, read the issue, prior `Coder Agent says:` handoff, PR description, and diff, then run the smallest meaningful repository checks. It must append `Verifier says:` evidence to the issue and PR.

- **Pass:** only the orchestrator moves the task/PR from `ready-for-review` to `ready-for-qa` and dispatches QA.
- **Fail:** increment the combined failure counter and return the task to Builder (new work) or Recovery (bug/conflict work) with the verifier findings. At counter 2, set `blocked`; do not let the verifier edit code or loop indefinitely.
- **Unavailable fresh context:** record that verification is non-independent and follow the project’s human-review policy; never label it independent.

## QA delegation

For each `ready-for-qa` task, delegate to a separate coding agent acting as QA (may be a different provider/model than the implementer or verifier) only when the capability manifest confirms a separate execution and isolated workspace. The QA prompt must require the agent to:

1. Check out and work on the **PR branch** in an isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md`. Never QA against main. If the manifest cannot provide isolation or a separate QA execution, do not run or pass automated QA; set the task to `blocked` and request authorized manual QA, recording the exact capability limitation.
2. Read, in order: the issue/task, its last `Coder Agent says:` comment, and the PR (description + diff).
3. For functional checks, read the target project's `README` (plus `AGENTS.md` / `CLAUDE.md`) to learn how to install, build, and serve the app, then bring it up from the PR branch before driving it. If the README does not document how to run the app, set `blocked` and say so.
4. Run only the QA flow(s) the declared validation type allows (`functional-only` | `scoped-visual` | `visual+functional`); QA judgment may narrow the scope or escalate with evidence, but never adds a full-page visual gate to a task whose type or readiness excludes it:
   - visual: `visual-baseline-setup` then `visual-qa-evaluation`
   - functional: `user-flow-browser-qa`
5. Use the coder comment's input block as the starting point for those skills.
6. Leave a `QA says: <comment>` comment on **both** the issue and the PR:
   - **pass**: note what was checked, then move the PR to `ready-for-human`
   - **fail**: write `<comment>` using the bug report structure, then set the PR labels to `ready-for-agent, bug` (both), and do not move to `ready-for-human`
   - **visual evidence**: whenever a visual flow ran, attach the visual evidence block from `qa-loop-contract.md` (current capture + baseline reference + diff + metadata) to both comments, pass or fail

Bug report structure (used inside a failing `QA says:` comment):

```
1. Steps to reproduce: exact ordered actions taken to reach the error.
2. Expected result: what should have happened.
3. Actual result: what actually happened (attach screenshots, console logs, or errors).
4. Environment: operating system, browser used, and application version.
```

The validation type declared in the coder handoff is binding for QA — see `## Validation type` in `references/qa-loop-contract.md`.

## Bug-fix delegation

For a task in `ready-for-agent` + `bug`, re-delegate the fix on the **same PR and branch**. Build the prompt with the `goal-prompting` skill:

- **Outcome**: the reported bug is resolved on the existing PR branch.
- **Completion criteria**: the bug report's reproduction steps no longer produce the error; the failing QA flow now passes; existing checks still pass; no scope expansion.
- **Start here**: the PR branch, the failing `QA says:` comment, the issue.
- **Constraints**: fix on the current branch, do not open a new PR, do not weaken tests or checks.

When done, the Recovery agent follows `Builder / Recovery handoff` again (push to the same PR and leave a `Coder Agent says:` comment). The handoff sets `ready-for-review`; the orchestrator dispatches Verifier, then removes `bug` + `ready-for-agent` and sets `ready-for-qa` only after verifier evidence passes. QA repeats only after that transition.

**Combined failure cap**: maintain one per-PR counter for implementation-quality Verifier failures plus QA/defect failures. Receipt/schema failures (invalid or missing result records, or unreachable evidence) are corrected separately and do not consume the counter. On the second counted failure, do not start another writer, Verifier, or QA round: set `blocked`, preserve all accumulated `Verifier says:` and `QA says:` rounds, and escalate with the counter and remaining failure. There is no unlimited Verifier loop.

## Merge and conflict handling

The orchestrator merges completed work by default; it does not wait for a human to do it.

- After both queues are empty, merge `ready-for-human` PRs one at a time, **oldest first by PR creation order**.
- Before each merge, confirm the PR is still `ready-for-human` (QA passed) and mergeable.
- Merge with the repo's stated method if it has one; otherwise use the repo default. Let the platform close the linked issue via the PR body (`Closes #<id>`); if it does not, the orchestrator closes it after merge.
- After each merge (and on issue close or abandonment), the orchestrator removes the task worktrees per `fabrica-routing/references/workspace-isolation-contract.md` (`scripts/remove-isolated-worktree.sh`: `git worktree remove` + `git worktree prune`).
- **On a merge conflict, the orchestrator never resolves it.** It delegates a conflict-resolution task to a coding agent, in goal format (`goal-prompting`):
  - **Outcome**: the PR branch is rebased/merged onto the current base with all conflicts resolved, nothing lost.
  - **Completion criteria**: no conflict markers; the branch builds and existing checks pass; the original change is preserved.
  - **Constraints**: work on the existing PR branch, do not open a new PR.
- After a conflict resolution, Recovery leaves its handoff; the PR goes through Verifier and then `ready-for-qa` for a re-check, then to `ready-for-human`, then the orchestrator retries the merge.
- Merging a PR can create conflicts in the next PRs in line; handle them the same way as they surface.

The orchestrator merges `ready-for-human` PRs by default. When a project policy must override that default with a human gate, and how merge readiness is verified, remain roadmap items — see the repo README.

## Release phase (optional)

The factory never publishes releases on its own. Only when the user
explicitly requests a release, or the task requires one, run the
`release-authoring` skill after the merge pass to draft and (with explicit
authorization) publish the structured release. Normal implementation and QA
flows must not publish releases automatically.

## Blocked

Any delegated agent that cannot proceed without external input sets `blocked` instead of guessing (missing access, contradictory or missing spec, unavailable dependency, repeated Verifier/QA failure with no path, or the shared failure cap of two). Receipt failures are corrected separately and do not consume the cap. The blocking party leaves a comment stating what is blocked, why, and what is needed to unblock. The orchestrator never advances a `blocked` task; it surfaces the blocker to the user. Once a human clears it, the task returns to its previous actionable label.

## Waited results and gates

When `fabrica-routing` delegates Explorer, Builder, Verifier, QA, or Recovery, the orchestration sequence is: dispatch one bounded objective, wait for the terminal Result Contract record, run the gatekeeper receipt checks, then route the next dependent role. A status update or background commentary is not a completed handoff.

Builder/Recovery -> Verifier -> QA remains sequential. Parallel batches are allowed only for independent objectives and only when the runtime capability manifest confirms delegated agents, waited completion, visible final results, parallel dispatch, isolated workspaces, and available capacity. The gatekeeper validates evidence reachability and paths; it does not replace code verification or product QA.

## Verification rule

Verification is not optional. Ask the subagent to prove the work with the repo's real checks.
Use the smallest meaningful set of checks that can still prove the change is correct:

- type checks when the repo has them
- unit tests when the change touches business logic
- integration or e2e tests when the change crosses boundaries
- lint or formatting checks when they are part of the repo workflow

If verification fails, the task is not ready to move forward.

## PR naming rule

Every PR created by the workflow must use this naming pattern:

`Agent-<task-id>-<short-title>`

Examples:
- `Agent-12-multi-provider-fan-out`
- `Agent-3-workspace-manager-isolated-workspace`

Keep the task ID visible in the PR title so the PR is always traceable back to the issue or task that generated it.

## PR description rule

The PR description must clearly explain:

- what was implemented
- what was verified
- what changed compared with the task request
- whether there are follow-up items or risks

Write the description so a human reviewer can quickly confirm that the work matches the task.
Use `references/pr-template.md` as the default structure for the PR body.

## Retry and timeout policy

If a delegated subagent times out, retry it with the same provider first, and give it a larger time budget or a smaller slice of work.

Only ask the user to choose another provider when the failure is really a provider capacity problem, such as the provider running out of credits or becoming unavailable.

Do not treat a timeout as a signal to switch providers automatically.
Do not ask for a provider change until the current provider has clearly failed for capacity reasons.

## Output style

When reporting progress to the user, be direct and concrete. Use this exact structure for every delegation update:

- `Delegación: <valor>`
- `Fase: <implementation | qa | bug-fix>`
- `Issue/Task que se va a realizar: <url de donde está>`
- `Objetivo del agent: <description>`
- `Output: <pr-con lo que se realizo>`
- `Estado resultante: <label al que quedó la tarea/PR>`

Keep the content short and operational:
- which task was picked up
- which subagent handled it
- what was verified
- which PR was created or updated
- what state the task moved to

## Relationship to setup-fabrica

This skill assumes `setup-fabrica` already resolved:

- the local project folder
- the task provider
- the task source
- any provider-specific credentials or access needed to read tasks

For the concrete tools to read and write tasks per provider (GitHub `gh` CLI, `Notion:*`, `Linear:*`), follow `Provider access patterns` in `setup-fabrica`.

If that setup is not done yet, ask the user to run `/setup-fabrica` first. `setup-fabrica` is user-invoked only and cannot be triggered automatically by the orchestrator.
