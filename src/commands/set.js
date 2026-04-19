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
