---
name: release-authoring
description: "Drafts and publishes structured, evidence-based GitHub releases with capability sections, traceability, honest validation status, install instructions, and a comparative changelog link. Use when the user explicitly requests a release or a task requires publishing one; never runs automatically after merges."
allowed-tools: Bash(git log *) Bash(git diff *) Bash(git tag *) Bash(gh release view *) Bash(gh release create *) Bash(gh pr list *) Bash(gh pr view *) Bash(gh issue view *)
metadata:
  version: 0.1.0
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Release Authoring

Use this skill to prepare and publish a professional GitHub release. A release
is always explicit: this skill runs only when the user requests a release or
the task requires one. Normal implementation and QA flows must not publish
releases automatically.

The key idea: every factual claim in the body must trace back to repository
or GitHub evidence inspected during the run. Never invent features, checks,
compatibility, or successful runtime validation.

## Inputs

Resolve all of these before drafting:

- Previous tag and next tag (e.g. `v0.2.4` → `v0.2.5`).
- Target repository and target commit for the tag.
- Merged PRs and closed issues in range, with numbers and URLs.
- Changed skills, commands, contracts, files, or other technical interfaces,
  using exact identifiers.
- Validation evidence: exact commands run and their real outputs, including
  failures, unavailable dependencies, and runtime limitations.
- Installation commands and the skill inventory delta.
- Draft or prerelease state requested.

## Workflow

1. Resolve the previous and next tags. Confirm the next tag with the user
   when it is not already fixed by the task.
2. Inspect the actual evidence before writing a single line:
   `git log <prev>..<next> --oneline`, `gh pr list --state merged`,
   `git diff <prev>...<next> --stat`, and the prior release bodies for format.
3. Classify the release as feature, patch, or another repository-supported
   type. Classification never changes the requested version.
4. Draft the structured body using `Release body template` below.
5. Show or persist the draft before publication when operating
   interactively, and wait for explicit authorization to publish.
6. Publish only after explicit authorization:
   `gh release create <next-tag> --target <sha> --title <title> --notes-file <draft> [--draft | --prerelease]`.
7. Read the release back and verify tag, target commit, title, body,
   draft/prerelease state, and the comparative changelog link. Report the
   release URL.

## Release body template

Every body includes these sections when applicable, in this order:

```markdown
<One-paragraph summary: release type and compatibility.>

## <Capability or domain> (#issue, #pr)

- **`exact-skill-or-interface`** — what changed, with exact identifiers.

## Validation

- `<exact command>` — passed/failed, with real output summarized.
- Failures, unavailable dependencies, and runtime limits stated honestly.
  A configured credential is not proof that a runtime works.

## Install

Install all skills:

```bash
npx skills add <owner>/<repo> --skill '*'
```

Install only the new skill:

```bash
npx skills add <owner>/<repo> \
  --skill <skill-name>
```

## Related changes

- Issue #N: <url>
- Pull request #N: <url>

**Full changelog**: <compare-url-prev>...<compare-url-next>
```

Distinguish documented or configured capability from runtime-verified
capability in every section. A check that was not run is reported as not
run, never as passed.

## Evidence rules

- Quote exact skill names, command names, contract paths, file paths, issue
  numbers, and PR numbers. No paraphrased identifiers.
- Link every related issue and PR by URL.
- Record validation failures with the exact error output and the reason it
  does not block (or why it does).
- GitHub's native generated notes may be used only as input to a reviewed
  draft, never as the published body.

## Do not

- Do not publish without explicit user authorization.
- Do not auto-run after a merge or at the end of a QA loop.
- Do not retrofit historical releases unless the task explicitly asks.
- Do not claim a capability was runtime-verified when only configuration
  or documentation exists.
