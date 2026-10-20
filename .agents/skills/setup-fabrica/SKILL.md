---
name: setup-fabrica
description: "Sets up the software-factory agent flow for a repo: resolves the project root, tracker, labels, and runtime capabilities before workflow-fabrica routes focused agent roles. When an ideation package exists under docs/ideation/ it adopts its root and provider instead of re-asking, and factory setup stays independent of ideation. Use whenever the user asks to bootstrap or configure an agential software factory workflow, especially when tasks live in GitHub, Linear, Notion, or a similar tracker."
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git remote *) Bash(git branch *) Bash(git log *) Bash(gh repo view *) Bash(gh issue list *) Bash(gh issue view *) Bash(gh issue create *) Bash(gh issue edit *) Bash(gh label list *) Bash(gh label create *)
metadata:
  version: 0.2.2
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Setup Fábrica

Use this skill when the user wants to establish or run an agential software-factory flow for a specific repository.
The goal is to keep humans out of the execution path unless a task truly needs human review.

## Invocation

This skill is **user-invoked only** (`disable-model-invocation: true`). The user must run it explicitly with `/setup-fabrica`.
The orchestrator must never trigger it automatically. If setup is missing, the orchestrator tells the user to run `/setup-fabrica`; it does not start the flow on its own.

## What this skill does

1. Resolve the active repo and its source of truth.
2. Detect where tasks live and how to access them.
3. Read the task label vocabulary used by the factory.
4. Record the current runtime capabilities using `fabrica-routing/references/runtime-capability-manifest.md`.
5. Hand off to `workflow-fabrica`, which routes Builder/Recovery -> `ready-for-review` -> Verifier -> `ready-for-qa` -> QA.

## Core rules

- The setup flow is strictly step-by-step. Ask exactly one question at a time and wait for the answer before moving to the next step.
- Do not bundle multiple required questions into a single message.
- Resolve the project root with this precedence: (1) if a repo is open in the current workspace, treat it as the active project and confirm it with a single question ("Work on the repo at `<path>`, or point to another one?"); (2) if there is no repo in the workspace, or the user wants a different target, ask for the full path to the project folder. Do not silently assume a path the user has not confirmed, and do not ask for a path when the workspace repo is confirmed.
- After the project root is confirmed, ask which task provider is in use for this project (for example: GitHub, Notion, Linear, a custom tracker, or something else).
- Before asking for the project root or the provider, check whether an ideation package already exists (`docs/ideation/README.md`, see `skills/workflow/setup-ideation/references/ideation-package.md`). If it is present, adopt its recorded root and `Provider` and skip the corresponding questions; ask only for what is genuinely missing. Ideation is optional: its absence is not an error and the normal flow still runs.
- Ideation and factory execution are independent. Tickets may exist without an ideation package (created by hand, by `to-tickets`, or migrated), and an ideation package may exist without factory setup. Never require one for the other.
- If the provider is GitHub, inspect the repository and check whether issues/tasks exist there.
- If the provider is Notion, request only the minimum credentials, integration details, and page/database access needed to read tasks.
- If the provider is another service, request only the minimum API keys, URLs, and access details needed to connect and read tasks.
- Do not guess provider details. If something is missing, ask for it explicitly before proceeding.
- Do not move to the next step until the current answer is known and understood.
- Once the task source is connected and tasks are visible, hand off to `workflow-fabrica` for execution flow, or ask the user what they want next: execute the tasks, start delegating, or take another action.
- `setup-fabrica` and `workflow-fabrica` are meant to be used together: the first resolves the project and provider, the second runs the task workflow.
- This skill is for setting up the factory workflow, not for creating the factory itself.
- Keep the flow agentic: focused roles do the work; the orchestrator dispatches and coordinates.
- **The orchestrator never edits code, verifies code, runs QA, or resolves merge conflicts directly.** Builder/Recovery make changes, Verifier checks code changes, and QA checks product behavior. The orchestrator merges `ready-for-human` PRs by default (integration only) but delegates any conflict.
- Do not promise a separate agent, fresh context, isolated worktree, browser, or visual QA unless the runtime capability manifest confirms it.
- Do not route implementation work through a human unless the task state explicitly requires human review.
- Treat `ready-for-agent` (implementation or bug fixes) and `ready-for-qa` (QA) as the automatic pickup labels. `ready-for-review` is a durable waiting state owned by the Verifier gate and is never picked by queue drain. Never auto-pick `blocked`.
- After implementation, run verification steps before updating task state.
- When the agent returns, summarize what was done, what was verified, and what the remaining state is.
- When the repo is GitHub-backed and the user wants the factory to operate there, migrate the tracker to GitHub Issues early instead of keeping local markdown scratch files.
- Before delegating build work, seed a repository-foundation ticket for README, Bun/TypeScript scaffolding, linting, formatting, commit hooks, and commit-message conventions if those basics are still missing.
- When you create a GitHub-backed factory, create the expected labels up front: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-review`, `ready-for-qa`, `bug`, `blocked`, `ready-for-human`, `wontfix`. `ready-for-agent` and `ready-for-qa` are the only pickup states; `ready-for-review` waits for Verifier.
- See `references/github-factory-bootstrap.md` for a concise bootstrap pattern derived from a repo that started empty and was migrated from local notes to GitHub Issues.
- The Builder/Recovery -> `ready-for-review` -> Verifier -> `ready-for-qa` -> QA loop, label transitions, and the `Coder Agent says:` / `Verifier says:` / `QA says:` comment structures are defined in `workflow-fabrica`'s `references/qa-loop-contract.md`.

## Suggested flow

### 1) Resolve the project and tracker

First look for an existing ideation package at `docs/ideation/README.md`. When it is present, adopt its recorded root and `Provider`, read its status, and skip the root and provider questions below; when it is absent, resolve them normally.

Confirm the active project using the precedence in Core rules: the workspace repo by default (confirmed with one question), or an explicit path when there is no workspace repo or the user targets another one. Skip this question when the ideation package already fixed the root.
If the tracker is GitHub, inspect the remote and use that repository. Inspect Git and remote state before asking: do not re-ask for details that are already configured, and only ask when something is genuinely missing.
If the tracker is Linear, Notion, or another system, ask only for the access details needed to read tasks. See `Provider access patterns` below for the concrete tools per provider.

### 2) Read the factory labels

Confirm the tracker's labels or states. The factory vocabulary is: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-review`, `ready-for-qa`, `bug`, `blocked`, `ready-for-human`, `wontfix`.
The automatic pickup labels are `ready-for-agent` (implementation or bug fix) and `ready-for-qa` (QA). `ready-for-review` is not a pickup label: it means a writer has handed off and the task is waiting for Verifier.
If the task is not in a pickup state, do not execute it.
If `to-tickets` already published tickets (they carry `ready-for-agent`), discover and use them instead of recreating anything; the Fabrica labels are already applied.

