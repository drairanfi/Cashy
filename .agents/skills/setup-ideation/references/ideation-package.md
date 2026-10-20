# Ideation Package Contract

The ideation phase produces a versioned, human-reviewed decision package. It is the single source of truth that `to-spec` and `to-tickets` read. Specialized skills enrich it; they never invent a parallel contract.

## Location

```text
docs/ideation/
├── README.md        # index: idea summary, owner, provider, status, links
├── vision.md        # problem, actors, users, measurable outcome
├── requirements.md  # REQ-*, functional and non-functional, acceptance criteria
├── use-cases.md     # UC-* with scenarios (optional for small changes)
├── pendings.md      # open questions that cannot be answered yet
└── grill-log.md     # round-by-round question/answer/decision record

docs/prototypes/     # only when the product has a graphical interface
├── *.html           # low-fidelity HTML/CSS/JS wireframes
└── prototype.md     # what was prototyped and the decisions it settled
```

Projects that already have ideation (human-made, legacy, or migrated) are accepted as-is. Do not rewrite their artifacts; add only what is missing and mark unknown fields `needs-info`.

## README.md

Minimum fields:

- **Idea**: one-paragraph summary in the person's own words.
- **Owner**: who is accountable for the decisions.
- **Provider**: `github` or `local`, chosen before `to-spec`.
- **Status**: `in-progress` | `ready-for-spec` | `ready-for-tickets`.
- **Prototype**: `docs/prototypes/` link, or `declined` / `not-applicable`.

## vision.md

- Problem being solved, from the user's perspective.
- Actors and users, with their needs.
- Measurable outcome: how we know it worked.
- Non-goals: what this is explicitly not.

## requirements.md

One block per requirement:

```markdown
### REQ-001 — <short title>

- **Statement**: what must be true.
- **Actor**: who cares.
- **Priority**: must | should | could.
- **Acceptance criteria**: verifiable checks.
- **Edge cases**: the awkward cases that must not break it.
- **Source**: grill round id, prototype section, or `legacy`.
- **Status**: confirmed | needs-info.
```

Requirements must be deep enough to be testable: functional behavior, limits, permissions, empty/loading/error states, and edge cases. Avoid absurd detail and details that cannot be answered yet; those go to `pendings.md`.

## use-cases.md

One block per use case: preconditions, trigger, postconditions, happy path, alternative and error scenarios (Given/When/Then). Keep it lean; skip it for small changes.

## pendings.md

The explicit backlog of open decisions. Each entry:

```markdown
### P-001 — <question>

- **Why it is open**: missing information, dependency, or decision not yet made.
- **Blocks**: which requirement or flow it affects, or `none`.
- **Who can answer**: owner or role.
- **Status**: open | answered (link the answer above, never delete the question).
```

A pending never blocks `to-spec` on its own unless it hides the core problem, the actors, or the primary flow. Answered questions stay in the file so the history is not lost.

## grill-log.md

The durable record of discovery. One entry per round:

- Round number, question asked, answer (verbatim or close), inference proposed, person's confirmation, and a decision id (`D-*`) when a decision lands.

## Gate

`to-spec` may start only when:

- `grill-me` reached an empty frontier.
- `README.md`, `vision.md`, and `requirements.md` exist with the fields above.
- `pendings.md` exists (it may say "no open questions").
- Provider is recorded.

Prototypes are **not** part of the gate.
