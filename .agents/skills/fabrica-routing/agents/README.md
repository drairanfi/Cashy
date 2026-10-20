# Fabrica Agent Profiles

The canonical source of truth for Fabrica's dedicated agent roles is the repository `agents/` directory; the `fabrica-routing` skill ships a byte-identical copy for standalone installation. Each profile defines a stable operational contract independent of any specific agent CLI.

Runtime-specific agent definitions are projections of these contracts. Do not edit `.codex/agents/`, `.claude/agents/`, OpenCode configuration, or any other runtime directory as the primary definition. Update the canonical profile in the repository `agents/` directory first, then generate or maintain its runtime projection through the adapter contract.

## Profiles

- `orchestrator.md` — selects and dispatches the smallest valid route.
- **Explorer:** optional; dispatch only when the handoff identifies a bounded uncertainty whose answer changes the route or scope. Well-scoped tasks skip Explorer.
- `builder.md` — implements scoped work and runs self-checks.
- `verifier.md` — independently checks the change against its stated objective.
- `qa.md` — validates user-visible functional and visual behavior.
- `recovery.md` — fixes an accepted QA defect or merge conflict on the existing branch.

These profiles define agent topology only. They do not introduce an SDD lifecycle, planning artifacts, or a mandatory planning phase.

## Profile format

Every canonical profile starts with YAML front matter, followed by the role body:

```yaml
---
name: <role>
description: "<what the role settles, and when the orchestrator dispatches it>"
---

# <Role>

## Mission
...
```

- `name` MUST match the profile filename without `.md`, so a materialized copy is discoverable by filename and by declared name.
- `description` MUST be a non-empty single-line string naming the role's outcome and its trigger. Runtimes use it to discover and select the agent, so it is never optional and never a summary of the whole file.
- The front matter is the only part of a profile that the runtime reads before the body, so a profile without it is not a valid agent definition even when the body is complete.

## Runtime projections

`agents/` is the repository canonical source. The `agents/` directory inside the standalone `fabrica-routing` skill is a checked-in, byte-identical projection so the skill works when installed without the repository root. Runtime folders `.agents/`, `.codex/`, and `.claude/` are generated materialized copies. Update the canonical source first, regenerate both projections, and record any separate host-only adapter metadata; never silently diverge role content.

The repository root is the canonical source; the packaged directory is maintained by copying the six role profiles and this README from it. Standalone consumers must resolve `agents/<role>.md` relative to the installed `fabrica-routing` skill directory, never relative to a missing repository root.

After changing a canonical profile or skill, synchronize every maintained runtime projection from the repository root:

```bash
for runtime in .agents .codex .claude; do
  mkdir -p "$runtime/skills" "$runtime/agents"
  rsync -a --delete skills/ "$runtime/skills/"
  rsync -a --delete --exclude README.md agents/ "$runtime/agents/"
  cp agents/README.md "$runtime/agents/README.md"
done
```

The command intentionally materializes the full skill catalog and complete role profiles in every runtime folder. The role and skill content must be byte-identical to canonical files; host-only metadata is kept in a separate adapter metadata record and recorded in the handoff rather than embedded in the copied role content.
