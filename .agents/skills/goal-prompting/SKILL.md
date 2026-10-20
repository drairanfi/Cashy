---
name: goal-prompting
description: Turns vague work requests into short, verifiable, measurable prompts for delegating to long-running coding agents, with completion criteria, starting guidance, constraints, progress tracking, and cleanup criteria. Use when creating, rewriting, reviewing, or optimizing prompts for /goal, goal mode, Codex goal mode, autonomous coding tasks, or agent delegation, including when the user says "make this a goal", "goal prompt", "optimize this prompt for an agent", "run this with /goal", or asks how to structure work for a coding agent.
metadata:
  version: 0.3.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Goal Prompting

Use this skill to create prompts that work well with `/goal` or any long-running coding agent that must continue until a concrete outcome is reached.

The key idea: a goal prompt is not just an initial instruction. It is the agent's exit criteria. If the criteria are fuzzy, the agent cannot reliably know when to stop.

## Core Principles

Design every goal around these seven checks:

1. Verifiable completion criteria: define what must be true before the agent stops.
2. Starting guidance: give useful pointers, likely files, tools, constraints, and known risks.
3. Progress measurement: state how the agent should measure improvement or parity.
4. Realistic environment: specify the environment that counts as valid proof.
5. Visual caution: treat images as context, not the only success criterion.
6. Progress tracking: ask for durable checkpoints when the work may take a long time.
7. Cleanup and review: require reflection, removal of failed attempts, and final validation.

## Workflow

When asked to create or improve a `/goal` prompt:

1. Extract the actual desired outcome.
2. Convert vague language into observable acceptance criteria.
3. Prefer numeric targets when they are meaningful.
4. Add measurement commands, tests, benchmarks, screenshots, logs, or review artifacts.
5. Add boundaries that prevent bad shortcuts.
6. Keep the final `/goal` prompt concise enough to act as exit criteria.
7. If important information is missing, ask one focused question before drafting.

Do not turn the goal into a giant implementation plan. A goal prompt can reference a plan file, issue, spec, or benchmark, but the prompt itself should stay focused on the outcome.

## Platform limits (enforced before any work starts)

The `/goal` plugin validates the dispatch before the agent does anything.
Violating these limits rejects the goal outright, so check them before sending:

- **Objective cap: 4000 characters.** Measure the objective body before
  dispatching. A 4,783-character objective was rejected with
  `Objective too long: exceeds the 4000-character limit`; trimmed to 3,843
  characters with no loss of criteria, it was accepted. A goal with numbered
  acceptance criteria, a start-here list, constraints, and a pre-finish
  checklist lands near 4k on its own — keep it tight or move detail into a
  referenced file.
- **`--`-token trap: any `--token` inside the objective body is parsed as a
  flag.** An objective containing `git status --porcelain` fails with
  `Unsupported flag: --porcelain` — the message blames flags, but the fix is
  in the objective text (rewrite as `git status -s`). The same applies to
  HTML comment markers such as `<!-- BEGIN:nextjs-agent-rules -->`, which
  appear whenever a goal concerns generated agent-rules blocks. Rule: never
  put `--` inside the objective body; use short flags or move the command
  into a referenced file.
- **Supported flags:** `--max-turns`, `--max-minutes`, `--max-duration-ms`,
  `--max-tokens`, `--budget`, `--cooldown-ms`, `--no-progress-threshold`,
  `--no-progress-turns`, `--no-tool-turns`, `--success`, `--constraints`,
  `--mode`. Anything else that looks like a flag inside the objective is the
  trap above, not a real option.
- **Defaults are too low for real work:** 10 auto-continue turns, 15 minutes,
  200k tracked tokens. A goal that must install dependencies, build, lint,
  and open a PR needs these raised explicitly.

## Headless dispatch permission trap

A non-interactive `opencode run` **auto-rejects every permission rule that
evaluates to `ask`**. On a config with `git commit *` / `git push *` set to
`ask`, the delegated writer edits files successfully and then cannot commit,
push, or open the PR — the failure looks like a model or task failure and
is neither. Fix with a per-run `OPENCODE_PERMISSION` override that allows
the needed verbs while keeping `git push --force`, `git reset --hard`, and
`git rebase` explicitly denied (denied, not merely discouraged in prose).

