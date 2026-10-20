# Agents, chains and roles (Pi)

How a Fabrica role becomes a Pi agent, how a chain runs a sequence of them, and how to observe what a step actually did. Verified against the local installation (Pi **1.1.0**, `gentle-pi` **4.3.0**) and the official documentation under <https://pi.dev/docs/latest>.

## Pi core has no subagents — delegation comes from extensions

The upstream documentation is explicit: "Pi ships with powerful defaults but skips features like sub-agents and plan mode." So on Pi, delegation is a **capability you install**, not a built-in.

That is not just a quote — Pi's own bundled documentation has no agents or chains page, its `configuration.md` enumerates every `<agent-dir>` path without listing `agents/` or `chains/`, and the word `subagent` does not appear in Pi's bundled `cli.js` at all. **The agent-file and `.chain.md` conventions are an extension convention**: they originate in Pi's shipped `examples/extensions/subagent/` and are implemented on this machine by `gentle-pi` 4.3.0 (`extensions/gentle-agents.ts`, with the `subagent_` tool prefix).

Two layers therefore exist in this environment, and the choice between them is capability-dependent:

1. **Pi's native `Agent` tool** — the fallback if nothing else is installed.
2. **The `subagent_*` tool family from the Subagents extension** (`pi-subagents`), which is the preferred runtime when present because it "runs the user's configured project/global subagent definitions and preserves history/background behavior".

`gentle-pi` (the ODD harness installed here, 9 user packages in total) *consumes* that: it ships the agent definitions and chains as **managed assets** into `~/.pi/agent/`, and its own docs say "if those tools are unavailable, the parent should fall back to Pi's native `Agent` tool or another available delegation mechanism. The requirement is delegation; the runtime is capability-dependent."

**The consequence for a factory dispatch is concrete:** `subagent_run` and `subagent_continue` **reject background mode in the single-shot modes `pi -p` and `pi --mode json`**, because those modes exit before a background result could ever be delivered. In a headless dispatch, delegation runs in bounded **task** mode only.

## The agent file

An agent is a Markdown file whose body is the whole system prompt:

```markdown
---
name: gentle-ai-worker
description: Scoped package-owned implementation writer for bounded non-SDD work. Edits code, runs focused tests, and returns review-ready evidence without committing.
tools: read, grep, find, edit, write, bash, mem_save, mcp
---

You are the package-owned implementation writer for Gentle AI.
…
```

| Frontmatter | Meaning |
| --- | --- |
| `name` | Identity of the agent, and how a chain step refers to it |
| `description` | When the parent should delegate to this agent — it sits in context, so keep it trigger-shaped |
| `tools` | Comma-separated allowlist (`read`, `grep`, `find`, `edit`, `write`, `bash`, `mcp`, plus extension tools such as `mem_save`). Omit it to inherit the tool set |

Known agent definition locations (from the `gentle-pi` reference):

| Scope | Directories |
| --- | --- |
| Project | `.pi/subagents/`, `.pi/agents/`, `.agents/` |
| User | `~/.pi/agent/subagents/`, `~/.pi/agent/agents/`, `~/.agents/` |

On this host `~/.pi/agent/agents/` holds 22 definitions, all installed as managed assets by `gentle-pi` (`sdd-*`, `gentle-ai-*`, `review-*`, `jd-*`). A role definition is therefore reproducible: it is a file, and it can be reviewed like one.

**Version check before trusting the harness:** the installed `gentle-pi` 4.3.0 documents a requirement of **Pi 1.2.0 or newer**, while this host runs **Pi 1.1.0**. Read the package's own requirement before assuming the delegation surface is complete, and treat a degraded feature as a version mismatch rather than a bug.

## Chains

A chain is a `.chain.md` file that runs steps in order, each bound to an agent of the same name:

```markdown
---
name: 4r-review
description: One-shot lens-only 4R discovery against a supplied initial review tree; the controller owns all authority.
---

## review-risk

output: review-risk-report.md
outputMode: file-only
progress: true

Run R1 Risk exactly once against the supplied `initial_review_tree`. Return candidate rows for security, …
```

| Part | Meaning |
| --- | --- |
| Frontmatter `name` / `description` | Chain identity and when to use it |
| `## <step>` heading | The step, named after the agent to run (`## review-risk` → `agents/review-risk.md`) |
| `output` | The file the step writes its result to |
| `outputMode: file-only` | The step's result goes to the file instead of into the conversation |
| `progress: true` | Report progress for the step |

Chains live beside the agents and are installed the same way: `gentle-pi` records `assets/chains/` as "review chains installed as global Pi runtime assets", and its `/gentle:install-review` command installs missing global review agents and chains (with `--force` refreshing the managed copies).

A chain is not a subagent. A subagent is one bounded delegation that returns a report; a chain is a fixed sequence with declared per-step outputs, driven by the harness rather than chosen by the model at runtime. Use a chain when the sequence is the point (a review pipeline), and a subagent when the parent should decide what to delegate.