### 3) Record runtime capabilities and route work

Record only the runtime capabilities that are actually available, using `fabrica-routing/references/runtime-capability-manifest.md`. Then `workflow-fabrica` selects Builder, Verifier, QA, or Recovery using the structured handoff envelope. Do not claim independent verification or workspace isolation when the manifest cannot prove it.

### 4) Delegate implementation

Send a Builder task using the spec handoff format below.
The delegation prompt should include:
- the implementation spec as a `Goal` block (see `Spec handoff format`)
- the repo context
- the tracker ticket reference
- the isolated-worktree instruction
- the branch isolation requirement
- the expected verification steps

Require the Builder to use an isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md` when the runtime capability manifest confirms it, and never claim that isolation when it is unavailable. Avoid touching the main branch directly.

### 5) Verify and hand off to QA

The Builder runs its required self-checks, opens or updates the PR, and leaves a `Coder Agent says:` handoff. A distinct Verifier then inspects the change and runs focused repository checks. Only a Verifier pass moves work to `ready-for-qa`.

From here `workflow-fabrica` runs the QA loop (`ready-for-qa` -> QA agent -> `ready-for-human` on pass, or `ready-for-agent, bug` on fail -> Recovery -> Verifier -> QA; a second QA fail -> `blocked`). Once the queues are empty the orchestrator merges `ready-for-human` PRs oldest-first, delegating any conflict. Full contract: `workflow-fabrica`'s `references/qa-loop-contract.md`.

## Spec handoff format

The orchestrator passes the implementation spec to the coding agent as an explicit `Goal` block, never as loose prose.

- In Claude Code, put it as a `## Goal` section at the top of the subagent prompt (the `Task` tool `prompt` argument).
- In other coding agents, use the agent's native structured goal/spec field when it supports one; otherwise embed the same `## Goal` block as plain text at the top of the prompt.

The `Goal` block contains:
- **Outcome**: the observable end state the change must produce.
- **Acceptance criteria**: checks that must pass for the task to be considered done.
- **In scope / Out of scope**: explicit boundaries so the agent does not expand the change.
- **Validation type**: one of `functional-only` | `scoped-visual` | `visual+functional`, declared at spec time; it decides which QA flows gate the task and is binding for QA.
- **Ticket**: the tracker reference (URL or ID) the work traces back to.

Use the `goal-prompting` skill to turn the task into this block.

## Provider access patterns

Use the most specific tooling available for each provider and prefer fully qualified MCP tool names (`Server:tool`).

- **GitHub**: use the `gh` CLI — `gh issue list`, `gh issue view`, `gh issue edit`, `gh issue comment`, `gh label list/create`, `gh repo view`. Use the GitHub MCP tools (`GitHub:*`) only when `gh` is unavailable.
- **Notion**: use the Notion MCP — `Notion:notion-search` and `Notion:notion-query-data-sources` to locate the task database, `Notion:notion-fetch` to read a page, `Notion:notion-update-page` to write status back.
- **Linear**: use the Linear MCP tools (for example `Linear:list_issues`, `Linear:get_issue`, `Linear:update_issue`) when present.
- **Other trackers**: ask for the minimum API base URL, auth, and read scope, and document the exact calls used to list and read tasks.

## Prompt pattern

When you delegate, keep the prompt short and operational:

- Lead with the `## Goal` block (see `Spec handoff format`).
- Use the confirmed project root; if the tracker is GitHub, resolve the repo from `git remote`.
- Work in a separate isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md`.
- Implement the task.
- Run tests and checks.
- Report back with what changed, what was verified, and any follow-up needed.

## Output style

When responding to the user, be direct and concrete:
- what task was found
- where it lives
- what agent was assigned
- what verification ran
- what state it moved to

## Do not

- Do not ask for a local path once the workspace repo is confirmed as the project root.
- Do not proceed on an unconfirmed project root, even when a workspace repo is present.
- Do not re-ask for the project root or the provider when an ideation package already recorded them.
- Do not require an ideation package to run factory setup, or require factory setup to run ideation.
- Do not guess tracker access details if the system can derive them from the repo or remote.
- Do not mark a task complete without verification.
- Do not send implementation work back to the user unless the workflow explicitly requires human review.
