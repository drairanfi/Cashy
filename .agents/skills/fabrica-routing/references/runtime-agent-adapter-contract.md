# Runtime agent adapter contract

Canonical Fabrica role contracts live in the repository-level `agents/` directory. The `fabrica-routing` skill also packages complete role profiles under its own `agents/` directory so standalone installation has no impossible parent-relative dependency. That directory is a checked-in, byte-identical projection of the repository profiles; update the repository source first, regenerate the package, and fail closed when the package is absent or differs.

Adapters convert the packaged role profile plus a complete handoff envelope into a native agent execution. When the full repository is available, the adapter validates the packaged profile against the repository canonical projection. Adapters do not add an SDD lifecycle.

## Adapter input and output

Every adapter receives:

- the packaged profile path, for example `skills/workflow/fabrica-routing/agents/verifier.md`;
- the repository-level canonical profile path when the full repository is available, for provenance and byte-equality validation;
- a complete handoff envelope following `agent-handoff-envelope.md`;
- the current capability manifest;
- exact repository instructions, task/PR/branch references, prior gated result, and required skill paths.

The adapter MUST return one terminal result record matching `agent-result-contract.md` (including `status`, evidence, changed paths, next role, risks, and loaded skill paths). If it cannot accept the profile and envelope or cannot return that record, routing fails closed to `blocked`; no provider-specific executable command is implied by this contract.

## Maintained adapters

### `.codex/`

- **Discovery paths:** `.codex/agents/<role>.md` and `.codex/skills/**`.
- **Materialization:** copy the complete content of `agents/<role>.md` to `.codex/agents/<role>.md`; copy the full `skills/` tree to `.codex/skills/`.
- **Native execution:** when the capability manifest declares `delegate_agents: true`, dispatch the materialized profile with the exact envelope and wait for completion using the host's native subagent lifecycle. For Codex-style runtimes this means correlate the child identifier, wait for the child result, and collect its final structured record before routing again.
- **Fallback:** if delegation or waited results are unavailable, execute the selected role inline and label the result `inline-fallback`; do not claim a fresh context or independent assessment.

### `.agents/`

- **Discovery paths:** `.agents/agents/<role>.md` and `.agents/skills/**`.
- **Materialization:** copy the complete content of `agents/<role>.md` to `.agents/agents/<role>.md`; copy the full `skills/` tree to `.agents/skills/`.
- **Native execution:** use the host's agent-discovery and delegation mechanism only when declared by the capability manifest. Pass the full envelope, gated predecessor receipt, and exact paths; wait for the final common result before dependent work.
- **Fallback:** run inline only when native delegation or waiting is absent, recording the factual limitation.

### `.claude/`

- **Discovery paths:** `.claude/agents/<role>.md` and `.claude/skills/**`.
- **Materialization:** copy the complete content of `agents/<role>.md` to `.claude/agents/<role>.md`; copy the full `skills/` tree to `.claude/skills/`.
- **Native execution:** invoke the discovered role using the host's native task/subagent mechanism only when capabilities confirm it. Pass the exact envelope and wait for a final common result; never treat background commentary as completion.
- **Fallback:** use inline execution and record limitations if a native task agent or waited result is not supported.

## Shared projection and execution rules

1. Resolve and update canonical `agents/<role>.md` first, then synchronize all three materialized projections. Never author a role change only in a runtime directory.
2. Every canonical profile carries `name` and `description` front matter before its body: `name` matches the filename without `.md`, and `description` is the single-line discovery metadata the runtime uses to select the agent. Copy the front matter with the body so the materialized file is a valid agent definition.
3. Runtime files may add only host syntax or invocation metadata. They must preserve the complete canonical mission, procedure, evidence, authority boundaries, and escalation rules. The canonical role body and front matter must be byte-identical in every projection; host-only metadata (model, tool allowlist, or invocation syntax) is permitted only in a separate adapter metadata record or clearly delimited wrapper, and its path/fields must be recorded in the handoff. It must not widen authority or add SDD.
4. A dependent role requires a completed, gate-passed result. Background work without a final result record is not a completed handoff.
5. Use a distinct fresh agent for Verifier or QA only when both `delegate_agents` and `fresh_agent_context` are true. Otherwise record the limitation and follow project policy for non-independent validation.
6. Never claim browser, tracker, PR, worktree, isolation, or result-waiting capability unless declared in the capability manifest.
7. When projections or skills change, synchronize every maintained runtime directory and verify byte equality for materialized role and skill files.
