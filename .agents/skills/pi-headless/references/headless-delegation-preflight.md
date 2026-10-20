# Headless delegation preflight (Pi)

Run this preflight before **every** headless `pi -p` dispatch. It is a required step, not troubleshooting: it proves the delegation channel is ready, and when the channel is not ready it stops the dispatch and names the exact fix.

Two gates are in scope: the **channel** (binary, credentials, model resolution, what the run will load) and the **inputs of this dispatch** (worktree, brief, brief markers). A channel-only preflight passes twice for a dispatch whose brief was never written or whose model id does not resolve.

```bash
skills/delegate/pi-headless/scripts/pi-channel-preflight.sh --model oc-sdk-go/deepseek-v4-flash --thinking low

skills/delegate/pi-headless/scripts/dispatch-pi.sh "$WORKTREE" "$BRIEF" "$LOGDIR" oc-sdk-go/deepseek-v4-flash low
```

## What the preflight proves

1. The binary resolves to an executable and reports a version.
2. The provider's credentials are usable — **proven by a smoke run, not by `pi auth check`** (see the trap below).
3. The model id exists in the catalog **for that provider**.
4. A one-shot JSON run completes with a clean turn, and reports the provider, model, API and effective thinking level that actually ran.
5. The dispatch line pins provider, model, thinking level, the trust decision, and the dispatcher's own timeout.

## Step 1 — Resolve the binary by absolute path

Pi is commonly **not** on a non-interactive `PATH`. On this host `command -v pi` is empty and the binary lives at `/home/ajosecortes/.local/share/pnpm/pi`. A bare `pi` therefore fails with `command not found`, which reads like a broken environment rather than a path problem.

```bash
command -v pi || echo "not on this PATH"
for c in "$HOME/.local/share/pnpm/pi" "$HOME/.bun/bin/pi" /usr/local/bin/pi /opt/homebrew/bin/pi; do
  [ -x "$c" ] && echo "found: $c"
done
"$PI_BIN" --version   # verified: 1.1.0
```

Ready: the dispatch uses an absolute path that exists in the environment it will run in, or `PI_BIN` is set.

## Step 2 — Check credentials, but treat the answer as a hint

```bash
"$PI" auth check --provider <provider> --json   # 0 ready | 1 not_ready | 2 invalid
"$PI" auth check --provider <provider> --model <provider/id> --json
```

**Measured trap (Pi 1.1.0, this host):** `pi auth check --provider oc-sdk-go` returned `{"status":"not_ready","provider":"oc-sdk-go","reason":"provider_not_found"}` with exit 1, and with `--model` it returned `{"status":"invalid","reason":"invalid_state"}` with exit 2 — while a real `-p` run on `oc-sdk-go/deepseek-v4-flash` completed cleanly and returned a proper receipt. Providers reached through a bridge or an SDK extension are outside `auth check`'s directory.

So: use `auth check` to catch the obvious (`0` means ready; a directory provider that reports `not_ready` is worth investigating), never as the gate. **The smoke run in Step 4 is the credential proof.**

Credential precedence when several sources exist: `--api-key` > `auth.json` > `models.json` `apiKey` > environment > ambient login. Pin the credential source if a role must not inherit an interactive login.

## Step 3 — Pin the model and validate it against the catalog

```bash
"$PI" --model oc-sdk-go/deepseek-v4-flash            # good
"$PI" --model deepseek-v4-flash                       # may be ambiguous across providers
"$PI" --model oc-sdk-go/deepseek-v4-flsh              # typo: warning, not an error
```

An id that is not in the catalog is **not** rejected:

```text
Warning: Model "…" not found for provider "…". Using custom model id.     # stderr
Error: Model "…" is ambiguous across providers: …                         # before any output
```

A typo therefore becomes a custom model id and fails later at the provider, and resolution can also **open the model selector at startup** — which hangs an unattended run. Validate before launching:

```bash
"$PI" --list-models <search> | awk -v p=<provider> -v m=<model-id> '$1==p && $2==m {found=1} END{exit !found}' \
  && echo "id is in the catalog"
```

Resolution order to keep in mind: CLI `--model` → the scoped `--models`/`enabledModels` → the settings default → the first authenticated model. Pin both provider and model, and pin `--models <same value>` so nothing can drift mid-run.

## Step 4 — Prove the channel with a smoke run that cannot touch the repository

