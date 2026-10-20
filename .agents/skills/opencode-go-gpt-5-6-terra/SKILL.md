---
name: opencode-go-gpt-5-6-terra
description: Documents and verifies the Hermes-to-OpenCode Go connection for the GPT-5.6 Terra model. Use when configuring OpenCode Go in Hermes, checking `gpt-5.6-terra` availability, or troubleshooting the provider/model connection.
metadata:
  version: 0.1.3
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# OpenCode Go + GPT-5.6 Terra

Use this skill to check whether Hermes can reach GPT-5.6 Terra through OpenCode Go.

## Exact identifiers

- Hermes provider: `opencode-go`
- Hermes model: `gpt-5.6-terra`
- OpenCode configuration identifier: `opencode-go/gpt-5.6-terra`
- OpenCode Go model endpoint: `https://opencode.ai/zen/go/v1/models`

Pass the provider and model separately to Hermes:

```bash
hermes chat -q "Reply with exactly PONG." \
  --provider opencode-go \
  --model gpt-5.6-terra \
  -Q
```

## Required preflight before a headless dispatch

Before delegating work to a headless `opencode run`, run the OpenCode headless-delegation preflight in this skill's `references/headless-delegation-preflight.md`. It verifies the OpenCode delegation channel and, when the channel is not ready, stops the dispatch and names the exact file, key, and change to fix. Do not dispatch without it.

Factory dispatches **MUST** use `--agent build`; never substitute another configured agent for delegated work. Another agent carries its own system prompt and its own model binding, so the substitution changes both the behaviour and the model the run actually executes, and it leaves no signal in the output. The dispatch shape is:

```bash
"$HOME/.opencode/bin/opencode" run --agent build --auto "<goal text>"
```

The preflight covers the OpenCode channel; the verification sequence below covers provider/model availability.

## Verification sequence

1. Check the local Hermes installation and provider configuration:

   ```bash
   hermes doctor
   ```

   Confirm that the API connectivity section reports `OpenCode Go` as configured or healthy. A configured API key proves provider configuration, not model availability.

2. Run the minimal smoke test:

   ```bash
   hermes chat -q "Reply with exactly PONG." \
     --provider opencode-go \
     --model gpt-5.6-terra \
     -Q
   ```

   Treat the connection as verified only when the command exits successfully and returns a real model response. Record the exit status and response; do not infer success from configuration alone.

3. Check the provider's current catalogue when availability is unclear:

   ```bash
   curl -fsSL https://opencode.ai/zen/go/v1/models
   ```

## Availability caveat

GPT-5.6 Terra is the requested model identifier, but OpenCode Go availability is catalogue- and account-dependent. The current OpenCode Go documentation and public model endpoint may not list Terra even though other OpenCode endpoints list it. In that case, do not claim that Hermes can use the model.

In the environment where this skill was prepared:

- `hermes doctor` reported `OpenCode Go (key configured)`.
- The smoke test returned `HTTP 400: Upstream request failed: Model is unavailable.` with exit status `1`.
- Therefore, GPT-5.6 Terra was **not runtime-verified** here.

Do not replace this result with a claim that the model works. Retry after the model appears in the OpenCode Go catalogue or OpenCode confirms account access.

## Alias behavior

No alias or normalization behavior is documented for this model. Use the exact model string `gpt-5.6-terra`. Do not assume that `gpt-5.6-terra` or `opencode-go/gpt-5.6-terra` is interchangeable in every Hermes or OpenCode configuration; verify any alternate form with a successful smoke test before documenting it.

## Troubleshooting

- **`OpenCode Go` is missing from `hermes doctor`:** configure `OPENCODE_GO_API_KEY` in the Hermes environment, then rerun `hermes doctor`.
- **`Model is unavailable` / HTTP 400:** confirm the exact model string, query the OpenCode Go `/models` endpoint, and verify that the model is enabled for the account. This is a provider catalogue or entitlement issue unless another model also fails.
- **Provider works but Terra fails:** test a model currently listed by OpenCode Go to separate provider authentication from Terra availability. Do not silently substitute another model in documentation.
- **Authentication errors:** refresh or replace the OpenCode Go API key, then rerun `hermes doctor`. Never paste credentials into shell history or commit them.
- **Stale Hermes configuration:** restart the Hermes process after changing configuration and rerun both checks.
- **Alias questions:** test one candidate at a time and record the exact command and response. Until verified, use only `--model gpt-5.6-terra`.
