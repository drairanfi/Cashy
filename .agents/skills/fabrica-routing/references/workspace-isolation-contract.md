# Workspace isolation contract

One mechanism and one root for task isolation. This is the single canonical
source — every other skill cites it instead of restating the rule.

## Mechanism

Always a Git worktree, never a full clone for task isolation. A worktree
shares the parent repository's object database, so files materialize without
duplicating history, and the branch stays the single unit mapping one task
to one PR.

```sh
git worktree add <path> -b <branch> <base>
```

## Root and layout

Everything factory-owned lives under `~/.fabrica/`:

| Role | Path |
|---|---|
| Builder | `~/.fabrica/workspaces/<project>/<task-slug>/` |
| Verifier | `~/.fabrica/workspaces/<project>/<task-slug>-verify/` |
| QA | `~/.fabrica/workspaces/<project>/<task-slug>-qa/` |

`<project>` is the repository name. `<task-slug>` is
`<task-id>-<short-title>` and matches the branch (`agent/<task-slug>`) and
the PR title (`Agent-<task-slug>`), so task, branch, worktree, and PR are
traceable from any one of them.

Example for issue 25 in `fabrica-skills`:

- Builder: `~/.fabrica/workspaces/fabrica-skills/25-worktree-isolation/`
- Verifier: `~/.fabrica/workspaces/fabrica-skills/25-worktree-isolation-verify/`
- QA: `~/.fabrica/workspaces/fabrica-skills/25-worktree-isolation-qa/`
- Branch: `agent/25-worktree-isolation`
- PR: `Agent-25-worktree-isolation`

## Creation

- Create the worktree immediately before dispatch, never reuse one across tasks.
- New work branches from `origin/main`. Recovery, verifier, and QA use
  the existing PR branch as base; verifier and QA attach detached at the PR
  branch tip (they never push), because git allows one branch per worktree.
- Never share a worktree between tasks, and never place two writers in one.
- Use `scripts/create-isolated-worktree.sh` instead of hand-rolling the
  command, so the path shape and flags stay opinionated.

## Role handoff staging

`<workspace>/.fabrica-handoff/` holds the role profile and reference copies
staged inside the workspace. Keep it out of `git status` and the diff via
`.git/info/exclude` (per-worktree exclude, never a committed `.gitignore`
change).

## Cleanup

Cleanup is a required step of the merge and close-out pass, owned by the
orchestrator — not a recommendation. On PR merge, on issue close, or on
abandonment:

```sh
git worktree remove <path>
git worktree prune
```

Use `scripts/remove-isolated-worktree.sh` so removal plus prune always run
together. An abandoned task must not leave a `prunable` registration behind.

## Migration note

Already-scattered worktrees (ad-hoc directories across unrelated parents)
are not repaired in place: run `git worktree prune` to drop stale
registrations whose directories are gone, and re-create on demand under this
contract. Repairing downstream projects' existing worktrees is out of scope.

## Out of scope

- A workspace-manager CLI or background reaper for cleanup.
- Changing Verifier/QA loop semantics, the failure cap, or label vocabulary.
- Persistent run state or an audit log beyond what isolation needs.
