# Limits, cost and context (Claude Code headless)

What a dispatch spends, what stops it, and what it refuses to do. Numbers marked **measured** were observed on this machine with `claude 2.1.302`; the rest come from the official documentation (<https://code.claude.com/docs/en/>) and are quoted so the reason survives.

## How usage is billed

- On a **subscription** (Pro, Max, Team, Enterprise) usage is included in the plan; on an **API key** or a cloud provider it is billed per token. `claude auth status` reports `authMethod` and `subscriptionType`, which is the cheapest way for a dispatcher to know which regime a run is in.
- Every dollar figure Claude Code prints is computed **locally at list price** and is an estimate, not a bill. `total_cost_usd` in a `json` result is that estimate.
- Session and weekly limits are **shared across models** on Team/Enterprise seats; the **Opus** and **Sonnet** limits are the only family-scoped ones, so switching model helps only in that case. Usage counts against the session and the weekly allowance at the same time.

Messages a dispatcher should recognize verbatim:

```text
You've hit your session limit · resets 3:45pm
You've hit your weekly limit · resets Mon 12:00am
You've hit your Opus limit · resets 3:45pm
You've hit your Sonnet limit · resets 3:45pm
Request rejected (429)
Usage credits required for 1M context
Credit balance is too low
```

`Credit balance is too low` most often means a stray `ANTHROPIC_API_KEY` is routing around a subscription. `Request rejected (429)` is an API-key/Bedrock rate limit, not a plan limit. From 2.1.234 an interactive session can wait and continue after a reset; a `-p` run cannot, so a quota failure mid-dispatch means the turn is lost and the brief must be re-dispatched.

## Run-level caps

| Cap | Behaviour |
| --- | --- |
| `--max-turns <n>` | Ends the loop with subtype `error_max_turns`. With `--input-format stream-json`, a message still queued when the cap fires starts a new turn with its own limit |
| `--max-budget-usd <amount>` | Checks the **client-side estimate**; subagent spend counts toward it; **spend can pass the cap**, so leave headroom. Once at the cap, spawning another subagent fails with `Budget limit reached` and running background subagents are stopped. Totals restored by `--continue`/`--resume` do **not** count. Enforcement behaviour requires 2.1.217+ |
| `timeout <seconds>` | The dispatcher's own wall-clock cap; independent of both, and the only one that survives a hung prompt |

A cap is not a forecast. Budgets and turns bound a run that goes wrong; they do not make it cheap.

## What a dispatch actually costs

The prompt is the smallest part of the bill. Measured on this machine (haiku, 5-token answer):

| Run | Loaded | Cost |
| --- | --- | --- |
| Default environment, first run of the day | 414 tools, 22 MCP servers, 133 skills, 32 agents | `total_cost_usd 0.4051` — `cache_creation_input_tokens 405105` |
| Same prompt, `--strict-mcp-config` (no servers) | 24 tools, 0 MCP servers | `total_cost_usd 0.00896` — `cache_creation 44350`, `cache_read 8867` |
| Real dispatch of a 366-byte brief, `--effort low` | default environment | `total_cost_usd 0.0119` — `cache_creation 58125`, `cache_read 8866`, `thinking_tokens 270` |
| `--effort low` vs default on a trivial prompt | — | `thinking_tokens 0` vs `62` |

Levers, in rough order of payoff:

1. **Serve the same environment to many runs.** The prompt cache is keyed by the whole prefix (system prompt, tools, skills), and the first dispatch after a change pays the full creation cost. Cache-busting actions: switching model, changing effort, fast mode, connecting or removing an MCP server, enabling or disabling a plugin, denying a whole tool, compaction, many images, upgrading Claude Code.
2. **`--strict-mcp-config`** (with no `--mcp-config`) drops every MCP server and its tools. On this machine: 414 tools → 24.
3. **`--setting-sources`** limits which settings files load; **`--agent`** pins one agent instead of loading the whole set; **`--tools`** narrows the built-in tool surface.
4. **Truncate or remove an oversized user `CLAUDE.md`** once the role no longer needs the global protocol: CLAUDE.md content is shipped as a user message on every dispatch.
5. **`--bare`** skips hooks, CLAUDE.md discovery, skills, agents and MCP servers at once — but read the trap below before using it in a factory dispatch.
6. **`--exclude-dynamic-system-prompt-sections`** moves per-machine sections (cwd, env, git status) out of the system prompt so the cache prefix is shared across machines.

**The `--bare` trap on a subscription:** bare mode never reads OAuth credentials or the keychain; Anthropic auth is strictly `ANTHROPIC_API_KEY` or `apiKeyHelper` via `--settings`. A factory dispatch that authenticates through `claude.ai` therefore **fails to authenticate under `--bare`**. Trim with `--strict-mcp-config` and `--setting-sources` instead, unless the environment is API-key based.

## Effort and thinking

- `--effort low|medium|high|xhigh|max` is the primary reasoning control: the model decides whether and how much to think at each step. The scale is calibrated **per model**, so the same level name is not the same underlying value across models.
- Defaults: `high` on every model that supports effort, except the 5.5 family (Opus/Sonnet/Haiku 5.5) which default to `medium`.
- A level the active model does not support falls back to the highest supported level **at or below** the one requested (`xhigh` runs as `high` on Opus 4.6).
- Resolution order: `CLAUDE_CODE_EFFORT_LEVEL` / `--effort` / `/effort` → saved `modelSettings` or `effortLevel` → the model's default. The environment variable **overrides the flag**, which is the opposite of the `--model`/`ANTHROPIC_MODEL` pair.
- `--effort` does **not** persist. `maxEffortLevel` is a cap, and the **lowest** cap across scopes wins, so a project cannot raise an admin cap.
- `--effort max` is documented as prone to overthinking. For a factory role, `medium`/`high` is usually the honest choice, and effort is the lever to pin per role, not a phrase in the brief.
- Thinking cannot be turned off on the 5.5 family, and `effort` above `high` with thinking disabled is rejected: `API Error: Effort 'xhigh' isn't available with thinking turned off on this model`.
- The old `think` / `think harder` ladder is **gone**: only `ultrathink` is still recognized, it adds an in-context instruction for one turn, and it does **not** change the effort level sent to the API.

## Context, compaction and the hard ceilings

- Context windows come from the model, and the `json` result reports them per model: `modelUsage.<model>.contextWindow` and `.maxOutputTokens` (measured: `claude-haiku-5-5` → 1,000,000 / 128,000).
- Auto-compaction triggers as the window fills (`--autocompact <auto|tokens>` sets the window for a session). `/compact` costs money — it is itself a large request; `/clear` is free.
- **A single-exchange conversation cannot be compacted.** One prompt plus the system prompt, tool definitions and attachments that fill the window produce `Prompt is too long · this conversation is a single exchange and cannot be compacted`. The fix is a smaller brief, not a bigger window.
- **32 MB raw request cap**, separate from the context window; accumulated images and attachments trip `Request too large (max 32MB)`.
- Output caps: a reply cut off at the maximum reports `Response exceeded the … output token maximum`; a non-streaming re-send caps replies at 64,000 output tokens and `CLAUDE_CODE_MAX_OUTPUT_TOKENS` cannot raise that specific limit. Raising `CLAUDE_CODE_MAX_OUTPUT_TOKENS` **reduces** the context available before auto-compaction.
- What survives compaction is a summary: file contents and tool output that were only read, not written, may not come back verbatim. Read it as a lossy step, and keep the evidence the role must report in the brief's own record.

## What Claude Code refuses to do

- No fallback for biology-flagged requests on Opus 5 / Sonnet 5.5: the turn ends in a refusal, and offensive-security or biology workloads trigger fallback frequently, often on the first request. In `-p` a flagged request ends the turn instead of asking.
- Network paths cannot be working directories: UNC shares, automount paths such as `/net/<host>`, or a local path reaching a network location through a symlink. On Windows, map the share to a drive letter and pass it with `--add-dir`.
- `--dangerously-skip-permissions` / `bypassPermissions` refuses to start as root or under `sudo`.
- `--remote-control` does not support `--sandbox`, cloud sessions cannot be created from a `--restricted` session, an MCP server cannot be added to the managed scope from the CLI, and file checkpoints are ignored in `-p` unless explicitly enabled.
- **CLAUDE.md is not enforced.** Its content is delivered as a user message with no compliance guarantee; anything that must happen at a specific point belongs in a hook.

## Permission waits that look like a slow task

- In `auto` and `bypassPermissions`, a prompt for a **critical-path removal** shows a **two-minute countdown**; if it expires, the command is denied and Claude is told what to do instead. After three expired prompts in a session, further critical-path removals are denied immediately.
- Wherever Claude Code **cannot show a prompt** — `-p`, the SDK, the VS Code chat panel, the Desktop app — `auto` mode **denies immediately** instead of waiting.
- The default for `--permission-prompts` is `host`, and a run with any permission host **waits**. This is the failure behind a dispatch that produces no output for a full timeout: pass `--permission-prompts none`.
- `dialogExpiry` (default `5m`) bounds other forwarded dialogs. A Fable usage-credits consent prompt that goes unanswered ends the turn with nothing sent — and in `-p` that prompt never appears at all.

## Recovery after a limit or a kill

1. Read the result payload first: `is_error`, `terminal_reason` and `permission_denials` say what happened where the exit code cannot.
2. On exit `143` (SIGTERM) the turn recorded no result — treat the worktree as mid-task and inspect it before re-dispatching.
3. Resume instead of restarting when the session id is known and the context is still valid: `claude -p "continue" --resume <session_id> --model <pinned>`. A restarted dispatch pays the cache-creation cost again.
4. Re-dispatch in a fresh worktree when the brief itself was wrong: the guard set (`headless-delegation-preflight.md`) exists so this costs nothing.
