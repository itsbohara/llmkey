# llmkey — Design Spec

**Date:** 2026-04-19  
**Status:** Approved  

## Overview

`llmkey` is a global Node.js CLI tool for managing LLM provider API keys. It stores keys in `~/.llmkey` as plain shell exports and loads them into every terminal session via a one-time `~/.zshrc` integration.

## Project Location

`/Users/mahesh/itsbohara/lab/llmkey`

## Goals

- Single place to set/update/remove LLM API keys
- Keys available as standard env vars (`$OPENAI_API_KEY`, etc.) in every terminal
- No hardcoded keys in project files
- Simple, transparent storage (no magic, human-readable file)

## Commands

| Command | Description |
|---|---|
| `llmkey init` | Appends `[ -f ~/.llmkey ] && source ~/.llmkey` to `~/.zshrc` (once) |
| `llmkey set <provider>` | Prompts for key (hidden input), writes to `~/.llmkey` |
| `llmkey list` | Shows all providers with masked keys (`sk-****1234`) |
| `llmkey remove <provider>` | Removes a provider's key from `~/.llmkey` |

## Known Providers

| Provider name | Env var |
|---|---|
| `openai` | `OPENAI_API_KEY` |
| `fireworks` | `FIREWORKS_API_KEY` |
| `nvidia` | `NVIDIA_API_KEY` |

Custom env var names are supported: `llmkey set MY_CUSTOM_VAR` uses the argument directly as the env var name (no transformation). The user is prompted for the key value as usual.

## Architecture

```
llmkey/
├── bin/
│   └── llmkey.js        # CLI entry point (#!/usr/bin/env node)
├── src/
│   ├── store.js         # Read/write ~/.llmkey
│   ├── providers.js     # Known provider → env var mappings
│   └── commands/
│       ├── set.js
│       ├── list.js
│       ├── remove.js
│       └── init.js
├── package.json
```

**Dependencies:** `commander`, `inquirer` (use v8.x — CommonJS, no `"type": "module"` required, simpler setup)

## Storage Format

`~/.llmkey` — plain shell export lines:

```sh
export OPENAI_API_KEY=sk-proj-abc123...
export FIREWORKS_API_KEY=fw-abc123...
export NVIDIA_API_KEY=nvapi-abc123...
```

- Created with `chmod 600` on first write; `chmod 600` is re-applied on every write (including updates)
- Full file rewrite on every set/remove (no partial line editing); entry order from the previous file is preserved; direct overwrite is acceptable for v1 (no atomic rename required)
- Key values are stored in single quotes to handle values containing `=` or special shell characters: `export OPENAI_API_KEY='sk-proj-...'`
- Malformed lines (not matching `export KEY='value'`) are silently skipped during parsing

## Key Masking (`list` command)

Show last 4 characters of the key value, mask everything else as `****`. Example: a key `sk-proj-abcdefgh1234` displays as `****1234`. Applied uniformly regardless of provider prefix. Keys shorter than 4 characters display as `****`.

**Output format:** one line per key, two columns: env var name and masked value. Example:
```
OPENAI_API_KEY       ****1234
FIREWORKS_API_KEY    ****abcd
MY_CUSTOM_VAR        ****xyz9
```
Custom vars (not in the known provider list) are displayed by their raw env var name. No `get`/`show` command in v1 — deliberate omission to keep scope minimal.

**Empty store:** if `~/.llmkey` is missing or has no keys, `list` prints: `No keys configured. Run llmkey set <provider> to add one.`

## Provider Resolution (shared by `set` and `remove`)

1. If the argument matches a known provider name (e.g., `openai`) → use its mapped env var name (`OPENAI_API_KEY`)
2. Otherwise → use the argument directly as the env var name

Both `set` and `remove` use this same resolution rule.

## `~/.zshrc` Integration

`llmkey init` appends exactly one line:

```sh
[ -f ~/.llmkey ] && source ~/.llmkey
```

Before appending, checks whether the exact string `[ -f ~/.llmkey ] && source ~/.llmkey` is already present in `~/.zshrc` (exact-match only; whitespace variants are out of scope for v1). If found, skips and notifies the user. Shell detection: check `$SHELL` env var — if it does not contain `zsh`, warn the user that only zsh is supported and print the source line for manual addition. On success, print: `✓ Added to ~/.zshrc. Restart your terminal or run: source ~/.zshrc`

## Error Handling

- `set` on existing key → silently overwrite (no confirmation prompt); the new value replaces the old one
- Unknown provider on `set` (argument not in known provider list) → only warn if the argument is lowercase (looks like an attempted provider name); UPPER_CASE args are treated as intentional custom env var names without warning
- `~/.llmkey` missing → treat as empty, create on first `set`
- `~/.zshrc` missing during `init` → warn, print the source line for manual addition
- Empty key input → re-prompt indefinitely until a non-empty value is entered or user hits Ctrl+C
- `remove` on a provider not in `~/.llmkey` → print "No key found for <provider>", exit 0
- Exit codes: 0 for all successful operations and expected non-errors (e.g., key not found on remove); 1 for unexpected errors (file permission denied, unhandled exceptions)
- `--help` → commander defaults; `--version` → sourced from `package.json` version field

## Installation

```sh
cd /Users/mahesh/itsbohara/lab/llmkey
npm install -g .
```

## Testing

Manual verification by user after build. No automated test framework in v1.
