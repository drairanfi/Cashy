# QA loop contract

## Contents
- State machine and labels
- Validation type
- Comment conventions
- Coder-agent handoff (implementation or bug fix done)
- Verifier delegation (before ready-for-qa)
- Waited handoffs and gatekeeper
- QA delegation (ready-for-qa)
- QA result comment
- Bug report structure
- Bug-fix delegation (ready-for-agent + bug)
- Failure cap
- Merge and conflict handling
- Blocked

## State machine and labels

The base flow follows Matt Pocock's model plus three factory-specific states (`ready-for-review`, `ready-for-qa`, `blocked`) and one defect marker (`bug`).

| Label | Meaning | Who sets it | Next |
|---|---|---|---|
| `needs-triage` | Not yet assessed | Human / orchestrator | `ready-for-agent`, `needs-info`, `wontfix` |
| `needs-info` | Waiting on missing detail from a human | Orchestrator | `ready-for-agent` |
| `ready-for-agent` | Ready for a Builder or Recovery agent to implement or fix | Orchestrator / QA agent | Builder or Recovery -> `ready-for-review`; `blocked` |
| `ready-for-review` | Writer handoff is complete and awaits Verifier | Builder / Recovery | Verifier; `blocked` |
| `ready-for-qa` | Verifier-approved implementation pushed to a PR, needs QA on that PR | Orchestrator after Verifier pass | `ready-for-human`, `ready-for-agent` + `bug`, `blocked` |
| `bug` | QA found a defect; always travels together with `ready-for-agent` | QA agent | Removed by the orchestrator after Recovery passes Verifier and returns to `ready-for-qa` |
| `ready-for-human` | QA passed; eligible for merge by the orchestrator | QA agent | Merged by the orchestrator / back to `ready-for-qa` after a conflict fix |
| `blocked` | A delegated agent cannot proceed, or the shared Verifier/QA failure cap was hit | Any delegated agent / orchestrator | Previous actionable label once a human unblocks it |
| `wontfix` | Will not be done | Human | Closed |

The `ready-for-human` name is kept for now; the merge-authority model (whether a human gate applies, and when) is a roadmap item in the repo README.

Transitions the factory automates:

```
ready-for-agent --Builder/Recovery--> ready-for-review --Verifier pass--> ready-for-qa --QA pass--> ready-for-human --orchestrator merges--> merged
       ^                              |                         |                          |
       |                         verifier fail                 QA fail                    merge conflict
       +---------------------- Builder/Recovery <-------- (ready-for-agent, bug)            v
                                                                    Recovery --> ready-for-review

`ready-for-review` is intentionally absent from automatic queue pickup: queue drain handles only `ready-for-agent` and `ready-for-qa`, so work awaiting Verifier cannot be re-picked.
```

- `blocked` can be entered from `ready-for-agent`, `ready-for-review`, or `ready-for-qa`; it pauses the task until a human clears it.
- The second counted Verifier or QA/defect failure on the same PR -> `blocked` + human review (see `Failure cap`). Receipt failures are corrected separately and do not count.

## Validation type

Not every task is eligible for visual QA. A slice that defers sections cannot pass a full-page visual diff, because the full-page baseline includes the deferred content. Each task therefore declares one binding validation type at spec time, and QA honors it instead of deciding evaluation scope at runtime.

| Type | Meaning | QA runs |
|---|---|---|
| `functional-only` | No visual baseline applies (visual not complete yet, motion, infra) | Functional checks only (`user-flow-browser-qa`) |
| `scoped-visual` | Visual within an explicit clip/mask scope (deferred areas excluded) | Scoped visual (`visual-baseline-setup` + `visual-qa-evaluation` on the declared scope), plus functional as needed |
| `visual+functional` | Full-page visual parity at the baseline viewports plus functional flows | Full visual + functional. Only valid when the task's structure matches the full-page baseline |

Rules:

