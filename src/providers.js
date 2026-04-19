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
