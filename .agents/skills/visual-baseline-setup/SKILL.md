---
name: visual-baseline-setup
description: Creates or defines a visual baseline for an application page, component, or scoped UI area. Use when the user wants to start visual QA, choose whether the baseline should cover the whole page or a narrower scope, decide viewport vs full-page capture, or define desktop/mobile/tablet baselines before comparisons.
metadata:
  version: 0.2.2
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# Visual Baseline Setup

Use this skill when a team needs a stable visual baseline before automated comparison starts.

## Goal
Create a baseline that matches the intended scope of the UI, not an accidental screenshot of everything on the page.

## Bundled resources
Read `references/baseline-contract.md` before capture.
Use `scripts/create-visual-baseline.ts` to generate baselines instead of inventing a new capture flow. The script writes `<out>/<scope>/<viewport>/<viewport>.png` plus a per-viewport `manifest.json` and a per-scope manifest — QA consumes them instead of guessing viewports.

## First, ask the right questions
Before creating anything, ask the user enough to avoid a bad baseline:
- What exactly should be included: whole page, a section, a component, or a specific route/state?
- Should the capture be full-page or viewport-only?
- What viewport sizes should be created by default?
- Do they want desktop only first, or desktop + mobile + tablet together?
- Are there dynamic areas that should be masked or excluded?
- Is the baseline for one state, or for multiple UI states?

## Default decision order
If the user does not specify, decide in this order:
1. Prefer the narrowest stable scope that still represents the feature.
2. Prefer viewport captures for component-level or state-specific work.
3. Use full-page only when the user explicitly wants the whole page or when the page is intentionally a single long-form surface — never for slices that defer sections (those get a `clip` baseline on the shipped scope instead).
4. Create desktop first, then mobile and tablet if the flow needs responsive coverage.
5. Capture at the project-standard viewports (desktop 1440x900, tablet 768x1024, mobile 390x844) unless the design baseline dictates otherwise.

## What to produce
The skill should drive the agent to:
- confirm scope with the user
- choose the baseline capture strategy
- define the viewport sizes to create
- run the companion baseline script or workflow
- save the baseline under `visual-baseline/<scope>/<viewport>/` (tracked in git, so the PR branch carries it)
- write the baseline manifest (viewports, capture mode, masks, environment) beside the images plus a per-scope manifest
- report what was captured and why

## Output expectation
Return a short result that states:
- scope chosen
- capture mode chosen (`viewport`, `full-page`, or `clip` + selector)
- viewport sizes used
- any excluded/masked content
- where the baseline was saved
- manifest path

## Important principle
A baseline is a contract. If the scope is wrong, every later comparison becomes noisy. Spend the questions here, not in every downstream comparison.
