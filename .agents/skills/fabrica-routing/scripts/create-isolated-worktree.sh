#!/usr/bin/env bash
# Creates one opinionated isolated worktree for a factory task.
# Canonical rule: skills/workflow/fabrica-routing/references/workspace-isolation-contract.md
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: create-isolated-worktree.sh --project=<repo> --task=<task-slug> --base=<base-branch> [--role=builder|verify|qa] [--branch=<name>] [--repo=<main-checkout>]

Creates ~/.fabrica/workspaces/<project>/<task-slug>[-verify|-qa]/ via
`git worktree add` and stages .fabrica-handoff/ excluded through .git/info/exclude.

  --project   Repository name (e.g. fabrica-skills).
  --task      Task slug <id>-<short-title> (e.g. 25-worktree-isolation).
  --base      Base to branch from: origin/main for new work, PR branch for recovery/verifier/QA.
  --role      builder (default), verify, or qa. Appends -verify / -qa to the directory.
  --branch    Branch name. Defaults to agent/<task-slug>.
  --repo      Main checkout to run git in. Defaults to the current repository top level.
EOF
}

PROJECT=""; TASK=""; BASE=""; ROLE="builder"; BRANCH=""; REPO=""

for arg in "$@"; do
  case "$arg" in
    --project=*) PROJECT="${arg#*=}" ;;
    --task=*) TASK="${arg#*=}" ;;
    --base=*) BASE="${arg#*=}" ;;
    --role=*) ROLE="${arg#*=}" ;;
    --branch=*) BRANCH="${arg#*=}" ;;
    --repo=*) REPO="${arg#*=}" ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$PROJECT" || -z "$TASK" || -z "$BASE" ]]; then
  echo "Missing required --project, --task, or --base." >&2; usage >&2; exit 1
fi
if [[ "$ROLE" != builder && "$ROLE" != verify && "$ROLE" != qa ]]; then
  echo "--role must be builder, verify, or qa." >&2; exit 1
fi
if [[ -z "$REPO" ]]; then
  REPO="$(git rev-parse --show-toplevel)"
fi
if [[ -z "$BRANCH" ]]; then
  BRANCH="agent/${TASK}"
fi

SUFFIX=""
if [[ "$ROLE" == verify ]]; then SUFFIX="-verify"; fi
if [[ "$ROLE" == qa ]]; then SUFFIX="-qa"; fi
PATH_DIR="${HOME}/.fabrica/workspaces/${PROJECT}/${TASK}${SUFFIX}"

mkdir -p "$(dirname "$PATH_DIR")"

if [[ "$ROLE" == builder ]]; then
  if git -C "$REPO" rev-parse --verify --quiet "refs/heads/${BRANCH}" >/dev/null; then
    git -C "$REPO" worktree add "$PATH_DIR" "$BRANCH"
  else
    git -C "$REPO" fetch origin >/dev/null 2>&1 || true
    git -C "$REPO" worktree add "$PATH_DIR" -b "$BRANCH" "$BASE"
  fi
else
  # Verifier/QA never push: a detached checkout of the PR branch tip avoids
  # git's one-worktree-per-branch limit while keeping the exact code under test.
  git -C "$REPO" fetch origin >/dev/null 2>&1 || true
  git -C "$REPO" worktree add --detach "$PATH_DIR" "$BASE"
fi

mkdir -p "${PATH_DIR}/.fabrica-handoff"
EXCLUDE_FILE="$(git -C "$PATH_DIR" rev-parse --git-common-dir 2>/dev/null || echo "${PATH_DIR}/.git")/info/exclude"
# Worktrees share the common dir; fall back to the worktree admin dir when needed.
if [[ ! -f "$EXCLUDE_FILE" ]]; then
  EXCLUDE_FILE="$(git -C "$PATH_DIR" rev-parse --git-dir)/info/exclude"
fi
mkdir -p "$(dirname "$EXCLUDE_FILE")"
grep -qxF ".fabrica-handoff/" "$EXCLUDE_FILE" 2>/dev/null || echo ".fabrica-handoff/" >> "$EXCLUDE_FILE"

echo "Worktree ready: ${PATH_DIR} (branch ${BRANCH}, role ${ROLE})"