Two related facts for headless runs:

- `opencode run` uses the working directory as its workspace (`--dir` is for
  attaching to a server, not for setting the workspace).
- Resume a partial run; do not restart it — a fresh run against an
  already-edited tree re-derives the wrong plan.

## Canonical home for this content

This skill (`goal-prompting` in `fabrica-skills`) is the **canonical**
source for the platform limits and the headless-dispatch pitfalls above.
The same material also exists in two locally installed Hermes skills —
`autonomous-ai-agents/coding-agent-delegation` and
`autonomous-ai-agents/agent-orchestration-control-plane`
(`references/provider-adapter-operations.md`) — which are **mirrors, not
sources**: the repo sync procedure copies the repo tree over the installed
targets, so local-only edits are lost on the next sync. Update this file;
do not patch the local copies.

## Goal Prompt Template

Use this structure by default:

```text
/goal [Outcome]

Completion criteria:
- [Verifiable criterion 1]
- [Verifiable criterion 2]
- [Verifiable criterion 3]

Start here:
- [Likely files, commands, docs, logs, screenshots, or systems]

Measure progress with:
- [Tests, benchmarks, production-like checks, visual diff tools, traces, coverage, timing, metrics]

Constraints:
- [No shortcuts, no reduced coverage, no fake data unless allowed, no visual asset hacks, no broad rewrites unless needed]

Progress tracking:
- [Commit/checkpoint/report cadence if long-running]

Before finishing:
- [Review, cleanup failed attempts, rerun validation, summarize evidence]
```

If the user wants a shorter output, collapse the sections into one compact prompt while preserving the same information.

## What Good Looks Like

Strong goal prompts include proof:

```text
/goal Reduce CI build time by at least 30% without weakening tests.

Completion criteria:
- Median CI build time on the same branch drops from the current baseline by >=30% across 3 comparable runs.
- Test coverage and required quality gates are not reduced.
- The final PR explains each optimization and includes before/after timings.

Start here:
- Inspect the CI workflow files, dependency installation, caching, and build steps first.

Measure progress with:
- Record the current baseline, then rerun comparable CI or local CI-equivalent commands after each meaningful change.

Constraints:
- Do not skip tests, remove checks, or hide failures to improve timing.

Before finishing:
- Remove failed experiments, run the full validation path, and summarize evidence.
```

Weak goal prompts lack stopping power:

```text
/goal Make CI faster.
```

That is too vague because the agent cannot know what "faster" means, whether shortcuts are allowed, or what proof is sufficient.

## Handling Visual Goals

For UI or design work, avoid using "100% pixel perfect" as the only target. Visual matching can send agents into low-value loops.

Prefer a combined goal:

```text
/goal Implement the dashboard UI from the provided reference using the existing design system.

Completion criteria:
- All states in the referenced spec are implemented: loading, empty, error, populated, and mobile.
- The page passes accessibility checks for keyboard navigation, labels, color contrast, and responsive layout.
- A screenshot comparison shows no major layout, spacing, typography, or color mismatch against the reference.

Constraints:
- Do not inline the reference image as a shortcut.
- Do not spend time reproducing decorative illustrations exactly unless they are part of the product requirement.
```

## When The Goal Is Not Ready

If the user's request is too ambiguous, ask one question that unlocks verifiability. Good questions are specific:

- "What metric should count as success: build time, deploy time, runtime latency, or all three?"
- "Which environment counts as proof: local, staging, deploy preview, or production-like?"
- "Is generated test data acceptable, or must the agent use the real dataset?"

After the user answers, draft the goal.

## Prompt Review Checklist

Before returning the final prompt, verify:

- The outcome is concrete enough for an agent to stop.
- At least one completion criterion is externally checkable.
- The prompt includes enough starting context to avoid wasting time.
- The measurement method cannot be gamed by weakening quality.
- The environment is realistic for the work.
- Long-running work has a tracking artifact or checkpoint strategy.
- The final instruction includes cleanup and final evidence.
- The objective body is under 4000 characters and contains no `--` token.

## Output Format

Return the optimized prompt first.

If useful, add a short note after the prompt explaining the most important tradeoff or missing assumption. Keep the explanation brief; the user usually needs a prompt they can paste into `/goal`.
