# llmkey Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `llmkey`, a global Node.js CLI that manages LLM provider API keys in `~/.llmkey` and sources them automatically in every terminal session.

**Architecture:** `commander` wires up four subcommands (`init`, `set`, `list`, `remove`). `store.js` owns all reads/writes of `~/.llmkey`. `providers.js` owns the known-provider → env-var mapping used by both `set` and `remove`. No test framework — manual verification at each step.

**Tech Stack:** Node.js (CommonJS), `commander@^11`, `inquirer@^8`

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Project config, bin entry, deps |
| `bin/llmkey.js` | CLI entry point, commander wiring |
| `src/providers.js` | Known provider → env var map + resolution logic |
| `src/store.js` | Read/write `~/.llmkey`, chmod, parse/serialize |
| `src/commands/init.js` | `llmkey init` — zshrc integration |
| `src/commands/set.js` | `llmkey set <provider>` — prompt + save key |
| `src/commands/list.js` | `llmkey list` — masked output |
| `src/commands/remove.js` | `llmkey remove <provider>` — delete key |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `bin/llmkey.js` (stub)
- Create: `src/providers.js` (stub)
- Create: `src/store.js` (stub)
- Create: `src/commands/init.js` (stub)
- Create: `src/commands/set.js` (stub)
- Create: `src/commands/list.js` (stub)
- Create: `src/commands/remove.js` (stub)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "llmkey",
  "version": "1.0.0",
  "description": "Manage LLM provider API keys as system environment variables",
  "bin": {
    "llmkey": "./bin/llmkey.js"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^8.2.6"
  },
  "engines": {
    "node": ">=16"
  }
}
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p bin src/commands
```

- [ ] **Step 3: Install dependencies**

```bash
cd /Users/mahesh/itsbohara/lab/llmkey
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated. No errors.

- [ ] **Step 4: Create stub entry point `bin/llmkey.js`**

```js
#!/usr/bin/env node
console.log('llmkey ok');
```

- [ ] **Step 5: Make it executable and verify**

```bash
chmod +x bin/llmkey.js
node bin/llmkey.js
```

Expected output: `llmkey ok`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json bin/ src/
git commit -m "chore: project scaffold with deps"
```

---

## Task 2: `src/providers.js`

**Files:**
- Create: `src/providers.js`

- [ ] **Step 1: Write `src/providers.js`**

```js
const PROVIDERS = {
  openai: 'OPENAI_API_KEY',
  fireworks: 'FIREWORKS_API_KEY',
  nvidia: 'NVIDIA_API_KEY',
};

function resolveEnvVar(arg) {
  return PROVIDERS[arg] || arg;
}

function isKnownProvider(arg) {
  return arg in PROVIDERS;
}

module.exports = { PROVIDERS, resolveEnvVar, isKnownProvider };
```

- [ ] **Step 2: Verify manually**

```bash
node -e "
const { resolveEnvVar, isKnownProvider } = require('./src/providers');
console.log(resolveEnvVar('openai'));        // OPENAI_API_KEY
console.log(resolveEnvVar('fireworks'));     // FIREWORKS_API_KEY
console.log(resolveEnvVar('MY_CUSTOM'));     // MY_CUSTOM
console.log(isKnownProvider('openai'));      // true
console.log(isKnownProvider('MY_CUSTOM'));   // false
"
```

Expected: all five lines match the comments above.

- [ ] **Step 3: Commit**

```bash
git add src/providers.js
git commit -m "feat: add provider resolution"
```

---

## Task 3: `src/store.js`

**Files:**
- Create: `src/store.js`

- [ ] **Step 1: Write `src/store.js`**

```js
const fs = require('fs');
const os = require('os');
const path = require('path');

const LLMKEY_PATH = path.join(os.homedir(), '.llmkey');
const LINE_REGEX = /^export ([A-Z0-9_]+)='([^']*)'$/;

