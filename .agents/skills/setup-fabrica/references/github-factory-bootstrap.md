# GitHub Bootstrap Pattern for a Factory Repo

This pattern comes from a repo that started empty and was prepared for a GitHub-backed factory flow.

## What happened

- The repo was initialized locally and pointed at a GitHub remote.
- The repo bootstrap docs were added first (`AGENTS.md`, `docs/agents/*`).
- The issue tracker was migrated to GitHub Issues instead of staying in `.scratch/`.
- The full label vocabulary was created in GitHub before publishing work items: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-review`, `ready-for-qa`, `bug`, `blocked`, `ready-for-human`, `wontfix`.
- A foundation issue was created for README, Bun/TypeScript setup, linting, formatting, commit hooks, and commit-message conventions.

## Practical lesson

For a GitHub-backed factory repo, do the repository foundation before delegating feature work:

1. establish repo docs and agent conventions
2. switch the tracker to GitHub Issues
3. create the full label vocabulary (triage plus `ready-for-review`, `ready-for-qa`, `bug`, `blocked`)
4. publish the foundation issue
5. then start slicing implementation work

## Pitfall to avoid

Do not leave the repo in a half-local, half-GitHub state. Pick one tracker model and make it the source of truth before you hand work to agents.
