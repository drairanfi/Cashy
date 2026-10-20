# Subagents and roles (Claude Code)

How a Fabrica role becomes a Claude Code agent, how it is scoped and tiered, how deep it may delegate, and how to observe what it actually did. Verified against Claude Code **2.1.302** and <https://code.claude.com/docs/en/sub-agents>.

## A role is an agent definition

A subagent is a Markdown file: YAML frontmatter plus a body that becomes the subagent's **entire** system prompt (it does not receive the Claude Code system prompt, only its own prompt plus environment details). Only `name` and `description` are required.

```markdown
---
name: verifier
description: Independently verifies a builder's change against the ticket's acceptance criteria. Use for verdicts on a ready-for-review PR.
tools: Read, Glob, Grep, Bash
model: sonnet
effort: high
---
You are an independent verifier. ...
```

| Field | Effect |
| --- | --- |
| `name`, `description` | Required. `description` is how the main agent decides to delegate; the combined descriptions of your agents sit in context on every turn |
| `tools` | **Allowlist** (`Read, Glob, Grep`). Omit it and the agent inherits every tool available to subagents |
| `disallowedTools` | Denylist, applied on top of the inherited set. A specifier such as `Bash(git push *)` removes the **whole tool**, not the matching commands |
| `model` | `opus`, `sonnet`, `haiku`, `fable`, a full model id, or `inherit` |
| `effort` | `low`…`max` while this subagent is active; `CLAUDE_CODE_EFFORT_LEVEL` still wins |
| `permissionMode` | Same values as the CLI flag |
| `maxTurns` | Turn cap; at the limit the output is returned marked **partial** |
| `skills` | Skills preloaded with their **full content** (first 32 names) |
| `mcpServers`, `hooks` | Scoped to this subagent (ignored for plugin subagents) |
| `background` | Keep this agent in the background even when Claude asks for the foreground |
| `omitClaudeMd` | `true` launches without user/project/local CLAUDE.md (managed policy still loads) |
| `isolation` | `worktree` runs the agent in a temporary git worktree branched from the **default branch**, not the parent's HEAD |
| `memory` | `user`, `project` or `local` persistent memory scope |
| `autoCompactWindow` | Plain integer token count (100000–1000000); `200k` is read as `200` and ignored |

Unknown frontmatter fields are **ignored without an error** — check the definition, not the silence. A file is skipped outright (with the reason only in the debug log) when `name` or `description` is missing, the opening `---` is not the first line, `name` contains `:` or starts with `-`, or the YAML does not parse. `claude plugin validate <agents-dir>` pre-checks a directory.

### Where definitions live, and who wins

| Location | Scope | Priority |
| --- | --- | --- |
| Managed settings | Organization | 1 (highest) |
| `--agents` CLI flag | This session | 2 |
| `.claude/agents/` | This project | 3 |
| `~/.claude/agents/` | All your projects | 4 |
| A plugin's `agents/` | Where the plugin is enabled | 5 |

Project agents are discovered recursively and by walking up from the working directory; the definition **closest to the working directory** wins, identity comes only from `name`, and two files claiming the same `name` are resolved by filesystem read order with only `/doctor` reporting the duplicate. Claude Code watches both `agents` directories, so an edited definition applies to the next delegation — except for the first file created in a **new** directory, and for `--add-dir` directories.

**Handling a factory role from the CLI instead of disk** — useful when the brief must be self-contained:

```bash
claude -p "$(cat "$BRIEF")" --model haiku --agents '{"verifier":{"description":"Independently verifies a change","prompt":"You are an independent verifier.","tools":["Read","Grep","Glob","Bash"],"model":"sonnet"}}'
```

The file form of `--agents` requires `-p`; an invalid value is validated at startup and exits.

## Running a role as the whole session: `--agent`

```bash
claude -p "$(cat "$BRIEF")" --agent verifier --model sonnet
```

