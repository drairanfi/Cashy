# Headless delegation preflight (OpenCode)

Run this preflight before **every** headless `opencode run` dispatch. It is a required step, not troubleshooting: it proves the delegation channel is ready, and when the channel is not ready it stops the dispatch and names the exact fix. A dispatch that starts without it can edit files correctly and then die at the first commit with a permission error that points at the wrong cause.

## What the preflight proves

The channel is ready only when all of the following hold:

1. The OpenCode binary resolves by absolute path and reports a v2 version.
2. The effective, already-resolved permission rules let delegated work stage, commit, push, and open or update PRs and issues.
3. The effective rules keep the destructive Git verbs blocked.
4. The dispatch line uses the v2 headless shape and pins the agent to `build`.
5. The dispatch line pins the model with `--model`, and the dispatcher records the exact model string it passed.

## Step 1 — Resolve the binary by absolute path

```bash
"$HOME/.opencode/bin/opencode" --version
```

Ready: prints `opencode v2.x.y`. This repository was verified on `v2.0.18`.

Do not rely on a bare `opencode` on `PATH`. The binary lives at `~/.opencode/bin/opencode` and a login shell exports it while a non-interactive shell may not, so a dispatch that calls a bare `opencode` can fail with `command not found` for a reason unrelated to permissions. Probe a clean environment if needed:

```bash
env -i bash -c 'command -v opencode || echo "not on a non-login PATH"'
```

Ready: the dispatch uses `"$HOME/.opencode/bin/opencode"` regardless of what this probe prints.

## Step 2 — Read the effective permission rules

`opencode debug config` prints the **already-resolved** configuration: the global document plus every directory and project document, with the permission rules that actually apply. Treat it as authoritative; do not reason from the raw `opencode.json` you assume is loaded.

```bash
"$HOME/.opencode/bin/opencode" debug config
```

The shell rules are the entries under each document's `info.permissions` where `action` is `"shell"`. Rules are matched by pattern, the **last matching rule wins**, and `*` is the catch-all. See the OpenCode permissions reference: <https://opencode.ai/docs/permissions>.

## Step 3 — Decide ready / not ready

Run the ready check. It reads the same resolved config, applies the last-matching-rule rule, and exits `0` only when the channel is ready:

```bash
"$HOME/.opencode/bin/opencode" debug config | python3 -c '
import json,re,sys
req={"git add *","git commit *","git push","gh pr *","gh issue *"}
den={"git push --force *","git push -f *","git push --force-with-lease *","git rebase *","git reset *"}
auto="--auto" in sys.argv[1:]
rules=[(r["resource"],r["effect"]) for d in json.load(sys.stdin) for r in d.get("info",{}).get("permissions",[]) if r.get("action")=="shell"]
def eff(v):
    e=None
    for res,ef in rules:
        if re.fullmatch(re.escape(res).replace(r"\*",".*"),v): e=ef
    return e
bad=0
for v in sorted(req):
    e=eff(v)
    if e=="allow" or (e=="ask" and auto): print("ok   %s -> %s"%(v,e))
    else: bad=1; print("FAIL %s -> %s"%(v,e))
for v in sorted(den):
    e=eff(v)
    if e=="deny": print("ok   %s -> deny"%v)
    else: bad=1; print("FAIL %s -> %s (must be deny)"%(v,e))
sys.exit(bad)
'
```

Append `--auto` after the closing quote when, and only when, the dispatch line includes `--auto`. Without it, an `ask` rule is treated as a failure because headless `opencode run` rejects `ask` (see the trap below).

Ready means the effective effect for each required verb is `allow` (or `ask` with `--auto`), and each destructive verb is `deny`:

| Verb | Required effective effect |
|---|---|
| `git add *` | `allow`, or `ask` with `--auto` |
| `git commit *` | `allow`, or `ask` with `--auto` |
| `git push` | `allow`, or `ask` with `--auto` |
| `gh pr *` | `allow`, or `ask` with `--auto` |
| `gh issue *` | `allow`, or `ask` with `--auto` |
| `git push --force *` | `deny` |
| `git push -f *` | `deny` |
| `git push --force-with-lease *` | `deny` |
| `git rebase *` | `deny` |
| `git reset *` | `deny` |

An explicit `deny` always wins, including under `--auto`. That is what keeps the destructive verbs blocked while ordinary work flows.

