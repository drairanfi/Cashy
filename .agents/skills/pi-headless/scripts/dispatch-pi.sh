#!/usr/bin/env bash
# Dispatch one Fabrica role on headless Pi, with fail-closed guards and a receipt.
#
# usage: dispatch-pi.sh <worktree> <brief-file> <log-dir> [provider/model[:level]] [thinking-level]
#
# Environment overrides (all optional):
#   PI_BIN                 path to the pi binary (default: resolve from PATH then well-known dirs)
#   PI_TRUST               approve (default) | no-approve | none
#   PI_TOOLS               comma-separated tool allowlist (e.g. read,grep,find,edit,write,bash)
#   PI_NO_MCP=1            pass --no-mcp
#   PI_NO_SKILLS=1         pass --no-skills
#   PI_NO_EXTENSIONS=1     pass --no-extensions
#   PI_NO_CONTEXT=1        pass --no-context-files
#   PI_NO_SESSION=1        pass --no-session (note: this also unsets the file-based provenance)
#   PI_TIMEOUT             seconds, default 5400
#
# Guards run BEFORE anything launches. A dispatch that fails a guard costs nothing.
set -uo pipefail

W="${1:?usage: dispatch-pi.sh <worktree> <brief> <log-dir> [provider/model[:level]] [thinking]}"
P="${2:?usage: dispatch-pi.sh <worktree> <brief> <log-dir> [provider/model[:level]] [thinking]}"
L="${3:?usage: dispatch-pi.sh <worktree> <brief> <log-dir> [provider/model[:level]] [thinking]}"
MODEL="${4:-${PI_MODEL:-}}"
THINKING="${5:-${PI_THINKING:-}}"
TRUST="${PI_TRUST:-approve}"
LIMIT="${PI_TIMEOUT:-5400}"

# ----------------------------------------------------------- input guards
[ -d "$W" ] || { echo "GUARD FAIL: the worktree does not exist: $W"; exit 1; }
git -C "$W" rev-parse --verify --quiet HEAD >/dev/null || { echo "GUARD FAIL: $W is not a git worktree"; exit 1; }

[ -s "$P" ] || { echo "GUARD FAIL: brief missing or empty: $P"; exit 1; }

# Section markers are ROLE-SPECIFIC: a builder brief carries `## Goal` and a
# `Coder Agent says` handoff, a verifier or QA brief carries `## Objective` and
# its own handoff. A guard that hardcodes one role's markers cries wolf on every
# other role and gets ignored, so accept the role-appropriate set.
grep -qE '^## (Goal|Objective)' "$P" \
  || { echo "GUARD FAIL: brief has no objective block (## Goal / ## Objective)"; exit 1; }
grep -q 'schema_version: 1' "$P" \
  || { echo "GUARD FAIL: brief does not require the result record (schema_version: 1)"; exit 1; }
grep -qE '(Coder Agent|Builder|Verifier|Recovery|QA) says' "$P" \
  || { echo "GUARD FAIL: brief does not require the role handoff"; exit 1; }

BIN="${PI_BIN:-$(command -v pi 2>/dev/null || true)}"
if [ -z "$BIN" ]; then
  for c in "$HOME/.local/share/pnpm/pi" "$HOME/.bun/bin/pi" /usr/local/bin/pi /opt/homebrew/bin/pi; do
    [ -x "$c" ] && { BIN="$c"; break; }
  done
fi
[ -n "$BIN" ] || { echo "GUARD FAIL: pi is not resolvable (set PI_BIN)"; exit 1; }

