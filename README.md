# llmkey

A global CLI for managing LLM provider API keys. Keys are stored in `~/.llmkey` as plain shell exports and automatically available in every terminal session.

## Install

### macOS / Linux (no Node.js required)

Download the binary for your platform from [GitHub Releases](https://github.com/itsbohara/llmkey/releases/latest):

**macOS — Apple Silicon (M1/M2/M3):**
```sh
curl -L https://github.com/itsbohara/llmkey/releases/latest/download/llmkey-macos-arm64 -o llmkey
chmod +x llmkey
sudo mv llmkey /usr/local/bin/
```

**macOS — Intel:**
```sh
curl -L https://github.com/itsbohara/llmkey/releases/latest/download/llmkey-macos-x64 -o llmkey
chmod +x llmkey
sudo mv llmkey /usr/local/bin/
```

**Linux:**
```sh
curl -L https://github.com/itsbohara/llmkey/releases/latest/download/llmkey-linux-x64 -o llmkey
chmod +x llmkey
sudo mv llmkey /usr/local/bin/
```

**Windows:**

Download `llmkey-win-x64.exe` from [releases](https://github.com/itsbohara/llmkey/releases/latest), rename it to `llmkey.exe`, and add it to a folder in your `PATH`.

### Build from source

```sh
git clone https://github.com/itsbohara/llmkey.git
cd llmkey
npm install
npm run build
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

- zsh (for `llmkey init` shell integration)
- Node.js >= 16 (only if installing via npm)
