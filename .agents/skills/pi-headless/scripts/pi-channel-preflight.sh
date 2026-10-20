#!/usr/bin/env bash
# Channel readiness for headless Pi dispatches.
#
# usage: pi-channel-preflight.sh --model <provider/id> [--thinking <level>] [--timeout <seconds>] [--skip-smoke]
#
# Proves the delegation channel is ready before a dispatch spends anything:
#   1. the binary resolves to an executable and reports a version
#   2. the provider has usable credentials (pi auth check)
#   3. the model id exists in the catalog for that provider
#   4. a one-shot JSON run returns a clean turn, and reports which model/level actually ran
# Exits 0 only when every check passed; otherwise it names each failing check and exits 1.
set -uo pipefail

MODEL=""
THINKING=""
TIMEOUT="${PI_SMOKE_TIMEOUT:-180}"
SMOKE=1

while [ $# -gt 0 ]; do
  case "$1" in
    --model)    MODEL="${2:?--model needs a provider/id}"; shift 2 ;;
    --thinking) THINKING="${2:?--thinking needs a level}"; shift 2 ;;
    --timeout)  TIMEOUT="${2:?--timeout needs seconds}"; shift 2 ;;
    --skip-smoke) SMOKE=0; shift ;;
    -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

[ -n "$MODEL" ] || { echo "usage: pi-channel-preflight.sh --model <provider/id> [--thinking <level>]" >&2; exit 2; }

PROVIDER="${MODEL%%/*}"
MODEL_ID="${MODEL#*/}"
FAIL=0
ok()   { printf 'ok    %s\n' "$*"; }
bad()  { printf 'FAIL  %s\n' "$*"; FAIL=1; }
note() { printf '      %s\n' "$*"; }

echo "=== pi channel preflight ==="

# ---------------------------------------------------------------- 1. binary
BIN="${PI_BIN:-$(command -v pi 2>/dev/null || true)}"
if [ -z "$BIN" ]; then
  for c in "$HOME/.local/share/pnpm/pi" "$HOME/.bun/bin/pi" /usr/local/bin/pi /opt/homebrew/bin/pi; do
    [ -x "$c" ] && { BIN="$c"; break; }
  done
fi
if [ -n "$BIN" ] && [ -x "$BIN" ]; then
  ok "binary: $BIN"
  ok "version: $("$BIN" --version 2>&1 | head -1)"
else
  bad "binary: pi not found (set PI_BIN)"
  note "pi is commonly NOT on a non-interactive PATH; it is installed under ~/.local/share/pnpm or ~/.bun/bin"
fi

if [ "$FAIL" -ne 0 ]; then
  echo "=== NOT READY: fix the checks above before dispatching ==="
  exit 1
fi

# ------------------------------------------------------------------ 2. auth
AUTH_RC=0
"$BIN" auth check --provider "$PROVIDER" --model "$MODEL" --json >/tmp/pi-auth-check.$$ 2>&1 || AUTH_RC=$?
# `pi auth check` knows the providers in its own directory. A provider that runs
# through a bridge or an SDK extension can report not_ready/provider_not_found
# and still work — measured on this host: --provider oc-sdk-go returned
# {"status":"not_ready","reason":"provider_not_found"} (exit 1) while a real run
# on an oc-sdk-go model completed cleanly. So this check is a hint, never the
# credential gate: the smoke test below is what proves the channel.
case "$AUTH_RC" in
  0) ok "auth: $PROVIDER reports ready (pi auth check exit 0)" ;;
  1) note "auth: pi auth check reports not_ready for $PROVIDER"
     head -1 /tmp/pi-auth-check.$$ | sed 's/^/      /'
     note "expected for a bridged/SDK provider; the smoke test is the credential proof" ;;
  2) note "auth: pi auth check exited 2 (invalid invocation) for $PROVIDER"
     head -1 /tmp/pi-auth-check.$$ | sed 's/^/      /'
     note "pi auth check needs a directory provider or a resolvable model; the smoke test is the credential proof" ;;
  *) note "auth: pi auth check exited $AUTH_RC"
     head -1 /tmp/pi-auth-check.$$ | sed 's/^/      /' ;;
esac
rm -f /tmp/pi-auth-check.$$

# ----------------------------------------------------------------- 3. model
if "$BIN" --list-models "$MODEL" 2>/dev/null | awk -v p="$PROVIDER" -v m="$MODEL_ID" '$1==p && $2==m {found=1} END{exit !found}'; then
  ok "model: $MODEL_ID exists for $PROVIDER"
else
  bad "model: $MODEL_ID not in the catalog for $PROVIDER"
  note "--model with an unknown id is NOT an error: Pi warns on stderr and uses a custom model id, then fails at the provider"
  note "run: $BIN --list-models <search> to find the exact id"
fi

# ------------------------------------------------------------ 4. smoke test
if [ "$SMOKE" -eq 1 ]; then
  SMOKE_DIR="$(mktemp -d)"
  ARGS=(-p --mode json --model "$MODEL" --no-approve --no-context-files)
  [ -n "$THINKING" ] && ARGS+=(--thinking "$THINKING")
  ( cd "$SMOKE_DIR" && timeout "$TIMEOUT" "$BIN" "${ARGS[@]}" "Reply with exactly: PONG" ) > "$SMOKE_DIR/out.jsonl" 2> "$SMOKE_DIR/out.err"
  RC=$?
  if [ "$RC" -ne 0 ]; then
    bad "smoke test: exit $RC"
    head -3 "$SMOKE_DIR/out.err" | sed 's/^/      /'
  else
    python3 - "$SMOKE_DIR/out.jsonl" "$THINKING" <<'PY' || FAIL=1
import json, sys
path, want = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
turn = None
settled = None
for line in open(path, encoding="utf-8", errors="replace"):
    line = line.strip()
    if not line.startswith("{"):
        continue
    try:
        d = json.loads(line)
    except Exception:
        continue
    if d.get("type") == "turn_end":
        turn = d.get("message") or {}
    if d.get("type") == "agent_settled":
        settled = d
if turn is None:
    print("FAIL  smoke test: no turn_end record — the invocation failed before the first turn"); sys.exit(1)
if str(turn.get("stopReason")) != "stop":
    print("FAIL  smoke test: stopReason=%r (a failed turn still exits 0 in JSON mode)" % turn.get("stopReason")); sys.exit(1)
usage = turn.get("usage") or {}
cost = (usage.get("cost") or {}).get("total")
print("ok    smoke test: clean turn")
print("      ran: provider=%s model=%s api=%s thinkingLevel=%s" % (
    turn.get("provider"), turn.get("model"), turn.get("api"), turn.get("thinkingLevel")))
print("      tokens=%s cost_usd=%s settled=%s aborted=%s" % (
    usage.get("totalTokens"), cost, settled is not None,
    None if settled is None else settled.get("aborted")))
if want and turn.get("thinkingLevel") != want:
    print("      WARNING: requested thinking=%s but the effective level is %s (levels are clamped)" % (
        want, turn.get("thinkingLevel")))
PY
    [ -f "$SMOKE_DIR/out.err" ] && [ -s "$SMOKE_DIR/out.err" ] && note "stderr: $(head -1 "$SMOKE_DIR/out.err")"
  fi
  rm -rf "$SMOKE_DIR"
else
  note "smoke test skipped (--skip-smoke); model and level were not proven at runtime"
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "=== READY: dispatch with provider-qualified --model, --thinking, --approve and your own timeout ==="
  exit 0
fi
echo "=== NOT READY: fix the FAIL lines above ==="
exit 1
