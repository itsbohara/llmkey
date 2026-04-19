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
