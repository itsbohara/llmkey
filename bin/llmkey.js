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
