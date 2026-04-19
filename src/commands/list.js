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
