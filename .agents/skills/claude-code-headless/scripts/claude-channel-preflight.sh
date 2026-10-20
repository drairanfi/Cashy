#!/usr/bin/env bash
# Channel readiness for headless Claude Code dispatches.
#
# usage: claude-channel-preflight.sh [--model <alias|name>] [--timeout <seconds>] [--skip-smoke]
#
# Proves the delegation channel is ready before a dispatch spends anything:
#   1. the binary resolves and reports a version
#   2. the session is authenticated
#   3. the model alias resolves to a canonical model (smoke test)
#   4. the settings that will apply are visible
# Exits 0 only when every check passed; otherwise it names each failing check and exits 1.
set -uo pipefail

MODEL="${CLAUDE_MODEL:-haiku}"
TIMEOUT="${CLAUDE_SMOKE_TIMEOUT:-120}"
SMOKE=1

while [ $# -gt 0 ]; do
  case "$1" in
    --model)   MODEL="${2:?--model needs a value}"; shift 2 ;;
    --timeout) TIMEOUT="${2:?--timeout needs a value}"; shift 2 ;;
    --skip-smoke) SMOKE=0; shift ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

FAIL=0
ok()   { printf 'ok    %s\n' "$*"; }
bad()  { printf 'FAIL  %s\n' "$*"; FAIL=1; }
note() { printf '      %s\n' "$*"; }

echo "=== claude channel preflight ==="

# ---------------------------------------------------------------- 1. binary
BIN="${CLAUDE_BIN:-}"
if [ -z "$BIN" ]; then
  BIN="$(command -v claude 2>/dev/null || true)"
fi
if [ -z "$BIN" ]; then
  for c in "$HOME/.local/bin/claude" /usr/local/bin/claude /opt/homebrew/bin/claude; do
    [ -x "$c" ] && { BIN="$c"; break; }
  done
fi
if [ -n "$BIN" ] && [ -x "$BIN" ]; then
  ok "binary: $BIN"
  VERSION="$("$BIN" --version 2>&1 | head -1)"
  ok "version: $VERSION"
else
  bad "binary: claude not found (set CLAUDE_BIN or put it on PATH)"
  note "a non-interactive shell may not inherit a login-shell PATH; resolve the absolute path"
fi

if [ "$FAIL" -ne 0 ]; then
  echo "=== NOT READY: fix the checks above before dispatching ==="
  exit 1
fi

# ------------------------------------------------------------------ 2. auth
AUTH_JSON="$("$BIN" auth status 2>/dev/null)"
if printf '%s' "$AUTH_JSON" | python3 -c '
import json,sys
d=json.load(sys.stdin)
print("authMethod=%s provider=%s plan=%s config=%s" % (
    d.get("authMethod"), d.get("apiProvider"), d.get("subscriptionType"), d.get("configDirectory")))
sys.exit(0 if d.get("loggedIn") else 1)
' 2>/dev/null; then
  ok "auth: logged in"
else
  bad "auth: not logged in ($("$BIN" auth status --text 2>&1 | head -1))"
  note "run: $BIN auth login"
fi

CONFIG_DIR="$(printf '%s' "$AUTH_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("configDirectory") or "")' 2>/dev/null)"
if [ -n "$CONFIG_DIR" ]; then
  ok "config directory: $CONFIG_DIR"
fi

# -------------------------------------------------------------- 3. settings
if [ -n "$CONFIG_DIR" ] && [ -f "$CONFIG_DIR/settings.json" ]; then
  SET="$(python3 -c '
import json,sys
d=json.load(open(sys.argv[1]))
print("model=%s effortLevel=%s" % (d.get("model","(unset)"), d.get("effortLevel","(unset)")))
' "$CONFIG_DIR/settings.json" 2>/dev/null)"
  if [ -n "$SET" ]; then
    ok "user settings: $SET"
    note "a -p run also loads CLAUDE.md, skills, agents, hooks and MCP servers unless you trim them"
  else
    bad "user settings: $CONFIG_DIR/settings.json is not valid JSON"
    note "under -p a settings file that fails validation is silently ignored; run: $BIN doctor"
  fi
else
  ok "user settings: none at $CONFIG_DIR/settings.json"
fi

# ------------------------------------------------------------ 4. smoke test
if [ "$SMOKE" -eq 1 ]; then
  SMOKE_DIR="$(mktemp -d)"
  OUT="$(cd "$SMOKE_DIR" && timeout "$TIMEOUT" "$BIN" -p "Reply with exactly: PONG" \
        --model "$MODEL" --tools "" --output-format json 2>&1)"
  RC=$?
  rm -rf "$SMOKE_DIR"
  if [ "$RC" -ne 0 ]; then
    bad "smoke test: exit $RC with --model $MODEL"
    printf '%s\n' "$OUT" | head -4 | sed 's/^/      /'
    note "an unrecognized model prints [claude-code:unrecognized_model] and exits 1"
  else
    printf '%s' "$OUT" | python3 -c '
import json,sys
raw=sys.stdin.read()
try:
    d=json.loads(raw[raw.index("{"):])
except Exception:
    print("FAIL  smoke test: output was not a single JSON object"); sys.exit(1)
m=d.get("modelUsage") or {}
canonical=next(iter(m), "(unknown)")
if d.get("is_error") or "PONG" not in str(d.get("result","")):
    print("FAIL  smoke test: is_error=%s result=%r" % (d.get("is_error"), str(d.get("result"))[:80])); sys.exit(1)
print("ok    smoke test: alias resolves to %s" % canonical)
print("      session=%s turns=%s cost_usd=%s" % (d.get("session_id"), d.get("num_turns"), d.get("total_cost_usd")))
' || FAIL=1
  fi
else
  note "smoke test skipped (--skip-smoke); the alias was not proven to resolve"
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "=== READY: dispatch with an explicit --model, --permission-prompts none and a timeout ==="
  exit 0
fi
echo "=== NOT READY: fix the FAIL lines above ==="
exit 1
