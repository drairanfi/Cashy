---
name: setup-ideation
description: "Human entry gate for the Fabrica ideation phase: captures the initial idea, runs a deep grill-me discovery, optionally prototypes low-fidelity wireframes, chooses the ticket provider, and produces a versioned ideation package before to-spec is allowed. Use when a person says they want to start a new project or feature from scratch and wants a guided, step-by-step ideation before any tickets exist."
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git remote *) Bash(git branch *) Bash(git log *) Bash(gh repo view *)
metadata:
  version: 0.3.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Setup Ideation

Use this skill when a **person** wants to turn an idea into a decision package before any ticket exists.
It is the single door into the Fabrica ideation phase: idea in, `docs/ideation/` package out.

## Invocation

This skill is **user-invoked only** (`disable-model-invocation: true`). A person must run it explicitly with `/setup-ideation`.
The orchestrator, `workflow-fabrica`, or any other agent must never trigger it automatically. If ideation is missing and work is requested, the agent tells the person to run `/setup-ideation` and stops.

## What this skill does

1. Resolve the project root.
2. Ask the person to explain the idea in their own words.
3. Run `grill-me` (which delegates to `grilling`) for deep discovery. This is mandatory.
4. If the product has a graphical interface, offer `prototype` to build low-fidelity wireframes. This can run in parallel with `grill-me`.
5. Choose where tickets will live (GitHub first, local tracker otherwise).
6. Verify the ideation package is complete enough, then hand off to `to-spec` and `to-tickets`.

This skill prepares decisions. It never implements features and never runs QA.

## Core rules

- The flow is strictly step-by-step: ask your own setup questions **one at a time** and wait for the answer before moving on. The `grilling` discovery step is the exception: it follows the `grilling` skill's design-tree rounds, asking a frontier of questions per round.
- Never invent the person's idea, users, or rules. Ask, record, and play back what was said.
- `grill-me` (or `grill-with-docs` when the project also needs domain docs) is mandatory: do not skip it and do not fast-forward it. Every requirement must trace back to a grill round or be recorded as pending.
- `prototype` is optional and conditional on a graphical interface. It is independent of `grill-me`, so it may run in parallel. Never block `to-spec` on prototypes.
- Choose the ticket provider **before** `to-spec`, because `to-spec` and `to-tickets` read it.
- A detail that cannot be answered yet is not a blocker. Record it in `docs/ideation/pendings.md` with the question, why it is open, and who can answer it.
- Do not write tickets here. Ticket creation belongs to `to-tickets`.
- The orchestrator never edits code, verifies code, runs QA, or resolves conflicts. This skill only produces ideation artifacts.

## Suggested flow

### 1) Resolve the project root

Use the same precedence as `setup-fabrica`:

1. If a repo is open in the workspace, treat it as the active project and confirm it with a single question.
2. Otherwise, ask for the full path to the project folder.

Do not assume a path the person has not confirmed, and do not ask for a path when the workspace repo is confirmed.

Classify the project: **new** (no repo yet) or **existing**. For a new project, confirm whether to create the folder and initialize Git; record the exact command used. For an existing project, inspect `README`, `AGENTS.md`/`CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, and the package manager, and preserve everything.

### 2) Capture the idea

Ask the person to explain the idea in free form: the problem, who it is for, and what success looks like. Let them talk; do not interrupt with a questionnaire yet.

Write this raw capture into `docs/ideation/README.md` as the idea summary before moving on.

### 3) Run grill-me (mandatory)

Read and follow `skills/ideation/grill-me/SKILL.md`, which delegates to the `grilling` skill. Work its design tree in rounds until the frontier is empty.
When the project should also build its domain model during discovery, use `skills/ideation/grill-with-docs/SKILL.md` instead: it grills and creates `CONTEXT.md` and `docs/adr/` as decisions land. Run one or the other, not both.
`grilling` persists the full round-by-round record to `docs/ideation/grill-log.md`, the distilled requirements to `docs/ideation/requirements.md`, the concept-level context to `docs/ideation/vision.md`, and anything unanswerable to `docs/ideation/pendings.md`.

Do not proceed while grill-me is unfinished.

### 4) Prototype low-fidelity wireframes (conditional)

Ask one question: **does this product have a graphical interface?** (a screens-based app, site, or admin UI, as opposed to a CLI, library, API, or headless service).

- **No interface** → skip this step and go to step 5.
- **Has interface** → read and follow `skills/ideation/prototype/SKILL.md`. Because prototypes are independent of grill-me, this step may run in parallel with step 3 when the person wants it.
  The result lives in `docs/prototypes/`: the HTML/CSS/JS wireframes plus `prototype.md`, which summarizes what was prototyped and the decisions it settled.

If the person declines prototyping, record that in `docs/ideation/README.md` and continue. A missing prototype never blocks `to-spec`.

### 5) Choose the ticket provider

Ask one question: **where do you want to manage the tasks?** GitHub Issues or a local tracker.

- **GitHub** → confirm the remote. If the project has no Git repository or no remote, see `to-tickets` for the bootstrap flow (`git init`, first commit, `gh repo create` / remote URL). Record the provider in `docs/ideation/README.md`.
- **Local** → the tracker is the versioned `.scratch/<feature-slug>/issues/` folder described in `to-tickets`. Record the provider in `docs/ideation/README.md`.

GitHub is the first supported provider; more providers can be added later without changing the ideation package.

### 6) Verify the gate and hand off

Confirm the ideation package against `references/ideation-package.md`:

- `docs/ideation/README.md` has the idea summary, provider, owner, and status.
- `docs/ideation/vision.md` states the problem, actors, and measurable outcome.
- `docs/ideation/requirements.md` has high-depth functional and non-functional requirements with acceptance criteria and edge cases.
- `docs/ideation/pendings.md` exists (possibly stating "no open questions").
- `grill-me` reached an empty frontier and said the necessary questions are done.

If the gate passes, tell the person the next step is `to-spec`, then `to-tickets`. If it does not, return to the missing step. Do not create tickets.

## Handoff

- `to-spec` reads the ideation package and publishes the spec to the chosen tracker as a `needs-triage` parent. It cannot run without `grill-me` output; it can run without prototypes.
- `to-tickets` reads the spec and publishes tracer-bullet tickets with Fabrica labels through the chosen provider.
- After tickets exist, the person runs `/setup-fabrica` to configure factory execution, which is independent of ideation: a project may already have tickets without ever running this skill.

## Do not

- Do not run this skill automatically or on the orchestrator's behalf.
- Do not skip or shorten `grill-me`.
- Do not require a prototype to continue.
- Do not create issues or tickets here.
- Do not ask for a project path once the workspace repo is confirmed.
- Do not promise a separate agent, isolated worktree, browser, or visual QA from this skill.
