#!/usr/bin/env bash
# Removes opinionated isolated worktrees for a factory task and prunes registrations.
# Canonical rule: skills/workflow/fabrica-routing/references/workspace-isolation-contract.md
# The orchestrator owns this as part of the merge/close-out pass.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: remove-isolated-worktree.sh --project=<repo> --task=<task-slug> [--role=all|builder|verify|qa] [--repo=<main-checkout>]

Runs `git worktree remove <path>` followed by `git worktree prune` so no
prunable registration is left behind. --role=all (default) removes the
builder, -verify, and -qa worktrees for the task.

  --project   Repository name (e.g. fabrica-skills).
  --task      Task slug <id>-<short-title> (e.g. 25-worktree-isolation).
  --role      all (default), builder, verify, or qa.
  --repo      Main checkout to run git in. Defaults to the current repository top level.
EOF
}

PROJECT=""; TASK=""; ROLE="all"; REPO=""

for arg in "$@"; do
  case "$arg" in
    --project=*) PROJECT="${arg#*=}" ;;
    --task=*) TASK="${arg#*=}" ;;
    --role=*) ROLE="${arg#*=}" ;;
    --repo=*) REPO="${arg#*=}" ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$PROJECT" || -z "$TASK" ]]; then
  echo "Missing required --project or --task." >&2; usage >&2; exit 1
fi
if [[ -z "$REPO" ]]; then
  REPO="$(git rev-parse --show-toplevel)"
fi

SUFFIXES=("")
case "$ROLE" in
  all) SUFFIXES=("" "-verify" "-qa") ;;
  builder) SUFFIXES=("") ;;
  verify) SUFFIXES=("-verify") ;;
  qa) SUFFIXES=("-qa") ;;
  *) echo "--role must be all, builder, verify, or qa." >&2; exit 1 ;;
esac

for suffix in "${SUFFIXES[@]}"; do
  PATH_DIR="${HOME}/.fabrica/workspaces/${PROJECT}/${TASK}${suffix}"
  if [[ -e "$PATH_DIR" ]] || git -C "$REPO" worktree list --porcelain | grep -qxF "worktree $PATH_DIR"; then
    git -C "$REPO" worktree remove "$PATH_DIR"
    echo "Removed: ${PATH_DIR}"
  else
    echo "Skipped (absent): ${PATH_DIR}"
  fi
done

git -C "$REPO" worktree prune
echo "Pruned stale worktree registrations."
