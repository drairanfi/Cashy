# GitHub-backed factory bootstrap pattern

This is a concrete GitHub-backed factory flow. It is agent-agnostic: any orchestrator that can read a tracker, delegate to isolated coding agents, and open PRs can run it.

## Setup pattern

1. Initialize the repo and set `origin`.
2. Move the tracker to GitHub Issues early instead of keeping local scratch issues.
3. Seed the label vocabulary up front:
   - `needs-triage`
   - `needs-info`
   - `ready-for-agent`
   - `ready-for-review`
   - `ready-for-qa`
   - `bug`
   - `blocked`
   - `ready-for-human`
   - `wontfix`
4. Create a canonic `CONTEXT.md` from the grilling decisions so the spec does not live only in chat.
5. Add a single repository foundation ticket when Bun/TypeScript, README, linting, formatting, Husky, lint-staged, and commit conventions are still missing.
6. Keep the repository docs aligned with the tracker source of truth.

## Queue execution pattern

- Pick the oldest `ready-for-agent` issue in dependency order; process the `ready-for-qa` queue in the same drain. Never pick `ready-for-review`: it is durable work awaiting an explicit Verifier dispatch.
- Delegate each task to its own isolated worktree per `fabrica-routing/references/workspace-isolation-contract.md`, scoped to that feature/PR. Parallel tasks each get a separate worktree; never share one worktree across tasks. Verifier and QA get their own `-verify` / `-qa` worktrees for the same task.
- Verify with the repo's real checks before updating state.
- After implementation, the coding agent sets the PR to `ready-for-review` and leaves a `Coder Agent says:` handoff comment on the issue and the PR. The orchestrator dispatches Verifier; only a Verifier pass lets the orchestrator set `ready-for-qa`.
- The Verifier appends an accumulated `Verifier says:` round to both issue and PR. A Verifier failure routes back to Builder/Recovery; the second combined Verifier/QA failure blocks the PR.
- A separate QA agent works on the PR branch, runs the visual and/or functional flow, and leaves a `QA says:` comment: pass moves the PR to `ready-for-human`; fail sets `ready-for-agent, bug` with a structured bug report.
- Bug fixes are re-delegated on the same PR in goal format and loop back through `ready-for-review`; a Verifier pass returns them to `ready-for-qa`. The second combined Verifier/QA failure on the same PR sends it to `blocked` for human review. Receipt failures are corrected separately and do not consume the cap.
- Move an issue to `ready-for-human` only after QA passes.
- Open PRs with traceable names in the form `Agent-<task-id>-<short-title>`.
- Keep PR descriptions' dated Coder, Verifier, and QA rounds accumulated; never overwrite an earlier `Verifier says:` or `QA says:` record.

Full contract: `qa-loop-contract.md`.

## Merge and conflict rule

Do not check merge conflicts after every single issue while queues still have ready items.
Drain the `ready-for-agent` and `ready-for-qa` queues first, then run the merge pass:

- Merge `ready-for-human` PRs one at a time, oldest first by PR creation order.
- The orchestrator merges; it never resolves a conflict. Any conflict is delegated to a coding agent in goal format, and the PR then re-enters `ready-for-qa` before the merge is retried.

## Notes

- This pattern is meant for GitHub-backed repos that already have issue labels and a branch/PR workflow.
- The delegation backend is interchangeable. Use whatever coding-agent backend is available (Claude Code subagents, OpenCode, or another) and keep the same factory contract: isolated worktree, verification before state change, PR traceable to the ticket.
