---
name: grill-with-docs
description: "A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go. Fabrica ideation variant of grill-me: use when the project also needs CONTEXT.md and ADRs."
metadata:
  version: 0.3.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

Call the Skill tool twice, for "grilling" and "domain-modeling".

## Fabrica ideation alignment

Use this instead of `grill-me` when the ideation should also build the project's domain model. `grilling` persists the interview to `docs/ideation/` (and parks open questions in `docs/ideation/pendings.md`); `domain-modeling` creates and sharpens `CONTEXT.md` and `docs/adr/` as decisions land.

Inside `setup-ideation` it is an alternative to the mandatory `grill-me` round, not an addition: run one or the other.