1. The ticket declares the validation type when it is created/specified.
2. The coder handoff (`Coder Agent says:`) restates it, with `Visual readiness: ready | pending <#ticket>` and the exact baseline viewports.
3. QA honors the declared type as **binding**; it escalates only when the declaration is demonstrably wrong, with evidence attached.
4. Skill/spec templates (Goal block, handoff template) must carry this field.

## Comment conventions

Every automated comment is left on BOTH the issue/task and the PR, and starts with a role prefix:

- Explorer: `Explorer says: <comment>`
- Builder or Recovery: `Coder Agent says: <comment>`
- Verifier: `Verifier says: <comment>`
- QA agent: `QA says: <comment>`

For each round, the PR description appends the Coder handoff, the Verifier result, and the QA result under the same dated `#### Round N — <date>` heading. These records are accumulated and never overwritten.

Comments **accumulate**: each round appends a new comment, and PR-description blocks are appended under a dated round heading. Never overwrite or delete a prior comment or block — the full trace stays on both the issue and the PR.

Keep comments in English. Use the provider's native comment API: GitHub `gh issue comment` / `gh pr comment`, `Notion:notion-create-comment`, or the Linear comment tool.

## Coder-agent handoff (implementation or bug fix done)

When a Builder or Recovery agent finishes implementing a task OR fixing a bug, before handing back it MUST:

1. Open or update the PR for the work (isolated branch, never main when the runtime supports isolation).
2. Leave a `Coder Agent says:` comment on the issue AND the PR containing:
   - **What to test**: `visual`, `functional`, or both.
   - **QA flow to run**: `visual-baseline-setup` + `visual-qa-evaluation` for visual; `user-flow-browser-qa` for functional.
   - **Scope touched**: whole view or a specific section, and which view/route.
   - **Viewport(s)**: `mobile`, `tablet`, `desktop`, or a combination.
   - **Input for the QA skills**: the concrete starting point the QA agent needs — route/URL, auth state or role, fixtures or seed data, the use case / expected behavior, and any dynamic areas to ignore.
   - **Vision to implement**: one or two lines on the intended end state, so QA judges against intent, not guesswork.
   - **Validation type**: `functional-only` | `scoped-visual` | `visual+functional` (binding for QA, see `## Validation type`).
   - **Visual readiness**: `ready`, or `pending <#ticket>` when visual is deferred to a later ticket.
   - **Baseline viewports**: exact viewport(s) the change was built against (e.g. 1440x900, 390x844).
3. Put the same "what to test / scope / viewport / input / vision" block in the PR description (see `pr-template.md`).

The orchestrator dispatches Verifier next; the writer's state is `ready-for-review`. A Recovery pass removes `bug` and `ready-for-agent` only when the orchestrator moves the work to `ready-for-qa` after verifier evidence passes.

## Verifier delegation (before ready-for-qa)

The orchestrator delegates a Verifier after every Builder or Recovery handoff. The Verifier is a code/change-quality gate and is distinct from QA.

1. When supported, use a distinct agent with fresh context; otherwise record the exact limitation and do not call the outcome independent.
2. Read the issue, latest `Coder Agent says:` handoff, PR description, and diff.
3. Run the smallest meaningful repository checks for the change and append a `Verifier says:` comment on both the issue and PR with commands, results, and any findings.
4. On pass, only the orchestrator sets `ready-for-qa`; on fail, it routes the findings to Builder or Recovery and increments the shared failure counter. The Verifier never edits implementation files.

## Waited handoffs and gatekeeper

Every Explorer, Builder, Verifier, QA, and Recovery outcome carries the common Result Contract from `skills/workflow/fabrica-routing/references/agent-result-contract.md`. Before any dependent dispatch, the Orchestrator waits for that terminal record and validates it under `gatekeeper-contract.md`: schema, loaded skill paths, resolvable evidence, and changed paths when diff access exists.

