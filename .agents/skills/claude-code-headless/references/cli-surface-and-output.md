# CLI surface and output contracts (Claude Code)

Flags, output formats, exit codes and sessions for headless `claude -p`, verified against Claude Code **2.1.302** (`claude --help`) and the official documentation under <https://code.claude.com/docs/en/>.

## Flags by purpose

### Session and context

| Flag | Effect |
| --- | --- |
| `--add-dir <dirs...>` | Additional directories the tools may touch; also allows CLAUDE.md discovery in them |
| `-p, --print` | Non-interactive: print the response and exit. Skips the workspace trust dialog |
| `--system-prompt <text>` / `--system-prompt-file <path>` | Replace the default system prompt |
| `--append-system-prompt <text>` / `--append-system-prompt-file <path>` | Add to the default system prompt |
| `--setting-sources <user,project,local>` | Which settings files to load |
| `--settings <file-or-json>` | Extra settings for this session (a file is capped at 2 MiB, else exit 1) |
| `--bare` | Minimal mode: skips hooks, LSP, plugin sync, auto-memory, CLAUDE.md discovery, hooks/skills/agents/MCP auto-discovery. Sets `CLAUDE_CODE_SIMPLE=1` |
| `--tools <names...>` | Restrict the built-in tool set (`""` disables all, `default` restores all). MCP tools are not governed by it |
| `--restricted` | Drop the code-running tools and WebFetch, confine file tools to the working directories, ignore user/project/local settings, refuse `bypassPermissions` |
| `-c, --continue` | Continue the most recent conversation in this directory |
| `-r, --resume [id]` | Resume a session by id (or an interactive picker) |
| `--fork-session` | With `--resume`/`--continue`, branch into a new session id instead of reusing it |
| `--session-id <uuid>` | Use a specific session id |
| `-n, --name <name>` | Display name, resumable by name |
| `--no-session-persistence` | Do not save the session to disk (print mode only) |
| `--exclude-dynamic-system-prompt-sections` | Move per-machine prompt sections (cwd, git status) into the first user message to improve cross-user cache reuse |
| `-w, --worktree [name]` | Create a git worktree for the session |

### Model, effort and limits

| Flag | Effect |
| --- | --- |
| `--model <alias\|name>` | Session model: `opus`, `sonnet`, `haiku`, `fable`, or a full model name |
| `--fallback-model <a,b>` | Comma-separated fallback chain when the primary is overloaded or unavailable |
| `--effort <low\|medium\|high\|xhigh\|max>` | Reasoning effort for the session (not persisted) |
| `--max-turns <n>` | Agentic turn cap; exits with `error_max_turns` when reached (print only) |
| `--max-budget-usd <amount>` | Stop once the estimated spend reaches the amount (print only) |
| `--autocompact <auto\|tokens>` | Auto-compact window for this session (100k–1M) |

### Permissions and tools

| Flag | Effect |
| --- | --- |
| `--permission-mode <mode>` | `acceptEdits`, `auto`, `bypassPermissions`, `manual` (alias of `default`), `dontAsk`, `plan` |
| `--permission-prompts <host\|none>` | Who answers a prompt in print mode. `none` denies instead of waiting |
| `--dangerously-skip-permissions` | Equivalent to `--permission-mode bypassPermissions` |
| `--allow-dangerously-skip-permissions` | Make bypass *available* in the cycle without starting in it |
| `--allowedTools <t...>` / `--disallowedTools <t...>` | Allow / deny rules; space- or comma-separated, e.g. `"Bash(git *) Edit"` |

### Output

| Flag | Effect |
| --- | --- |
| `--output-format text\|json\|stream-json` | Print mode only; `text` is the default |
| `--input-format text\|stream-json` | Print mode only; `stream-json` streams user messages on stdin |
| `--json-schema <schema>` | Validate the final output against a JSON Schema (lands in `structured_output`) |
| `--include-partial-messages` | Token-level chunks (`stream-json` only) |
| `--forward-subagent-text` | Forward subagent text and thinking blocks with `parent_tool_use_id` (`stream-json` only) |
| `--include-hook-events` | Include hook lifecycle events (`stream-json` only) |
| `--replay-user-messages` | Re-emit stdin user messages on stdout for acknowledgment |
| `--verbose` | Verbose output |

### Agents, MCP, plugins

| Flag | Effect |
| --- | --- |
| `--agent <name>` | Use a named agent for the session |
| `--agents <json\|file>` | Define agents inline; the file form requires `-p` |
| `--append-subagent-system-prompt[-file]` | Append text to every subagent's system prompt (print mode) |
| `--mcp-config <files...>` | MCP servers from JSON files or strings; with `-p` the run waits for pending servers up to `MCP_TIMEOUT` |
| `--strict-mcp-config` | Use only the servers from `--mcp-config`, ignore every other source |
| `--plugin-dir <path>` / `--plugin-url <url>` | Load plugins for this session only (repeatable) |

### Diagnostics

`-d, --debug [filter]` (e.g. `"api,hooks"`), `--debug-file <path>`, `-v, --version`, `-h, --help`, `--safe-mode` (all customizations disabled), `--ax-screen-reader`.

## Output contracts

### `text`

Plain text on stdout. With a multi-turn run, each turn's result prints and the last one is the final answer (2.1.295+; earlier builds printed only the last). This is the right default for a role whose handoff is prose.

### `json`

One result object on stdout. Fields observed on 2.1.302 plus the documented set:

