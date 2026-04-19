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
