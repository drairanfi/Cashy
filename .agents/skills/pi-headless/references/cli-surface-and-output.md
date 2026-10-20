# CLI surface and output contracts (Pi)

Flags, modes, sessions and exit codes for headless Pi, verified against **Pi 1.1.0** (`pi --help`, local runs) and the official documentation under <https://pi.dev/docs/latest>.

## Invocation and modes

```text
pi [options] [--] [@files...] [messages...]
```

| Mode | How | What it is for |
| --- | --- | --- |
| Interactive | `pi` | The TUI. Not usable in automation. |
| Print | `pi -p "prompt"` | One-shot: process the prompt and exit. |
| JSON | `pi -p --mode json "prompt"` | One-shot with a **JSONL event stream** on stdout. |
| RPC | `pi --mode rpc` | Pi stays alive; a client sends commands and receives events. For IDEs and multi-turn loops. |

`--mode text` is the default for print mode: the final answer on stdout, diagnostics on stderr, nonzero exit when the final response is an error or was aborted. `@file` arguments add files to the initial message; they are context, not the instruction — the instruction comes from the prompt argument.

## Options by purpose

### Output and modes

| Flag | Effect |
| --- | --- |
| `-p, --print` | Non-interactive: process the prompt and exit |
| `--mode <text\|json\|rpc>` | Output mode (default `text`) |
| `--export <file>` | Export a session to HTML and exit |
| `--verbose` | Force verbose startup |
| `--tui-mode <fullscreen\|regular>` | TUI layout (interactive only) |

### Session

| Flag | Effect |
| --- | --- |
| `-c, --continue` | Continue the previous session |
| `-r, --resume` | Select a session to resume |
| `--session <path\|id>` | Use a specific session file or partial UUID |
| `--session-id <id>` | Exact project session id, created if missing |
| `--fork <path\|id>` | Fork a session into a new one |
| `--session-dir <dir>` | Where sessions are stored and looked up |
| `--no-session` | Do not persist a session (ephemeral) |
| `-n, --name <name>` | Session display name |

### Model, thinking and context

| Flag | Effect |
| --- | --- |
| `--provider <name>` | Provider for `--model` resolution (requires `--model`) |
| `--model <pattern>` | Model pattern or id; accepts `provider/id` and `provider/id:thinking` |
| `--models <patterns>` | Comma-separated cycle scope; globs (`anthropic/*`) and fuzzy matching |
| `--thinking <level>` | `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` |
| `--api-key <key>` | Credential override |
| `--system-prompt <text>` / `--append-system-prompt <text>` | Replace or extend the system prompt |
| `-nc, --no-context-files` | Do not discover `AGENTS.md` / `CLAUDE.md` |
| `-a, --approve` / `-na, --no-approve` | Trust this project for this run / ignore project-local files |
| `--offline` (`PI_OFFLINE=1`) | Disable startup network operations |
| `--list-models [search]` | List the catalog (provider, model, context, max-out, thinking, images) |

### Tools, extensions, skills, MCP

| Flag | Effect |
| --- | --- |
| `-nt, --no-tools` | Disable all tools (built-in and extension) |
| `-nbt, --no-builtin-tools` | Disable built-in tools, keep extension tools |
| `-t, --tools <names>` | Allowlist of tools or patterns; `+name`/`-name` adjust the defaults |
| `-xt, --exclude-tools <names>` | Denylist, applied to every tool including MCP |
| `-e, --extension <path>` | Load an extension file or `builtin:<name>` |
| `-ne, --no-extensions` | Disable discovery (explicit `-e` still works) |
| `--skill <path>` / `-ns, --no-skills` | Load a skill file or directory / disable skill discovery |
| `--prompt-template <path>` / `-np, --no-prompt-templates` | Prompt templates |
| `--theme <path>` / `--no-themes` / `--use-theme <name>` | Themes |
| `--no-mcp` | No MCP servers connect and no MCP tools are exposed |

### Command surface

| Command | What it does |
| --- | --- |
| `pi install <source> [-l]` / `pi remove <source>` | Add/remove an extension source and record it in settings |
| `pi update [source\|self\|pi]` | Update Pi, extensions, or the model catalogs |
| `pi list` | List installed extensions with their paths |
| `pi config [-l]` | TUI to enable/disable package resources |
| `pi auth print-api-key` / `print-bearer-token` / `check` | Print a credential for an external client, or check readiness (`--json`) |
| `pi mcp <command>` | Inspect servers, sign in or out |

Extensions can add their own flags — a local `pi --help` lists them under `Extension CLI Flags:`. On this host the Gentle AI extension adds `--no-skill-registry`, and other packages add flags such as `--plan`.

## The JSON event stream

`--mode json` writes a **session header** followed by one JSON object per line:

```json
{"type":"session","version":3,"id":"uuid","timestamp":"…","cwd":"/path"}
{"type":"agent_start"}
{"type":"turn_start"}
{"type":"message_start","message":{"role":"assistant","content":[],"stopReason":"pending"}}
{"type":"message_update","usage":{…},"assistantMessageEvent":{"type":"text_delta","contentIndex":0,"delta":"PONG"}}
{"type":"message_end","message":{"role":"assistant","content":[{"type":"text","text":"PONG"}],
   "api":"openai-completions","provider":"oc-sdk-go","model":"deepseek-v4-flash",
   "usage":{"input":35451,"output":3,"cacheRead":0,"cacheWrite":0,"reasoning":0,
            "totalTokens":35454,"cost":{"input":0.00531765,"output":0.0000018,"total":0.00531945}},
   "stopReason":"stop","thinkingLevel":"medium","durationMs":2610}}
{"type":"turn_end","message":{…},"toolResults":[]}
{"type":"agent_end","messages":[…],"willRetry":false}
{"type":"agent_settled","aborted":false}
```

