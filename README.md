# llmkey

A global CLI for managing LLM provider API keys. Keys are stored in `~/.llmkey` as plain shell exports and automatically available in every terminal session.

## Install

```sh
npm install -g .
```

## Setup

```sh
llmkey init
```

Adds `[ -f ~/.llmkey ] && source ~/.llmkey` to `~/.zshrc`. Restart your terminal or run `source ~/.zshrc` after.

## Commands

```sh
llmkey set <provider>       # Add or update a key (hidden prompt)
llmkey list                 # Show all keys with masked values
llmkey remove <provider>    # Remove a key
```

## Providers

| Name | Env var |
|---|---|
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY` |
| `fireworks` | `FIREWORKS_API_KEY` |
| `nvidia` | `NVIDIA_API_KEY` |

Unknown names are used as-is: `llmkey set MY_CUSTOM_VAR` sets `$MY_CUSTOM_VAR`.

## Storage

Keys are stored in `~/.llmkey` (chmod 600) as plain shell exports:

```sh
export OPENAI_API_KEY='sk-proj-...'
export ANTHROPIC_API_KEY='sk-ant-...'
```

## Requirements

- Node.js >= 16
- zsh
