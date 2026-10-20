---
name: opencode-go-deepseek-flash
description: Verifies and documents the Hermes-to-OpenCode Go connection for DeepSeek Flash models. Use when the user asks to connect Hermes to OpenCode via OpenCode Go, validate DeepSeek Flash support, or needs the exact smoke-test flow for `deepseek-v4-flash` / `deepseek/deepseek-v4-flash` with Hermes.
metadata:
  version: 0.2.5
  authors:
    - JoseCortezz25
  homepage: https://github.com/JoseCortezz25/fabrica-skills
---

# OpenCode Go + DeepSeek Flash

Use this skill when you need to verify or document the Hermes ↔ OpenCode Go connection for DeepSeek Flash.

This skill captures the exact path that worked in this environment:

- `opencode-go` is the provider
- `deepseek-v4-flash` is the supported model name
- Hermes also accepts `deepseek/deepseek-v4-flash` and normalizes it to `deepseek-v4-flash`
- A quick `hermes chat -q` smoke test is the fastest way to prove the connection

## Required preflight before a headless dispatch

Before delegating work to a headless `opencode run`, run the preflight in `references/headless-delegation-preflight.md`. It verifies the OpenCode delegation channel and, when the channel is not ready, stops the dispatch and names the exact file, key, and change to fix. Do not dispatch without it.

Factory dispatches **MUST** use `--agent build`, and **MUST** pin the model with `--model`. Never substitute another configured agent for delegated work. Another agent carries its own system prompt and its own model binding, so the substitution changes both the behaviour and the model the run actually executes, and it leaves no signal in the output. The preflight's dispatch step pins the shape:

```bash
"$HOME/.opencode/bin/opencode" run \
  --agent build \
  --model "<provider>/<model>" \
  --auto \
  "<goal text>"
```

An unpinned model is not reproducible. OpenCode resolves a model as `--model` → the `model` key in the config → the last used model → an internal priority; a dispatch that sets neither the flag nor the config key falls through to the last model used in the TUI, and the run does not report which model executed. Pin it per role: a Verifier running on the writer's own model is a weaker independent check.

The preflight covers the OpenCode side of the connection; the smoke tests below cover the provider/model side.

## What to do

1. Confirm Hermes sees the provider.
   - Use `hermes doctor`.
   - Look for `OpenCode Go` in the API connectivity section.

2. Run a tiny smoke test.
   - Use `hermes chat -q` with `--provider opencode-go`.
   - Test `--model deepseek-v4-flash` first.
   - If you want to verify alias normalization, also test `--model deepseek/deepseek-v4-flash`.

3. Treat the test as successful only if the model returns a real answer.
   - A shell exit code of 0 and a text response are enough for a connection proof.
   - If Hermes says the model is unsupported, do not assume the provider is broken; the model name may simply not be enabled for that provider.

4. Document the exact command that worked.
   - Save the provider, model, and any normalization behavior you observed.
   - Prefer short, copy-pastable command lines.

## Recommended smoke test

```bash
hermes chat -q "Responde solo con PONG." --provider opencode-go --model deepseek-v4-flash -Q
```

Optional alias check:

```bash
hermes chat -q "Responde solo con PONG." --provider opencode-go --model deepseek/deepseek-v4-flash -Q
```

## What not to assume

- Do not assume every DeepSeek model is available through OpenCode Go.
- Do not assume `opencode-free` exists in the current Hermes build unless `hermes model` or the docs for this installation show it.
- Do not use a long chat prompt to validate connectivity; keep the smoke test minimal.

## Troubleshooting

If the model is rejected as unsupported:
- Re-run `hermes doctor` and confirm `OpenCode Go` is configured.
- Retry with the normalized model name `deepseek-v4-flash`.
- If you were using a different provider name, verify the provider spelling.
- If the provider still rejects the model, treat that as a provider/model compatibility issue, not a generic Hermes failure.

If you need the exact model list:
- Use `hermes model` interactively.
- That picker is not meant for non-interactive parsing.
