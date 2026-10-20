# GitHub Bootstrap

How to publish tickets to GitHub when the project is not ready. Run this only with the person's explicit authorization, and go **one step at a time**, explaining each step before doing it.

## 1. Check the current state

```bash
git status
git remote -v
gh auth status
```

- Git present with a remote → go to step 4.
- Git present, no remote → step 3.
- No Git repository → step 2.

## 2. Initialize Git (only with authorization)

If there is no repository, explain that tickets live in GitHub Issues and GitHub needs a repository to host them. Then, with approval:

```bash
git init
```

Create or confirm a `.gitignore` for the project's runtime, then make the first commit with the project's conventions (see the repo's `AGENTS.md`). Never commit secrets; check for `.env` and credentials first.

## 3. Attach an origin remote

Ask the person for one of:

- An existing GitHub repository URL (`https://github.com/<owner>/<repo>.git`) to attach with `git remote add origin <url>`.
- Permission to create a new repository with the GitHub CLI:

```bash
gh repo create <owner>/<repo> --source . --remote origin --private
```

Choose `--public` or `--private` with the person, never by default.

Push only when the person confirms: `git push -u origin <branch>`.

## 4. Validate the Fabrica labels

```bash
gh label list
gh label create ready-for-agent --description "Ready for an implementation agent" --color 0E8A16
gh label create ready-for-review --description "Waiting for the Verifier" --color 1D76DB
gh label create ready-for-qa --description "Waiting for QA" --color 5319E7
gh label create ready-for-human --description "Waiting for human review or merge" --color FBCA04
gh label create needs-triage --description "Not yet evaluated" --color D4C5F9
gh label create needs-info --description "Waiting on more information" --color FEF2C0
gh label create bug --description "Something is broken" --color D73A4A
gh label create blocked --description "Cannot proceed" --color B60205
gh label create wontfix --description "Will not be actioned" --color FFFFFF
```

Skip any label that already exists; never overwrite an existing label's color or description without asking.

## 5. Publish

Return to `to-tickets` step 4 and create issues in dependency order with `gh issue create`, applying `ready-for-agent`. Use native blocking links where available; otherwise put "Blocked by" in the body.

## Rules

- Never run `git init`, `git remote add`, `gh repo create`, or `git push` without explicit authorization.
- Never force-push, rewrite history, or commit over uncommitted changes.
- Never create a public repository by default.
- Explain each command before running it; the person may prefer to run it themselves.