# A provider-qualified model is required: a bare id can be ambiguous across
# providers, and a misspelled id is not an error -- Pi warns and uses a custom id.
[ -n "$MODEL" ] || { echo "GUARD FAIL: no model pinned (pass provider/model as \$4 or set PI_MODEL)"; exit 1; }
case "$MODEL" in
  */*) : ;;
  *) echo "GUARD FAIL: model must be provider-qualified (got: $MODEL)"; exit 1 ;;
esac

mkdir -p "$L"

# ------------------------------------------------------------ ready line
BRANCH="$(git -C "$W" rev-parse --abbrev-ref HEAD)"
COMMIT="$(git -C "$W" rev-parse --short HEAD)"
STAMP="$(date +%Y%m%d-%H%M%S)"
BASE="$L/$(basename "$P" .md).$STAMP"
echo "GUARDS OK · branch $BRANCH @ $COMMIT"
echo "brief: $(basename "$P") ($(wc -c < "$P") bytes)"
echo "pinned: model=$MODEL thinking=${THINKING:-<model default>} trust=$TRUST timeout=${LIMIT}s"

# -------------------------------------------------------------- dispatch
ARGS=(-p --mode json --model "$MODEL" --models "$MODEL")
[ -n "$THINKING" ] && ARGS+=(--thinking "$THINKING")
case "$TRUST" in
  approve)    ARGS+=(--approve) ;;
  no-approve) ARGS+=(--no-approve) ;;
  none)       : ;;
  *) echo "GUARD FAIL: PI_TRUST must be approve|no-approve|none (got: $TRUST)"; exit 1 ;;
esac
[ -n "${PI_TOOLS:-}" ] && ARGS+=(--tools "$PI_TOOLS")
[ "${PI_NO_MCP:-0}" = "1" ] && ARGS+=(--no-mcp)
[ "${PI_NO_SKILLS:-0}" = "1" ] && ARGS+=(--no-skills)
[ "${PI_NO_EXTENSIONS:-0}" = "1" ] && ARGS+=(--no-extensions)
[ "${PI_NO_CONTEXT:-0}" = "1" ] && ARGS+=(--no-context-files)
[ "${PI_NO_SESSION:-0}" = "1" ] && ARGS+=(--no-session)

echo "=== ARRANCA: $(date '+%Y-%m-%d %H:%M:%S') · pi/$MODEL · $(basename "$W")"
cd "$W" || exit 1
# stdout is reserved for the JSONL stream; diagnostics stay on stderr in their own file.
timeout "$LIMIT" "$BIN" "${ARGS[@]}" "$(cat "$P")" > "$BASE.jsonl" 2> "$BASE.err"
RC=$?
echo "=== TERMINA: exit=$RC · $(date '+%H:%M:%S') · stream=$BASE.jsonl stderr=$BASE.err"

# --------------------------------------------------- record what actually ran
# JSON mode exits 0 on a failed turn, so the receipt is read from the events.
python3 - "$BASE.jsonl" "$BASE.txt" <<'PY'
import json, sys
stream, out = sys.argv[1], sys.argv[2]
turn = None
settled = False
aborted = None
final_text = []
for line in open(stream, encoding="utf-8", errors="replace"):
    line = line.strip()
    if not line.startswith("{"):
        continue
    try:
        d = json.loads(line)
    except Exception:
        continue
    t = d.get("type")
    if t == "turn_end":
        turn = d.get("message") or {}
    elif t == "agent_settled":
        settled = True
        aborted = d.get("aborted")
    elif t == "message_end":
        m = d.get("message") or {}
        if m.get("role") == "assistant":
            for block in (m.get("content") or []):
                if isinstance(block, dict) and block.get("type") == "text":
                    final_text.append(block.get("text") or "")
if final_text:
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(final_text[-1])
if turn is None:
    print("receipt: NO turn_end record — the invocation failed before the first turn")
    sys.exit(3)
usage = turn.get("usage") or {}
cost = (usage.get("cost") or {}).get("total")
stop = turn.get("stopReason")
print("receipt: provider=%s model=%s api=%s thinkingLevel=%s stopReason=%s" % (
    turn.get("provider"), turn.get("model"), turn.get("api"), turn.get("thinkingLevel"), stop))
print("receipt: tokens=%s cost_usd=%s settled=%s aborted=%s" % (
    usage.get("totalTokens"), cost, settled, aborted))
print("receipt: final text -> %s" % out)
if stop != "stop":
    print("receipt: FAILED TURN — stopReason %r is not 'stop'; JSON mode still exits 0" % stop)
    sys.exit(4)
sys.exit(0)
PY
RECEIPT_RC=$?
if [ "$RECEIPT_RC" -ne 0 ]; then
  echo "=== the run produced no clean turn (receipt exit $RECEIPT_RC) ==="
  [ -s "$BASE.err" ] && head -3 "$BASE.err" | sed 's/^/      stderr: /'
  [ "$RC" -eq 0 ] && RC="$RECEIPT_RC"
fi

exit "$RC"
