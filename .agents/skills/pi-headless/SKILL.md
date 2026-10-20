---
name: pi-headless
description: Dispatches a Fabrica role on headless Pi (`pi -p`) and verifies the channel before launching. Use when delegating a task to the Pi coding agent, pinning its provider, model or thinking level, choosing an output mode, reading the JSON event stream, or troubleshooting a Pi run that hangs, drifts onto another model, or reports success for a turn that failed.
metadata:
  version: 0.1.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Headless Pi

Use this skill to run one Fabrica role unattended on Pi and read the result back: the pinned dispatch shape, the channel preflight, the fail-closed input guards, the provider/model/thinking pin per role, and the failure modes that look like something else.

This is the Pi channel, the sibling of `claude-code-headless` and `opencode-go-deepseek-flash`. Same contract, its own traps. Pi's biggest one is the opposite of "it failed loudly": **a failed or aborted turn still exits 0 in JSON mode**, so a dispatcher that trusts the exit code reports success for work that never happened.

Use it when a role must run unattended, when the model or thinking level must be pinned, when the run's result has to be processed as data, or when a dispatch hangs, drifts onto a different model, or claims success without doing anything.

Do not use it for an interactive Pi session, and do not use it to dispatch Claude Code or OpenCode work — those are the sibling skills' channels.

## The dispatch, in one line

```bash
cd "$WORKTREE" && timeout 5400 "$PI" -p --mode json \
  --model "$PROVIDER_MODEL" \
  --thinking "$LEVEL" \
  --approve \
  --models "$PROVIDER_MODEL" \
  "$(cat "$BRIEF")" > "$LOG.jsonl" 2> "$LOG.err"
```

`$PI` is an absolute path — see the first trap below. Every part of that line is load-bearing:

| Part | Why it is there |
| --- | --- |
| `"$PI"` | **Pi is not on a non-interactive `PATH`.** On this host the binary is `/home/ajosecortes/.local/share/pnpm/pi`; a bare `pi` fails with `command not found`, which reads like a broken environment instead of a missing path. |
| `-p` | One-shot print mode: process the prompt and exit. It also removes every interactive prompt, so anything that would ask hangs instead. |
| `--mode json` | A JSONL event stream on stdout — the receipt. `text` prints only the final answer; `rpc` keeps Pi alive for a client. |
| `--model "$PROVIDER_MODEL"` | Provider-qualified (`provider/id`). A bare id can be ambiguous across providers, and a misspelled one is **not** an error: Pi warns on stderr, uses a custom model id, and fails later at the provider. |
| `--thinking "$LEVEL"` | The reasoning level. It is **clamped** to what the model supports, so the level you asked for is not necessarily the level that ran. |
| `--approve` | Makes the project trust decision explicit. Without it an unapproved project is **silently skipped**: project settings, `.pi/mcp.json`, project extensions/skills and project packages never load. |
| `--models "$PROVIDER_MODEL"` | Pins the model cycle, so nothing can drift onto another model mid-run. |
| `-- "$(cat "$BRIEF")"` | The brief is a file. Pi does not read a brief from a file by itself: `@file` inclusion is for context, not for the instruction. |
| `timeout 5400` | Pi has **no global run timeout**. The wall clock is the dispatcher's job. |
| `> "$LOG.jsonl" 2> "$LOG.err"` | **Stdout is reserved for the JSONL stream.** Keep diagnostics on stderr in a separate file; an extension that prints to stdout corrupts the stream. |

Two flags are deliberate omissions worth stating: Pi loads `AGENTS.md` / `CLAUDE.md` **regardless of trust**, and loads skills and extensions into the system prompt. For a deterministic role add `--no-context-files`, `--no-skills` (then `--skill <path>` for the ones it needs) and `--no-extensions`. For a role that should follow the repository's own conventions, keep the context files and say so.

## Before every dispatch

Two gates, both required, both fail-closed:

1. **The channel is ready** — binary, provider auth, and a model id that exists in the catalog for that provider.
2. **The inputs exist** — the worktree, the brief, and the brief's required markers.

```bash
# 1. Channel: exits non-zero and names the failing check
skills/delegate/pi-headless/scripts/pi-channel-preflight.sh --model oc-sdk-go/deepseek-v4-flash

# 2. Inputs + dispatch: exits non-zero before anything launches
skills/delegate/pi-headless/scripts/dispatch-pi.sh \
  "$WORKTREE" "$BRIEF" "$LOGDIR" oc-sdk-go/deepseek-v4-flash high
```

`references/headless-delegation-preflight.md` states what each check proves, the ready / not-ready condition for every one, and the measured evidence behind them.

## Pin the provider, the model and the thinking level — then prove what ran