function read() {
  if (!fs.existsSync(LLMKEY_PATH)) return {};
  const lines = fs.readFileSync(LLMKEY_PATH, 'utf8').split('\n');
  const result = {};
  for (const line of lines) {
    const match = line.match(LINE_REGEX);
    if (match) result[match[1]] = match[2];
  }
  return result;
}

function write(keys) {
  const lines = Object.entries(keys).map(([k, v]) => `export ${k}='${v}'`);
  const content = lines.length ? lines.join('\n') + '\n' : '';
  fs.writeFileSync(LLMKEY_PATH, content);
  fs.chmodSync(LLMKEY_PATH, 0o600);
}

module.exports = { read, write, LLMKEY_PATH };
```

- [ ] **Step 2: Verify manually**

```bash
node -e "
const { read, write, LLMKEY_PATH } = require('./src/store');
write({ OPENAI_API_KEY: 'test-key-1234', MY_VAR: 'abc' });
console.log(read());
const fs = require('fs');
console.log(fs.statSync(LLMKEY_PATH).mode.toString(8)); // should end in 600
"
```

Expected:
```
{ OPENAI_API_KEY: 'test-key-1234', MY_VAR: 'abc' }
100600
```

- [ ] **Step 3: Inspect the written file**

```bash
cat ~/.llmkey
```

Expected:
```
export OPENAI_API_KEY='test-key-1234'
export MY_VAR='abc'
```

- [ ] **Step 4: Clean up test file**

```bash
rm ~/.llmkey
```

- [ ] **Step 5: Commit**

```bash
git add src/store.js
git commit -m "feat: add ~/.llmkey store (read/write)"
```

---

## Task 4: `src/commands/init.js`

**Files:**
- Create: `src/commands/init.js`

- [ ] **Step 1: Write `src/commands/init.js`**

```js
const fs = require('fs');
const os = require('os');
const path = require('path');

const ZSHRC_PATH = path.join(os.homedir(), '.zshrc');
const SOURCE_LINE = '[ -f ~/.llmkey ] && source ~/.llmkey';

function init() {
  const shell = process.env.SHELL || '';
  if (!shell.includes('zsh')) {
    console.warn('Warning: Only zsh is supported in v1.');
    console.log(`Add this line to your shell config manually:\n  ${SOURCE_LINE}`);
    return;
  }

  if (!fs.existsSync(ZSHRC_PATH)) {
    console.warn('~/.zshrc not found.');
    console.log(`Add this line to your shell config manually:\n  ${SOURCE_LINE}`);
    return;
  }

  const content = fs.readFileSync(ZSHRC_PATH, 'utf8');
  if (content.includes(SOURCE_LINE)) {
    console.log('Already configured. No changes made.');
    return;
  }

  fs.appendFileSync(ZSHRC_PATH, `\n${SOURCE_LINE}\n`);
  console.log('✓ Added to ~/.zshrc. Restart your terminal or run: source ~/.zshrc');
}

module.exports = { init };
```

- [ ] **Step 2: Verify idempotency (do not run on real ~/.zshrc yet — use a temp file)**

```bash
node -e "
const fs = require('fs');
const os = require('os');
// Patch ZSHRC path to a temp file for testing
const tmp = '/tmp/test_zshrc';
fs.writeFileSync(tmp, '# existing content\n');
// Monkey-patch the module's path
const m = require('./src/commands/init');
// Can't easily patch — just run and inspect ~/.zshrc after
"
```

Note: Full init verification happens in Task 8 (end-to-end) after the CLI is wired. Skip deep testing here.

- [ ] **Step 3: Commit**

```bash
git add src/commands/init.js
git commit -m "feat: add init command"
```

---

## Task 5: `src/commands/set.js`

**Files:**
- Create: `src/commands/set.js`

- [ ] **Step 1: Write `src/commands/set.js`**

```js
const inquirer = require('inquirer');
const { resolveEnvVar, isKnownProvider } = require('../providers');
const { read, write } = require('../store');

