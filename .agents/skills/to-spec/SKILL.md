---
name: to-spec
description: "Turn the Fabrica ideation package into a spec and publish it to the project issue tracker: no interview, just synthesis of what's already documented. Use after /setup-ideation and grill-me, and before to-tickets."
metadata:
  version: 0.3.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/setup-ideation`.

## Preconditions (Fabrica)

- The **ideation package** in `docs/ideation/` must exist: at minimum `README.md`, `vision.md`, and `requirements.md`, following the shapes in `skills/workflow/setup-ideation/references/ideation-package.md`.
- It must contain the output of `grill-me`. **`to-spec` cannot run without grill-me.**
- `docs/prototypes/prototype.md` is **optional**: read it when present, but a missing prototype never blocks the spec.
- The ticket provider (`github` or `local`) must already be recorded in `docs/ideation/README.md`. If it is missing, ask one question to choose it, then continue.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching. Read the ideation package (`vision.md`, `requirements.md`, `use-cases.md`, `pendings.md`, `grill-log.md`) and `docs/prototypes/prototype.md` when it exists.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using the template below, then publish it to the project issue tracker. Apply the `needs-triage` triage label - the spec is a parent reference, not a work item, so it must not be a pickup state. Do not apply `ready-for-agent`; that label belongs to the tickets `to-tickets` creates.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>

## Fabrica alignment

- Every requirement in the spec must trace back to a `REQ-*` in the ideation package. Anything the package left open stays explicitly open in the spec (referencing its `P-*` pending); do not silently resolve product decisions.
- Declare the **Validation type** (`functional-only` | `scoped-visual` | `visual+functional`) in the spec so `to-tickets` can carry it into each ticket. It is binding for QA.
- The spec is a parent reference for `to-tickets`, which owns slicing it into tickets and applying Fabrica labels. Do not create the work tickets here.
- With the `local` provider, write the spec to `.scratch/<feature-slug>/spec.md`; `to-tickets` writes the tickets under `.scratch/<feature-slug>/issues/`.
- If the ideation needs to change, go back to `grill-me`; do not patch the spec around a missing decision.
