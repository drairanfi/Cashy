# Headless delegation preflight (Claude Code)

Run this preflight before **every** headless `claude -p` dispatch. It is a required step, not troubleshooting: it proves the delegation channel is ready, and when the channel is not ready it stops the dispatch and names the exact fix. A dispatch that starts without it can edit the repository correctly and then die at the first commit, or hang for the whole timeout, with a symptom that points at the wrong cause.

Two gates are in scope here: the **channel** (binary, version, auth, model resolution, what the run will load) and the **inputs of this dispatch** (worktree, brief, brief markers). The channel alone is not enough — a dispatch launched with a brief that was never written, or with a model string that silently does not resolve, passes a channel-only preflight twice.

Run both gates with the shipped scripts:

```bash
skills/delegate/claude-code-headless/scripts/claude-channel-preflight.sh --model haiku

skills/delegate/claude-code-headless/scripts/dispatch-claude.sh \
  "$WORKTREE" "$BRIEF" "$LOGDIR" haiku low
```

The second script runs the input guards and only then launches. Both exit non-zero and name the failing check.

## What the preflight proves

The channel is ready only when all of the following hold:

1. The `claude` binary resolves to an existing executable and reports a version.
2. The session is authenticated, and the dispatcher knows which authentication method and config directory are in play.
3. The model alias resolves to a canonical model — proven by a smoke run, not by reading settings.
4. The dispatcher knows what the run will load before the prompt (CLAUDE.md, skills, agents, hooks, MCP servers) and has decided to keep or trim it.
5. The dispatch line pins the model, the permission mode, `--permission-prompts none`, the output format and a timeout.

## Step 1 — Resolve the binary and its version

```bash
command -v claude || echo "not on this PATH"
claude --version
```

Ready: prints `2.1.302 (Claude Code)` or any version you intend to support. This repository was verified on **2.1.302**.

A non-interactive shell does not necessarily inherit a login shell's `PATH`. If `command -v claude` is empty and the binary is installed per-user, resolve it explicitly:

```bash
for c in "$HOME/.local/bin/claude" /usr/local/bin/claude /opt/homebrew/bin/claude; do
  [ -x "$c" ] && echo "found: $c"
done
```

Ready: the dispatch uses a path that exists in the environment it will run in, or `CLAUDE_BIN` is set. The preflight checks `$HOME/.local/bin/claude`, `/usr/local/bin/claude` and `/opt/homebrew/bin/claude` before giving up.

## Step 2 — Prove the session is authenticated

```bash
claude auth status            # JSON, exit 0 when logged in, 1 when not
claude auth status --text     # human-readable
```

The JSON carries `loggedIn`, `authMethod` (`none`, `claude.ai`, `oauth_token`, `api_key`, `api_key_helper`, `third_party`), `apiProvider`, `subscriptionType`, `projectsDirectory`, and **`configDirectory`** — the directory whose `settings.json` and `CLAUDE.md` will apply.

Ready: `loggedIn` is `true` and `authMethod` is the method you intend to bill. A dispatch that runs headless on a subscription and one that runs on an API key have different limit behaviour (see `limits-and-costs.md`).

Do not test authentication by running a prompt. `auth status` is free and does not consume quota.

## Step 3 — Pin the model and prove the alias resolves

Aliases are resolved at runtime, and an unrecognized name is **not** caught by argument validation:

```bash
claude -p "Reply PONG" --model not-a-real-model --tools ""
# Claude Code doesn't recognize the model "not-a-real-model", so it assumes a context window of 200k tokens.
# [claude-code:unrecognized_model] {"model":"not-a-real-model","query_source":"sdk"}
# There's an issue with the selected model (not-a-real-model). It may not exist or you may not have access to it.
# exit code 1
```

Two lessons from that run:

- The failure is a **warning plus exit code 1**, so a dispatcher that ignores the exit code ships a run with a wrong context window.
- In the same run the JSON payload reported `"subtype": "success"` while `is_error` was `true`, `api_error_status` was `404` and `terminal_reason` was `api_error`. **Never decide a run's outcome from `subtype` alone**; read `is_error` and `terminal_reason`.

Prove the alias with a smoke run that cannot use tools and does not touch the repository:

```bash
cd "$(mktemp -d)" && claude -p "Reply with exactly: PONG" \
  --model haiku --tools "" --output-format json \
  | jq -r '"model=\(.modelUsage | keys[0]) is_error=\(.is_error) cost=\(.total_cost_usd)"'
```

Ready: the command exits 0, the result is `PONG`, and `modelUsage` names the canonical model (`claude-haiku-5-5` for the `haiku` alias on this build). The canonical name is the only proof of which model will run; the alias alone proves nothing.

The smoke run costs money (it loads the full system prompt, so the first run of the day is the expensive one). Run it once per session, or per model change, not per dispatch:

