#!/usr/bin/env bash
# Dispatch one Fabrica role on headless Claude Code, with fail-closed guards.
#
# usage: dispatch-claude.sh <worktree> <brief-file> <log-dir> [model] [effort]
#
# Environment overrides (all optional):
#   CLAUDE_BIN                path to the binary (default: resolve from PATH)
#   CLAUDE_PERMISSION_MODE    default bypassPermissions
#   CLAUDE_OUTPUT_FORMAT      text (default) | json | stream-json
#   CLAUDE_MAX_TURNS          e.g. 40          (--print only)
#   CLAUDE_MAX_BUDGET_USD     e.g. 5.00        (--print only)
#   CLAUDE_TIMEOUT            seconds, default 5400
#
# Guards run BEFORE anything launches. A dispatch that fails a guard costs nothing.
set -uo pipefail

W="${1:?usage: dispatch-claude.sh <worktree> <brief> <log-dir> [model] [effort]}"
P="${2:?usage: dispatch-claude.sh <worktree> <brief> <log-dir> [model] [effort]}"
L="${3:?usage: dispatch-claude.sh <worktree> <brief> <log-dir> [model] [effort]}"
MODEL="${4:-${CLAUDE_MODEL:-haiku}}"
EFFORT="${5:-${CLAUDE_EFFORT:-}}"
MODE="${CLAUDE_PERMISSION_MODE:-bypassPermissions}"
FORMAT="${CLAUDE_OUTPUT_FORMAT:-text}"
LIMIT="${CLAUDE_TIMEOUT:-5400}"

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

BIN="${CLAUDE_BIN:-$(command -v claude 2>/dev/null || true)}"
[ -n "$BIN" ] || { echo "GUARD FAIL: claude is not on PATH (set CLAUDE_BIN)"; exit 1; }

mkdir -p "$L"

# ------------------------------------------------------------ ready line
BRANCH="$(git -C "$W" rev-parse --abbrev-ref HEAD)"
COMMIT="$(git -C "$W" rev-parse --short HEAD)"
echo "GUARDS OK · branch $BRANCH @ $COMMIT"
echo "brief: $(basename "$P") ($(wc -c < "$P") bytes)"
echo "pinned: model=$MODEL effort=${EFFORT:-default} mode=$MODE format=$FORMAT timeout=${LIMIT}s"

# -------------------------------------------------------------- dispatch
ARGS=(-p "$(cat "$P")" --model "$MODEL" --permission-mode "$MODE"
      --permission-prompts none --output-format "$FORMAT")
[ -n "$EFFORT" ] && ARGS+=(--effort "$EFFORT")
[ -n "${CLAUDE_MAX_TURNS:-}" ] && ARGS+=(--max-turns "$CLAUDE_MAX_TURNS")
[ -n "${CLAUDE_MAX_BUDGET_USD:-}" ] && ARGS+=(--max-budget-usd "$CLAUDE_MAX_BUDGET_USD")

LOG="$L/$(basename "$P" .md).$(date +%Y%m%d-%H%M%S).log"
echo "=== ARRANCA: $(date '+%Y-%m-%d %H:%M:%S') · claude/$MODEL · $(basename "$W")"
cd "$W" || exit 1
timeout "$LIMIT" "$BIN" "${ARGS[@]}" 2>&1 | tee "$LOG"
RC=${PIPESTATUS[0]}
echo "=== TERMINA: exit=$RC · $(date '+%H:%M:%S') · log=$LOG"

# --------------------------------------------------- record what actually ran
if [ "$FORMAT" = "json" ] && [ -s "$LOG" ]; then
  python3 - "$LOG" <<'PY' || true
import json, sys
raw = open(sys.argv[1], encoding="utf-8", errors="replace").read()
start = raw.find("{")
if start >= 0:
    try:
        d = json.loads(raw[start:])
    except Exception:
        d = None
    if isinstance(d, dict):
        usage = d.get("modelUsage") or {}
        canonical = next(iter(usage), "(unknown)")
        print("ran: model=%s turns=%s cost_usd=%s terminal=%s denials=%s" % (
            canonical, d.get("num_turns"), d.get("total_cost_usd"),
            d.get("terminal_reason"), len(d.get("permission_denials") or [])))
        print("session=%s" % d.get("session_id"))
PY
fi

exit "$RC"
