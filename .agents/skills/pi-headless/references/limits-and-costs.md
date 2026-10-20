# Limits, cost and context (Pi)

What a Pi dispatch spends, what stops it, and what Pi refuses to do. Numbers marked **measured** were observed on this host with `pi 1.1.0` on 2026-10-17; the rest come from the official documentation (<https://pi.dev/docs/latest>) and are quoted so the reasoning survives.

## The catalog decides the price

`pi --list-models` prints the whole catalog, one row per model, with the columns that matter for a role:

```text
provider           model                    context  max-out  thinking  images
oc-sdk-go          deepseek-v4-flash        1M       384K     yes       no
opencode-go        gpt-5.6-luna             1.1M     128K     yes       yes
vercel-ai-gateway  zai/glm-5.3-flash        1M       131K     yes       yes
openai-codex       gpt-5.6                  400K     128K     yes       yes
```

Measured on this host: **387 models across 4 providers** — `vercel-ai-gateway` 304, `oc-sdk-go` 42, `opencode-go` 31, `openai-codex` 9. The per-model `contextWindow` and `maxTokens` come from the catalog (defaults `128000` and `16384`), and the effective context window reported by a run is the model's, not Pi's.

Two catalog caveats worth knowing before pinning a role:

- The catalog is **not** validated against `--model`: an id that is not there becomes a "custom model id" that fails at the provider.
- The catalog can declare hard request limits (`inputLimits.maxRequestBytes`, `images.maxPerMessage`, `images.maxPerRequest`) but Pi does not yet rewrite or reject history based on them — declaring a limit is not enforcing it.

## The run costs before the brief arrives

Measured, `-p` with a trivial prompt on this host's configuration:

| Observation | Value |
| --- | --- |
| Input tokens | **35,451** — the system prompt plus the tools declared by the nine installed extensions |
| Cost | **~$0.0053** for a three-token answer |
| Same prompt, different API | `gpt-5.6-luna` (`openai-responses`) reported `input: 3, cacheWrite: 27,149`, i.e. the same weight attributed to a different field |

So a Pi dispatch pays for its environment, not for its prompt. The levers, in order of payoff:

1. **`--no-extensions`** with explicit `-e <path>` entries — the system prompt contains the tool declarations of every loaded extension, so this is the lever that changes the request the most.
2. **`--no-skills`** plus `--skill <path>` for the ones the role needs.
3. **`--no-context-files`** — drops the `AGENTS.md` / `CLAUDE.md` hierarchy from the per-turn prompt (and the prompt-injection path with it).
4. **`--no-mcp`** — no server connects and no MCP tool is exposed.
5. **`--tools <allowlist>`** — narrows the built-in surface. Note it does **not** remove MCP tools, only un-declares them; use `--exclude-tools` for a real denylist.

## What the run reports about its own cost

Every `message_update` carries a `usage` object and the authoritative one is on `message_end` / `turn_end`:

| Field | Meaning |
| --- | --- |
| `input`, `output` | Tokens billed at each rate |
| `cacheRead`, `cacheWrite` | Tokens served from / written to a prompt cache |
| `reasoning` | Reasoning tokens |
| `totalTokens` | Provider-reported total |
| `cost.input` / `.output` / `.cacheRead` / `.cacheWrite` / `.total` | USD, computed from catalog prices |

Caveats that make a naive cost read wrong:

- **Streaming usage can be zero until completion** when a provider does not report usage mid-stream. Read `turn_end`, not a running total.
- **Attribution differs per provider**: the same prompt size can appear as `input: 35,411, cacheWrite: 0` on one API and `input: 3, cacheWrite: 27,149` on another.
- **The per-turn cost is a lower bound.** Classifier and image calls made by `codemode` scripts, cache-warming refreshes, and compaction summaries all count toward the session total without appearing in the turn's `cost`.
- **Unpriced models report zero**: a model without catalog prices reports tokens at no cost. `cost.total: 0` does not mean the run was free.

## Rate limits and quota

Pi has no per-provider rate-limit table of its own. Quota behaviour is the provider's and arrives as a provider error. Measured categories on this host:

- **Hard account failure (HTTP 402).** `vercel-ai-gateway` is configured and reports `ready` in `pi auth check` while refusing every request: `402 {"error":{"message":"A positive credit balance is required for all requests, including BYOK…","type":"insufficient_funds"}}`. **Billing state is invisible to `auth check`** — this is another reason the smoke run, not the auth check, is the credential gate.
- **Invalid model on a subscription provider.** `Codex error: The 'does-not-exist' model is not supported when using Codex with a ChatGPT account.` — the provider rejects the id, not Pi.
- **Transient overload (529-class).** Documented in the retry example.

Pi deliberately does not retry provider errors by default: `retry.provider.maxRetries` defaults to `0`, because provider retries "can delay Pi from handling quota and usage-limit errors itself". The design intent is to surface quota errors immediately and retry only at the agent level.

## Context, and what fills it

- The limit is per model (`contextWindow` / `maxTokens` from the catalog). Compaction exists and announces itself in the stream: `compaction_start` / `compaction_end` events, and `auto_retry_start` / `auto_retry_end` for retries.
- What actually goes into a request: the system prompt preamble, the tool declarations of every loaded extension, the skill index, MCP tool definitions, the `AGENTS.md`/`CLAUDE.md` hierarchy, and then the conversation. That is why the four levers above matter more than prompt wording.
- **Context files bypass project trust.** They load even in a project you declined, so treat the instructions in a folder as untrusted input; `-nc` is the mitigation.
- The session file stores the whole conversation plus provenance (`model_change`, `thinking_level_change`), which is why a JSON-mode stream for a trivial run is already ~500 KB and why long sessions should be read from disk rather than buffered.

## What Pi explicitly cannot do

- **No subagents and no plan mode in core, by design.** "Pi ships with powerful defaults but skips features like sub-agents and plan mode." The agents and chains installed on this host come from **extensions** (`gentle-pi`, and packages such as `pi-subagents` / `pi-fabric`), not from Pi itself — so a delegation feature is only as available as its extension.
- **No built-in sandbox.** Pi reads, changes and executes files with the permissions of the account that started it, and does not ask before every tool call. Project trust controls which *project resources load*, not what tool calls can touch; watching the transcript is not a security boundary.
- **`--no-session` is not a sandbox** — it persists nothing, but tools, extensions and child processes can still write files and external state.
- **TUI-only extension capabilities** are unavailable or degraded outside interactive mode, and **RPC mode rejects `@file` arguments**.
- **`--tools` does not remove MCP tools.**
- **`pi update` cannot update Pi under Nix** (package and catalog updates still work).
- **The thinking level is clamped, not rejected.** A valid-but-unsupported level is silently replaced by the nearest supported one above (measured: `--thinking off` on `opencode-go/gpt-5.6-luna` ran as `low`). A level string outside the seven warns and falls back to the default; a non-reasoning model accepts `--thinking high` and fails later at the provider, not at argument parsing.
- **Flags that need a model**: `--provider` alone and `--api-key` alone are hard errors. An ambiguous bare `--model` is a hard error naming the providers.

## Pinning a role deterministically

```bash
PI="${PI_BIN:-$HOME/.local/share/pnpm/pi}"

"$PI" -p --mode json \
  --model "oc-sdk-go/deepseek-v4-flash:high" \
  --thinking high \
  --models "oc-sdk-go/deepseek-v4-flash" \
  --approve \
  --no-context-files \
  --no-skills \
  "$(cat "$BRIEF")" > "$LOG.jsonl" 2> "$LOG.err"
```

| Flag | Why it is required for determinism |
| --- | --- |
| `--model provider/id:level` | `provider/id` removes cross-provider ambiguity; the suffix sets reasoning inline |
| `--thinking <level>` | Documents intent and wins if the suffix is ever edited. Remember it is **clamped** — read the effective level back |
| `--models <same id>` | Pins the cycle so nothing drifts onto another model |
| `--approve` / `--no-approve` | Makes trust explicit instead of inherited from `trust.json` or `defaultProjectTrust` |
| `--no-context-files` | Removes ancestor instructions from the per-turn prompt |
| `--no-skills` (+ `--skill <path>`) | Removes the skill index from the system prompt |

Equivalent settings, when the role is configured rather than flagged: `defaultProvider`, `defaultModel`, `defaultThinkingLevel`, `modelThinkingLevels` (keyed `provider/modelId`), `enabledModels`, `defaultTools`, and `compaction.*`.

Caveats no flag can fix: clamping; the catalog's silent custom-model fallback; provider-side routing (with a gateway you pin the Pi-level model, not the physical upstream); and credential precedence (`--api-key` > `auth.json` > `models.json` `apiKey` > environment > ambient login).

## Recovery after a failure

1. Read the stream first: `turn_end.message.stopReason` (and `agent_settled.aborted`) say what happened where the exit code cannot.
2. `length` means the reply was cut off at the model's output limit — the partial text is real, the turn was not completed.
3. A provider error (402 / 529 / invalid model) is the provider's, not Pi's: fix the model id or the account, and re-dispatch in a fresh worktree.
4. Resume instead of restarting when the session is useful: `--continue` or `--session <id>`, with the same pinned model and level.
