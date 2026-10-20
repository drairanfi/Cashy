---
name: claude-code-headless
description: Dispatches a Fabrica role on headless Claude Code (`claude -p`) and verifies the channel before launching. Use when delegating a task to a Claude Code agent, pinning its model, effort, permission mode or output format, reading its JSON result, or troubleshooting a Claude dispatch that hangs, exits non-zero, or reports a different model than the one pinned.
metadata:
  version: 0.1.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Headless Claude Code

Use this skill to run one Fabrica role unattended on Claude Code and read the result back: the pinned `claude -p` shape, the channel preflight, the fail-closed input guards, the model/effort pin per role, and the failure modes that look like something else.

This is the Claude channel, the sibling of `opencode-go-deepseek-flash` and `opencode-go-gpt-5-6-terra`. Same contract, different traps: OpenCode fails closed by auto-rejecting `ask` rules; `claude -p` has no interactive prompt at all, so it **waits** for a permission host unless it is told nobody is there.

Use it when a role must run unattended, when the model, effort, permission mode or output format must be pinned, when the run's result has to be read as data, or when a dispatch hangs or dies.

Do not use it for an interactive Claude Code session (run `claude` without `-p`), and do not use it to dispatch OpenCode work — that is the sibling skill's channel.

## The dispatch, in one line

```bash
cd "$WORKTREE" && timeout 5400 claude -p "$(cat "$BRIEF")" \
  --model "$MODEL" \
  --permission-mode bypassPermissions \
  --permission-prompts none \
  --output-format text 2>&1 | tee "$LOG"
```

Every part of that line is load-bearing:

| Part | Why it is there |
| --- | --- |
| `claude -p` | Non-interactive mode. It also skips the workspace trust dialog and silently ignores a settings file that fails validation. |
| `"$(cat "$BRIEF")"` | The brief is a file. A brief that was never written becomes an empty prompt, and an empty `-p` run fails with exit 1 and `Input must be provided either through stdin or as a prompt argument`. Assert it before launching. |
| `--model "$MODEL"` | Mandatory and explicit. Without it the model comes from settings, and an unrecognized name is a warning, not a preflight failure. |
| `--permission-mode bypassPermissions` | Runs without asking. Reads, edits, Bash and `gh` all work; anything an explicit `ask` rule matches is still denied, and in `-p` it is denied instantly instead of prompted. |
| `--permission-prompts none` | "Nobody can approve this." Without it, a run that has any permission host waits for an answer that never comes — the hang this flag exists to prevent. |
| `--output-format text` | The role's final message goes to stdout and straight into the log. Use `json` when the result has to be parsed (see below). |
| `timeout 5400` | A dispatch cap that is independent of the API and of the background-work ceiling. |
| `tee "$LOG"` | The run's log is the evidence. Write it under the task's log directory, one file per dispatch. |

For a run whose result must be structured, add `--output-format json` (and keep the log) — the final object then carries `result`, `session_id`, `num_turns`, `total_cost_usd`, `permission_denials`, `modelUsage` and `subagent_stats`. See `references/cli-surface-and-output.md`.

## Before every dispatch

Two gates, both required, both fail-closed:

1. **The channel is ready** — binary, version, credentials, and a model alias that actually resolves.
2. **The inputs exist** — the worktree, the brief, and the brief's required markers.

```bash
# 1. Channel: exits non-zero and names the failing check
skills/delegate/claude-code-headless/scripts/claude-channel-preflight.sh --model haiku

# 2. Inputs + dispatch: exits non-zero before anything launches
skills/delegate/claude-code-headless/scripts/dispatch-claude.sh \
  "$WORKTREE" "$BRIEF" "$LOGDIR" haiku
```

`references/headless-delegation-preflight.md` states exactly what each check proves, the ready / not-ready condition for every one, and the measured evidence behind them.

## Pin the model per role — and record which one ran

