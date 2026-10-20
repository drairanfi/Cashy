---
name: fabrica-routing
description: "Routes a factory task to focused agent roles based on the available runtime capabilities. Use when coordinating exploration, implementation, independent verification, QA, bug recovery, or conflict recovery without assuming a specific agent CLI or unsupported isolation."
metadata:
  version: 0.2.2
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Fabrica Routing

Use this skill before delegating a factory task. It selects the smallest set of focused roles that can complete the next state transition while preserving independent verification and the existing QA loop.

This is an agent-topology skill. It does **not** define an SDD workflow, create planning artifacts, or require a particular runtime.

## Read first

1. `references/runtime-capability-manifest.md`
2. `references/workspace-isolation-contract.md`
2. `references/agent-handoff-envelope.md`
3. `references/runtime-agent-adapter-contract.md`
4. `references/agent-result-contract.md`
5. `references/gatekeeper-contract.md`
6. The packaged role profile in `agents/<role>.md` (a self-contained projection of the repository-level canonical profile) before dispatching that role.
7. `workflow-fabrica` when the task is in the factory queue.

The routing package contains its own `agents/` profiles for standalone installation. In a full checkout, compare them byte-for-byte with the repository-level canonical `agents/` profiles before dispatch; if the repository root is unavailable, the packaged profiles remain the usable source and must not be resolved through a parent-relative path.

## Non-negotiable authority boundaries

- **Orchestrator:** reads state, selects roles, dispatches, records outcomes, updates coordination state, and may perform an approved merge. It never edits code, resolves conflicts, runs implementation verification, performs a code review, or runs QA flows itself.
- **Explorer:** inspects enough repository and task context to remove a concrete uncertainty. It does not edit implementation files or approve work.
- **Builder:** implements a new task in an isolated worktree when available. It runs its own required checks, but its result is not independently approved by those checks.
- **Verifier:** independently inspects the change and runs focused repository checks. It is distinct from the builder whenever the runtime supports a separate agent or a fresh context. It does not perform product QA.
- **QA:** validates user-visible functional and/or visual behavior using the existing QA skills. QA is distinct from the verifier and from the builder.
- **Recovery:** fixes a reported QA defect or merge conflict on the existing branch. It returns the work to verifier and QA; it never self-approves.

A single runtime may execute roles inline only when it cannot delegate. In that fallback, record the limitation in the handoff envelope and do not claim independent review or isolated worktrees occurred.

## Failure cap

The shared per-PR cap is 2 counted Verifier or QA/defect failures. Receipt failures remain handoff corrections and do not consume the cap. At the cap, set `blocked` and stop retrying.

## Routing procedure

1. Read the task, tracker state, latest role handoffs, PR state, and capability manifest.
2. Select only the roles required for the next transition:
   - unclear repository behavior, ownership, or implementation location, when the handoff identifies a bounded uncertainty that changes the next route or scope -> **Explorer**, then route again;
   - `ready-for-agent` without `bug` -> **Builder**, which hands off to `ready-for-review`;
   - `ready-for-review` -> **Verifier** only;
   - verifier passed -> the orchestrator transitions to `ready-for-qa`, then **QA**;
   - `ready-for-agent` + `bug` -> **Recovery**, then `ready-for-review`, verifier, and QA; a Verifier failure consumes the shared cap and routes back to Recovery;
   - merge conflict -> **Recovery**, then `ready-for-review`, verifier, and QA;
   - `ready-for-qa` -> **QA** only; do not add a verifier retroactively unless new code was produced.
3. Resolve the packaged `agents/<role>.md` profile for the selected role, then give that profile and the complete envelope to the runtime adapter as defined in `references/runtime-agent-adapter-contract.md`.
4. Build one envelope for every dispatch using `references/agent-handoff-envelope.md`. Include exact task, PR, branch, canonical profile, adapter, artifact, and skill paths rather than relying on chat summaries.
5. Dispatch only when the adapter can return a terminal result record. Wait for the result, validate it with the gatekeeper, and only then dispatch a dependent role. Never advance based on background commentary.
6. Use a separate agent and one isolated worktree per `references/workspace-isolation-contract.md` only when the capability manifest confirms both are available. Otherwise use the least misleading fallback and record it.
7. Persist each completed handoff on the task and PR using the role prefixes and accumulation rule from `workflow-fabrica/references/qa-loop-contract.md`.
8. If a role lacks an input, access, or capability needed to proceed, set `blocked` with the missing requirement. Never invent an unsupported adapter, worktree, browser, or reviewer.

## Dispatch rules

- Keep one dispatch to one role and one bounded objective.
- Pass the packaged `agents/<role>.md` profile and exact local paths or URLs for required skills, repository guidance, task records, PR, branch, and prior handoff. The packaged files are projections of the repository-level canonical profiles; the runtime adapter is a further projection layer, never a new role source of truth.
- Parallelize only independent tasks after the capability manifest confirms delegation, waited completion, visible result records, parallel dispatch, isolated workspaces, and capacity. Never put two writers in one worktree.
- For any dependency, use a waited handoff: receive the Result Contract record, gate it, then dispatch the next role. Builder/Recovery -> Verifier -> QA is never parallel.
- Gatekeeping validates result schema, paths, and evidence reachability; it never replaces Verifier's quality judgment or QA's product judgment.
- **Explorer dispatch:** Explorer is optional. Dispatch it only when the handoff names a bounded, answerable uncertainty (for example, an unknown repository path, owner, or existing behavior) whose answer changes the next role or scope; otherwise route directly to Builder.
- Verifier approval is a code/change-quality gate; QA approval is a product-behavior gate. Neither replaces the other.
- A failed verifier returns to Builder or Recovery depending on whether a QA report or merge conflict already exists.
- A failed QA follows the established `ready-for-agent, bug` loop; do not bypass it with an orchestrator patch.

- **Standalone packaging:** this skill ships complete role profiles in `agents/`. Repository-level `agents/` is canonical; `fabrica-routing/agents/` is a checked-in, byte-identical projection for standalone installs. Update canonical profiles first, regenerate this directory, and fail closed if a packaged profile is missing or differs from canonical.

## Output

For each dispatch or result, report: role, packaged and repository canonical profile, materialized runtime profile, runtime adapter, objective, task/PR, capability mode, result-contract status, gate result, evidence required or produced, and next role/state. Keep the report operational and link to the stored handoff.