async function set(providerArg) {
  const envVar = resolveEnvVar(providerArg);

  if (!isKnownProvider(providerArg) && providerArg === providerArg.toLowerCase()) {
    console.warn(`Warning: "${providerArg}" is not a known provider. Using "${envVar}" as env var name.`);
  }

  let key = '';
  while (!key) {
    const { value } = await inquirer.prompt([{
      type: 'password',
      name: 'value',
      message: `Enter key for ${envVar}:`,
      mask: '*',
    }]);
    key = (value || '').trim();
    if (!key) console.log('Key cannot be empty. Try again or press Ctrl+C to cancel.');
  }

  const keys = read();
  keys[envVar] = key;
  write(keys);
  console.log(`✓ ${envVar} saved.`);
}

module.exports = { set };
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/set.js
git commit -m "feat: add set command"
```

---

## Task 6: `src/commands/list.js`

**Files:**
- Create: `src/commands/list.js`

- [ ] **Step 1: Write `src/commands/list.js`**

```js
const { read } = require('../store');

function maskKey(value) {
  if (!value || value.length <= 4) return '****';
  return '****' + value.slice(-4);
}

function list() {
  const keys = read();
  const entries = Object.entries(keys);

  if (entries.length === 0) {
    console.log('No keys configured. Run llmkey set <provider> to add one.');
    return;
  }

  const maxLen = Math.max(...entries.map(([k]) => k.length));
  for (const [envVar, value] of entries) {
    console.log(`${envVar.padEnd(maxLen + 4)}${maskKey(value)}`);
  }
}

module.exports = { list };
```

- [ ] **Step 2: Verify manually**

```bash
node -e "
const { write } = require('./src/store');
write({ OPENAI_API_KEY: 'sk-proj-abcdefgh1234', FIREWORKS_API_KEY: 'fw-xyz9' });
require('./src/commands/list').list();
"
```

Expected output:
```
OPENAI_API_KEY       ****1234
FIREWORKS_API_KEY    ****xyz9
```

- [ ] **Step 3: Verify empty store**

```bash
node -e "
const fs = require('fs'), os = require('os'), path = require('path');
const p = path.join(os.homedir(), '.llmkey');
if (fs.existsSync(p)) fs.unlinkSync(p);
require('./src/commands/list').list();
"
```

Expected: `No keys configured. Run llmkey set <provider> to add one.`

- [ ] **Step 4: Clean up**

```bash
rm -f ~/.llmkey
```

- [ ] **Step 5: Commit**

```bash
git add src/commands/list.js
git commit -m "feat: add list command with masked output"
```

---

## Task 7: `src/commands/remove.js`

**Files:**
- Create: `src/commands/remove.js`

- [ ] **Step 1: Write `src/commands/remove.js`**

```js
const { resolveEnvVar } = require('../providers');
const { read, write } = require('../store');

function remove(providerArg) {
  const envVar = resolveEnvVar(providerArg);
  const keys = read();

  if (!(envVar in keys)) {
    console.log(`No key found for ${envVar}`);
    return;
  }

  delete keys[envVar];
  write(keys);
  console.log(`✓ ${envVar} removed.`);
}

module.exports = { remove };
```

- [ ] **Step 2: Verify manually**

```bash
node -e "
const { write } = require('./src/store');
write({ OPENAI_API_KEY: 'sk-test', FIREWORKS_API_KEY: 'fw-test' });
const { remove } = require('./src/commands/remove');
remove('openai');           // should remove OPENAI_API_KEY
remove('openai');           // should print: No key found for OPENAI_API_KEY
const { read } = require('./src/store');
console.log(read());        // should only have FIREWORKS_API_KEY
"
```

Expected:
```
✓ OPENAI_API_KEY removed.
No key found for OPENAI_API_KEY
{ FIREWORKS_API_KEY: 'fw-test' }
```

- [ ] **Step 3: Clean up**

```bash
rm -f ~/.llmkey
```

- [ ] **Step 4: Commit**

```bash
git add src/commands/remove.js
git commit -m "feat: add remove command"
```

---

## Task 8: Wire up `bin/llmkey.js` + End-to-End Test

**Files:**
- Modify: `bin/llmkey.js` (replace stub)

- [ ] **Step 1: Write `bin/llmkey.js`**

```js
#!/usr/bin/env node