What this reference does **not** assert, because it was not verified: how the chain executor schedules steps and passes context between them, whether `outputMode` accepts values other than `file-only`, and whether an agent can pin a thinking level in its own frontmatter (only the CLI flag and the extension's per-agent model profiles are verified here).

## Roles: model, thinking and tool scoping

- **Per-role model routing exists inside the extension**, not only on the CLI: `gentle-pi` uses per-agent model profiles (`profiles.json`, materialized `subagents.json` routing, and exportable `gentle-pi.agent_model_profile` envelopes). An unpinned session uses the globally active profile.
- On the CLI, pin the role's model and thinking level as the dispatch does (`--model provider/id:level`, `--thinking`) — see `limits-and-costs.md` for the pinning recipe and the clamping caveat.
- Scope `tools` in the agent definition. Prefer an allowlist over a denylist; a read-only verifier is a `tools:` line, not a promise in prose.
- **Admission control that matters for parallel work:** when the subagent runtime queues a bounded writer, it is rejected if another queued or running writer of the same parent process in the same worktree has an **overlapping `## Allowed edit surfaces` entry**. Writers are keyed by the realpath of the worktree root, so a subdirectory cwd and the root count as one worktree. It is an admission-time check, not a write guard, and separate Pi processes do not coordinate.

## Observing what a step actually did

| Surface | What it gives you |
| --- | --- |
| `--mode json` stream | `tool_execution_start/update/end` events correlated by `toolCallId`, plus a `turn_end` per turn with provider, model, thinkingLevel, `usage` and cost |
| The session file | Every message with its `model`, plus the `model_change` / `thinking_level_change` provenance entries |
| The agents overlay (interactive) | One row per delegated thread with model, tokens and elapsed time, and the structured handoff it returned |
| `pi list` | The installed extension set, which is what makes the delegation surface available at all |
| `PI_PROVIDER` / `PI_MODEL` / `PI_REASONING_LEVEL` inside the run | Self-reporting source of truth, injected into the `bash` tool |

A child run must emit **`agent_settled`** to count as complete: `agent_end` "records a run's output but is not completion because retries or queued continuations may follow". The same rule applies to the parent dispatch — a wrapper that needs completion waits for `agent_settled`.

## MCP, and what it means for a delegated role

`pi mcp` never starts a session; it edits and inspects the MCP configuration directly:

```text
pi mcp add <server> [--url <url> | -- <command> [args…]] [--env K=V] [--header K=V] [--oauth-client-id <id>]
pi mcp remove <server> [-l]     pi mcp list [--json]     pi mcp login|logout <server>
```

- It "reads `~/.pi/agent/mcp.json` and, **in trusted projects**, `.pi/mcp.json`" — the project file is `.pi/mcp.json`, and `-l/--local` targets it instead of the global file. An unapproved project therefore has no project MCP servers, which is one more reason `--approve` must be explicit in a dispatch.
- `pi mcp list` shows state, tools and errors, and **exits 1** on an invalid entry or an enabled-but-unconnected server — usable as a check.
- **On this host, built-in MCP is disabled**: `settings.json` carries `-builtin:mcp` and `-builtin:codemode`, so the `mcp` tool that the local agent definitions declare is *not* Pi's built-in implementation. Which package provides it is UNVERIFIED here; `pi-mcp-adapter` (documented as replacing built-in MCP) is not installed. The `pi mcp …` shell commands always drive the built-in implementation, regardless of which adapter a session uses.

Consequence for a role: an agent whose `tools:` list includes `mcp` depends on an extension being present. If a dispatch runs with `--no-extensions` or `--no-mcp`, that tool is gone and the role must be told so in its brief rather than discovering it mid-task.

## Playbook: making a Pi dispatch delegate well

1. **Put the whole task in the prompt argument.** A subagent/step receives the prompt plus its own definition, not the parent conversation; file paths, error text and constraints have to be restated. `@file` adds context; it is not the instruction.
2. **Declare the output.** The durable convention here is the family's own: an objective block (`## Goal` / `## Objective`), a result record with `schema_version: 1`, and a role handoff line (`Coder Agent says:` / `Verifier says:` / `QA says:`). The dispatch guards enforce exactly that before launching.
3. **Scope tools in the definition, not in the prompt.** A `tools:` allowlist is enforced; a sentence asking the model to stay read-only is not.
4. **Tier the model and effort per role**, and record both from the receipt. An independent verifier on the writer's model and level is not independent.
5. **Cap the cost at the channel**, not at the prompt: the extensions and their tool declarations are what the request pays for. See `limits-and-costs.md`.
6. **Read the receipt, not the prose.** `turn_end.message.stopReason` and `agent_settled.aborted` decide whether the step completed; a JSON-mode run exits 0 even when the turn failed.