- Always `provider/id`, or `--provider X --model Y`. Pi's resolution order is CLI `--model` → the scoped `--models`/`enabledModels` → the settings default → the first authenticated model; if several providers match it **asks for `--provider`**, and if nothing matches it **opens the model selector at startup**, which hangs an unattended run.
- Validate the id against the catalog before launching: `"$PI" --list-models <id>`. A typo becomes a custom model id and surfaces later as a provider error.
- `--thinking off|minimal|low|medium|high|xhigh|max`, or the shorthand `--model provider/id:level`. Read the **effective** level back from the run: an unsupported level is silently replaced (measured: `--thinking off` on `opencode-go/gpt-5.6-luna` ran as `low`).
- Pin the thinking level per role, not once for the factory. An independent verifier on the writer's own model, at the writer's own effort, is a weaker check.
- **Three ways to prove what ran**, and a dispatch should record at least one:
  1. the `turn_end` message carries `provider`, `model`, `api`, `thinkingLevel`, `stopReason` and `usage` with cost;
  2. the session file records a `model_change` and a `thinking_level_change` entry at start, and every assistant message names its model;
  3. inside the run, `PI_PROVIDER`, `PI_MODEL`, `PI_REASONING_LEVEL` and `PI_SESSION_ID` are injected into the `bash` tool (unset for `--no-session`).

```bash
jq -c 'select(.type=="turn_end") | .message
       | {provider, model, api, thinkingLevel, stopReason,
          tokens: .usage.totalTokens, cost: .usage.cost.total}' "$LOG.jsonl"
```

## Read the result the same way every time

The JSONL stream is the record. Record per dispatch: the pinned model and thinking level, the worktree branch and commit, the brief path and size, both log paths, the exit code, and from the stream the `turn_end` fields above plus `agent_settled.aborted`.

**Do not judge a run by its exit code.** A failed or aborted assistant response appears in the stream and Pi still exits 0; only an invocation that throws exits non-zero. Assert on the events:

```bash
jq -e 'select(.type=="turn_end") | .message.stopReason == "stop"' "$LOG.jsonl" >/dev/null \
  || echo "turn did not stop cleanly — treat as failed"
```

Also wait for `agent_settled`, not `agent_end`: retries, compaction, overflow recovery and follow-up work can follow an `agent_end`.

## Failure modes that look like something else

| Symptom | What it actually is | Fix |
| --- | --- | --- |
| `command not found` | Pi is not on a non-interactive `PATH` | Resolve the absolute binary path |
| The run hangs before any output | Model resolution opened the model selector | Pin `provider/id`, preflight with `pi auth check` |
| The role behaves as if the repo's tooling is missing | An unapproved project silently skipped project resources | Pass `--approve` (or `--no-approve` deliberately) |
| Exit 0 and no useful work | JSON mode exits 0 on a failed turn | Assert `stopReason == "stop"` in the stream |
| `Warning: Model "…" not found for provider "…". Using custom model id.` on stderr | The id is not in the catalog | Fix the id; validate with `--list-models` |
| `Error: Model "…" is ambiguous across providers: …` | A bare id matched several providers | Qualify with `--provider` or `provider/id` |
| Garbage in the JSONL stream | An extension wrote to stdout | Move it to stderr, or run `--no-extensions` in machine pipelines |
| The stream stalls mid-run | A reader stopped consuming stdout and the pipe filled | Drain stdout continuously |
| A level you did not ask for | Thinking levels are clamped to the model | Read `thinkingLevel` from `turn_end` and fail if the difference matters |

## The run costs before the brief arrives

Measured on this host (Pi 1.1.0): a trivial `-p` prompt consumed **35,451 input tokens** and cost **$0.0053** — the system prompt plus the tools registered by nine installed extensions. The catalog offers **387 models across 4 providers** (`vercel-ai-gateway` 304, `oc-sdk-go` 42, `opencode-go` 31, `openai-codex` 9), so the model you pin decides the price of a role far more than the prompt length does.

Levers: `--no-extensions` with explicit `-e` paths freezes what the request contains; `--no-skills` plus `--skill <path>` loads only what the role needs; `--no-context-files` drops the `AGENTS.md`/`CLAUDE.md` hierarchy; `--no-mcp` drops every MCP server. `references/limits-and-costs.md` has the numbers and the tradeoffs.

## References

- `references/headless-delegation-preflight.md` — channel and input readiness, with the ready / not-ready condition and the exact command for each check.
- `references/cli-surface-and-output.md` — invocation modes, the JSONL event contract, sessions, exit codes, timeouts and the command surface.
- `references/agents-chains-and-roles.md` — agent files, chains, tool scoping, per-role tiering, and how to observe a step.
- `references/limits-and-costs.md` — catalog and context, the measured overhead, providers and credentials, and Pi's stated limitations.
- `scripts/pi-channel-preflight.sh` — ready / not-ready for the channel.
- `scripts/dispatch-pi.sh` — guarded dispatch that records the receipt.