const { Command } = require('commander');
const { version } = require('../package.json');
const { init } = require('../src/commands/init');
const { set } = require('../src/commands/set');
const { list } = require('../src/commands/list');
const { remove } = require('../src/commands/remove');

const program = new Command();

program
  .name('llmkey')
  .description('Manage LLM provider API keys')
  .version(version);

program
  .command('init')
  .description('Add source line to ~/.zshrc (run once)')
  .action(init);

program
  .command('set <provider>')
  .description('Set a provider API key')
  .action(set);

program
  .command('list')
  .description('List all configured keys (masked)')
  .action(list);

program
  .command('remove <provider>')
  .description('Remove a provider API key')
  .action(remove);

program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Test `--help` and `--version`**

```bash
node bin/llmkey.js --help
node bin/llmkey.js --version
```

Expected: help text showing all four commands; version `1.0.0`.

- [ ] **Step 3: Test `list` (empty)**

```bash
node bin/llmkey.js list
```

Expected: `No keys configured. Run llmkey set <provider> to add one.`

- [ ] **Step 4: Test `set` with known provider**

```bash
node bin/llmkey.js set openai
```

Enter a fake key (e.g., `sk-test-1234abcd`) when prompted.

Expected: `✓ OPENAI_API_KEY saved.`

- [ ] **Step 5: Test `list` shows masked key**

```bash
node bin/llmkey.js list
```

Expected:
```
OPENAI_API_KEY    ****abcd
```

- [ ] **Step 6: Test `set` with custom UPPER_CASE var (no warning)**

```bash
node bin/llmkey.js set MY_CUSTOM_VAR
```

Enter a fake key. Expected: no warning, `✓ MY_CUSTOM_VAR saved.`

- [ ] **Step 7: Test `set` with unknown lowercase arg (should warn)**

```bash
node bin/llmkey.js set unknownprovider
```

Expected: warning printed, then key prompt.

- [ ] **Step 8: Test `remove`**

```bash
node bin/llmkey.js remove openai
node bin/llmkey.js remove openai   # second time: not found
```

Expected:
```
✓ OPENAI_API_KEY removed.
No key found for OPENAI_API_KEY
```

- [ ] **Step 9: Clean up test keys**

```bash
rm -f ~/.llmkey
```

- [ ] **Step 10: Commit**

```bash
git add bin/llmkey.js
git commit -m "feat: wire up CLI entry point"
```

---

## Task 9: Global Install

**Files:** none (install step only)

- [ ] **Step 1: Install globally**

```bash
cd /Users/mahesh/itsbohara/lab/llmkey
npm install -g .
```

Expected: no errors. `llmkey` now available in PATH.

- [ ] **Step 2: Verify global binary**

```bash
which llmkey
llmkey --version
```

Expected: path like `/usr/local/bin/llmkey` or similar; version `1.0.0`.

- [ ] **Step 3: Run `llmkey init`**

```bash
llmkey init
```

Expected: `✓ Added to ~/.zshrc. Restart your terminal or run: source ~/.zshrc`

- [ ] **Step 4: Verify `.zshrc` was updated**

```bash
tail -3 ~/.zshrc
```

Expected: last lines include `[ -f ~/.llmkey ] && source ~/.llmkey`

- [ ] **Step 5: Run init again (idempotency check)**

```bash
llmkey init
```

Expected: `Already configured. No changes made.`

- [ ] **Step 6: Set a real key and verify it loads in new shell**

```bash
llmkey set openai    # enter your real key
source ~/.zshrc
echo $OPENAI_API_KEY  # should print the key
```

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: llmkey v1.0.0 complete"
```

---

## Done

`llmkey` is installed globally. Keys set via `llmkey set <provider>` are available as `$ENV_VAR` in every new terminal session.