- The main thread takes on that agent's tool restrictions **and its model**.
- A custom agent's system prompt **replaces** the Claude Code system prompt entirely (as `--system-prompt` does).
- CLAUDE.md and project memory still load, even when the definition sets `omitClaudeMd`; with `-p` the session starts without the git status snapshot.
- The choice persists across `--resume`: a resumed session restores the agent's tools and model.
- `.claude/settings.json` can set `"agent": "<name>"` as a project default; the flag wins.

For a factory dispatch this is the cleanest way to make a run *be* the role instead of *asking* the model to act like it — one pinned agent, one pinned model, no reliance on a description triggering a delegation.

## Model and effort per role

Resolution order for a subagent: per-invocation `model` parameter → the definition's `model` → `CLAUDE_CODE_SUBAGENT_MODEL` → the main conversation's model.

- **Alias trap:** if the main conversation's model belongs to the alias's family, the alias resolves to the main conversation's **exact** model, `[1m]` extended-context suffix included — so `model: opus` on an Opus main session can be the expensive variant rather than a cheap one.
- `CLAUDE_CODE_SUBAGENT_MODEL` is a *default* (a definition or a per-invocation value still wins). To force one model on every subagent, teammate and workflow agent, also set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` (2.1.257+).
- Effort is the second dial: the definition's `effort` field, overridable per non-fork invocation (2.1.292+), above which sits `CLAUDE_CODE_EFFORT_LEVEL`.
- The built-in `Explore` and `Plan` agents are read-only and skip CLAUDE.md and git status to stay cheap; redefining `Explore` yourself overrides the built-in and lets you set its model.
- Aliases and families resolve differently per provider; verify with a smoke run rather than assuming (`headless-delegation-preflight.md`).

A workable factory tiering, with the reasoning next to each choice:

| Role | Model / effort | Why |
| --- | --- | --- |
| Explorer | `haiku`, `low` | Read-only discovery; the cheapest role in the pipeline |
| Builder | `sonnet`, `medium` | Writes code and runs the checks; the volume role |
| Verifier | a **different** model from the builder, `high` | Independence is the point — an independent verdict cannot come from the writer's own model |
| QA | `sonnet`, `medium` | Drives the product, not the diff |
| Recovery | `sonnet`, `high` | A fix after a failed verdict needs more reasoning, not more turns |

## Depth, concurrency and budget

| Limit | Default | Knob |
| --- | --- | --- |
| Nested layers below the main conversation | **3** — at the limit the `Agent` tool is withheld from every non-fork subagent | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (`1` disables nesting) |
| Concurrent subagents per session | **20** — past it, spawning fails with `Concurrent subagent limit reached` and the error says not to retry | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` (ultracode sessions are exempt) |
| Spend | none | `--max-budget-usd`; subagent spend counts, and at the cap spawning fails with `Budget limit reached` and running background subagents are stopped |

To stop one specific agent from spawning others, omit `Agent` from its `tools` list. To stop delegation entirely, deny the `Agent` tool. In non-interactive mode and SDK sessions, `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1` removes the built-in types.

A subagent that hits `maxTurns` returns a **partial** result, not an error, and can be resumed — treat a partial as an unfinished unit of work, never as a verdict.

## Foreground, background and what that costs

