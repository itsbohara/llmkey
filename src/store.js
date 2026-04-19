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