Verbs without an explicit rule inherit the catch-all `*`. A missing `gh pr *` or `gh issue *` rule is ready as long as the catch-all resolves to `allow` (or `ask` with `--auto`).

## The `ask`-in-headless trap

Headless `opencode run` **auto-rejects** every rule that evaluates to `ask` and reports it as if a human had declined:

```text
! permission requested: bash (git add ..., git commit -m "..."); auto-rejecting
Error: The user rejected permission to use this specific tool call.
```

No user is involved; headless fails closed. The run edits files correctly, then cannot commit, push, or open a PR, and ends `[goal:blocked]` with the work uncommitted. This is why a required verb must resolve to `allow`, or the dispatch must carry `--auto`.

## Step 4 — Pin the v2 dispatch shape

Factory dispatches **MUST** use `--agent build`. Never substitute another configured agent for delegated work. Explain the reason next to the rule so it is not removed later as a cosmetic detail: another agent carries its own system prompt and its own model binding, so the substitution changes both the behaviour and the model the run actually executes, and it leaves no signal in the output — the run reports success while a different role and a different model did the work.

Ready dispatch line:

```bash
"$HOME/.opencode/bin/opencode" run \
  --agent build \
  --model "<provider>/<model>" \
  --auto \
  "Implement the task described in issue #<id>. Follow the handoff envelope exactly."
```

- Absolute binary path (Step 1).
- `--agent build` pins the agent; every dispatch example below uses it. Do not use `--agent <role>`, a bare `opencode run`, or any other configured agent for a factory dispatch.
- `--model "<provider>/<model>"` pins the model. **Do not omit it.** OpenCode resolves a model in this order: (1) the `--model` flag, (2) the `model` key in the config, (3) the last used model, (4) an internal priority (see <https://opencode.ai/docs/models/>, "Loading models"). A dispatch that sets neither the flag nor the config key — including a config that leaves `agent.<name>.model` unset — does not fall back to a role binding: it falls through to **whichever model was last used in the TUI**. The same command can therefore execute on a different model on a different day, and the run leaves no signal about which one it used. State the exact string and record it with the dispatch.
- Pin the model **per role**, not once for the whole factory. A Verifier that runs on the writer's own model is a weaker independent check; use a different model, or a different provider, when the role's independence is the point.
- `--auto` auto-approves `ask` rules; explicit `deny` still wins.
- A plain message. v2 removed the v1 `--command` flag, so a dispatch that invokes the `/goal` wrapper through `--command` cannot run:

  ```text
  ERROR
    Unrecognized flag: --command in command opencode run
  ```

  Pass the goal text as the message instead.
- Add `--standalone` when no background service is available, to run with a private server instead.

## Failure path

If any Step 3 check fails, **do not dispatch**. Notify the user with the exact remediation:

- **File:** the config source path from `opencode debug config` that resolves the wrong rule (the `path` of the document that owns it, for example `~/.config/opencode/opencode.json` or the project `opencode.json`).
- **Key:** the exact entry: `permissions` -> `action: shell` -> `resource: "<verb>"`.
- **Required change:** set that rule's `effect` to the value the table requires. Use `allow` for a required verb, or leave it `ask` and add `--auto` to the dispatch. Keep a destructive verb at `deny`. If no rule resolves a required verb, add an explicit `allow` rule for it before the catch-all, or confirm the catch-all is not `deny`.

Then stop and wait. Never dispatch a run that will die at the first commit.

## Verified environment

The facts encoded above were verified on OpenCode `v2.0.18`:

- `"$HOME/.opencode/bin/opencode" --version` -> `opencode v2.0.18`.
- `env -i bash -c 'command -v opencode'` -> not found, while the absolute path above works; a login shell exported it, a clean non-login shell did not.
- `opencode run --command foo` -> `Unrecognized flag: --command in command opencode run`.
- `opencode run --help` lists `--agent string  Agent to use`, `--auto  Auto-approve permissions that are not explicitly denied`, and `--standalone  Run with a private server instead of the background service`.
- The agent-pinning rule was verified on OpenCode `v2.0.18`: `--agent build` is the accepted dispatch shape, and the resolved config binds the goal command to the `build` agent.
- The Step 3 ready check exits `0` against an effective config whose required verbs are `allow` and destructive verbs are `deny`, and exits `1` when a required verb is `ask` without `--auto`, when a required verb is `deny`, or when a destructive verb is not `deny`.