```bash
cd "$(mktemp -d)" && timeout 180 "$PI" -p --mode json \
  --model oc-sdk-go/deepseek-v4-flash --no-approve --no-context-files \
  "Reply with exactly: PONG" > out.jsonl 2> out.err

jq -c 'select(.type=="turn_end") | .message
       | {provider, model, api, thinkingLevel, stopReason, tokens: .usage.totalTokens, cost: .usage.cost.total}' out.jsonl
```

Measured on this host for that exact shape:

```json
{"provider":"oc-sdk-go","model":"deepseek-v4-flash","api":"openai-completions",
 "thinkingLevel":"low","stopReason":"stop","tokens":35447,"cost":0.0053184}
```

Ready: the stream contains a `turn_end` whose `stopReason` is `"stop"`, a matching `agent_settled`, and the model you pinned. **`stopReason` is the assertion that matters** — JSON mode exits 0 on a failed turn.

The smoke run costs money (a trivial run cost ~$0.005 here). Run it once per session or per model change, not per dispatch:

```bash
scripts/pi-channel-preflight.sh --model oc-sdk-go/deepseek-v4-flash        # includes the smoke run
scripts/pi-channel-preflight.sh --model oc-sdk-go/deepseek-v4-flash --skip-smoke   # free, unproven
```

### Thinking levels are clamped — read the effective one

A level the model does not support is silently replaced. Measured: `--thinking off` on `opencode-go/gpt-5.6-luna` ran as `thinkingLevel: "low"`. The preflight compares the requested level with the effective one and warns; a dispatch that records `thinkingLevel` can detect the drift after the fact.

## Step 5 — Pin the dispatch shape

```bash
cd "$WORKTREE" && timeout 5400 "$PI" -p --mode json \
  --model "$PROVIDER_ID" --thinking "$LEVEL" --models "$PROVIDER_ID" \
  --approve "$(cat "$BRIEF")" > "$LOG.jsonl" 2> "$LOG.err"
```

- `--approve` (or `--no-approve`, or a saved decision in `~/.pi/agent/trust.json`). With `defaultProjectTrust: "ask"` — this host's effective default — and no flag, an unapproved project silently skips project settings, `.pi/mcp.json`, project extensions, project skills and project packages. The symptom is a model that behaves as if the repository's tooling is missing, not an error.
- **Context files load regardless of trust.** `AGENTS.md` / `CLAUDE.md` are discovered even in an unapproved project; add `--no-context-files` when you do not want them (and note that they are also a prompt-injection path).
- `--no-extensions`, `--no-skills`, `--no-mcp` remove everything the extensions, skills and MCP servers add to the request. For a deterministic role, add the specific ones back with `-e <path>` and `--skill <path>`.
- **There is no global run timeout in Pi.** The `timeout` in the dispatch line is the only wall clock; the Pi-level timeouts are MCP-related only.
- Keep stdout for the JSONL stream. Redirecting both streams into one file (`2>&1 | tee`) mixes diagnostics into the protocol stream.

## Step 6 — Fail closed on the inputs (guards)

| Guard | Fails with |
| --- | --- |
| The worktree exists and is a git worktree | `GUARD FAIL: the worktree does not exist` / `is not a git worktree` |
| The brief exists and is non-empty | `GUARD FAIL: brief missing or empty` |
| The brief carries an objective block | `GUARD FAIL: brief has no objective block (## Goal / ## Objective)` |
| The brief requires the result record | `GUARD FAIL: brief does not require the result record (schema_version: 1)` |
| The brief requires the role handoff | `GUARD FAIL: brief does not require the role handoff` |
| A provider-qualified model is pinned | `GUARD FAIL: no model pinned` / `model must be provider-qualified` |
| The binary is resolvable | `GUARD FAIL: pi is not resolvable (set PI_BIN)` |

Section markers are **role-specific** (a builder brief carries `## Goal` and a `Coder Agent says` handoff; a verifier or QA brief carries `## Objective` and its own handoff). A guard that hardcodes one role's markers cries wolf on every other role and gets ignored.

Every guard exits before anything launches, so a failed guard costs nothing.

## What this preflight does not prove

- It does not prove the brief is complete or that the role will do good work.
- It does not prove the provider's remaining quota. Rate-limit failures appear inside the run.
- It does not prove the target repository builds or tests. That is the role's checkout, not the channel.