- `--model` takes an alias (`opus`, `sonnet`, `haiku`, `fable`) or a full model name. An unrecognized name prints `Claude Code doesn't recognize the model "<name>", so it assumes a context window of 200k tokens`, emits `[claude-code:unrecognized_model]`, and exits **1** — a cheap failure, but only if the dispatcher looks at the exit code.
- Pin the model **per role**, not once for the factory. A Verifier running on the writer's own model is a weaker independent check, and `--model` is the lever that separates them.
- Pin the effort too: `--effort low|medium|high|xhigh|max`. On the 5.5 family the default is `medium`; `low` measurably reduces thinking tokens to zero on a trivial prompt. The reasoning lever a role needs is `--effort`, not a phrase in the prompt — the old `think` / `think harder` ladder is gone and only `ultrathink` survives as a keyword.
- **Pinning the session model does not pin the subagents.** A measured run pinned to `haiku` that delegated once to the built-in `Explore` subagent reported **two** models in `modelUsage`: `claude-haiku-5-5` at `costUSD 0.0128` and `claude-sonnet-5-5` at `costUSD 0.0822` — the delegated step cost six times the role it was delegated from. Set the agent's own `model`, or `CLAUDE_CODE_SUBAGENT_MODEL` (with `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` to override definitions), and read `modelUsage` per model to see where the money went.
- **Prove what ran, don't assume it.** With `--output-format json` the result carries `modelUsage`, keyed by the canonical model that executed:

```bash
claude -p "$(cat "$BRIEF")" --model haiku --output-format json --permission-prompts none \
  | tee "$LOG" | jq -r '"model=\(.modelUsage | keys[0]) turns=\(.num_turns) cost=\(.total_cost_usd) denials=\(.permission_denials | length)"'
```

That line is this channel's answer to "a dispatch must fail closed on its own inputs": the dispatcher echoes the model it passed, and the payload states the model that ran.

## Read the result the same way every time

Record, per dispatch: the pinned model, the branch and commit of the worktree, the brief path and its byte size, the log path, the exit code, then from the JSON payload `modelUsage`, `num_turns`, `total_cost_usd`, `terminal_reason` and `permission_denials`.

`terminal_reason` is how a run that ended early says so (`completed`, `max_turns`, `budget_exhausted`, `prompt_too_long`, `model_error`). A non-empty `permission_denials` on a `bypassPermissions` run means an explicit `ask` rule or a critical-path removal fired, not a mode problem.

## Failure modes that look like something else

| Symptom | What it actually is | Fix |
| --- | --- | --- |
| The dispatch hangs with no output | A permission host is being waited on | Pass `--permission-prompts none` |
| The run starts, edits nothing, exits 1 | Unpinned or misspelled model | Pin `--model`, check the exit code |
| `--dangerously-skip-permissions cannot be used with root/sudo privileges` | Running as root | Run as a normal user, or use `--permission-mode dontAsk` |
| Settings changes have no effect | A `-p` run silently skips settings that fail validation | Run `claude doctor` and read what it dropped |
| Exit 143, no result recorded | SIGTERM ended the process tree | Send SIGINT for a clean end, else treat the turn as unfinished |
| The run outlives the turn | Foreground subagents and background work keep it open; the wait is capped at 10 minutes by default | Pass `--max-budget-usd`/`--max-turns`, or watch `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` |
| Tool surface far larger than the task | MCP servers and plugins loaded before the prompt | `--strict-mcp-config` with no `--mcp-config`, `--setting-sources`, `--agent` |
| A delegated run costs far more than the pinned model suggests | The subagent ran on its own model, not the session's | Pin the subagent `model`; attribute the spend from `modelUsage` |
| `You've hit your session limit` / `weekly limit` | Plan quota, shared across models | Wait for the reset; the Opus/Sonnet limits are the only family-scoped ones |

## The cost of a dispatch is decided before the prompt arrives

Measured on a heavily configured home (2.1.302, haiku): a default `claude -p` dispatch loaded **133 skills, 32 agents, 414 tools across 22 MCP servers**, and the first run of the day paid **405k cache-creation tokens ($0.405)** for a five-token answer. The same prompt with `--strict-mcp-config` (no servers) loaded **24 tools** and cost **$0.009** once the prompt cache was warm.

So: trim the environment instead of the prompt, and reuse the cache — a model switch, an effort change, an MCP change, a plugin toggle and an upgrade all invalidate it. `references/limits-and-costs.md` has the measurements, the quotas, the context rules and the levers.

## References

- `references/headless-delegation-preflight.md` — channel and input readiness, with the ready / not-ready condition and the exact command for each check.
- `references/cli-surface-and-output.md` — flags by purpose, the `text` / `json` / `stream-json` contracts, exit codes, timeouts, sessions and resume.
- `references/subagents-and-roles.md` — role agents, tool and model scoping, nested and forked subagents, and how to observe one.
- `references/limits-and-costs.md` — quotas, spend limits, context and compaction, measured dispatch overhead, and what Claude Code refuses to do.
- `scripts/claude-channel-preflight.sh` — ready / not-ready for the channel.
- `scripts/dispatch-claude.sh` — guarded dispatch that echoes the pinned model.