| Event | Meaning |
| --- | --- |
| `agent_start` / `agent_end` | A low-level agent run started / ended. `agent_end` closes **one** run; retries, compaction, overflow recovery and follow-up work can follow |
| `agent_settled` | Pi has **no remaining automatic work**. A wrapper that needs completion waits for this, not `agent_end` |
| `turn_start` / `turn_end` | One assistant turn plus its tool calls. `turn_end.message` is the authoritative receipt: provider, model, api, thinkingLevel, stopReason, usage with cost |
| `message_start` / `message_update` / `message_end` | Message lifecycle. `message_update` is **delta-only** on the wire (buffer `text_delta`; replace it with `message_end.message`) |
| `tool_execution_start/update/end` | Tool lifecycle, correlated by `toolCallId` |
| `compaction_start` / `compaction_end`, `auto_retry_start` / `auto_retry_end` | Context compaction and retries |

Parsing rules that a wrapper must follow:

- One JSON object per line, terminated by `\n`. Split on LF only; Unicode line separators (U+2028/U+2029) inside strings are **not** boundaries, so Node's `readline` is unsuitable.
- **Stdout is reserved for the stream**; diagnostics go to stderr.
- **Read stdout continuously.** A reader that stops consuming can stall Pi when the pipe buffer fills.
- The stream is large: a trivial run produced a ~500 KB `.jsonl`. Keep it in a file and extract the text:

```bash
jq -r 'select(.type=="message_end") | .message.content[]? | select(.type=="text") | .text' "$LOG.jsonl" | tail -1
```

## Exit codes

| Situation | Signal |
| --- | --- |
| Print mode, clean run | exit 0, final text on stdout |
| Print mode, final `error`/`aborted` response | **nonzero** exit, message on stderr |
| JSON mode, failed or aborted assistant response | visible in the stream; **exit may still be 0** |
| JSON/RPC invocations that throw | nonzero exit |
| `pi auth check` | 0 ready / 1 not_ready / 2 invalid |
| `pi mcp list` | 1 on an invalid entry or an enabled-but-unconnected server |
| Binary missing from PATH | shell-level "not found" (typically 127) |

**The asymmetry is the trap**: a script that checks only `$?` on a JSON-mode run treats a failed turn as a success. Assert on the events:

```bash
jq -e 'select(.type=="turn_end") | .message.stopReason == "stop"' "$LOG.jsonl" >/dev/null || echo "failed turn"
```

## Sessions and provenance

- Session files live under the session directory (default `~/.pi/agent/sessions/<project-slug>/`), one JSONL file per session.
- The file records provenance at the start: a `model_change` entry (provider + model id) and a `thinking_level_change` entry. Every assistant message carries its `model`, and newer ones carry `thinkingLevel`.
- The `model_change` entry is the **selected** model, which may be a virtual model on a routed gateway; the assistant message names the physical model that answered.
- `--no-session` uses an in-memory session: nothing persists, and `PI_SESSION_FILE` is unset inside the run — so file-based provenance and `--no-session` are mutually exclusive.
- Inside the run, the `bash` tool receives `PI_PROVIDER`, `PI_MODEL`, `PI_REASONING_LEVEL` (the effective, post-clamp level) and `PI_SESSION_ID`. The docs are explicit that these are the source of truth for "which model are you running on", rather than inferring it from the system prompt.
- `--export <file>` renders a session to HTML.

## Recipes

```bash
PI="${PI_BIN:-$HOME/.local/share/pnpm/pi}"

# one-shot, machine-readable, austere
export PI_OFFLINE=1 PI_TELEMETRY=0
"$PI" -p --mode json --no-session --approve --no-mcp \
      --tools read,grep,find,ls \
      --model opencode-go/gpt-5.6-luna --thinking high \
      "Review the diff and print a machine-readable summary" > events.jsonl

# pipe a prompt in (the instruction still has to come from the prompt argument or a message)
printf 'Summarize NOTES.md\n' | "$PI" -p --no-session "Follow the instruction on stdin"

# a prompt that starts with a dash
"$PI" -p -- "- list the risks first"

# continue the same project session later
"$PI" -p --continue --model opencode-go/gpt-5.6-luna "keep going"
```

Failure modes a wrapper must expect:

- **Missing binary on PATH** — see the preflight; always use an absolute path in automation.
- **An unapproved project** — project settings, `.pi/mcp.json`, project extensions/skills and packages are silently skipped; pass `--approve` or `--no-approve` explicitly.
- **A model that does not resolve** — a warning for a typo, an ambiguity error, or the model selector opening at startup (which hangs a headless run).
- **Empty stdout parse** — the stream is JSONL with a session header, not one JSON object.
- **Stream corruption** — an extension that prints to stdout.
- **Stalled pipe** — a reader that stops draining.
- **`--no-session` is not a sandbox** — it persists nothing, but tools, extensions and child processes can still write files.