| Field | Meaning |
| --- | --- |
| `type` | `"result"` |
| `subtype` | `"success"` or an error subtype (`error_max_turns`, `error_during_execution`, `error_max_budget_usd`, `error_max_structured_output_retries`). **Not a reliable success signal** — a 404 on an unknown model still reported `success` with `is_error: true` |
| `is_error` | Whether the run ended in error — check this |
| `result` | Final text |
| `session_id` | Capture it to `--resume` later |
| `num_turns` | Agentic turns taken |
| `duration_ms`, `duration_api_ms`, `ttft_ms` | Wall clock, API time, time to first token |
| `total_cost_usd` | Client-side cost estimate, not a bill |
| `usage` | Tokens for the main loop only (excludes subagents) |
| `modelUsage` | Per-model totals, keyed by **canonical model id** — the proof of which model ran, with `contextWindow`, `maxOutputTokens`, `thinkingTokens`, `costUSD`, `provider` |
| `permission_denials` | Authoritative record of denials |
| `terminal_reason` | `completed`, `max_turns`, `budget_exhausted`, `prompt_too_long`, `model_error`, `api_error`, … |
| `api_error_status` | HTTP status of the API error that ended the conversation |
| `subagent_stats` | `spawned`, `completed`, `failed`, `max_depth`, `killed`, `refused` (`depth_limit`, `concurrency_limit`, `budget`) — how a run reports that it delegated |
| `structured_output` | Present with `--json-schema`: the validated object |
| `stop_reason`, `safety_stops`, `result_index`, `queued_turn_count` | Turn-level detail |

### `stream-json`

Newline-delimited JSON events, one per line. The **last** line is the `result` object. Event kinds observed on 2.1.302 for a trivial run:

| Event | Notes |
| --- | --- |
| `system` / `subtype: "init"` | Session metadata: `model`, `permissionMode`, `output_style`, `tools`, `agents`, `skills`, `slash_commands`, `plugins`, `mcp_servers`, `memory_paths`, `capabilities`, `claude_code_version` |
| `system` hook events | One per hook lifecycle event when hooks run (`hook_name`, `hook_event`, `outcome`, `exit_code`) |
| `system` / `subtype` with `estimated_tokens` | Context accounting |
| `assistant` | Complete content blocks; subagent frames carry a non-null `parent_tool_use_id` |
| `user` | Tool results |
| `rate_limit_event` | Rate-limit state changes |
| `result` | Final object (field set above) |

Add `--verbose` (the docs use it in every streaming example) and `--include-partial-messages` for token deltas.

## Reading results with jq

```bash
# final text
claude -p "$(cat "$BRIEF")" --model haiku --output-format json | jq -r '.result'

# outcome + the model that actually ran
... | jq -r '"model=\(.modelUsage | keys[0]) error=\(.is_error) terminal=\(.terminal_reason) cost=\(.total_cost_usd) denials=\(.permission_denials | length)"'

# session id for a later --resume
session_id=$(claude -p "Start the review" --output-format json | jq -r '.session_id')
claude -p "Continue that review" --resume "$session_id" --model haiku

# structured output
claude -p "List the exported functions in src/auth.ts" --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output.functions'
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Startup or configuration failure, and most in-run failures that Claude Code can classify: invalid `--json-schema`, invalid `--agents`, `--settings` file over 2 MiB, missing prompt under `--print`, failed resume, unrecognized model name, not logged in |
| `137` | Installation killed before it finished |
| `143` | The run was stopped with SIGTERM (`128+15`); the in-progress turn records no result |
| `4294967295` | Windows native build, right after a turn completes |

An invalid **flag** is reported on stderr before the run starts; a failure **inside** the run (missing authentication, unknown model) is printed as the result on stdout, so a dispatcher that only reads stderr misses it.

## Timeouts and background work

| Knob | Default | Effect |
| --- | --- | --- |
| `API_TIMEOUT_MS` | 600000 | Per-request timeout |
| `MCP_TIMEOUT` | 30 s | Startup wait for pending MCP servers (with `--mcp-config` and `-p`) |
| `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` | 10 min | How long a `-p` run waits for background work after the turn and stdin close (`0` = no cap) |
| `--max-budget-usd` | none | Stops remaining background work at the cap instead of waiting |
| `timeout <s>` in the dispatch line | none | The wall-clock cap the dispatcher owns |

A `-p` run stays open while background work it started is still running — that is also how a background subagent's result becomes part of the final output. If the wait exceeds the ceiling, Claude Code stops the remaining work and drops its partial result.

## Sessions, resume and background agents

- `-c` continues the most recent conversation in the current directory; `-r <id>` resumes a specific one; `--fork-session` branches instead of reusing the id. A session id is in every `json`/`stream-json` payload.
- Resuming reuses the recorded system prompt verbatim until the conversation is compacted (`--system-prompt-snapshot on` is the default), so a resumed run does not pick up a changed prompt.
- `--bg` starts a background session and prints the id used by `claude attach <id>`, `claude logs <id>`, `claude stop <id>`, `claude rm <id>`, `claude respawn <id>`, and `claude agents --json` lists them. `--bg` **cannot be combined with `-p`** — pick one.
- `--print` cannot run terminal-only commands such as `/login`. `/model`, `/effort`, `/fast`, `/color` and `/rename` accept a value as an argument, and `/config key=value` sets a setting; changes to `/model` and `/effort` apply to that session only.
- `claude ultrareview [PR|branch]` runs a cloud-hosted multi-agent review and prints findings; `--post` posts them to the PR as one plain comment, `--json` prints the raw payload, `--timeout <minutes>` defaults to 45.

## Caveats that only apply to `-p`

- The workspace trust dialog is skipped: only run in directories you trust.
- A settings file that fails validation is silently ignored — run `claude doctor` to see what was dropped.
- `--output-format`, `--input-format`, `--json-schema`, `--max-turns`, `--max-budget-usd` and `--no-session-persistence` are print-mode only.
- A content-flagged request ends the turn as a refusal instead of asking.
- The Fable usage-credits consent prompt never appears; the request is billed without asking.