A Builder or Recovery receipt must pass the gate before Verifier starts. A Verifier receipt must pass the gate before `ready-for-qa` is set and QA starts. A QA receipt must pass the gate before the existing `ready-for-human` or `ready-for-agent, bug` transition. Gatekeeping validates the receipt only; it never substitutes for the Verifier or QA judgment. Receipt failure requests a corrected handoff and does not consume a QA retry round.

## QA delegation (ready-for-qa)

When a task carries `ready-for-qa`, the orchestrator delegates it to a separate coding agent acting as QA (it may be a different provider/model than the implementer) only when the capability manifest confirms a separate execution and isolated workspace. If those capabilities are unavailable, automated QA does not run or pass: the orchestrator sets `blocked`, records the exact limitation, and requests authorized manual QA. The QA delegation prompt MUST require the agent to:

1. Check out and work on the PR branch inside an isolated worktree per `skills/workflow/fabrica-routing/references/workspace-isolation-contract.md` (detached at the PR tip for verifier/QA; they never push). Never QA against main. Do not substitute the main checkout or an unisolated workspace.
2. Read, in this order: the issue/task, its last `Coder Agent says:` comment, and the PR in `ready-for-qa` (description + diff).
3. Run only the QA flow(s) the declared validation type allows (`functional-only` | `scoped-visual` | `visual+functional`, restated in the coder handoff with visual readiness and baseline viewports). QA judgment may narrow the scope (e.g. skip a viewport with a documented reason) or escalate with evidence when the declaration is demonstrably wrong — it must never add a full-page visual gate to a task whose type or readiness excludes it:
   - Visual: `visual-baseline-setup` then `visual-qa-evaluation`.
   - Functional: `user-flow-browser-qa`.
4. Use the `Input for the QA skills` block from the coder comment as the starting point for those skills.
5. Decide one outcome and record it (see `QA result comment`).

The validation type declared in the coder handoff is binding for QA (see `## Validation type`).

The orchestrator does not run the QA flows itself; it delegates and then reads the result.

## QA result comment

The QA agent leaves a `QA says:` comment on the issue AND the PR.

**Pass** — visual and/or functional both meet the intent within scope:
- State "QA passed" with a one-line note on what was checked (flows, viewports) and the validation type that was run.
- When a visual flow ran, attach the visual evidence block below.
- Move the PR to `ready-for-human`.

**Fail** — a bug, or functionality/visual not fully met:
- `<comment>` follows the bug report structure below.
- Set the PR labels to `ready-for-agent, bug` (both, together).
- Do not move to `ready-for-human`.

### Visual evidence block (required whenever a visual flow ran)

Pass or fail, a `QA says:` comment that covers a visual flow MUST carry the evidence of what was compared, on BOTH the issue and the PR (identical block; the PR-description round block links to the comment):

- **Current capture (required)** — the screenshot(s) taken on the PR branch, uploaded to the comment, one per viewport checked (`mobile` / `tablet` / `desktop`), each labelled with scope + route + viewport.
- **Baseline reference (required)** — the exact source of truth: baseline manifest path (`visual-baseline/<scope>/<viewport>/manifest.json`) + commit/branch (or artifact id), plus route/scope + viewport. It must be resolvable later — never just "the baseline". Baselines are tracked in git under `visual-baseline/` (see `visual-baseline-setup/references/baseline-contract.md`).
- **Diff image (required on fail, recommended on pass)** — the comparison output. On fail it goes inside the bug report's *Actual result* section.
- **Comparison metadata** — one line each: scope reviewed, viewport(s), capture mode (`viewport` vs `full-page`), dynamic areas ignored, verdict per viewport.
- **Size fallback** — if the provider caps image uploads, attach at minimum the failing viewport + its diff, and link the rest from the PR branch path or artifact. Never a bare "QA passed" with zero images.

## Bug report structure

Inside a failing `QA says:` comment, `<comment>` uses exactly this structure:

```
1. Steps to reproduce: exact ordered actions taken to reach the error.
2. Expected result: what should have happened.
3. Actual result: what actually happened (attach screenshots, console logs, or errors when available).
4. Environment: operating system, browser used, and application version where it occurs.
```

## Bug-fix delegation (ready-for-agent + bug)

When a task carries `ready-for-agent` and `bug`, the orchestrator re-delegates the fix to a coding agent, on the SAME PR and branch. The delegation prompt is in goal format — build it with the `goal-prompting` skill — where:

- **Outcome**: the reported bug is resolved on the existing PR branch.
- **Completion criteria**: the exact steps from the bug report no longer produce the error; the failing QA flow (visual and/or functional) now passes; existing checks still pass; no scope expansion beyond the fix.
- **Start here**: the PR branch, the failing `QA says:` comment, the issue.
- **Constraints**: fix on the current branch, do not open a new PR, do not weaken tests or checks.

When the fix is done, Recovery follows **Coder-agent handoff** again: push to the same PR and leave a `Coder Agent says:` comment on the issue and PR.

The orchestrator then dispatches **Verifier** and repeats **QA delegation** only after it passes.

## Failure cap

The same per-PR counter covers implementation-quality Verifier failures and QA/defect failures. A failure is counted when Verifier rejects the change or QA reports an implementation/product defect that routes to another writer round. Receipt failures (invalid/missing result records or unreachable evidence) are handoff-correction work and do not consume the counter. On counted failure 2, set `blocked`, stop all further Builder/Recovery, Verifier, and QA retries, preserve the accumulated `Verifier says:` and `QA says:` rounds, and escalate with the counter and remaining failure. There is no unlimited Verifier loop.

## Merge and conflict handling

The orchestrator merges completed work by default; it does not hand merging to a human.

- Once both queues are empty, merge `ready-for-human` PRs one at a time, **oldest first by PR creation order**.
- Before each merge, re-confirm the PR is still `ready-for-human` and mergeable.
- Use the repo's stated merge method if it documents one, else the repo default. Prefer `Closes #<id>` in the PR body so the platform closes the linked issue; otherwise the orchestrator closes it after merge.
- After each merge (and on issue close or abandonment), the orchestrator removes the task worktrees per `skills/workflow/fabrica-routing/references/workspace-isolation-contract.md` (`git worktree remove` + `git worktree prune`).
- **A merge conflict is never resolved by the orchestrator.** It delegates a conflict-resolution task in goal format (`goal-prompting`):
  - **Outcome**: the PR branch is rebased/merged onto the current base with every conflict resolved and nothing lost.
  - **Completion criteria**: no conflict markers; the branch builds; existing checks pass; the original change is preserved.
  - **Start here**: the PR branch, the base branch, the conflicting files.
  - **Constraints**: stay on the existing PR branch, do not open a new PR.
- After a conflict fix, Recovery returns the PR to Verifier. A verifier pass returns it to `ready-for-qa` for a re-check, then `ready-for-human`, then the orchestrator retries the merge.
- Each merge can create conflicts in the PRs still in line; handle them the same way as they surface.

The orchestrator merges `ready-for-human` PRs by default. When a project policy must override that default with a human gate, and how merge readiness is verified before the merge, remain roadmap items in the repo README.

## Blocked

Any delegated agent (coder or QA) that cannot proceed without external input sets `blocked` instead of guessing. Typical causes: missing credentials or access, contradictory or missing spec detail, an unavailable external dependency, the target project's README not documenting how to run the app, or the shared Verifier/QA failure cap being hit. Receipt failures are corrected separately and do not consume the cap.

Whoever sets it leaves a comment (role prefix as usual) stating: what is blocked, why, and exactly what is needed to unblock. The orchestrator never advances a `blocked` task automatically; it surfaces the blocker to the user. Once a human clears it, the task returns to its previous actionable label (`ready-for-agent` or `ready-for-qa`).