- **Foreground** subagents block the main conversation; **background** ones run concurrently and report back as a completion notification in a later turn.
- Fork mode is **on** in interactive sessions and **off** in `-p` and the SDK. With it off, Claude runs a subagent in the background by default and in the foreground when it needs the result before continuing; `background: true` keeps one agent in the background regardless.
- Background subagents run with a **smaller built-in tool set** than foreground ones (forks and resumed foreground subagents excepted) and the reduction is silent unless the tool list ends up empty.
- A `-p` run **stays open** while subagents and background work it started are still running, because their results are part of the final output; the wait is capped at 10 minutes by default (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`, `0` for no cap). A dispatch that "hangs" after its last visible output is usually waiting exactly here.

## Context: what crosses the boundary

A non-fork subagent starts with a **fresh, isolated context window**. It does not see the conversation, the files the parent read, or the skills the parent already invoked. It receives:

- its own system prompt plus environment details (not the Claude Code system prompt),
- the delegation prompt the parent wrote,
- the CLAUDE.md hierarchy, `AGENTS.md` project instructions and managed policy files,
- a git status snapshot,
- the full content of any skill named in `skills`,
- a roster of *named* agents when it has the `SendMessage` tool.

Consequences for briefs: **the Agent prompt string is the only channel you control.** File paths, error text, decisions already made and constraints that live in the parent's CLAUDE.md must be restated in the brief. Analyses of a running session also note that the parent may summarise a subagent's report, and that a report is scanned on the way back with backslashes and a `[harness: …]` marker added for instruction-shaped text — the scan never removes or rewords the subagent's own text.

A **fork** is the opposite trade: it inherits the entire conversation (same system prompt, tools, model, history), reuses the parent's prompt cache, and can be started with `/subtask` — but it drops input isolation, it cannot spawn further forks, and in `-p` fork mode is off unless `CLAUDE_CODE_FORK_SUBAGENT=1`.

## A delegated run, measured

A `-p` session pinned to `haiku`, asked to count three files through the built-in `Explore` subagent, returned:

```text
result: COUNT=3        num_turns: 2      total_cost_usd: 0.09497765
subagent_stats: {"spawned": 1, "requested": {"background": 0, "foreground": 1, "unset": 0},
                 "started_in_background": 0, "max_depth": 1, "spawned_by_subagents": 0,
                 "completed": 1, "failed": 0, "killed": {...}, "refused": {...},
                 "by_type": {"Explore": 1}}
modelUsage:  claude-haiku-5-5   costUSD 0.0128   (the session)
             claude-sonnet-5-5  costUSD 0.0822   (the Explore subagent)
```

Three things follow from it:

1. `subagent_stats.spawned` plus `by_type` is the delegation receipt: work was really delegated, and to which agent type.
2. `modelUsage` is **per model**, and a subagent's model is its own — the session was pinned to `haiku` and the delegated step ran on `sonnet`, at six times the session's cost. Pinning the session model is not a budget.
3. `usage` covers the main agent loop only; subagent spend appears in `modelUsage`. Attribute cost from `modelUsage`.

## Observing what a subagent actually did

| Surface | What it gives you |
| --- | --- |
| `claude -p --output-format json` → `subagent_stats` | `spawned`, `completed`, `failed`, `max_depth`, `spawned_by_subagents`, `killed`, `refused` (`depth_limit`, `concurrency_limit`, `budget`) and `by_type`, which names the agent type. The cheapest delegation receipt in a headless run |
| `--forward-subagent-text` (with `--output-format stream-json`) | The subagent's own text and thinking blocks, each with `parent_tool_use_id`; without it the stream carries only its tool calls |
| Transcript files | `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` |
| `SubagentStart` / `SubagentStop` hooks | Deterministic lifecycle logging; hook payloads carry `agent_id` and `agent_type` |
| `/tasks`, the subagent panel | Interactive only: rows per subagent with the model and effort of each |

A run that delegated and a run that merely claimed to delegate are distinguishable: a non-zero `subagent_stats.spawned` means an `Agent` tool call actually happened. When a role's brief says "delegate the exploration", read that field before believing the report.

## Agent teams, and why the factory does not need them

Agent **teams** are an experimental, off-by-default feature where one session acts as team lead, assigns tasks to named teammates, and the teammates talk to each other. They are worth knowing because they are easy to confuse with subagents: teammates are separate sessions, they are **not** worktree-isolated (partition files yourself), and token use scales with the number of active teammates. For Fabrica's flow the dispatch-plus-report contract is the better fit: one worktree per task, one role per dispatch, one report per role — and it keeps the orchestrator's context thin.
