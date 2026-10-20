# Visual baseline contract

This skill creates the source of truth for later visual comparisons.

## Default scope order
1. Use the narrowest stable scope that still represents the feature.
2. Prefer viewport captures for component or state-specific work.
3. Use full-page only when the user explicitly wants the whole page or the page is intentionally a long-form surface.

## Default viewport set
If the user does not specify, create these captures by default (project standard):
- desktop: 1440x900
- tablet: 768x1024
- mobile: 390x844

`evaluate-visual-diff.ts` renders at the exact baseline contract size — the per-viewport manifest when present, otherwise the baseline PNG dimensions — so a baseline captured with these defaults compares without `dimension-mismatch`. A viewport that does not match the baseline file fails loudly instead of silently diffing.

## Capture mode
Every baseline declares one capture mode, stored in the manifest:
- `viewport` — capture the viewport box only. Default for component-level or state-specific work.
- `full-page` — capture the whole page. Reserved for structure-complete pages; do not use it for slices that defer sections.
- `clip` — capture a single element via `--selector=<css>` (stored as `selector` in the manifest). Use it for slices that defer sections: the deferred areas stay out of the baseline instead of failing the diff later.

## Storage convention (canonical)

All baselines live under a single repo-root directory so a QA agent on an
isolated PR worktree can find them without extra downloads:

- root: `<repo-root>/visual-baseline/`
- per scope: `<repo-root>/visual-baseline/<scope>/`
- per viewport: `<repo-root>/visual-baseline/<scope>/<viewport>/<viewport>.png`
- per-viewport manifest: `<repo-root>/visual-baseline/<scope>/<viewport>/manifest.json`
- per-scope manifest: `<repo-root>/visual-baseline/<scope>/manifest.json`

`create-visual-baseline.ts --out` defaults to `./visual-baseline` and
`--scope` defaults to `page`. The scope segment is always part of the path:
`<out>/<scope>/<viewport>/<viewport>.png`. Scope names are kebab-case
(route or feature slice, e.g. `home-hero`, `checkout-form`).

## Committed vs. generated

- `visual-baseline/` is **tracked in git**. The PR branch carries its own
  baselines, which is what lets `visual-qa-evaluation` run on the PR worktree.
- `visual-eval/` (the output of `evaluate-visual-diff.ts`) is **never
  committed**. It is ephemeral QA output; attach the PNGs to the `QA says:`
  comment instead.

## Manifest
`create-visual-baseline.ts` writes a manifest beside the screenshots so QA never guesses viewports:
- per viewport: `<out>/<scope>/<viewport>/manifest.json` with `version`, `url`, `scope`, `capture` (`viewport` | `full-page` | `clip`), `selector` (clip target or `null`), `viewport` (`name` + exact `width`/`height`), `engine` (browser name + version), `deviceScaleFactor`, `masks`, `readySelector`, `screenshot` path, `createdAt`.
- per scope: `<out>/<scope>/manifest.json` with `version`, `url`, `scope`, and the per-viewport entries keyed by viewport name.

`evaluate-visual-diff.ts` consumes the per-viewport manifest to render at the exact baseline contract size (falling back to the baseline PNG dimensions, then to the project-standard defaults, when no manifest exists).

## Baseline naming
Baselines are addressed by scope + viewport, not by filename guessing:

- `<out>/<scope>/<viewport>/<viewport>.png` (e.g. `visual-baseline/home-hero/desktop/desktop.png`)
- keep the same scope name in every related file
- store a per-viewport manifest beside each screenshot plus a per-scope manifest at `<out>/<scope>/manifest.json`

## Suggested masks
Mask or exclude dynamic regions before saving baselines:
- timestamps
- avatars
- rotating banners
- live counts
- randomized recommendations

## When to ask the user
Ask before capture if any of these are unclear:
- page vs section vs component
- full-page vs viewport
- which viewport set to use
- whether mobile/tablet are required
- which regions should be masked
- whether the baseline is for one state or several states

## Baseline rule
A baseline is a contract. If the scope is wrong, every future diff becomes noise.