```bash
scripts/claude-channel-preflight.sh --model haiku        # includes the smoke run
scripts/claude-channel-preflight.sh --model haiku --skip-smoke   # free, alias unproven
```

## Step 4 — Know what the run will load before the prompt

The prompt is the smallest part of a dispatch. Measured on a heavily configured home (2.1.302, `haiku`), the `system/init` event of a headless run reported:

| Loaded by default | Count |
| --- | --- |
| Skills | 133 |
| Agents (subagent definitions) | 32 |
| Tools (MCP servers included) | 414 |
| Slash commands | 198 |
| MCP servers | 22 |
| Plugins | 7 |

The same prompt with `--strict-mcp-config` and no `--mcp-config` loaded **24 tools** and no servers. The `system/init` event is where you read this per run:

```bash
claude -p "$(cat "$BRIEF")" --model haiku --output-format stream-json --verbose \
  | head -1 | jq '{model, permissionMode, output_style,
                   tools: (.tools | length), agents: (.agents | length),
                   skills: (.skills | length), mcp: (.mcp_servers | length)}'
```

Ready: you have decided deliberately whether this role needs the full environment. If it does not, trim with `--strict-mcp-config`, `--setting-sources`, `--agent`, `--tools`, or `--bare` — and read `limits-and-costs.md` for the tradeoffs, including the one that matters most: `--bare` never reads OAuth credentials, so on a subscription it fails to authenticate.

## Step 5 — Pin the dispatch shape

Ready dispatch line:

```bash
cd "$WORKTREE" && timeout 5400 claude -p "$(cat "$BRIEF")" \
  --model "$MODEL" \
  --permission-mode bypassPermissions \
  --permission-prompts none \
  --output-format text 2>&1 | tee "$LOG"
```

- `--model "$MODEL"` — **do not omit it.** Without the flag the model comes from settings; on this machine the user settings resolve to `sonnet`, so an unpinned dispatch silently runs a different model than the one the dispatcher believes it chose. Pin the model verbatim, record it, and (with `--output-format json`) confirm it landed.
- `--permission-prompts none` — **the hang preventer.** The default is `host`: with any permission host present the run waits for an answer that never arrives. `none` denies anything that would prompt and tells Claude not to retry.
- `--permission-mode bypassPermissions` — runs reads, edits, Bash and `gh` without asking. It is not a blanket: tools matched by an explicit `ask` rule, `AskUserQuestion` and MCP tools marked `requiresUserInteraction`, `rm`/`rmdir` on a critical path, and network-path reads are still denied, and under `-p` they are denied instantly. The denials are listed in the result's `permission_denials`. On Linux and macOS this mode **refuses to start as root**.
- `--output-format text` — the role's final message is the log. Switch to `json` when the dispatcher needs to record `modelUsage`, `num_turns`, `total_cost_usd`, `terminal_reason` or `permission_denials`.
- `timeout 5400` — an independent cap. `--max-budget-usd` and `--max-turns` are the run-level caps; this one is the wall clock.

Another mode is legitimate when the role must not write: `--permission-mode dontAsk` denies everything that would prompt, including network-path reads, so it suits a read-only verifier. Whatever you choose, pin it — the starting mode of a `-p` run is otherwise whatever the build and the settings decide.

## Step 6 — Fail closed on the inputs (guards)

The channel can be ready while this dispatch is doomed. Run the guards before launching; `dispatch-claude.sh` runs them itself.

| Guard | Fails with |
| --- | --- |
| The worktree exists and is a git worktree | `GUARD FAIL: the worktree does not exist` / `is not a git worktree` |
| The brief exists and is non-empty | `GUARD FAIL: brief missing or empty` |
| The brief carries an objective block | `GUARD FAIL: brief has no objective block (## Goal / ## Objective)` |
| The brief requires the result record | `GUARD FAIL: brief does not require the result record (schema_version: 1)` |
| The brief requires the role handoff | `GUARD FAIL: brief does not require the role handoff` |
| The binary is resolvable | `GUARD FAIL: claude is not on PATH (set CLAUDE_BIN)` |

Section markers are **role-specific**: a builder brief carries `## Goal` and a `Coder Agent says` handoff; a verifier or QA brief carries `## Objective` and its own handoff line. A guard that hardcodes one role's markers cries wolf on every other role and gets ignored — accept the role-appropriate set, and when a guard fires, first ask whether the guard's own accepted set is complete.

Every guard exits before anything launches, so a failed guard costs nothing. When a dispatch fails closed, the exit code is the signal — surface it at call time rather than discovering it in a log minutes later.

## What this preflight does not prove

- It does not prove the role will do good work, or that its brief is complete. Verify the brief against its required-section manifest separately.
- It does not prove the API has quota left. A quota failure appears inside the run (`You've hit your session limit`), not in the preflight.
- It does not prove the target repository can build or test. That is the role's checkout, not the channel.
