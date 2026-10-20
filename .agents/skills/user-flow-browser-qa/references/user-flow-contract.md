# User flow QA contract

## Scope first
Define the exact user flow before touching the browser. A flow without a start, a goal, and a failure mode is not QA yet.

## Required inputs
Capture these before validating:
- use case
- starting route or screen
- user role / auth state
- device target
- fixtures or data prerequisites
- happy path
- critical paths
- expected failure behavior

## Selector policy
Use stable selectors in this order:
1. `data-testid`
2. `id`
3. stable classes
4. text only as a fallback

If a selector is not unique, tighten it. Do not continue with an ambiguous locator.

## What to validate
Always validate both:
- the happy path the user expects
- the critical paths that reveal the flow is broken

## Test placement policy
Follow the repository rules first.
If no rules or harness exist, place the tests under `_tests_/` in a folder named after the validated flow.
